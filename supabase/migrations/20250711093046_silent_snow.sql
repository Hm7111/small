/*
  # Split Setup - Stage 2: Performance Improvements
  
  1. New Indexes
    - Added indexes for frequently queried columns
    
  2. Functions
    - Optimized database functions for better performance
    
  3. Changes
    - Schema optimizations for query performance
*/

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_requests_service_member ON requests(service_id, member_id);
CREATE INDEX IF NOT EXISTS idx_members_registration_date ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_members_preferred_branch_city ON members(preferred_branch_id, city);

-- Create improved function for calculating completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(
  member_record members
) RETURNS integer AS $$
DECLARE
  completed_fields integer := 0;
  total_fields integer := 20;
BEGIN
  -- Count completed fields
  IF member_record.full_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.national_id IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.phone IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.gender IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.birth_date IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.city IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.address IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.email IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.disability_type IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.education_level IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.employment_status IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.building_number IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.street_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.district IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.postal_code IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.alternative_phone IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.emergency_contact_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.emergency_contact_phone IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.emergency_contact_relation IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF member_record.preferred_branch_id IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  
  RETURN ROUND((completed_fields::numeric / total_fields::numeric) * 100);
END;
$$ LANGUAGE plpgsql;