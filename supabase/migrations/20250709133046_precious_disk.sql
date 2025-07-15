-- Fix admin user setup while preserving existing relationships
DO $$
DECLARE
  auth_user_id UUID;
  services_admin_id UUID;
BEGIN
  -- Get the Auth user ID for the admin
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'admin@charity.org' 
  LIMIT 1;
  
  -- Get the ID used in services table (the one referenced by foreign key)
  SELECT created_by INTO services_admin_id
  FROM services
  WHERE created_by = '00000000-0000-0000-0000-000000000001'
  LIMIT 1;
  
  -- We need to keep the existing ID if it's referenced by services
  IF services_admin_id IS NOT NULL THEN
    -- Update existing admin but keep the original ID to preserve foreign key references
    UPDATE public.users 
    SET 
      email = 'admin@charity.org', -- Make sure email is set correctly
      role = 'admin',
      is_active = true,
      full_name = 'مدير النظام',
      phone = '+966500000000', -- Default phone
      updated_at = now()
    WHERE id = services_admin_id;
    
    RAISE NOTICE 'Updated admin user with ID % to match admin@charity.org', services_admin_id;
    
    -- If auth user exists but doesn't match our services admin, create a link via email
    IF auth_user_id IS NOT NULL THEN
      UPDATE auth.users
      SET email = 'admin@charity.org',
          updated_at = now()
      WHERE id = auth_user_id;
      
      RAISE NOTICE 'Updated auth user to use admin@charity.org email';
    END IF;
  ELSE
    -- No services dependency, we can use the auth ID or create a new admin
    IF EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@charity.org') THEN
      UPDATE public.users 
      SET 
        role = 'admin',
        is_active = true,
        full_name = 'مدير النظام',
        phone = '+966500000000',
        updated_at = now()
      WHERE email = 'admin@charity.org';
      
      RAISE NOTICE 'Updated existing admin user with email admin@charity.org';
    ELSE
      -- No existing admin with that email, so create one
      INSERT INTO public.users (
        id,
        full_name, 
        email, 
        phone, 
        role, 
        is_active
      )
      VALUES (
        COALESCE(auth_user_id, '00000000-0000-0000-0000-000000000001'),
        'مدير النظام',
        'admin@charity.org',
        '+966500000000',
        'admin',
        true
      ) ON CONFLICT (id) DO UPDATE SET
        email = 'admin@charity.org',
        role = 'admin',
        is_active = true;
      
      RAISE NOTICE 'Created or updated admin user with ID: %', COALESCE(auth_user_id, '00000000-0000-0000-0000-000000000001');
    END IF;
  END IF;
END
$$;