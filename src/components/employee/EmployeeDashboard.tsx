import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, FileText, Clock, CheckCircle, AlertTriangle, 
  Home, Settings, LogOut, User, Shield, FileCheck, FileSearch
} from 'lucide-react';
import EmployeeLayout from './EmployeeLayout';
import EmployeeDashboardStats from './dashboard/EmployeeDashboardStats';
import RegistrationReviewList from './registration/RegistrationReviewList';
import EmployeeReports from './reports/EmployeeReports';
import { useTheme } from '../../components/ui/ThemeProvider';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface EmployeeState {
  activeTab: 'dashboard' | 'registrations' | 'documents' | 'profile' | 'reports';
  userData: any;
  employeeData: any;
  branchData: any;
  stats: {
    pendingRegistrations: number;
    assignedToMe: number;
    reviewedByMe: number;
    averageReviewTime: string;
  };
  isLoading: boolean;
}

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [state, setState] = useState<EmployeeState>({
    activeTab: 'dashboard',
    userData: user,
    employeeData: null,
    branchData: null,
    stats: {
      pendingRegistrations: 0,
      assignedToMe: 0,
      reviewedByMe: 0,
      averageReviewTime: '1.2 يوم'
    },
    isLoading: true
  });

  const loadEmployeeData = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employee-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get_dashboard', 
          employeeId: user?.id,
          branchId: user?.branch_id
        })
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          employeeData: result.employeeData || null,
          branchData: result.branchData || null,
          stats: result.stats || prev.stats,
          isLoading: false
        }));
      } else {
        console.error('Failed to load employee data:', result.error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    loadEmployeeData();
  }, [loadEmployeeData]);

  const navigationItems = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      icon: <Home className="w-5 h-5" />,
      description: 'نظرة عامة على المهام'
    },
    {
      id: 'registrations',
      title: 'طلبات التسجيل',
      icon: <FileCheck className="w-5 h-5" />,
      description: 'مراجعة طلبات التسجيل',
      badge: state.stats.assignedToMe > 0 ? state.stats.assignedToMe.toString() : undefined
    },
    {
      id: 'documents',
      title: 'التحقق من المستندات',
      icon: <FileText className="w-5 h-5" />,
      description: 'مراجعة ملفات المستفيدين'
    },
    {
      id: 'reports',
      title: 'التقارير التفصيلية',
      icon: <FileSearch className="w-5 h-5" />,
      description: 'عرض تقارير المستفيدين المسندين'
    },
    {
      id: 'profile',
      title: 'الملف الشخصي',
      icon: <User className="w-5 h-5" />,
      description: 'إعدادات الحساب'
    }
  ];

  const renderContent = () => {
    switch (state.activeTab) {
      case 'dashboard':
        return <EmployeeDashboardStats 
          user={user}
          stats={state.stats} 
          branch={state.branchData}
          isLoading={state.isLoading}
          onRefresh={loadEmployeeData}
        />;
      case 'registrations':
        return <RegistrationReviewList 
          employeeId={user?.id}
          branchId={user?.branch_id}
          onStatsUpdate={loadEmployeeData}
        />;
      case 'documents':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">قريباً</h3>
            <p className="text-gray-600">صفحة التحقق من المستندات قيد التطوير</p>
          </div>
        );
      case 'reports':
        return <EmployeeReports 
          employeeId={user?.id || ''} 
          employeeName={user?.full_name || 'الموظف'} 
          branchId={user?.branch_id || ''} 
        />;
      case 'profile':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">الملف الشخصي</h3>
            <p className="text-gray-600">صفحة الملف الشخصي قيد التطوير</p>
          </div>
        );
      default:
        return <EmployeeDashboardStats 
          user={user}
          stats={state.stats} 
          branch={state.branchData}
          isLoading={state.isLoading}
          onRefresh={loadEmployeeData}
        />;
    }
  };

  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">وصول غير مصرح</h2>
          <p className="text-gray-600">هذه الصفحة مخصصة للموظفين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <EmployeeLayout
      user={user}
      theme={theme}
      onThemeChange={toggleTheme}
      branch={state.branchData}
      activeTab={state.activeTab}
      onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab as any }))}
      navigationItems={navigationItems}
      onLogout={logout}
    >
      {renderContent()}
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
