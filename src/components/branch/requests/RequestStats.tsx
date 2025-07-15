import React from 'react';
import { REQUEST_LABELS } from '../../../constants/labels';
import { UIIcons, RequestIcons } from '../../../constants/icons';

interface RequestStatsProps {
  stats: {
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    total: number;
  };
  loading?: boolean;
}

/**
 * مكون إحصائيات الطلبات
 */
const RequestStats: React.FC<RequestStatsProps> = ({ stats, loading = false }) => {
  // تحديد أنواع الإحصائيات
  const statItems = [
    {
      key: 'pending',
      label: REQUEST_LABELS.PENDING,
      value: stats.pending,
      icon: <RequestIcons.Clock className="w-4 h-4" />,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'under_review',
      label: REQUEST_LABELS.UNDER_REVIEW,
      value: stats.under_review,
      icon: <UIIcons.Eye className="w-4 h-4" />,
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      key: 'approved',
      label: REQUEST_LABELS.APPROVED,
      value: stats.approved,
      icon: <RequestIcons.CheckCircle className="w-4 h-4" />,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'rejected',
      label: REQUEST_LABELS.REJECTED,
      value: stats.rejected,
      icon: <RequestIcons.XCircle className="w-4 h-4" />,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {statItems.map((item) => (
          <div key={item.key} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div 
          key={item.key}
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
              <p className={`text-2xl font-bold ${item.textColor}`}>{item.value}</p>
            </div>
            <div className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center`}>
              <div className={item.textColor}>{item.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestStats;
