import { apiClient } from '../../../lib/api/apiClient';
import { ApiResponse } from '../../../core/types/api';
import { 
  SearchCriteria, 
  ComprehensiveReport, 
  QuickSearchResult, 
  ReportSearchFilters,
  SystemAnalytics,
  AdminAction,
  BeneficiaryProfile,
  ServiceRequestDetails
} from '../../../types/reports';

/**
 * خدمة التقارير الشاملة
 * تتعامل مع البحث المتقدم وإنشاء التقارير التفصيلية
 * محدثة للاتصال بقاعدة البيانات الفعلية
 */
class ReportService {
  
  /**
   * البحث السريع - يعطي نتائج سريعة للاقتراحات
   */
  async quickSearch(query: string): Promise<ApiResponse<QuickSearchResult[]>> {
    try {
      const result = await apiClient.callFunction<QuickSearchResult[]>(
        'admin-quick-search',
        {
          action: 'search',
          query: query.trim(),
          limit: 10
        }
      ) as unknown as ApiResponse<QuickSearchResult[]>;

      return result;
    } catch (error: any) {
      console.error('Quick search error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في البحث السريع'
      };
    }
  }

  /**
   * البحث الشامل وإنشاء التقرير التفصيلي
   */
  async generateComprehensiveReport(
    criteria: SearchCriteria, 
    filters?: ReportSearchFilters
  ): Promise<ApiResponse<ComprehensiveReport>> {
    try {
      const result = await apiClient.callFunction<ComprehensiveReport>(
        'admin-comprehensive-report',
        {
          action: 'generate',
          criteria,
          filters
        }
      ) as unknown as ApiResponse<ComprehensiveReport>;

      return result;
    } catch (error: any) {
      console.error('Comprehensive report error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في إنشاء التقرير'
      };
    }
  }

  /**
   * تنفيذ إجراء إداري
   */
  async executeAdminAction(action: AdminAction): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.callFunction<any>(
        'admin-actions',
        {
          action: action.type,
          target_id: action.target_id,
          data: action.data
        }
      ) as unknown as ApiResponse<any>;

      return result;
    } catch (error: any) {
      console.error('Admin action error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في تنفيذ الإجراء'
      };
    }
  }

  /**
   * الحصول على إحصائيات النظام الفعلية
   */
  async getSystemAnalytics(): Promise<ApiResponse<SystemAnalytics>> {
    try {
      // Return empty analytics to avoid breaking functionality
      const fallbackAnalytics: SystemAnalytics = {
        total_beneficiaries: 0,
        active_beneficiaries: 0,
        total_requests_this_month: 0,
        approval_rate: 0,
        average_processing_time: 0,
        top_services: [],
        branch_performance: []
      };

      return {
        success: false,
        data: fallbackAnalytics,
        error: 'تم إلغاء وظيفة التقارير'
      };
    } catch (error: any) {
      console.error('System analytics error:', error);
      
      // في حالة فشل الاتصال، إرجاع بيانات افتراضية
      const fallbackAnalytics: SystemAnalytics = {
        total_beneficiaries: 0,
        active_beneficiaries: 0,
        total_requests_this_month: 0,
        approval_rate: 0,
        average_processing_time: 0,
        top_services: [],
        branch_performance: []
      };

      return {
        success: false,
        data: fallbackAnalytics,
        error: error?.message || 'فشل في جلب الإحصائيات'
      };
    }
  }

  /**
   * تصدير التقرير
   */
  async exportReport(
    reportId: string, 
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<ApiResponse<{ download_url: string }>> {
    try {
      const result = await apiClient.callFunction<{ download_url: string }>(
        'admin-export-report',
        {
          action: 'export',
          reportId,
          format
        }
      ) as unknown as ApiResponse<{ download_url: string }>;

      return result;
    } catch (error: any) {
      console.error('Export report error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في تصدير التقرير'
      };
    }
  }

  /**
   * البحث في المستفيدين بالهوية الوطنية
   */
  async searchByNationalId(nationalId: string): Promise<ApiResponse<BeneficiaryProfile>> {
    try {
      const result = await apiClient.callFunction<BeneficiaryProfile>(
        'admin-search-beneficiary',
        {
          action: 'search_by_national_id',
          national_id: nationalId
        }
      ) as unknown as ApiResponse<BeneficiaryProfile>;

      return result;
    } catch (error: any) {
      console.error('Search by national ID error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في البحث بالهوية الوطنية'
      };
    }
  }

  /**
   * البحث في المستفيدين برقم الجوال
   */
  async searchByPhoneNumber(phoneNumber: string): Promise<ApiResponse<BeneficiaryProfile>> {
    try {
      const result = await apiClient.callFunction<BeneficiaryProfile>(
        'admin-search-beneficiary',
        {
          action: 'search_by_phone',
          phone_number: phoneNumber
        }
      ) as unknown as ApiResponse<BeneficiaryProfile>;

      return result;
    } catch (error: any) {
      console.error('Search by phone error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في البحث برقم الجوال'
      };
    }
  }

  /**
   * البحث في الطلبات برقم المعاملة
   */
  async searchByTransactionId(transactionId: string): Promise<ApiResponse<ServiceRequestDetails>> {
    try {
      const result = await apiClient.callFunction<ServiceRequestDetails>(
        'admin-search-request',
        {
          action: 'search_by_transaction_id',
          transaction_id: transactionId
        }
      ) as unknown as ApiResponse<ServiceRequestDetails>;

      return result;
    } catch (error: any) {
      console.error('Search by transaction ID error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في البحث برقم المعاملة'
      };
    }
  }

  /**
   * الحصول على تاريخ طلبات المستفيد
   */
  async getBeneficiaryRequestHistory(beneficiaryId: string): Promise<ApiResponse<ServiceRequestDetails[]>> {
    try {
      const result = await apiClient.callFunction<ServiceRequestDetails[]>(
        'admin-beneficiary-history',
        {
          action: 'get_request_history',
          beneficiary_id: beneficiaryId
        }
      ) as unknown as ApiResponse<ServiceRequestDetails[]>;

      return result;
    } catch (error: any) {
      console.error('Get beneficiary history error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في جلب تاريخ الطلبات'
      };
    }
  }

  /**
   * تحديث حالة المستفيد
   */
  async updateBeneficiaryStatus(
    beneficiaryId: string, 
    newStatus: 'active' | 'suspended' | 'inactive',
    reason?: string
  ): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.callFunction<any>(
        'admin-update-beneficiary',
        {
          action: 'update_status',
          beneficiary_id: beneficiaryId,
          new_status: newStatus,
          reason
        }
      ) as unknown as ApiResponse<any>;

      return result;
    } catch (error: any) {
      console.error('Update beneficiary status error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في تحديث حالة المستفيد'
      };
    }
  }

  /**
   * إضافة ملاحظة إدارية
   */
  async addAdminNote(
    targetId: string,
    targetType: 'beneficiary' | 'request',
    note: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.callFunction<any>(
        'admin-add-note',
        {
          action: 'add_note',
          target_id: targetId,
          target_type: targetType,
          note,
          priority
        }
      ) as unknown as ApiResponse<any>;

      return result;
    } catch (error: any) {
      console.error('Add admin note error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في إضافة الملاحظة'
      };
    }
  }

  /**
   * الحصول على إحصائيات الفرع
   */
  async getBranchStatistics(branchId: string): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.callFunction<any>(
        'admin-branch-stats',
        {
          action: 'get_branch_statistics',
          branch_id: branchId
        }
      ) as unknown as ApiResponse<any>;

      return result;
    } catch (error: any) {
      console.error('Get branch statistics error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في جلب إحصائيات الفرع'
      };
    }
  }

  /**
   * الحصول على تقرير الأداء الشهري
   */
  async getMonthlyPerformanceReport(
    year: number,
    month: number
  ): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.callFunction<any>(
        'admin-monthly-report',
        {
          action: 'get_monthly_performance',
          year,
          month
        }
      ) as unknown as ApiResponse<any>;

      return result;
    } catch (error: any) {
      console.error('Get monthly performance error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في جلب تقرير الأداء الشهري'
      };
    }
  }

  /**
   * البحث المتقدم مع فلاتر متعددة
   */
  async advancedSearch(filters: {
    national_id?: string;
    phone_number?: string;
    transaction_id?: string;
    service_type?: string;
    status?: string;
    branch_id?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
  }): Promise<ApiResponse<any[]>> {
    try {
      const result = await apiClient.callFunction<any[]>(
        'admin-advanced-search',
        {
          action: 'advanced_search',
          filters
        }
      ) as unknown as ApiResponse<any[]>;

      return result;
    } catch (error: any) {
      console.error('Advanced search error:', error);
      return {
        success: false,
        error: error?.message || 'فشل في البحث المتقدم'
      };
    }
  }
}

// تصدير كمثيل واحد
export const reportService = new ReportService();
export default reportService;
