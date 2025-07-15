import React from 'react';
import { 
  Users, Clock, CheckCircle, RefreshCw, FileText, 
  AlertTriangle, TrendingUp, Award, Calendar,
  Activity, PieChart, Building, Eye, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

const fadeIn: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariant: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

interface BranchDashboardProps {
  stats: {
    pendingRegistrations: number;
    totalMembers: number;
    activeRequests: number;
    employeesCount: number;
    reviewTime: string;
    branchRank: number;
  };
  branch: any;
  isLoading: boolean;
  onRefresh: () => void;
  recentActivities: Array<{
    type: string;
    message: string;
    time: string;
    user: string;
  }>;
}

const BranchDashboard: React.FC<BranchDashboardProps> = ({ 
  stats, 
  branch, 
  isLoading,
  onRefresh,
  recentActivities
}) => {
  const statCards = [
    {
      title: 'طلبات التسجيل الجديدة',
      value: stats.pendingRegistrations,
      icon: <FileText className="w-6 h-6" />,
      color: 'amber',
      description: 'بانتظار المراجعة',
      path: 'registrations'
    },
    {
      title: 'طلبات الخدمات النشطة',
      value: stats.activeRequests,
      icon: <Clock className="w-6 h-6" />,
      color: 'blue',
      description: 'قيد المعالجة',
      path: 'requests'
    },
    {
      title: 'عدد المستفيدين',
      value: stats.totalMembers,
      icon: <Users className="w-6 h-6" />,
      color: 'purple',
      description: 'مستفيد مسجل',
      path: 'members'
    },
    {
      title: 'عدد الموظفين',
      value: stats.employeesCount,
      icon: <Users className="w-6 h-6" />,
      color: 'green',
      description: 'موظف في الفرع',
      path: 'employees'
    }
  ];

  const performanceMetrics = [
    {
      title: 'ترتيب الفرع',
      value: `#${stats.branchRank}`,
      icon: <Award className="w-5 h-5 text-amber-600" />,
      description: 'بين جميع الفروع'
    },
    {
      title: 'متوسط زمن المراجعة',
      value: stats.reviewTime,
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      description: 'لطلبات التسجيل'
    },
    {
      title: 'نسبة الموافقة',
      value: '85%',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      description: 'للطلبات الجديدة'
    }
  ];

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6" 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm"
          variants={fadeIn}
        >
          <motion.div 
            className="text-center"
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [0.98, 1, 0.98] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2 
            }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">جاري تحميل البيانات...</p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Branch Header */}
      <motion.div 
        className="relative bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-800 rounded-2xl p-8 text-white overflow-hidden shadow-lg"
        variants={fadeIn}
      >
        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              مرحباً {branch?.manager_name || user?.full_name || 'مدير الفرع'}
            </h1>
            <p className="text-green-100 text-lg">
              لوحة تحكم فرع {branch?.name || 'الفرع'}
            </p>
            <div className="flex items-center mt-4 text-green-200">
              <Building className="w-5 h-5 mr-2" />
              {branch?.city}, {branch?.address}
              <span className="mx-3">•</span>
              <Calendar className="w-5 h-5 mr-2" />
              {formatGregorianDate(new Date().toISOString())}
            </div>
          </div>
          <motion.div 
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center border border-white/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-bold">{branch?.name?.charAt(0) || 'B'}</span>
            <span className="text-xs mt-1">{branch?.city}</span>
          </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3"></div>
      </motion.div>
      
      {/* Alert for pending registrations */}
      {stats.pendingRegistrations > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-6 shadow-sm"
          variants={fadeIn}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-amber-100 dark:bg-amber-800/60 rounded-xl flex items-center justify-center"
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 1, repeat: 2, repeatType: "reverse" }}
            >
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">طلبات تحتاج مراجعتك</h3>
              <p className="text-amber-800 dark:text-amber-400">
                يوجد {stats.pendingRegistrations} {stats.pendingRegistrations === 1 ? 'طلب' : 'طلبات'} تسجيل {stats.pendingRegistrations === 1 ? 'جديد' : 'جديدة'} {stats.pendingRegistrations === 1 ? 'ينتظر' : 'تنتظر'} المراجعة
              </p>
            </div>
            <div className="flex-grow"></div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
              onClick={() => alert('تم التحويل إلى طلبات التسجيل')}
                className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 shadow-sm"
              >
              مراجعة الطلبات
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card: any, index: number) => (
          <motion.div 
            key={index}
            variants={cardVariant}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center 
                ${card.color === 'amber' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
                  card.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' :
                  card.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-500 text-white' :
                  'bg-gradient-to-br from-green-400 to-green-500 text-white'}
                shadow-md
              `}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-300">{card.description}</p>
              <div className={`
                px-2 py-1 rounded-full text-xs font-medium 
                ${card.color === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                  card.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                  card.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                  'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}
              `}>
                عرض التفاصيل
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Performance Metrics */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        variants={fadeIn}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            أداء الفرع
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {performanceMetrics.map((metric: any, index: number) => (
            <motion.div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-inner"
              variants={cardVariant}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.title}</h4>
                {metric.icon}
              </div>
              <div className="text-center pt-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div 
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          variants={fadeIn}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          آخر النشاطات
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-500"
            >
              عرض الكل
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivities?.map((activity: any, index: number) => (
              <motion.div 
                key={`activity-${index}`} 
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/70 hover:bg-gray-100 dark:hover:bg-gray-900/90 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ x: 5 }}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${activity.type === 'registration' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' :
                    activity.type === 'request' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' :
                    'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'}
                `}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white">{activity.message}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.user}</p>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatGregorianDate(activity.time, true)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          variants={fadeIn}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              التقويم
            </h3>
            <p className="text-sm text-gray-500">
              {formatGregorianDate(new Date().toISOString())}
            </p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 text-center h-64 flex flex-col items-center justify-center">
            <Calendar className="w-12 h-12 text-green-400 mb-3" />
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">قريبًا</h4>
            <p className="text-sm text-green-600 dark:text-green-400">سيتم إضافة التقويم وإدارة المواعيد قريبًا</p>
            
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-green-200 text-green-700 dark:border-green-700 dark:text-green-400"
              onClick={() => alert('سيتم إضافة هذه الميزة قريبًا')}
            >
              استعراض المهام
            </Button>
          </div>
        </motion.div>
      </div>
        
      {/* Summary Stats */}
      <motion.div 
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30 rounded-xl p-6"
        variants={fadeIn}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-800/60 rounded-full flex items-center justify-center">
            <PieChart className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-300">ملخص أداء الفرع الشهري</h3>
            <p className="text-sm text-green-700 dark:text-green-400">
              المعدل العام للإنجاز: <span className="font-bold dark:text-white">92%</span> • 
              الطلبات المنجزة: <span className="font-bold dark:text-white">45</span> • 
              معدل رضا المستفيدين: <span className="font-bold dark:text-white">4.8/5</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
  
  // دالة مساعدة للحصول على أيقونة النشاط
  function getActivityIcon(type: string) {
    // تأكد من استخدام أيقونات وقيم ثابتة لتجنب مشاكل العرض
    switch (type) {
      case 'registration': return <FileText className="w-5 h-5" />;
      case 'request': return <CheckCircle className="w-5 h-5" />;
      case 'document': return <Eye className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  }
};

export default BranchDashboard;
