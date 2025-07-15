-- Fix admin user setup without changing existing IDs (to prevent foreign key constraint violations)
DO $$
DECLARE
  auth_user_id UUID;
  existing_admin_id UUID;
BEGIN
  -- Get Auth user ID from auth.users
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'admin@charity.org' 
  LIMIT 1;
  
  -- Check if admin user already exists
  SELECT id INTO existing_admin_id 
  FROM public.users 
  WHERE email = 'admin@charity.org' AND role = 'admin'
  LIMIT 1;
  
  IF existing_admin_id IS NOT NULL THEN
    -- Update existing admin user WITHOUT changing the ID
    UPDATE public.users 
    SET 
      is_active = true,
      full_name = 'مدير النظام',
      phone = '+966500000000', -- Default phone
      updated_at = now()
    WHERE id = existing_admin_id;
    
    RAISE NOTICE 'Existing admin user updated. ID: %', existing_admin_id;
  ELSE
    -- No existing admin with that email, so create one
    -- If we have Auth ID, use it, otherwise generate a new UUID
    INSERT INTO public.users (
      id,
      full_name, 
      email, 
      phone, 
      role, 
      is_active
    )
    VALUES (
      COALESCE(auth_user_id, gen_random_uuid()), -- Use Auth ID if available, otherwise generate new
      'مدير النظام',
      'admin@charity.org',
      '+966500000000', -- Default phone
      'admin',
      true
    );
    
    RAISE NOTICE 'New admin user created with ID: %', COALESCE(auth_user_id, 'new generated UUID');
  END IF;
  
  -- Additional step: Make sure the default admin user (00000000-0000-0000-0000-000000000001) still has admin role
  -- as it may be referenced by services
  IF EXISTS (SELECT 1 FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    UPDATE public.users 
    SET 
      role = 'admin',
      is_active = true,
      updated_at = now()
    WHERE id = '00000000-0000-0000-0000-000000000001';
    
    RAISE NOTICE 'Default admin user (00000000-0000-0000-0000-000000000001) permissions ensured';
  END IF;
END
$$;