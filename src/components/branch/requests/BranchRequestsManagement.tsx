import React, { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw } from '../../../constants/icons';
import Button from '../../ui/Button';
import { ServiceRequest } from '../../types/requests';
import { REQUESTS_TEXTS } from '../../../constants/texts';

// Import components
import RequestsTable from './RequestsTable';
import RequestsFilters from './RequestsFilters';
import RequestStats from './RequestStats';
import RequestDetailsModal from './RequestDetailsModal';

interface BranchRequestsManagementProps {
  branch: any;
  onStatsUpdate: () => void;
}

/**
 * مكون إدارة طلبات الفرع
 */
const BranchRequestsManagement: React.FC<BranchRequestsManagementProps> = ({
  branch,
  onStatsUpdate
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // حساب إحصائيات الطلبات
  const requestStats = {
    pending: requests.filter(req => req.status === 'pending').length,
    under_review: requests.filter(req => req.status === 'under_review').length,
    approved: requests.filter(req => req.status === 'approved').length,
    rejected: requests.filter(req => req.status === 'rejected').length,
    total: requests.length
  };

  // تحميل الطلبات
  const loadRequests = useCallback(async () => {
    if (!branch?.id) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'list',
          branchId: branch.id
        })
      });

      if (!response.ok) {
        throw new Error(`فشل في جلب البيانات: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setRequests(result.requests || []);
        onStatsUpdate();
      } else {
        throw new Error(result.error || 'فشل في تحميل طلبات الخدمات');
      }
    } catch (err: any) {
      console.error('Error loading requests:', err);
      setError(`حدث خطأ في تحميل البيانات: ${err.message}`);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  }, [branch?.id, onStatsUpdate]);

  // تحميل الطلبات عند تغيير الفرع
  useEffect(() => {
    if (branch?.id && !initialLoadComplete) {
      loadRequests();
    }
  }, [branch?.id, initialLoadComplete, loadRequests]);

  // تصفية الطلبات حسب البحث وحالة الطلب
  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.national_id.includes(searchTerm) ||
        request.service_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter]);

  // تغيير حالة الطلب
  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update_status',
          requestId,
          newStatus,
          branchId: branch.id
        })
      });

      const result = await response.json();

      if (result.success) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus }
            : req
        ));
        onStatsUpdate();
        return true;
      } else {
        alert('حدث خطأ في تحديث حالة الطلب');
        return false;
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      return false;
    }
  };

  // عرض تفاصيل الطلب
  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // إعادة ضبط الفلاتر
  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              {REQUESTS_TEXTS.REQUESTS_MANAGEMENT}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {REQUESTS_TEXTS.REQUESTS_LIST} ({filteredRequests.length} طلب)
            </p>
          </div>
          <Button onClick={loadRequests} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500" icon={<RefreshCw className="w-5 h-5" />}>
            {REQUESTS_TEXTS.REFRESH}
          </Button>
        </div>

        {/* Filters */}
        <RequestsFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onReset={handleReset}
          onSearch={loadRequests}
          isLoading={isLoading}
        />
      </div>

      {/* Stats */}
      <RequestStats stats={requestStats} loading={isLoading && !initialLoadComplete} />

      {/* Requests Table */}
      <RequestsTable
        requests={filteredRequests}
        onStatusChange={handleStatusChange}
        onViewDetails={handleViewDetails}
        loading={isLoading && !initialLoadComplete}
      />

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          request={selectedRequest}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default BranchRequestsManagement;
