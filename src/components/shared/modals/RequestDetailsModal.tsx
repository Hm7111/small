import React from 'react';
import { X } from '@/constants/icons';
import Button from '@/components/ui/Button';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { formatCurrency } from '@/utils/helpers';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  title: string;
  subtitle: string;
  statusBadge: React.ReactNode;
  infoContent: React.ReactNode;
  actionsContent: React.ReactNode;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  title,
  subtitle,
  statusBadge,
  infoContent,
  actionsContent
}) => {
  const [tab, setTab] = React.useState<'info' | 'actions'>('info');

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-3xl relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {request.service_name?.charAt(0) || 'S'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>
                  {statusBadge}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTab('info')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${tab === 'info' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
              `}
            >
              تفاصيل الطلب
            </button>
            <button
              onClick={() => setTab('actions')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${tab === 'actions' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
              `}
            >
              الإجراءات
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {tab === 'info' ? infoContent : actionsContent}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
