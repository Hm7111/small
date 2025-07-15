/**
 * Generic API Response interface
 * Used for all API responses to ensure consistent structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata for API responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> extends ApiResponse {
  data?: T[];
  pagination?: PaginationMeta;
}

/**
 * Filter parameters for API requests
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Sort parameters for API requests
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  originalError?: any;
}
