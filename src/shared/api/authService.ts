/**
 * Authentication Service
 * Unified authentication API calls
 */

import { apiClient, ApiResponse } from './apiClient';

export interface OtpRequest {
  nationalId: string;
  phoneNumber: string;
  fullName?: string;
}

export interface OtpVerification {
  nationalId: string;
  otpCode: string;
  sessionId?: number;
}

export interface AuthUser {
  id: string;
  national_id: string;
  role: string;
  full_name: string;
  phone: string;
  email?: string;
}

export interface AuthResponse {
  user: AuthUser;
  session: any;
  token?: string;
}

/**
 * Send OTP for new user registration
 */
export const sendOtp = async (data: OtpRequest): Promise<ApiResponse<void>> => {
  return apiClient.post('/functions/v1/send-otp', data);
};

/**
 * Send OTP for existing user login
 */
export const sendExistingUserOtp = async (data: Omit<OtpRequest, 'fullName'>): Promise<ApiResponse<{ sessionId: number }>> => {
  return apiClient.post('/functions/v1/send-existing-user-otp', data);
};

/**
 * Verify OTP for new user
 */
export const verifyOtp = async (data: OtpVerification): Promise<ApiResponse<AuthResponse>> => {
  const endpoint = data.sessionId 
    ? '/functions/v1/verify-existing-user-otp' 
    : '/functions/v1/verify-otp';
    
  return apiClient.post(endpoint, data);
};

/**
 * Get user by national ID
 */
export const getUserByNationalId = async (nationalId: string): Promise<ApiResponse<AuthUser>> => {
  return apiClient.post('/functions/v1/get-user-by-national-id', { nationalId });
};

/**
 * Admin login
 */
export const adminLogin = async (credentials: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/functions/v1/admin-login', credentials);
};

/**
 * Setup admin user
 */
export const setupAdmin = async (adminData: any): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/functions/v1/setup-admin', adminData);
};

/**
 * Create admin user
 */
export const createAdminUser = async (userData: any): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/functions/v1/create-admin-user', userData);
};

