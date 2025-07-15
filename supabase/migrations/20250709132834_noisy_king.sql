/*
  # Add admin user to the system

  1. New Records
    - Add admin user with email 'admin@charity.org' and role 'admin'
    - Set up basic admin user information for system initialization

  2. Security
    - Admin user will have full access according to existing RLS policies
    - Password will need to be set separately through the user_passwords table

  3. Notes
    - This creates the initial admin user required for system operation
    - Phone number is set to a placeholder that meets format requirements
    - National ID is NULL as permitted for admin users
*/

-- Insert the admin user
INSERT INTO users (
  full_name,
  email,
  phone,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'System Administrator',
  'admin@charity.org',
  '+966500000000',
  'admin'::user_role,
  true,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;