/*
  # Split Setup - Stage 3: Security Enhancements
  
  1. Security
    - Enhanced RLS policies for sensitive tables
    - Additional audit logging
    
  2. Changes
    - Improved password handling
*/

-- Enhanced security for password storage
CREATE TABLE IF NOT EXISTS user_password_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_password_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Only admins can view password history"
  ON user_password_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Create function to enforce password complexity
CREATE OR REPLACE FUNCTION check_password_complexity(password text)
RETURNS boolean AS $$
BEGIN
  -- Check length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for digits
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for special characters
  IF password !~ '[^a-zA-Z0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for uppercase
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for lowercase
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;