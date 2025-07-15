import React from 'react';
import { 
  Bell, ArrowUpRight, Package, FileText, CheckCircle,
  User, TrendingUp, Clock
} from 'lucide-react';
import Button from '../../ui/Button';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface ActivityAndQuickActionsProps {
  registrationStatus: string;
  memberData: any;
  retryFetch: () => void;
}

const ActivityAndQuickActions: React.FC<ActivityAndQuickActionsProps> = ({
  registrationStatus,
  memberData,
  retryFetch
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Recent Activity Card */}
      <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>آخر النشاطات</span>
        </h3>
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {registrationStatus === 'approved' ? 'تم اعتماد حسابك' : 'تم استلام طلبك'}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatGregorianDate(memberData?.updated_at || new Date().toISOString(), true)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5">
                {registrationStatus === 'approved' 
                  ? 'يمكنك الآن تقديم طلبات الخدمات المتاحة' 
                  : 'سيتم مراجعة طلبك في أقرب وقت'}
              </p>
            </div>
          </div>
          
          {registrationStatus === 'approved' && (
            <>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">تم الانتهاء من مراجعة بياناتك</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatGregorianDate(memberData?.employee_review_date || memberData?.created_at, true)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5">
                    تمت المراجعة بواسطة: الموظف
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">تم اعتماد طلبك من قبل مدير الفرع</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatGregorianDate(memberData?.manager_review_date || memberData?.created_at, true)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5">
                    تهانينا! أصبحت الآن مستفيداً معتمداً
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 opacity-[0.03] dark:opacity-[0.05] transform translate-x-16 -translate-y-16">
          <Bell className="w-full h-full" />
        </div>
        
        <div className="text-center mt-6 pt-2 border-t border-gray-100 dark:border-gray-700 relative z-10">
          <Button 
            variant="outline" 
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={() => alert('جاري تطوير صفحة النشاطات المفصلة')}
          >
            عرض كل النشاطات
          </Button>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>إجراءات سريعة</span>
        </h3>
        
        <div className="space-y-3 relative z-10">
          {registrationStatus === 'approved' ? (
            <>
              <Button
                className="w-full justify-between items-center text-right group px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:shadow-md transition-all border-0"
                variant="outline"
                icon={<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                onClick={() => window.location.href = '/beneficiary?tab=services'}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-700 dark:text-blue-500" />
                  <span>طلب خدمة جديدة</span>
                </div>
              </Button>
              
              <Button
                className="w-full justify-between items-center text-right group px-4 py-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-800 dark:text-green-300 hover:shadow-md transition-all border-0"
                variant="outline"
                icon={<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                onClick={() => window.location.href = '/beneficiary?tab=requests'}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-700 dark:text-green-500" />
                  <span>عرض طلباتي</span>
                </div>
              </Button>
              
              <Button
                className="w-full justify-between items-center text-right group px-4 py-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:shadow-md transition-all border-0"
                variant="outline"
                icon={<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                onClick={() => window.location.href = '/beneficiary?tab=profile'}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-700 dark:text-purple-500" />
                  <span>تحديث بياناتي</span>
                </div>
              </Button>
            </>
          ) : (
            <>
              <Button
                className="w-full justify-between items-center text-right group px-4 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 hover:shadow-md transition-all border-0"
                variant="outline"
                icon={<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                onClick={() => window.location.href = '/beneficiary?tab=registration'}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-700 dark:text-indigo-500" />
                  <span>إكمال البيانات الشخصية</span>
                </div>
              </Button>
              
              <Button
                className="w-full justify-between items-center text-right group px-4 py-3 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:shadow-md transition-all border-0"
                variant="outline"
                icon={<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                onClick={retryFetch}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-700 dark:text-orange-500" />
                  <span>تحديث حالة الطلب</span>
                </div>
              </Button>
              
              <Button
                className="w-full justify-between items-center text-right group px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-900/70 text-gray-800 dark:text-gray-300 hover:shadow-md transition-all border-0"
                variant="outline"
                icon={<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                onClick={() => window.location.href = '/beneficiary?tab=profile'}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-500" />
                  <span>عرض بياناتي الشخصية</span>
                </div>
              </Button>
            </>
          )}
        </div>
        
        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] transform translate-x-12 translate-y-12">
          <TrendingUp className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default ActivityAndQuickActions;
