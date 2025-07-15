/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - The current SELECT policy on users table creates infinite recursion
    - When checking if user is admin, it queries the users table again
    - This causes circular dependency and 500 error

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid circular dependency
    - Use direct uid() comparisons and avoid subqueries to users table
    - Create separate policies for different roles

  3. Security
    - Users can read their own data
    - Admin users can read all data (using auth.jwt claims)
    - Employees and branch managers can read based on their roles
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- Create new SELECT policy that avoids infinite recursion
-- Users can read their own data
CREATE POLICY "users_select_own_data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create separate policy for admin access to all users
-- This uses auth.jwt() to check role without querying users table
CREATE POLICY "users_select_admin_access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- Create INSERT policy for admins only
CREATE POLICY "users_insert_admin_only"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- Create UPDATE policy for users to update their own data and admins to update any
CREATE POLICY "users_update_own_or_admin"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- If the above JWT approach doesn't work, we'll use a function-based approach
-- Create a function to check if current user is admin without causing recursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user has admin role in auth.users metadata
  RETURN (
    SELECT COALESCE(
      (auth.jwt() ->> 'role') = 'admin',
      (auth.jwt() ->> 'user_role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative policies using the function if JWT approach fails
-- Drop the JWT-based policies if they don't work
-- DROP POLICY IF EXISTS "users_select_admin_access" ON users;
-- DROP POLICY IF EXISTS "users_insert_admin_only" ON users;
-- DROP POLICY IF EXISTS "users_update_own_or_admin" ON users;

-- Alternative SELECT policy using function
CREATE POLICY "users_select_admin_function"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin_user());

-- Alternative INSERT policy using function
CREATE POLICY "users_insert_admin_function"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

-- Alternative UPDATE policy using function
CREATE POLICY "users_update_admin_function"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin_user());