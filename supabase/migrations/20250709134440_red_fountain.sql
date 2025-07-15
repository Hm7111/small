-- Fix admin user setup to ensure proper linking between auth.users and public.users
DO $$
DECLARE
  auth_user_id UUID;
  existing_admin_email TEXT;
  services_admin_id UUID;
  admin_email TEXT := 'admin@charity.org';
  old_admin_id UUID := '00000000-0000-0000-0000-000000000001'::uuid; -- Cast to UUID
BEGIN
  -- Try to get the auth user ID for the admin
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = admin_email
  LIMIT 1;
  
  RAISE NOTICE 'Auth user ID found: %', auth_user_id;
  
  -- Check if admin user email already exists in public.users
  SELECT id INTO existing_admin_email 
  FROM public.users 
  WHERE email = admin_email
  LIMIT 1;
  
  -- Check if services reference the old admin ID
  SELECT created_by INTO services_admin_id
  FROM services
  WHERE created_by = old_admin_id -- Now comparing UUID to UUID
  LIMIT 1;
  
  -- If services reference the old admin ID, preserve it
  IF services_admin_id IS NOT NULL THEN
    RAISE NOTICE 'Services reference admin ID %, preserving this ID', services_admin_id;
    
    -- Ensure old_admin_id exists as admin with correct email
    INSERT INTO public.users (
      id,
      full_name, 
      email, 
      phone, 
      role, 
      is_active
    ) VALUES (
      old_admin_id,
      'مدير النظام',
      admin_email,
      '+966500000000',
      'admin',
      true
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      updated_at = now();
  ELSE
    -- No services dependency, use the auth ID if available
    RAISE NOTICE 'No services dependency found, can use auth ID';
    
    IF auth_user_id IS NOT NULL THEN
      -- First, if there's already a user with admin email but different ID, 
      -- change that email to avoid conflict
      IF existing_admin_email IS NOT NULL AND existing_admin_email != auth_user_id::text THEN
        UPDATE public.users 
        SET email = 'admin_old_' || gen_random_uuid() || '@temp.com',
            updated_at = now()
        WHERE email = admin_email;
        
        RAISE NOTICE 'Changed email of existing admin user to prevent conflict';
      END IF;
      
      -- Now create/update the admin user with auth ID
      INSERT INTO public.users (
        id,
        full_name, 
        email, 
        phone, 
        role, 
        is_active
      ) VALUES (
        auth_user_id,
        'مدير النظام',
        admin_email,
        '+966500000000',
        'admin',
        true
      ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = now();
      
      RAISE NOTICE 'Created/updated admin user with auth ID';
    ELSE
      -- No auth ID available, use default ID or existing admin
      INSERT INTO public.users (
        id,
        full_name, 
        email, 
        phone, 
        role, 
        is_active
      ) VALUES (
        old_admin_id,
        'مدير النظام',
        admin_email,
        '+966500000000',
        'admin',
        true
      ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = now();
      
      RAISE NOTICE 'Created/updated admin user with default ID';
    END IF;
  END IF;
  
  -- In case admin exists with email but no proper role
  UPDATE public.users 
  SET role = 'admin', 
      is_active = true,
      updated_at = now()
  WHERE email = admin_email AND role != 'admin';
  
  RAISE NOTICE 'Admin user setup completed successfully';
END
$$;

-- Add a helper function to find admin user
CREATE OR REPLACE FUNCTION get_admin_user_id()
RETURNS uuid AS $$
DECLARE
  admin_id uuid;
BEGIN
  -- First try to get admin by email
  SELECT id INTO admin_id
  FROM public.users
  WHERE email = 'admin@charity.org' AND role = 'admin'
  LIMIT 1;
  
  -- If not found, try the default ID
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id
    FROM public.users
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid AND role = 'admin'
    LIMIT 1;
  END IF;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql;