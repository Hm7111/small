/**
 * Unified API Client
 * Centralized HTTP client with error handling and logging
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.defaultHeaders = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create request headers with defaults
   */
  private createHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...customHeaders
    };
  }

  /**
   * Log API calls in development mode
   */
  private log(endpoint: string, method: string, data?: any, response?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🌐 API ${method}: ${endpoint}`);
      if (data) console.log('📤 Request:', data);
      if (response) {
        if (response.success) {
          console.log('✅ Response:', response);
        } else {
          console.error('❌ Error:', response.error);
        }
      }
      console.groupEnd();
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any, endpoint: string): ApiResponse {
    const errorMessage = error.message || 'خطأ في الشبكة';
    
    console.error(`❌ Network Error (${endpoint}):`, errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }

  /**
   * Make HTTP request with unified error handling
   */
  async request<T = any>(
    endpoint: string, 
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'POST',
      headers: customHeaders,
      body,
      timeout = 30000
    } = config;

    try {
      this.log(endpoint, method, body);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: this.createHeaders(customHeaders),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      this.log(endpoint, method, body, result);

      if (result.success || response.ok) {
        return {
          success: true,
          data: result.data || result
        };
      } else {
        return {
          success: false,
          error: result.error || 'خطأ غير معروف'
        };
      }
    } catch (error: any) {
      return this.handleError(error, endpoint);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data, headers });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, headers });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data, headers });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

