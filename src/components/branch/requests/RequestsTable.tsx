import React from 'react';
import { ServiceRequest } from '../../../types/requests';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { StatusBadge } from '../../../shared';
import ActionButtons from '../../../shared/components/ActionButtons';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { formatCurrency } from '../../../utils/helpers';
import { REQUEST_LABELS } from '../../../constants/labels';
import { UIIcons, ServiceIcons, RequestIcons } from '../../../constants/icons';

interface RequestsTableProps {
  requests: ServiceRequest[];
  onStatusChange: (requestId: string, newStatus: string) => void;
  onViewDetails: (request: ServiceRequest) => void;
  loading: boolean;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  onStatusChange,
  onViewDetails,
  loading
}) => {
  // تحويل حالة الطلب إلى نوع StatusBadge
  const getStatusBadgeType = (status: string): 'success' | 'error' | 'warning' | 'pending' | 'info' => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'warning';
      case 'pending': return 'pending';
      default: return 'info';
    }
  };

  // تحويل حالة الطلب إلى نص عربي
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'approved': return REQUEST_LABELS.APPROVED;
      case 'rejected': return REQUEST_LABELS.REJECTED;
      case 'under_review': return REQUEST_LABELS.UNDER_REVIEW;
      case 'pending': return REQUEST_LABELS.PENDING;
      default: return status;
    }
  };

  // تعريف الأعمدة
  const columns: Column<ServiceRequest>[] = [
    {
      key: 'beneficiary',
      header: 'المستفيد',
      cell: (request) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {request.member_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{request.member_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.national_id}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'service',
      header: 'الخدمة',
      cell: (request) => (
        <div className="flex items-center gap-2">
          <ServiceIcons.FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {request.service_name}
          </span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'المبلغ المطلوب',
      cell: (request) => (
        <div className="flex items-center gap-2">
          <ServiceIcons.DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
          <span className="text-sm text-gray-900 dark:text-gray-200 font-medium">
            {request.requested_amount ? formatCurrency(request.requested_amount) : 'غير محدد'}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'تاريخ الطلب',
      cell: (request) => (
        <div className="flex items-center gap-2">
          <UIIcons.Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatGregorianDate(request.created_at)}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'الحالة',
      cell: (request) => (
        <StatusBadge 
          status={getStatusBadgeType(request.status)}
          text={getStatusText(request.status)}
        />
      )
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      cell: (request) => {
        // تحديد الإجراءات المتاحة حسب حالة الطلب
        const actions = [];
        
        // زر عرض التفاصيل متاح دائماً
        actions.push({
          key: 'view',
          icon: <UIIcons.Eye className="w-4 h-4" />,
          onClick: () => onViewDetails(request),
          title: 'عرض التفاصيل'
        });
        
        // إضافة الأزرار حسب حالة الطلب
        if (request.status === 'pending') {
          actions.push(
            {
              key: 'review',
              icon: <RequestIcons.Clock className="w-4 h-4" />,
              onClick: () => onStatusChange(request.id, 'under_review'),
              title: 'بدء المراجعة'
            },
            {
              key: 'approve',
              icon: <RequestIcons.CheckCircle className="w-4 h-4" />,
              onClick: () => onStatusChange(request.id, 'approved'),
              title: 'موافقة'
            },
            {
              key: 'reject',
              icon: <RequestIcons.XCircle className="w-4 h-4" />,
              onClick: () => onStatusChange(request.id, 'rejected'),
              title: 'رفض'
            }
          );
        } else if (request.status === 'under_review') {
          actions.push(
            {
              key: 'approve',
              icon: <RequestIcons.CheckCircle className="w-4 h-4" />,
              onClick: () => onStatusChange(request.id, 'approved'),
              title: 'موافقة'
            },
            {
              key: 'reject',
              icon: <RequestIcons.XCircle className="w-4 h-4" />,
              onClick: () => onStatusChange(request.id, 'rejected'),
              title: 'رفض'
            }
          );
        }
        
        return (
          <ActionButtons 
            actions={actions}
            compact={true}
            direction="row"
            spacing="sm"
          />
        );
      }
    }
  ];

  // عرض رسالة في حالة عدم وجود طلبات
  const emptyState = (
    <div className="text-center py-12 px-4">
      <UIIcons.FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد طلبات خدمات</h3>
      <p className="text-gray-500 dark:text-gray-400">
        لا توجد طلبات خدمات في الفرع حالياً
      </p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={requests}
      keyExtractor={(request) => request.id}
      emptyState={emptyState}
      onRowClick={onViewDetails}
      loading={loading}
      pageSize={10}
    />
  );
};

export default RequestsTable;
