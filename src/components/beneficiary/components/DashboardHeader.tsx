import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar } from 'lucide-react';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { StatusBadge } from '../../../shared';
import { REGISTRATION_STATUS_LABELS } from '../../../utils/constants';

interface DashboardHeaderProps {
  userData: any;
  memberData: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userData, memberData }) => {
  // Get registration status
  const registrationStatus = memberData?.registration_status || 'profile_incomplete';
  const statusLabel = REGISTRATION_STATUS_LABELS[registrationStatus as keyof typeof REGISTRATION_STATUS_LABELS] || 
    (typeof registrationStatus === 'string' ? registrationStatus : 'غير معروف');

  // Determine status color
  const getStatusColor = () => {
    switch (registrationStatus) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'needs_correction': return 'warning';
      case 'under_manager_review':
      case 'pending_review':
      default:
        return 'info';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-800 dark:to-indigo-900 rounded-2xl p-8 text-white shadow-lg overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-200" />
            <span className="text-sm text-blue-200 font-medium">نظام الخدمات الإلكتروني الحكومي الموحد</span>
          </div>
          <h1 className="text-3xl font-bold">
            مرحباً، {memberData?.full_name || userData?.full_name || 'المستفيد'}
          </h1>
          <p className="text-blue-100 flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              رقم العضوية: <span className="font-semibold">{memberData?.id?.slice(-8).toUpperCase() || 'غير محدد'}</span>
            </span>
            
            {memberData?.created_at && (
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm">
                <Calendar className="w-3.5 h-3.5 inline ml-1" />
                تاريخ التسجيل: {formatGregorianDate(memberData?.created_at)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
              <StatusBadge 
                status={getStatusColor()} 
                text={statusLabel} 
                size="lg"
              />
            </div>
          </div>
          <div className="hidden md:block">
            {memberData?.profile_completion_percentage !== undefined && (
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <div className="text-sm text-white">اكتمال الملف: 
                  <div className="w-24 bg-white/20 h-2.5 rounded-full mt-1.5">
                    <div 
                      className="h-2.5 rounded-full bg-green-400" 
                      style={{width: `${memberData.profile_completion_percentage}%`}}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 mt-1 inline-block">{memberData.profile_completion_percentage}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 translate-y-32"></div>
    </motion.div>
  );
};

export default DashboardHeader;
