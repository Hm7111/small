import React from 'react';
import { Package, Clock, CheckCircle, Calendar } from 'lucide-react';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface StatsCardsProps {
  stats: {
    availableServices: number;
    activeRequests: number;
    completedRequests: number;
    lastLogin: string;
    nextAppointment: string;
  };
  registrationStatus: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, registrationStatus }) => {
  if (registrationStatus !== 'approved') return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center shadow-inner">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <StatusBadge status="info" text="الخدمات المتاحة" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.availableServices}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">خدمة متاحة</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center shadow-inner">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <StatusBadge status="pending" text="قيد المعالجة" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.activeRequests}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">طلب قيد المعالجة</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center shadow-inner">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <StatusBadge status="success" text="مكتملة" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.completedRequests}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">طلب تمت معالجته</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center shadow-inner">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <StatusBadge status="info" text="المواعيد" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            {stats.nextAppointment ? formatGregorianDate(stats.nextAppointment) : 'لا توجد مواعيد'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">الموعد القادم</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
