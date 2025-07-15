import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { supabase } from '../../shared/utils/supabase';

// Auth Constants
const AUTH_ENDPOINTS = {
  LOGIN: '/functions/v1/admin-login',
  REFRESH: '/functions/v1/refresh-token',
  LOGOUT: '/functions/v1/logout',
  VERIFY_OTP: '/functions/v1/verify-existing-user-otp',
  SEND_OTP: '/functions/v1/send-existing-user-otp',
};

// Token Management
const TOKEN_CONFIG = {
  ACCESS_TOKEN: 'gov_access_token',
  REFRESH_TOKEN: 'gov_refresh_token',
  ACCESS_EXPIRY: 'gov_token_expiry',
  COOKIE_OPTIONS: {
    secure: true,
    sameSite: 'strict',
    httpOnly: false, // Must be false for client-side access
    path: '/',
    expires: 7 // 7 days
  }
};

// Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserCredentials {
  email?: string;
  password?: string;
  nationalId?: string;
  otp?: string;
  sessionId?: number;
}

export interface AuthUser {
  id: string;
  full_name: string;
  email?: string;
  national_id?: string;
  phone: string;
  role: 'admin' | 'branch_manager' | 'employee' | 'beneficiary';
  branch_id?: string;
  is_active: boolean;
  member?: any;
}

// Token Management
export const setAuthTokens = (tokens: AuthTokens): void => {
  Cookies.set(TOKEN_CONFIG.ACCESS_TOKEN, tokens.accessToken, TOKEN_CONFIG.COOKIE_OPTIONS);
  Cookies.set(TOKEN_CONFIG.REFRESH_TOKEN, tokens.refreshToken, TOKEN_CONFIG.COOKIE_OPTIONS);
  Cookies.set(TOKEN_CONFIG.ACCESS_EXPIRY, tokens.expiresAt.toString(), TOKEN_CONFIG.COOKIE_OPTIONS);
};

export const getAuthTokens = (): AuthTokens | null => {
  const accessToken = Cookies.get(TOKEN_CONFIG.ACCESS_TOKEN);
  const refreshToken = Cookies.get(TOKEN_CONFIG.REFRESH_TOKEN);
  const expiresAt = Cookies.get(TOKEN_CONFIG.ACCESS_EXPIRY);

  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAt, 10)
  };
};

export const clearAuthTokens = (): void => {
  Cookies.remove(TOKEN_CONFIG.ACCESS_TOKEN);
  Cookies.remove(TOKEN_CONFIG.REFRESH_TOKEN);
  Cookies.remove(TOKEN_CONFIG.ACCESS_EXPIRY);
};

export const isTokenExpired = (): boolean => {
  const tokens = getAuthTokens();
  if (!tokens) return true;
  
  // Add 10 second buffer for network latency
  return Date.now() >= (tokens.expiresAt - 10000);
};

export const decodeToken = (token: string): any => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

// Auth Service Class
class AuthService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!this.baseUrl || !this.apiKey) {
      console.error('Authentication service initialization failed: Missing environment variables');
    }
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // Admin Login with Email/Password
  public async loginWithEmail(email: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}${AUTH_ENDPOINTS.LOGIN}`,
        { email, password },
        { headers: this.getAuthHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'فشل تسجيل الدخول');
      }

      const { user, session } = response.data;

      if (!user || !session) {
        throw new Error('بيانات المستخدم أو الجلسة غير متوفرة');
      }

      // Set auth tokens
      const tokens: AuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at * 1000 // Convert to milliseconds
      };

      setAuthTokens(tokens);

      return { user, tokens };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || 'فشل تسجيل الدخول');
    }
  }

  // Login with National ID and OTP
  public async loginWithNationalId(nationalId: string, otp: string, sessionId?: number): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}${AUTH_ENDPOINTS.VERIFY_OTP}`,
        { nationalId, otpCode: otp, sessionId },
        { headers: this.getAuthHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'فشل التحقق من رمز OTP');
      }

      const { user, session } = response.data;

      if (!user || !session) {
        throw new Error('بيانات المستخدم أو الجلسة غير متوفرة');
      }

      // Set auth tokens
      const tokens: AuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at * 1000 // Convert to milliseconds
      };

      setAuthTokens(tokens);

      return { user, tokens };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error.response?.data?.error || error.message || 'فشل التحقق من رمز OTP');
    }
  }

  // Send OTP to existing user
  public async sendOTP(nationalId: string): Promise<{ sessionId: number; expiresIn: number }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}${AUTH_ENDPOINTS.SEND_OTP}`,
        { nationalId },
        { headers: this.getAuthHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'فشل إرسال رمز التحقق');
      }

      return {
        sessionId: response.data.sessionId,
        expiresIn: response.data.expiresIn
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw new Error(error.response?.data?.error || error.message || 'فشل إرسال رمز التحقق');
    }
  }

  // Refresh token
  public async refreshToken(): Promise<AuthTokens> {
    const tokens = getAuthTokens();
    
    if (!tokens) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}${AUTH_ENDPOINTS.REFRESH}`,
        { refreshToken: tokens.refreshToken },
        { headers: this.getAuthHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'فشل تحديث الجلسة');
      }

      const { session } = response.data;

      if (!session) {
        throw new Error('بيانات الجلسة غير متوفرة');
      }

      // Set new auth tokens
      const newTokens: AuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at * 1000 // Convert to milliseconds
      };

      setAuthTokens(newTokens);

      return newTokens;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      clearAuthTokens();
      throw new Error(error.response?.data?.error || error.message || 'فشل تحديث الجلسة');
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      const tokens = getAuthTokens();
      
      if (tokens) {
        await axios.post(
          `${this.baseUrl}${AUTH_ENDPOINTS.LOGOUT}`,
          { refreshToken: tokens.refreshToken },
          { headers: this.getAuthHeaders() }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens regardless of API success
      clearAuthTokens();
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const tokens = getAuthTokens();
    return !!tokens && !isTokenExpired();
  }
  
  /**
   * Check if there is an active Supabase session
   */
  public hasActiveSession(): boolean {
    try {
      // Check if we have a session in localStorage
      const sessionStr = localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.currentSession?.access_token) {
          // Check if token is expired
          const expiresAt = session.currentSession.expires_at;
          if (expiresAt && expiresAt * 1000 > Date.now()) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking active session:', error);
      return false;
    }
  }
  
  /**
   * Get user data from active session
   */
  public async getUserFromSession(): Promise<any> {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      // Get user data from database
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *, 
          branch:branch_id(id, name, city),
          member:members!user_id(*)
        `)
        .eq('id', session.user.id)
        .single();
      
      if (error || !userData) return null;
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Error getting user from session:', error);
      return null;
    }
  }
}

// Export as singleton
export const authService = new AuthService();
export default authService;
