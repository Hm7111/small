export interface User {
  id: string;
  nationalId: string;
  email?: string;
  name: string;
  role: 'admin' | 'branch_manager' | 'employee' | 'beneficiary';
  phone?: string;
  branchId?: string;
}

export interface LoginState {
  step: 'selection' | 'national_id' | 'otp' | 'admin_login' | 'new_beneficiary' | 'success';
  userType: 'beneficiary' | 'employee' | 'admin' | null;
  sessionId: number | null;
  nationalId: string;
  otp: string;
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export type LoginStep = 'selection' | 'national_id' | 'otp' | 'admin_login' | 'new_beneficiary' | 'success';
export type UserType = 'beneficiary' | 'employee' | 'admin';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
