import React from 'react';
import { Shield, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import Button from '../../ui/Button';

interface StatusCardProps {
  registrationStatus: string;
  memberData: any;
  onRetry: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  registrationStatus, 
  memberData, 
  onRetry 
}) => {
  if (registrationStatus === 'approved') return null;

  return (
    <div className={`bg-gradient-to-r rounded-2xl p-8 border shadow-md relative
      ${registrationStatus === 'rejected' ? 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700/30' : 
       registrationStatus === 'needs_correction' ? 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700/30' : 
       'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/30'}
    `}>
      <div className="flex items-start gap-6">
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center shadow-md
          ${registrationStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' :
           registrationStatus === 'needs_correction' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300' :
           'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'}
        `}>
          {registrationStatus === 'rejected' ? 
            <Shield className="w-6 h-6" /> : 
            <Clock className="w-6 h-6" />}
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <h2 className={`text-2xl font-bold 
              ${registrationStatus === 'rejected' ? 'text-red-900 dark:text-red-300' :
               registrationStatus === 'needs_correction' ? 'text-amber-900 dark:text-amber-300' :
               'text-blue-900 dark:text-blue-300'}
            `}>
              {registrationStatus === 'pending_review' ? 'طلبك قيد المراجعة الأولية' :
               registrationStatus === 'under_employee_review' ? 'طلبك قيد مراجعة الموظف' :
               registrationStatus === 'under_manager_review' ? 'طلبك قيد مراجعة المدير' :
               registrationStatus === 'rejected' ? 'تم رفض طلبك' :
               registrationStatus === 'needs_correction' ? 'يحتاج طلبك للتصحيح' :
               registrationStatus === 'profile_incomplete' ? 'الملف الشخصي غير مكتمل' :
               'حالة التسجيل'}
            </h2>
            <p className={`text-base mt-2
              ${registrationStatus === 'rejected' ? 'text-red-700 dark:text-red-400' :
               registrationStatus === 'needs_correction' ? 'text-amber-700 dark:text-amber-400' :
               'text-blue-700 dark:text-blue-400'}
            `}>
              {registrationStatus === 'pending_review' ? 'سيتم مراجعة طلبك من قبل الموظفين في أقرب وقت' :
               registrationStatus === 'under_employee_review' ? 'يتم فحص بياناتك والتحقق من المستندات' :
               registrationStatus === 'under_manager_review' ? 'طلبك قيد المراجعة النهائية من قبل مدير الفرع' :
               registrationStatus === 'rejected' ? 'تم رفض طلبك، يرجى مراجعة الأسباب أدناه' :
               registrationStatus === 'needs_correction' ? 'يرجى تصحيح البيانات المطلوبة' :
               registrationStatus === 'profile_incomplete' ? 'يرجى إكمال بياناتك الشخصية لإتمام التسجيل' :
               'حالة التسجيل غير محددة'}
            </p>
          </div>
          
          {/* Additional Info */}
          {memberData?.rejection_reason && ( 
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl p-5">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2 text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                سبب الرفض:
              </h3>
              <p className="text-red-800 dark:text-red-300">{memberData.rejection_reason}</p>
            </div>
          )}
          
          {memberData?.employee_notes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-base flex items-center gap-2">
                <User className="w-5 h-5" />
                ملاحظات الموظف:
              </h3>
              <p className="text-blue-800 dark:text-blue-300">{memberData.employee_notes}</p>
            </div>
          )}

          {memberData?.manager_notes && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30 rounded-xl p-5">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 text-base flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ملاحظات المدير:
              </h3>
              <p className="text-purple-800 dark:text-purple-300">{memberData.manager_notes}</p>
            </div>
          )}

          {registrationStatus === 'needs_correction' && (
            <div className="flex justify-end">
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => window.location.href = '/beneficiary?tab=registration'}
              >
                تصحيح البيانات
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
