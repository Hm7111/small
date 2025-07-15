/**
 * أنواع البيانات المتعلقة بالطلبات
 */

export interface ServiceRequest {
  id: string;
  member_id: string;
  member_name: string;
  national_id: string;
  service_id: string;
  service_name: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  requested_amount?: number;
  approved_amount?: number;
  employee_id?: string;
  employee_name?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface RequestDetailsViewProps {
  request: ServiceRequest;
}

export interface RequestFormData {
  requestedAmount: number;
  reason: string;
  additionalNotes: string;
  agreeToTerms: boolean;
  uploadedDocuments?: Array<{
    name: string;
    fileInfo: {
      name: string;
      size: number;
      type: string;
    } | null;
  }>;
}

export interface RequestFiltersState {
  searchTerm: string;
  statusFilter: string;
  dateFilter?: string;
  categoryFilter?: string;
}

export interface RequestAction {
  type: 'approve' | 'reject' | 'review' | 'correction';
  requestId: string;
  memberId: string;
  notes?: string;
}

export interface RequestStats {
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  total: number;
  processedToday?: number;
  averageProcessingTime?: string;
}

export interface RequestTimeline {
  id: string;
  requestId: string;
  stepName: string;
  stepStatus: 'completed' | 'in_progress' | 'pending' | 'skipped' | 'error';
  date?: string;
  description?: string;
  performedBy?: {
    id: string;
    name: string;
    role: string;
  };
}
