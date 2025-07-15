import { User, ApiResponse } from '../types';
import { API_ENDPOINTS } from './constants';
import { supabase } from '../shared/utils/supabase';

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createHeaders = () => ({
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
});

const apiCall = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    // تقليل logging في الإنتاج - فقط للأخطاء المهمة
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Call:', endpoint, data ? '[data]' : '[no data]');
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    const result = await response.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 Response status:', response.status);
      if (!result.success) {
        console.log('❌ API Error:', result.error);
      }
    }
    
    if (result.success) {
      return { success: true, data: result.data || result };
    } else {
      return { success: false, error: result.error || 'خطأ غير معروف' };
    }
  } catch (error: any) {
    console.error(`❌ Network Error (${endpoint}):`, error.message);
    return { success: false, error: 'خطأ في الشبكة' };
  }
};

// إرسال رمز OTP للمستخدم الجديد
export const sendOtp = async (nationalId: string, phoneNumber: string, fullName?: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${BASE_URL}/functions/v1/send-otp`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ 
        nationalId, 
        phoneNumber, 
        fullName 
      })
    });
    
    return await response.json();
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { success: false, error: error.message || 'خطأ في إرسال رمز التحقق' };
  }
};

// التحقق من رمز OTP للمستخدم الجديد
export const verifyOtp = async (nationalId: string, otp: string, sessionId?: number): Promise<ApiResponse<void>> => {
  try {
    // تحديد الوظيفة المناسبة بناءً على نوع المستخدم (جديد أو موجود)
    // Always use verify-existing-user-otp for login flow
    const endpoint = sessionId 
      ? '/functions/v1/verify-existing-user-otp' 
      : '/functions/v1/verify-otp'; 
      
    console.log("Verifying OTP:", { nationalId, otpCode: otp, sessionId });
      
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ 
        nationalId, 
        otpCode: otp,
        sessionId
      })
    });
    
    const result = await response.json();
    
    // Always log the response for debugging 
    console.log("OTP verification response:", { 
      success: result.success || false,
      hasUser: !!result.user,
      hasSession: !!result.session
    });
    
    return result;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: error.message || 'خطأ في التحقق من رمز التحقق' };
  }
};

// الحصول على بيانات المستخدم بواسطة رقم الهوية
export const getUserByNationalId = async (nationalId: string): Promise<ApiResponse<User>> => {
  const response = await apiCall<User>(API_ENDPOINTS.GET_USER_BY_NATIONAL_ID, { nationalId });
  if (response.success && response.data?.user) {
    return { success: true, data: response.data.user };
  }
  return response;
};

// تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور (للإدارة)
export const loginWithEmail = async (email: string, password: string): Promise<ApiResponse<User>> => {
  try {
    // تحقق من وجود الإعدادات المطلوبة
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return { 
        success: false, 
        error: 'إعدادات قاعدة البيانات غير مكتملة. يرجى التحقق من متغيرات البيئة.' 
      };
    }
    
    // أولا نسجل الدخول باستخدام Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: undefined
      }
    });
    
    if (error) {
      // طباعة الخطأ بشكل محدود للمساعدة في التصحيح
      console.error("Auth error:", error.message);
      
      // تحسين رسائل الخطأ
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials') || error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'بيانات الدخول غير صحيحة أو الحساب غير موجود'
        };
      }
      
      return { success: false, error: error.message || 'خطأ في تسجيل الدخول' };
    }
    
    if (!data.user) {
      console.error("Authentication successful but no user data returned");
      return { success: false, error: 'فشل في تسجيل الدخول' };
    }
    
    // التحقق مما إذا كان المستخدم هو admin
    const isAdmin = email === 'admin@charity.org';
    console.log("User authenticated successfully with Supabase Auth");
    
    // للمستخدم admin، نحتاج إلى ربطه بالجداول
    if (isAdmin) {
      // Define a helper function for admin user linking
      const linkAdminUser = async () => {
        console.log("Admin user detected - checking linking status");
        try {
          // Call the admin-user-linking Edge Function
          const response = await fetch(`${BASE_URL}/functions/v1/admin-user-linking`, {
            method: 'POST', 
            headers: createHeaders(),
            body: JSON.stringify({ 
              auth_user_id: data.user.id 
            })
          });
          
          const result = await response.json();
          console.log("Admin user linking request sent successfully", result);
        } catch (error) {
          console.warn("Admin user linking failed but login successful, continuing...");
          // Ignore the error and continue with the login process
        }
      };
      
      // Try to link admin user but don't block login if it fails
      try {
        await linkAdminUser();
      } catch (error) {
        console.log('Admin linking failed but login successful, continuing...');
        // Continue with login despite linking failure
      }
    }
    
    // محاولة الحصول على بيانات المستخدم من قاعدة البيانات
    let { data: userData, error: userError } = await supabase
      .from('users')  
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    // Fetch member data separately to avoid ambiguity
    let memberData = null;
    if (userData) {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();
      
      memberData = member;
    }
    
    // إذا لم يتم العثور على المستخدم وكان البريد الإلكتروني admin@charity.org
    // قم بإنشاء سجل المستخدم في جدول users
    if (userError && userError.code === 'PGRST116' && email === 'admin@charity.org') {
      console.log('Admin user not found in users table, creating it now...');
      
      // إنشاء سجل المستخدم في جدول users
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: 'admin@charity.org',
          full_name: 'مدير النظام',
          phone: '+966500000000',
          role: 'admin',
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating admin user in database:', createError);
        return { 
          success: false, 
          error: 'فشل في إنشاء حساب المدير في قاعدة البيانات. الرجاء التحقق من لوحة تحكم Supabase وإنشاء المستخدم من خلال وظيفة إنشاء المدير.'
        };
      } else {
        console.log('Successfully created admin user record');
        userData = newUser;
      }
    } else if (email === 'admin@charity.org' && userData && userData.role !== 'admin') {
      // تحديث دور المستخدم إلى admin إذا كان البريد الإلكتروني هو admin@charity.org
      console.log('User has admin email but role is not admin. Updating role...');
      
      const { data: updatedUserData, error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userData.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Failed to update user role to admin:', updateError);
      } else if (updatedUserData) {
        console.log('Successfully updated user role to admin');
        userData = updatedUserData;
      }
    } else if (userError) {
      console.error('Database error fetching user data:', userError);
      return { success: false, error: 'فشل في استرداد بيانات المستخدم من قاعدة البيانات' };
    }
    
    // التحقق النهائي لضمان أن البريد admin@charity.org يكون دوره admin
    if (email === 'admin@charity.org' && userData && userData.role !== 'admin') {
      console.warn('WARNING: User with admin@charity.org still does not have admin role. Attempt to use admin-user-linking Edge Function to fix this.');
      
      try {
        // Safely attempt to link admin user with timeout protection
        try {
          // Set a timeout to prevent hanging if the function fails
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          await fetch(`${BASE_URL}/functions/v1/admin-user-linking`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify({ 
              auth_user_id: data.user.id 
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log("Admin user linking request completed successfully");
        } catch (linkingError) {
          // Edge function error shouldn't block login
          console.warn("Admin linking function failed (non-critical):", 
            linkingError instanceof Error ? linkingError.message : linkingError);
        }
      } catch (error) {
        console.warn("Admin linking failed but login successful, continuing...");
        // Continue with login despite linking failure
      }
    }
    
    // Combine user and member data
    if (userData) {
      userData = {
        ...userData,
        member: memberData
      };
    }
    
    return { 
      success: !!userData,
      data: userData,
      session: data.session
    };
  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return { 
        success: false, 
        error: 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت وإعدادات قاعدة البيانات.' 
      };
    }
    
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى' };
  }
};
