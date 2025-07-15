/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'branch_manager' | 'employee' | 'beneficiary';

/**
 * User interface representing a user in the system
 */
export interface User {
  id: string;
  full_name: string;
  email?: string;
  national_id?: string;
  phone: string;
  role: UserRole;
  branch_id?: string;
  branch_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member?: Member | null;
}

/**
 * Member interface representing a beneficiary in the system
 */
export interface Member {
  id: string;
  user_id: string;
  full_name: string;
  national_id: string;
  phone: string;
  gender: 'male' | 'female';
  birth_date?: string;
  city: string;
  address?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  registration_status: RegistrationStatus;
  profile_completion_percentage: number;
  disability_type?: string;
  disability_details?: string;
  disability_card_number?: string;
  education_level?: string;
  employment_status?: string;
  job_title?: string;
  employer?: string;
  monthly_income?: number;
  preferred_branch_id?: string;
  preferred_branch_name?: string;
  [key: string]: any; // For additional properties
}

/**
 * Registration status types
 */
export type RegistrationStatus = 
  | 'profile_incomplete'
  | 'pending_documents'
  | 'pending_review'
  | 'under_employee_review'
  | 'under_manager_review'
  | 'approved'
  | 'rejected'
  | 'needs_correction';

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  nationalId?: string;
  email?: string;
  password?: string;
  otp?: string;
  sessionId?: number;
}

/**
 * OTP verification response
 */
export interface OtpVerificationResponse {
  success: boolean;
  user?: User;
  session?: any;
  error?: string;
}

/**
 * Session interface
 */
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    role: UserRole;
  };
}
