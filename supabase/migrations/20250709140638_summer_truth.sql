/*
  # Create Admin User Migration

  1. Purpose
    - Create a new admin user in the public.users table
    - Ensure the admin user has proper permissions
    - Link existing services to the admin user

  2. Implementation
    - Creates admin user with email 'admin@charity.org'
    - Updates any services with NULL created_by to use this admin
*/

-- First, check if the admin already exists in users table
DO $$
DECLARE
  admin_id UUID;
  services_count INTEGER;
BEGIN
  -- Check for existing admin user
  SELECT id INTO admin_id
  FROM public.users
  WHERE email = 'admin@charity.org' AND role = 'admin'
  LIMIT 1;

  -- If admin doesn't exist, create it with a generated UUID
  IF admin_id IS NULL THEN
    -- Generate a stable UUID for the admin
    admin_id := gen_random_uuid();
    
    -- Create the admin user
    INSERT INTO public.users (
      id, 
      full_name, 
      email, 
      phone, 
      role, 
      is_active,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      'مدير النظام',
      'admin@charity.org',
      '+966500000000',
      'admin',
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Created admin user with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', admin_id;
    
    -- Make sure admin is active and has the correct role
    UPDATE public.users
    SET 
      role = 'admin',
      is_active = true,
      full_name = 'مدير النظام',
      updated_at = now()
    WHERE id = admin_id;
  END IF;
  
  -- Count services with NULL created_by that need fixing
  SELECT COUNT(*) INTO services_count
  FROM public.services
  WHERE created_by IS NULL;
  
  -- Update any services with NULL created_by to use admin_id
  IF services_count > 0 THEN
    UPDATE public.services
    SET created_by = admin_id
    WHERE created_by IS NULL;
    
    RAISE NOTICE 'Updated % services to reference admin user', services_count;
  END IF;
END $$;