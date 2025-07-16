import React, { useState, useEffect } from 'react';
import { 
  Building, Users, FileText, Clock, CheckCircle, Info,
  AlertTriangle, Home, User, Settings, LogOut, BarChart3,
  Activity, Calendar, RefreshCw, PieChart, TrendingUp, Eye,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BranchManagerLayout from './BranchManagerLayout';
import { useTheme } from '../../components/ui/ThemeProvider';
import RegistrationReviewList from './registration/RegistrationReviewList';
import BranchMembersManagement from './members/BranchMembersManagement';
import BranchDashboard from './dashboard/BranchDashboard';
import BranchRequestsManagement from './requests/BranchRequestsManagement';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { formatGregorianDate } from '../../shared/utils/dateHelpers';

const fadeIn = {
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariant = {
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

interface BranchState {
  activeTab: 'dashboard' | 'registrations' | 'members' | 'requests' | 'employees' | 'reports';
  branchData: any;
  stats: {
    pendingRegistrations: number;
    totalMembers: number;
    activeRequests: number;
    employeesCount: number;
    reviewTime: string;
    branchRank: number;
  } | null;
  isLoading: boolean;
}

const BranchManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [state, setState] = useState<BranchState>({
    activeTab: 'dashboard',
    branchData: null,
    stats: {
      pendingRegistrations: 0,
      totalMembers: 0,
      activeRequests: 0,
      employeesCount: 0,
      reviewTime: '1.5 يوم',
      branchRank: 2
    },
    isLoading: true
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      type: 'registration',
      message: 'تم استلام طلب تسجيل جديد',
      time: new Date().toISOString(),
      user: 'نظام التسجيل'
    },
    {
      type: 'document',
      message: 'تم التحقق من وثائق مستفيد',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user: 'نظام التوثيق'
    },
    {
      type: 'request',
      message: 'تمت الموافقة على طلب خدمة',
      time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      user: 'نظام الخدمات'
    }
  ]);

  useEffect(() => {
    loadBranchData();
  }, []);

  const loadBranchData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // تحقق إذا كان في وضع الإنتاج
      const isProduction = import.meta.env.PROD; // Vite's built-in environment variable
      
      // الحصول على بيانات الفرع والإحصائيات
      let result = { success: false, branchData: null, stats: null };
      
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-manager`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'get_dashboard', 
            managerId: user?.id,
            branchId: user?.branch_id
          })
        });
  
        result = await response.json();
      } catch (error) {
        console.error('Error fetching branch data, using static data:', error);
        // في حالة فشل الطلب في بيئة التطوير، نستخدم بيانات ثابتة
        if (!isProduction) {
          result = {
            success: true,
            branchData: {
              id: user?.branch_id || '10000000-0000-0000-0000-000000000001',
              name: 'فرع الرياض الرئيسي',
              city: 'الرياض',
              address: 'حي الملك عبدالعزيز، شارع الملك فهد',
              manager_name: user?.full_name || 'مدير الفرع'
            },
            stats: {
              pendingRegistrations: 0,
              totalMembers: 2,
              activeRequests: 0,
              employeesCount: 1,
              reviewTime: '1.5 يوم',
              branchRank: 1
            }
          } as any;
        }
      }

      if (result.success) {
        // في بيئة الإنتاج نستخدم البيانات الحقيقية فقط
        let finalStats = result.stats;
        
        // في بيئة التطوير، إذا كانت الإحصائيات فارغة أو غير موجودة، نستخدم بيانات ثابتة
        if (!isProduction && (!finalStats || Object.values(finalStats).every(val => val === 0))) {
          finalStats = {
            pendingRegistrations: 0,
            totalMembers: 2,
            activeRequests: 0,
            employeesCount: 1,
            reviewTime: '1.5 يوم',
            branchRank: 1
          } as any;
        }
        
        setState(prev => ({
          ...prev,
          branchData: result.branchData,
          stats: finalStats || {
            pendingRegistrations: 0,
            totalMembers: 0,
            activeRequests: 0,
            employeesCount: 0,
            reviewTime: '1.5 يوم',
            branchRank: 1
          },
          isLoading: false
        }));
      } else {
        console.error('Failed to load branch data:', (result as any).error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading branch data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const navigationItems = [ 
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      icon: <Home className="w-5 h-5" />,
      description: 'نظرة عامة على الفرع',
      color: 'green'
    },
    {
      id: 'registrations',
      title: 'طلبات التسجيل',
      icon: <FileText className="w-5 h-5" />,
      description: 'مراجعة طلبات التسجيل الجديدة',
      badge: state.stats && state.stats.pendingRegistrations > 0 ? state.stats.pendingRegistrations.toString() : undefined,
      color: 'blue'
    },
    {
      id: 'requests',
      title: 'طلبات الخدمات',
      icon: <Clock className="w-5 h-5" />,
      description: 'إدارة طلبات الخدمات',
      badge: state.stats && state.stats.activeRequests > 0 ? state.stats.activeRequests.toString() : undefined,
      color: 'amber'
    },
    {
      id: 'members',
      title: 'المستفيدين',
      icon: <Users className="w-5 h-5" />,
      description: 'إدارة المستفيدين في الفرع',
      badge: state.stats && state.stats.totalMembers > 0 ? state.stats.totalMembers.toString() : undefined,
      color: 'purple'
    },
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    const defaultStats = {
      pendingRegistrations: 0,
      totalMembers: 0,
      activeRequests: 0,
      employeesCount: 0,
      reviewTime: '1.5 يوم',
      branchRank: 1
    };

    switch (state.activeTab) {
      case 'dashboard':
        return <BranchDashboard stats={state.stats || defaultStats} branch={state.branchData} isLoading={state.isLoading} onRefresh={loadBranchData} recentActivities={recentActivities} />;
      case 'registrations':
        return <RegistrationReviewList branch={state.branchData} onStatsUpdate={loadBranchData} />;
      case 'members':
        return <BranchMembersManagement branch={state.branchData} onStatsUpdate={loadBranchData} />;
      case 'requests':
        return <BranchRequestsManagement branch={state.branchData} onStatsUpdate={loadBranchData} />;
      default:
        return <BranchDashboard stats={state.stats || defaultStats} branch={state.branchData} isLoading={state.isLoading} onRefresh={loadBranchData} recentActivities={recentActivities} />;
    }
  };

  if (!user || user.role !== 'branch_manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">وصول غير مصرح</h2>
          <p className="text-gray-600">هذه الصفحة مخصصة لمدراء الفروع فقط</p>
        </div>
      </div>
    );
  }

  return (
    <BranchManagerLayout
      user={user}
      branch={state.branchData}
      theme={theme}
      onThemeChange={toggleTheme}
      activeTab={state.activeTab}
      onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab as any }))}
      navigationItems={navigationItems}
      onLogout={handleLogout}
    >
      {renderContent()}
    </BranchManagerLayout>
  );
};

export default BranchManagerDashboard;
