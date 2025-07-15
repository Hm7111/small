import React, { useState } from 'react';
import RequestDetailsModal from '@/components/shared/modals/RequestDetailsModal';
import { REQUEST_LABELS } from '@/constants/labels';
import RequestActions from './RequestActions';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { formatCurrency } from '@/utils/helpers';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onStatusChange: (requestId: string, newStatus: string) => Promise<boolean>;
}

const BranchRequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  onStatusChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const getStatusBadge = () => {
    const statusMap: Record<string, { status: 'success' | 'error' | 'warning' | 'pending', text: string }> = {
      'approved': { status: 'success', text: REQUEST_LABELS.APPROVED },
      'rejected': { status: 'error', text: REQUEST_LABELS.REJECTED },
      'under_review': { status: 'warning', text: REQUEST_LABELS.UNDER_REVIEW },
      'pending': { status: 'pending', text: REQUEST_LABELS.PENDING }
    };
    
    const statusInfo = statusMap[request.status] || { status: 'info', text: request.status };
    
    return (
      <StatusBadge status={statusInfo.status} text={statusInfo.text} />
    );
  };

  const handleDetailedStatusChange = async (
    requestId: string,
    memberId: string,
    newStatus: string,
    notes?: string
  ) => {
    setIsSubmitting(true);
    try {
      const success = await onStatusChange(requestId, newStatus);
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoContent = (
    <div className="space-y-6">
      {/* Request Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">{REQUEST_LABELS.REQUEST_DETAILS}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Details */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">{REQUEST_LABELS.SERVICE_NAME}</p>
              <p className="font-medium text-gray-900 dark:text-white">{request.service_name}</p>
            </div>
            
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">{REQUEST_LABELS.REQUEST_NUMBER}</p>
              <p className="font-medium text-gray-900 dark:text-white">#{request.id.slice(-6).toUpperCase()}</p>
            </div>
            
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">{REQUEST_LABELS.REQUEST_DATE}</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatGregorianDate(request.created_at)}</p>
            </div>
          </div>
          
          {/* Financial Details */}
          <div className="space-y-3">
            {request.requested_amount && (
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">{REQUEST_LABELS.REQUESTED_AMOUNT}</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(request.requested_amount)}</p>
              </div>
            )}
            
            {request.approved_amount && (
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">{REQUEST_LABELS.APPROVED_AMOUNT}</p>
                <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(request.approved_amount)}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">{REQUEST_LABELS.REQUEST_STATUS}</p>
              <p className="font-medium">{getStatusBadge()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Beneficiary Information */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-4">معلومات المستفيد</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300">الاسم الكامل</p>
              <p className="font-medium text-gray-900 dark:text-white">{request.member_name}</p>
            </div>
            
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300">رقم الهوية</p>
              <p className="font-medium text-gray-900 dark:text-white">{request.national_id}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {(request.notes || request.rejection_reason) && (
        <div className={`bg-gradient-to-r rounded-xl p-6 ${
          request.status === 'approved' ? 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-700/30' : 
          request.status === 'rejected' ? 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700/30' : 
          'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/30'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            request.status === 'approved' ? 'text-green-900 dark:text-green-300' :
            request.status === 'rejected' ? 'text-red-900 dark:text-red-300' :
            'text-blue-900 dark:text-blue-300'
          }`}>
            {request.status === 'approved' ? 'ملاحظات الموافقة' : 
              request.status === 'rejected' ? 'سبب الرفض' : 
              'ملاحظات'}
          </h3>
          
          <p className={`${
            request.status === 'approved' ? 'text-green-700 dark:text-green-400' :
            request.status === 'rejected' ? 'text-red-700 dark:text-red-400' :
            'text-blue-700 dark:text-blue-400'
          }`}>
            {request.rejection_reason || request.notes || 'لا توجد ملاحظات'}
          </p>
        </div>
      )}
    </div>
  );

  const actionsContent = (
    <RequestActions
      requestId={request.id}
      memberId={request.member_id}
      onStatusChange={handleDetailedStatusChange}
      isSubmitting={isSubmitting}
    />
  );

  return (
    <RequestDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      request={request}
      title={request.service_name}
      subtitle={`طلب #${request.id.slice(-6).toUpperCase()}`}
      statusBadge={getStatusBadge()}
      infoContent={infoContent}
      actionsContent={actionsContent}
    />
  );
};

export default BranchRequestDetailsModal;
