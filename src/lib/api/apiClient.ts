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
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        // Wait for token refresh
        return new Promise((resolve) => {
          this.refreshSubscribers.push((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(this.instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        // Refresh token
        const newTokens = await authService.refreshToken();
        
        // Notify subscribers
        this.refreshSubscribers.forEach(callback => callback(newTokens.accessToken));
        this.refreshSubscribers = [];
        
        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        return this.instance(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }

    // Format error response
    let errorMessage = 'حدث خطأ غير متوقع';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.response?.data) {
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      errorCode = error.response.data.code || `ERROR_${error.response.status}`;
    } else if (error.message) {
      errorMessage = error.message;
      
      if (error.message.includes('Network Error')) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
      } else if (error.message.includes('timeout')) {
        errorCode = 'TIMEOUT_ERROR';
        errorMessage = 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
      }
    }

    return Promise.reject({
      message: errorMessage,
      code: errorCode,
      status: error.response?.status,
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
    try {
      // Use direct fetch for edge functions to avoid CORS issues
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        // Try to get more detailed error information
        try {
          const errorData = await response.json();
          throw new Error(
            `HTTP error! Status: ${response.status} ${response.statusText}\nDetails: ${
              errorData.error || errorData.message || JSON.stringify(errorData)
            }`
          );
        } catch (jsonError) {
          // If we can't parse the error as JSON, use the status and text
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error calling function "${functionName}":`, error);
      // Log additional details to help with debugging
      console.error(`URL: ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`);
      console.error(`Request data:`, data);
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
      } else {
        console.error(`Unknown error type:`, error);
      }
      throw error;
    }
  }
}

// Export as singleton
export const apiClient = new ApiClient();
export default apiClient;
