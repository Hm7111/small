/*
  # Link Admin User to Existing Services
  
  1. Purpose
    - Link existing admin user to services
    - Fix foreign key constraint violations
    - Ensure smooth login experience

  2. Implementation
    - Find admin user ID from Authentication system
    - Update services to use this admin user ID
    - Create admin user in public.users if needed
*/

DO $$ 
DECLARE
  admin_auth_id UUID;
  admin_public_id UUID;
  service_admin_id UUID;
BEGIN
  -- Get the auth.users ID for admin@charity.org
  SELECT id INTO admin_auth_id 
  FROM auth.users 
  WHERE email = 'admin@charity.org'
  LIMIT 1;
  
  -- Get the existing admin user ID from public.users
  SELECT id INTO admin_public_id
  FROM public.users
  WHERE email = 'admin@charity.org' AND role = 'admin'
  LIMIT 1;
  
  -- Get admin ID used in services
  SELECT DISTINCT created_by INTO service_admin_id
  FROM services
  WHERE created_by IS NOT NULL
  LIMIT 1;
  
  RAISE NOTICE 'Auth admin ID: %, Public admin ID: %, Service admin ID: %', 
    admin_auth_id, admin_public_id, service_admin_id;

  -- If we have an admin in auth but not in public, create it
  IF admin_auth_id IS NOT NULL AND admin_public_id IS NULL THEN
    INSERT INTO public.users (
      id, full_name, email, phone, role, is_active
    ) VALUES (
      admin_auth_id, 'مدير النظام', 'admin@charity.org', '+966500000000', 'admin', true
    );
    admin_public_id := admin_auth_id;
    RAISE NOTICE 'Created admin user in public.users with auth ID: %', admin_public_id;
  END IF;
  
  -- If services reference an admin ID but it's different from our admin user
  IF service_admin_id IS NOT NULL AND 
     admin_public_id IS NOT NULL AND 
     service_admin_id != admin_public_id THEN
    
    -- Update services to use the correct admin ID
    UPDATE services SET created_by = admin_public_id 
    WHERE created_by = service_admin_id;
    
    -- If the service admin ID user exists in public.users, change its email 
    -- to avoid conflict with admin@charity.org
    UPDATE public.users
    SET email = 'old_admin_' || now()::text || '@backup.org',
        updated_at = now()
    WHERE id = service_admin_id AND id != admin_public_id;
    
    RAISE NOTICE 'Updated services to reference admin ID: % (previously: %)', 
      admin_public_id, service_admin_id;
  END IF;
  
  -- Final verification
  IF admin_public_id IS NULL THEN
    RAISE NOTICE 'WARNING: No admin user found or created. Please create admin@charity.org user in Authentication and run this script again.';
  ELSE
    RAISE NOTICE 'Admin user setup complete. Use admin@charity.org to log in.';
  END IF;
END $$;