import { apiClient } from '../../../lib/api/apiClient';
import { API_ENDPOINTS } from '../../../core/constants/endpoints';
import { STORAGE_KEYS } from '../../../core/constants/endpoints';
import { User, LoginCredentials, OtpVerificationResponse } from '../../../core/types/auth';
import { ApiResponse } from '../../../core/types/api';
import { supabase } from '../../../shared/utils/supabase';

/**
 * Authentication Service
 * Handles all authentication-related operations
 * Implements Repository Pattern for data access
 */
class AuthService {
  /**
   * Send OTP to user's phone for verification
   */
  public async sendOtp(nationalId: string, phoneNumber: string, fullName?: string): Promise<ApiResponse> {
    try {
      return await apiClient.callFunction('send-otp', {
        nationalId,
        phoneNumber,
        fullName
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: error.message || 'خطأ في إرسال رمز التحقق'
      };
    }
  }

  /**
   * Send OTP to existing user's phone for login
   */
  public async sendExistingUserOtp(nationalId: string): Promise<ApiResponse> {
    try {
      return await apiClient.callFunction('send-existing-user-otp', {
        nationalId
      });
    } catch (error) {
      console.error('Error sending OTP to existing user:', error);
      return {
        success: false,
        error: error.message || 'خطأ في إرسال رمز التحقق'
      };
    }
  }

  /**
   * Verify OTP for new user registration
   */
  public async verifyOtp(nationalId: string, otp: string, sessionId?: number): Promise<OtpVerificationResponse> {
    try {
      const response = await apiClient.callFunction<OtpVerificationResponse>('verify-otp', {
        nationalId,
        otpCode: otp,
        sessionId
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        success: false,
        error: response.error || 'فشل التحقق من رمز OTP'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: error.message || 'خطأ في التحقق من رمز التحقق'
      };
    }
  }

  /**
   * Verify OTP for existing user login
   */
  public async verifyExistingUserOtp(nationalId: string, otp: string, sessionId?: number): Promise<OtpVerificationResponse> {
    try {
      const response = await apiClient.callFunction<any>('verify-existing-user-otp', {
        nationalId,
        otpCode: otp,
        sessionId
      });
      
      if (response.success) {
        // If we have session data, set it in Supabase
        if (response.session) {
          await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token
          });
        }
        
        return response;
      }
      
      return {
        success: false,
        error: response.error || 'فشل التحقق من رمز OTP',
        errorCode: response.errorCode || 'UNKNOWN_ERROR'
      };
    } catch (error) {
      console.error('Error verifying existing user OTP:', error);
      
      let errorMessage = error.message || 'خطأ في التحقق من رمز التحقق';
      let errorCode = 'NETWORK_ERROR';
      
      // تحليل رسائل الخطأ من الخادم بشكل أكثر دقة
      if (error.response && error.response.data) {
        // استخدام رسالة الخطأ والرمز من الاستجابة إذا كانت متوفرة
        errorMessage = error.response.data.error || errorMessage;
        errorCode = error.response.data.errorCode || errorCode;
      } else if (error.message && error.message.includes('404')) {
        errorMessage = 'رمز التحقق غير موجود أو انتهت صلاحيته. يرجى طلب رمز جديد';
        errorCode = 'OTP_NOT_FOUND';
      } else if (error.message && error.message.includes('409')) {
        //  تحليل أكثر دقة لأخطاء 409
        if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
          errorMessage = 'المستخدم غير موجود في نظام المصادقة. جاري إصلاح المشكلة...';
          errorMessage = 'رمز التحقق مُستخدم مسبقاً. يرجى طلب رمز جديد';
          errorCode = 'OTP_ALREADY_USED';
        } else {
          errorMessage = 'هناك مشكلة في بيانات المستخدم. يرجى المحاولة مرة أخرى بعد قليل';
          errorCode = 'DATA_CONFLICT';
        }
      } else if (error.message && error.message.includes('400')) {
        errorMessage = 'رمز التحقق غير صحيح';
        errorCode = 'INVALID_OTP';
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode
      };
    }
  }

  /**
   * Login with email and password (for admin)
   */
  public async loginWithEmail(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      // First authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return {
          success: false,
          error: error.message || 'خطأ في تسجيل الدخول'
        };
      }
      
      if (!data.user) {
        return {
          success: false,
          error: 'فشل في تسجيل الدخول'
        };
      }
      
      // Get user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *, 
          branch:branch_id(id, name, city),
          member:members!user_id(*)
        `)
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        return {
          success: false,
          error: 'فشل في استرداد بيانات المستخدم'
        };
      }
      
      return {
        success: true,
        data: userData,
        message: 'تم تسجيل الدخول بنجاح'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ أثناء تسجيل الدخول'
      };
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if there's an error
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  /**
   * Get current user session
   */
  public async getSession() {
    return await supabase.auth.getSession();
  }

  /**
   * Get user by national ID
   */
  public async getUserByNationalId(nationalId: string): Promise<ApiResponse<User>> {
    try {
      return await apiClient.callFunction('get-user-by-national-id', { nationalId });
    } catch (error) {
      console.error('Error getting user by national ID:', error);
      return {
        success: false,
        error: error.message || 'خطأ في جلب بيانات المستخدم'
      };
    }
  }

  /**
   * Save user to local storage
   */
  public saveUserToStorage(user: User): void {
    if (!user || typeof user !== 'object') {
      console.error("Invalid user data:", user);
      return;
    }
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Get user from local storage
   */
  public getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // Validate user object
      if (!user.id || !user.role) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error("Error parsing user from storage:", error);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }

  /**
   * Clear user from local storage
   */
  public clearUserFromStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

// Export as singleton
export const authService = new AuthService();
export default authService;
