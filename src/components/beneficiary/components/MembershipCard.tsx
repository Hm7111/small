import React from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Check, MapPin } from 'lucide-react';
import Button from '../../ui/Button';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface MembershipCardProps {
  registrationStatus: string;
  memberData: any;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ registrationStatus, memberData }) => {
  if (registrationStatus !== 'approved') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl shadow-md p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-white dark:border-blue-900">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                بطاقة العضوية الرسمية
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">رقم التسجيل: {memberData?.id?.slice(-8).toUpperCase() || 'غير محدد'}</p>
            </div>
            <Button
              variant="outline"
              className="text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 sm:flex-shrink-0"
              onClick={() => alert('عرض بطاقة العضوية')}
            >
              عرض البطاقة الرقمية
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
            <div className="text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">رقم العضوية</p>
              <p className="font-bold text-blue-800 dark:text-blue-300">{memberData?.id?.slice(-6).toUpperCase() || 'غير محدد'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">تاريخ الانضمام</p>
              <p className="font-bold text-blue-800 dark:text-blue-300">{formatGregorianDate(memberData?.created_at || new Date())}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">فرع الخدمة</p>
              <p className="font-bold text-blue-800 dark:text-blue-300">{memberData?.branch_name || 'الرئيسي'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">الحالة</p>
              <p className="font-bold text-green-600 dark:text-green-400">عضوية نشطة</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MembershipCard;
