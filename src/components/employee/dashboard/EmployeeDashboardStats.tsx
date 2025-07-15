import React from 'react';
import { 
  Users, FileCheck, Clock, RefreshCw, 
  CheckCircle, AlertTriangle, Calendar,
  Building
} from 'lucide-react';
import Button from '../../ui/Button';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface EmployeeDashboardStatsProps {
  user: any;
  stats: {
    pendingRegistrations: number;
    assignedToMe: number;
    reviewedByMe: number;
    averageReviewTime: string;
  };
  branch: any;
  isLoading: boolean;
  onRefresh: () => void;
}

const EmployeeDashboardStats: React.FC<EmployeeDashboardStatsProps> = ({ 
  user,
  stats, 
  branch, 
  isLoading,
  onRefresh 
}) => {
  const statCards = [
    {
      title: 'طلبات قيد المراجعة',
      value: stats.pendingRegistrations,
      icon: <FileCheck className="w-6 h-6" />,
      color: 'blue',
      description: 'إجمالي الطلبات بالفرع',
      path: 'registrations'
    },
    {
      title: 'مسندة إليّ',
      value: stats.assignedToMe,
      icon: <Clock className="w-6 h-6" />,
      color: 'amber',
      description: 'تحتاج مراجعتك',
      path: 'registrations'
    },
    {
      title: 'تمت المراجعة',
      value: stats.reviewedByMe,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      description: 'مراجعات سابقة',
      path: 'registrations'
    }
  ];

  const recentActivity = [
    {
      title: 'تم مراجعة طلب المستفيد أحمد محمد',
      date: formatGregorianDate(new Date().toISOString(), true),
      status: 'تم التحقق',
      icon: <CheckCircle className="w-4 h-4 text-green-600" />
    },
    {
      title: 'تم طلب تصحيح لطلب المستفيدة سارة علي',
      date: formatGregorianDate(new Date(Date.now() - 86400000).toISOString(), true), // يوم واحد مضى
      status: 'بحاجة لتصحيح',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
    },
    {
      title: 'طلب جديد: خالد محمد',
      date: formatGregorianDate(new Date(Date.now() - 172800000).toISOString(), true), // يومان مضى
      status: 'قيد المراجعة',
      icon: <Clock className="w-4 h-4 text-blue-600" />
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              مرحباً {user?.full_name || 'بالموظف'}
            </h1>
            <p className="text-blue-100 text-lg">
              {branch?.name || 'الفرع'} - لوحة تحكم الموظف
            </p>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <p className="text-sm text-blue-500">سيتم إضافة التقويم وإدارة المهام قريبًا</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert for assigned tasks */}
      {stats.assignedToMe > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">مهام تنتظر مراجعتك</h3>
              <p className="text-amber-800">
                يوجد {stats.assignedToMe} طلب مُسند إليك {stats.assignedToMe === 1 ? 'ينتظر' : 'تنتظر'} المراجعة
              </p>
            </div>
            <div className="flex-grow"></div>
            <Button
              onClick={() => alert('تم التحويل إلى المهام المسندة إليك')}
              className="bg-amber-600 hover:bg-amber-700"
            >
              مراجعة المهام
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${card.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  card.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'}
              `}>
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
            <p className="text-sm font-medium text-gray-700">{card.title}</p>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>
      
      {/* Tasks Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            النشاط الأخير
          </h3>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={onRefresh}
          >
            تحديث
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {activity.date}
                </div>
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {activity.status}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Button variant="outline">
            عرض المزيد
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">متوسط وقت المراجعة</h3>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-blue-700">{stats.averageReviewTime}</span>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-4">المستفيدين في فرعك</h3>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-purple-700">124</span>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-4">معدل إنجاز المهام</h3>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-700">95%</span>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* Calendar Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          التقويم والمهام
        </h3>
        
        <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <p className="text-blue-600 font-medium">التقويم قيد التطوير</p>
            <p className="text-sm text-blue-500">سيتم إضافة التقويم وإدارة المهام قريبًا</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardStats;
