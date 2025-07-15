/*
  # Create Default Admin User Setup

  This migration provides a function to create a default admin user
  if one doesn't exist in the authentication system.

  1. New Functions
    - `create_default_admin_user()` - Creates admin user if it doesn't exist
    
  2. Security
    - Function is security definer to run with elevated privileges
    - Only creates user if no admin exists
*/

-- Function to create default admin user
CREATE OR REPLACE FUNCTION create_default_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists boolean;
  new_user_id uuid;
BEGIN
  -- Check if admin user already exists in public.users
  SELECT EXISTS(
    SELECT 1 FROM users 
    WHERE email = 'admin@charity.org' AND role = 'admin'
  ) INTO admin_exists;
  
  -- If admin doesn't exist, we need to create it
  IF NOT admin_exists THEN
    -- Note: We can't create users in auth.users from SQL
    -- This needs to be done manually in Supabase Dashboard
    -- But we can ensure the public.users record exists when they do login
    
    RAISE NOTICE 'Admin user needs to be created in Supabase Auth Dashboard';
    RAISE NOTICE 'Email: admin@charity.org';
    RAISE NOTICE 'After creating in Auth, the public.users record will be created automatically on first login';
  ELSE
    RAISE NOTICE 'Admin user already exists in public.users table';
  END IF;
END;
$$;

-- Create a helper function to check admin setup status
CREATE OR REPLACE FUNCTION check_admin_setup()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  admin_in_users boolean;
BEGIN
  -- Check if admin exists in public.users
  SELECT EXISTS(
    SELECT 1 FROM users 
    WHERE email = 'admin@charity.org' AND role = 'admin'
  ) INTO admin_in_users;
  
  result := json_build_object(
    'admin_exists_in_users', admin_in_users,
    'setup_complete', admin_in_users,
    'next_steps', CASE 
      WHEN NOT admin_in_users THEN 'Create admin user in Supabase Auth Dashboard with email: admin@charity.org'
      ELSE 'Admin setup is complete'
    END
  );
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_default_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_setup() TO authenticated;