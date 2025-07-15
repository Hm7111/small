/**
 * أنواع البيانات المتعلقة بالتقارير الشاملة
 */

export interface SearchCriteria {
  type: 'national_id' | 'transaction_id' | 'phone_number';
  value: string;
}

export interface BeneficiaryProfile {
  id: string;
  national_id: string;
  full_name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: 'male' | 'female';
  marital_status?: string;
  address?: {
    city: string;
    district: string;
    street?: string;
    building_number?: string;
  };
  employment_status?: string;
  monthly_income?: number;
  family_members_count?: number;
  registration_date: string;
  status: 'active' | 'inactive' | 'suspended';
  branch_id?: string;
  branch_name?: string;
  completion_percentage: number;
  last_activity_date?: string;
}

export interface ServiceRequestDetails {
  id: string;
  service_id: string;
  service_name: string;
  service_category: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  requested_amount?: number;
  approved_amount?: number;
  request_date: string;
  processing_date?: string;
  completion_date?: string;
  employee_id?: string;
  employee_name?: string;
  branch_id?: string;
  branch_name?: string;
  notes?: string;
  rejection_reason?: string;
  documents_submitted?: Array<{
    name: string;
    type: string;
    upload_date: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  timeline?: Array<{
    date: string;
    action: string;
    performed_by: string;
    notes?: string;
  }>;
}

export interface ComprehensiveReport {
  search_criteria: SearchCriteria;
  beneficiary: BeneficiaryProfile;
  service_requests: ServiceRequestDetails[];
  financial_summary: {
    total_requested: number;
    total_approved: number;
    total_received: number;
    pending_amount: number;
  };
  activity_summary: {
    total_requests: number;
    approved_requests: number;
    rejected_requests: number;
    pending_requests: number;
    last_request_date?: string;
    average_processing_time?: number;
  };
  risk_assessment?: {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendations?: string[];
  generated_at: string;
  generated_by: string;
}

export interface AdminAction {
  type: 'approve_request' | 'reject_request' | 'suspend_beneficiary' | 'activate_beneficiary' | 
        'add_note' | 'schedule_interview' | 'request_documents' | 'transfer_branch';
  target_id: string;
  target_type: 'beneficiary' | 'service_request';
  data?: any;
  notes?: string;
}

export interface ReportSearchFilters {
  date_range?: {
    start: string;
    end: string;
  };
  status_filter?: string[];
  branch_filter?: string[];
  service_filter?: string[];
  amount_range?: {
    min: number;
    max: number;
  };
}

export interface QuickSearchResult {
  type: 'beneficiary' | 'service_request';
  id: string;
  title: string;
  subtitle: string;
  status: string;
  highlight?: string;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  include_documents: boolean;
  include_timeline: boolean;
  include_financial_details: boolean;
}

export interface SystemAnalytics {
  total_beneficiaries: number;
  active_beneficiaries: number;
  total_requests_this_month: number;
  approval_rate: number;
  average_processing_time: number;
  top_services: Array<{
    service_name: string;
    request_count: number;
    approval_rate: number;
  }>;
  branch_performance: Array<{
    branch_name: string;
    total_requests: number;
    approval_rate: number;
    avg_processing_time: number;
  }>;
}
