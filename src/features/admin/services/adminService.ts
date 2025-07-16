import { apiClient } from '../../../lib/api/apiClient';
import { ApiResponse } from '../../../core/types/api';

/**
 * Types for Admin Service
 */
export interface Service {
  id: string;
  name: string;
  description?: string;
  requirements?: string;
  category?: string;
  max_amount?: number;
  duration_days?: number;
  created_by?: string;
  creator_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  requests_count?: number;
  required_documents?: Array<{
    name: string;
    is_required: boolean;
  }>;
  reapplication_period_months?: number;
  is_one_time_only?: boolean;
}

export interface ServiceCreateData {
  name: string;
  description?: string;
  requirements?: string;
  category?: string;
  max_amount?: number;
  duration_days?: number;
  required_documents?: Array<{
    name: string;
    is_required: boolean;
  }>;
  reapplication_period_months?: number;
  is_one_time_only?: boolean;
}

export interface ServiceUpdateData extends ServiceCreateData {
  is_active?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  manager_id?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employees_count?: number;
  members_count?: number;
}

export interface User {
  id: string;
  full_name: string;
  email?: string;
  national_id?: string;
  phone: string;
  role: 'admin' | 'branch_manager' | 'employee' | 'beneficiary';
  branch_id?: string;
  branch_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalMembers: number;
  pendingRequests: number;
  activeBranches: number;
  totalServices: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  // إحصائيات إضافية
  userGrowthRate?: string;
  avgRequestsPerBranch?: number;
  approvalRate?: number;
  avgProcessingTime?: number;
  totalRequests?: number;
  approvedRequests?: number;
}

class AdminService {
  
  /**
   * Services Management
   */
  public services = {
    /**
     * Get all services
     */
    async getAll(): Promise<ApiResponse<Service[]>> {
      try {
        const result = await apiClient.callFunction<Service[]>(
          'admin-services',
          { action: 'list' }
        );
        return result as unknown as ApiResponse<Service[]>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في جلب الخدمات' 
        };
      }
    },

    /**
     * Create a new service
     */
    async create(serviceData: ServiceCreateData): Promise<ApiResponse<Service>> {
      try {
        const result = await apiClient.callFunction<Service>(
          'admin-services',
          {
            action: 'create',
            serviceData
          }
        );
        return result as unknown as ApiResponse<Service>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في إنشاء الخدمة' 
        };
      }
    },

    /**
     * Update an existing service
     */
    async update(serviceId: string, serviceData: ServiceUpdateData): Promise<ApiResponse<Service>> {
      try {
        const result = await apiClient.callFunction<Service>(
          'admin-services',
          {
            action: 'update',
            serviceId,
            serviceData
          }
        );
        return result as unknown as ApiResponse<Service>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في تحديث الخدمة' 
        };
      }
    },

    /**
     * Toggle service status (active/inactive)
     */
    async toggleStatus(serviceId: string, newStatus: boolean): Promise<ApiResponse<Service>> {
      try {
        const result = await apiClient.callFunction<Service>(
          'admin-services',
          {
            action: 'toggle_status',
            serviceId,
            newStatus
          }
        );
        return result as unknown as ApiResponse<Service>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في تغيير حالة الخدمة' 
        };
      }
    },

    /**
     * Check if service has requests
     */
    async checkHasRequests(serviceId: string): Promise<{ success: boolean; hasRequests: boolean; requestCount: number; error?: string }> {
      try {
        const result = await apiClient.callFunction<{ hasRequests: boolean; requestCount: number }>(
          'admin-services',
          {
            action: 'check_has_requests',
            serviceId
          }
        ) as unknown as ApiResponse<{ hasRequests: boolean; requestCount: number }>;
        
        return {
          success: result.success,
          hasRequests: result.data?.hasRequests || false,
          requestCount: result.data?.requestCount || 0
        };
      } catch (error: any) {
        return { 
          success: false, 
          hasRequests: false, 
          requestCount: 0, 
          error: error?.message || 'فشل في التحقق من الطلبات' 
        };
      }
    },

    /**
     * Delete a service
     */
    async delete(serviceId: string): Promise<ApiResponse<Service> & { hasRequests?: boolean }> {
      try {
        const result = await apiClient.callFunction<Service & { hasRequests?: boolean }>(
          'admin-services',
          {
            action: 'delete',
            serviceId
          }
        );
        return result as unknown as ApiResponse<Service> & { hasRequests?: boolean };
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في حذف الخدمة' 
        };
      }
    }
  };

  /**
   * Branches Management
   */
  public branches = {
    /**
     * Get all branches
     */
    async getAll(): Promise<ApiResponse<Branch[]>> {
      try {
        const result = await apiClient.callFunction<Branch[]>(
          'admin-branches',
          { action: 'list' }
        );
        return result as unknown as ApiResponse<Branch[]>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في جلب الفروع' 
        };
      }
    },

    /**
     * Create a new branch
     */
    async create(branchData: Partial<Branch>): Promise<ApiResponse<Branch>> {
      try {
        const result = await apiClient.callFunction<Branch>(
          'admin-branches',
          {
            action: 'create',
            branchData
          }
        );
        return result as unknown as ApiResponse<Branch>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في إنشاء الفرع' 
        };
      }
    },

    /**
     * Toggle branch status (active/inactive)
     */
    async toggleStatus(branchId: string, newStatus: boolean): Promise<ApiResponse<Branch>> {
      try {
        const result = await apiClient.callFunction<Branch>(
          'admin-branches',
          {
            action: 'toggle_status',
            branchId,
            newStatus
          }
        );
        return result as unknown as ApiResponse<Branch>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في تغيير حالة الفرع' 
        };
      }
    }
  };

  /**
   * Users Management
   */
  public users = {
    /**
     * Get all users
     */
    async getAll(): Promise<ApiResponse<User[]>> {
      try {
        const result = await apiClient.callFunction<User[]>(
          'admin-users',
          { action: 'list' }
        );
        return result as unknown as ApiResponse<User[]>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في جلب المستخدمين' 
        };
      }
    },

    /**
     * Create a new user
     */
    async create(userData: Partial<User>): Promise<ApiResponse<User>> {
      try {
        const result = await apiClient.callFunction<User>(
          'admin-users',
          {
            action: 'create',
            userData
          }
        );
        return result as unknown as ApiResponse<User>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في إنشاء المستخدم' 
        };
      }
    },

    /**
     * Toggle user status (active/inactive)
     */
    async toggleStatus(userId: string, newStatus: boolean): Promise<ApiResponse<User>> {
      try {
        const result = await apiClient.callFunction<User>(
          'admin-users',
          {
            action: 'toggle_status',
            userId,
            newStatus
          }
        );
        return result as unknown as ApiResponse<User>;
      } catch (error: any) {
        return { 
          success: false, 
          error: error?.message || 'فشل في تغيير حالة المستخدم' 
        };
      }
    }
  };
}

// Export as singleton instance
export const adminService = new AdminService();
export default adminService;
