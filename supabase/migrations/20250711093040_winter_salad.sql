/*
  # Split Setup - Stage 1: User Authentication
  
  1. New Tables
    - `otp_verification_logs` - Logging table for OTP verification attempts
    
  2. Security
    - Enhanced RLS policies for sensitive tables
    
  3. Changes
    - Schema optimizations for faster authentication
*/

-- OTP verification logging for security audits
CREATE TABLE IF NOT EXISTS otp_verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id text NOT NULL,
  phone_number text NOT NULL,
  session_id bigint NOT NULL,
  verification_success boolean DEFAULT false,
  verification_timestamp timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE otp_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Only admins can view OTP logs"
  ON otp_verification_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Add index for faster lookups
CREATE INDEX idx_otp_logs_verification_success ON otp_verification_logs(verification_success);
CREATE INDEX idx_otp_logs_timestamp ON otp_verification_logs(verification_timestamp);