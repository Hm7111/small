import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService, getAuthTokens, isTokenExpired } from '../auth/authService';

/**
 * API Client for making HTTP requests
 * Implements secure token management and automatic refresh
 */
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Create axios instance with default config
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_SUPABASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Setup request interceptor
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Setup response interceptor
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Handle request interceptor
   */
  private async handleRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    // Add API key to all requests
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (apiKey) {
      config.headers = {
        ...config.headers,
        'apikey': apiKey
      };
    }

    // Add auth token if available
    const tokens = getAuthTokens();
    if (tokens) {
      // Check if token is expired and needs refresh
      if (isTokenExpired() && !this.isRefreshing && !config.url?.includes('refresh-token')) {
        try {
          // Refresh token
          const newTokens = await authService.refreshToken();
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${newTokens.accessToken}`
          };
        } catch (error) {
          console.error('Token refresh failed during request:', error);
          // Continue with request without token
        }
      } else if (tokens.accessToken) {
        // Add current token
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${tokens.accessToken}`
        };
      }
    }

    return config;
  }

  /**
   * Handle request error interceptor
   */
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    console.error('Request error:', error);
    return Promise.reject(error);
  }

  /**
   * Handle response interceptor
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  /**
   * Handle response error interceptor
   */
  private async handleResponseError(error: AxiosError): Promise<any> {
    const originalRequest: any = error.config;
    
    // معالجة أخطاء 401 (غير مصرح)
    if (error.response?.status === 401 && !originalRequest._retry && authService.isAuthenticated()) {
      if (this.isRefreshing) {
        // انتظار تحديث الرمز
        return new Promise((resolve) => {
          this.refreshSubscribers.push((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(this.instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      console.log('جاري تحديث رمز المصادقة...');
      try {
        // تحديث الرمز
        const newTokens = await authService.refreshToken();
        
        // إشعار المشتركين
        this.refreshSubscribers.forEach(callback => callback(newTokens.accessToken));
        this.refreshSubscribers = [];
        
        // إعادة المحاولة للطلب الأصلي
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        return this.instance(originalRequest);
      } catch (refreshError) {
        // فشل تحديث الرمز، إعادة توجيه لصفحة تسجيل الدخول
        console.error('فشل تحديث رمز المصادقة:', refreshError);
        
        // حذف بيانات المصادقة
        authService.logout();
        
        // إعادة التوجيه إلى صفحة تسجيل الدخول
        window.location.href = '/';
        
        return Promise.reject({ 
          message: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول',
          code: 'SESSION_EXPIRED'
        });
      } finally {
        this.isRefreshing = false;
      }
    }

    // تنسيق استجابة الخطأ
    let errorMessage = 'حدث خطأ غير متوقع في النظام';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.response?.data) {
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      errorCode = error.response.data.code || `ERROR_${error.response.status}`;
      
      // ترجمة رسائل الخطأ الشائعة
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_credentials')) {
        errorMessage = 'بيانات تسجيل الدخول غير صحيحة';
        errorCode = 'INVALID_CREDENTIALS';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'لم يتم تأكيد البريد الإلكتروني بعد';
        errorCode = 'EMAIL_NOT_CONFIRMED';
      }
    } else if (error.message) {
      errorMessage = error.message;
      
      if (error.message.includes('Network Error')) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
      } else if (error.message.includes('timeout')) {
        errorCode = 'TIMEOUT_ERROR';
        errorMessage = 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        errorCode = 'NOT_FOUND_ERROR';
        errorMessage = 'الخدمة أو المورد المطلوب غير موجود';
      } else if (error.message.includes('already exists') || error.message.includes('409')) {
        errorCode = 'CONFLICT_ERROR';
        errorMessage = 'البيانات موجودة مسبقاً ولا يمكن إضافتها مرة أخرى';
      }
    }

    // سجل الخطأ بتفاصيل أكثر للمطورين
    console.error(`[${errorCode}] ${errorMessage}`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    return Promise.reject({
      message: errorMessage,
      code: errorCode,
      status: error.response?.status,
      url: error.config?.url,
      originalError: error
    });
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Call a Supabase Edge Function
   */
  public async callFunction<T = any>(functionName: string, data: any = {}): Promise<T> {
    // التحقق من معايير البحث وصحة البيانات
    const validationErrors = this.validateFunctionCallData(functionName, data);
    if (validationErrors) {
      return Promise.reject({
        success: false,
        error: validationErrors.error,
        code: validationErrors.code
      }) as any;
    }

    try {
      // تحقق من وجود الدالة قبل استدعائها
      if (functionName === 'admin-stats' || 
          functionName === 'admin-comprehensive-report' || 
          functionName === 'admin-quick-search' || 
          functionName === 'branch-manager-reports' || 
          functionName === 'admin-analytics' || 
          functionName === 'employee-reports') {
        console.log(`⚠️ محاولة استدعاء وظيفة محذوفة: ${functionName}`);
        return { 
          success: false, 
          error: 'هذه الوظيفة غير متاحة حالياً، تم حذفها من النظام',
          errorCode: 'FUNCTION_REMOVED'
        } as unknown as T;
      }
      
      // التحقق من إعدادات Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL is not configured');
      }

      if (!supabaseKey) {
        throw new Error('VITE_SUPABASE_ANON_KEY is not configured');
      }

      console.log(`🔄 جاري استدعاء وظيفة ${functionName}...`);
      
      // استخدام fetch مباشرة لوظائف Edge لتجنب مشاكل CORS
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        // محاولة الحصول على معلومات خطأ أكثر تفصيلاً
        try {
          const errorData = await response.json();
          
          // تحسين رسالة الخطأ بالعربية
          let arabicError = 'حدث خطأ في استدعاء الوظيفة';
          if (response.status === 404) {
            arabicError = `الوظيفة "${functionName}" غير موجودة`;
          } else if (response.status === 403) {
            arabicError = 'ليس لديك صلاحية الوصول لهذه الوظيفة';
          } else if (response.status === 500) {
            arabicError = 'حدث خطأ داخلي في الخادم';
          } else if (response.status === 400) {
            arabicError = 'طلب غير صحيح: ' + (errorData.error || errorData.message || '');
          }
          
          throw new Error(
            `${arabicError} (${response.status})`
          );
        } catch (jsonError) {
          // إذا لم نتمكن من تحليل الخطأ كـ JSON، فاستخدم الحالة والنص
          throw new Error(`خطأ HTTP! الحالة: ${response.status} ${response.statusText}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error calling function "${functionName}":`, error);
      // Log additional details to help with debugging
      console.error(`الرابط: ${import.meta.env.VITE_SUPABASE_URL || 'غير محدد'}/functions/v1/${functionName}`);
      console.error(`بيانات الطلب:`, data);
      if (error instanceof Error) {
        console.error(`اسم الخطأ: ${error.name}، الرسالة: ${error.message}`);
      } else {
        console.error(`نوع خطأ غير معروف:`, error);
      }
      
      // تقديم رسائل خطأ وصفية أكثر
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`فشل في الاتصال بالخادم. تحقق من إعدادات الشبكة والاتصال بالإنترنت.`);
      }
      
      throw error;
    }
  }
  
  /**
   * التحقق من صحة بيانات استدعاء الوظيفة
   */
  private validateFunctionCallData(functionName: string, data: any): { error: string, code: string } | null {
    // التحقق من وظائف البحث
    if (functionName === 'admin-quick-search' || functionName === 'search-beneficiaries') {
      if (!data.query && !data.criteria?.value) {
        return { 
          error: 'يجب إدخال معايير البحث', 
          code: 'VALIDATION_ERROR' 
        };
      }
      
      if (data.query && data.query.length < 3) {
        return { 
          error: 'يجب أن تكون كلمة البحث 3 أحرف على الأقل', 
          code: 'VALIDATION_ERROR' 
        };
      }
      
      if (data.criteria?.type === 'national_id' && data.criteria?.value) {
        const nationalIdRegex = /^\d{10}$/;
        if (!nationalIdRegex.test(data.criteria.value)) {
          return { 
            error: 'رقم الهوية الوطنية يجب أن يتكون من 10 أرقام', 
            code: 'VALIDATION_ERROR' 
          };
        }
      }
      
      if (data.criteria?.type === 'phone_number' && data.criteria?.value) {
        const phoneRegex = /^(05\d{8}|\+9665\d{8})$/;
        if (!phoneRegex.test(data.criteria.value.replace(/\s/g, ''))) {
          return { 
            error: 'صيغة رقم الهاتف غير صحيحة', 
            code: 'VALIDATION_ERROR' 
          };
        }
      }
    }
    
    return null;
  }
}

// Export as singleton
export const apiClient = new ApiClient();
export default apiClient;
