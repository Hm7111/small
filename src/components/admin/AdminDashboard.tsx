import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { adminService } from '../../features/admin/services/adminService';
import LoadingSpinner from '../ui/LoadingSpinner';
import AdminLayout from './AdminLayout'; // Assuming AdminLayout is default export
import ReportsAnalytics from './ReportsAnalytics';
import UsersManagement from './users/UsersManagement';
import BranchesManagement from './branches/BranchesManagement';
import ServicesManagement from './services/ServicesManagement';
import SystemSettings from '../../features/admin/components/settings/SystemSettings';
import { useTheme } from '../ui/ThemeProvider';
import { useCallback } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Settings, 
  FileText, 
  Shield 
} from 'lucide-react';

interface AdminDashboardProps {
  initialLoading?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialLoading = true }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isThemeDark, setIsThemeDark] = useState(theme === 'dark');
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalMembers: number;
    pendingRequests: number;
    activeBranches: number;
    totalServices: number;
    systemHealth: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigationItems = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      icon: <BarChart3 />,
      description: 'عرض الإحصائيات العامة',
      color: 'bg-blue-500'
    },
    {
      id: 'users',
      title: 'إدارة المستخدمين',
      icon: <Users />,
      description: 'إدارة المستخدمين والصلاحيات',
      color: 'bg-green-500'
    },
    {
      id: 'branches',
      title: 'إدارة الفروع',
      icon: <Building2 />,
      description: 'إدارة الفروع والمواقع',
      color: 'bg-purple-500'
    },
    {
      id: 'services',
      title: 'إدارة الخدمات',
      icon: <FileText />,
      description: 'إدارة الخدمات المقدمة',
      color: 'bg-orange-500'
    },
    {
      id: 'reports',
      title: 'التقارير والتحليلات',
      icon: <BarChart3 />,
      description: 'عرض التقارير والإحصائيات',
      color: 'bg-indigo-500'
    },
    {
      id: 'settings',
      title: 'إعدادات النظام',
      icon: <Settings />,
      description: 'إعدادات النظام العامة',
      color: 'bg-gray-500'
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); 
      
      // Fetch dashboard statistics
      const dashboardStats = await adminService.dashboard.getStats(user.id);
      
      // Transform the data to match the expected format
      setStats({
        totalUsers: dashboardStats.totalUsers || 0,
        totalMembers: dashboardStats.totalMembers || 0,
        pendingRequests: dashboardStats.pendingRequests || 0,
        activeBranches: dashboardStats.activeBranches || 0,
        totalServices: dashboardStats.totalServices || 0,
        systemHealth: dashboardStats.systemHealth || 'جيد'
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('فشل في تحميل الإحصائيات');
      
      // Provide fallback data to prevent crashes
      setStats({
        totalUsers: 0,
        totalMembers: 0,
        pendingRequests: 0,
        activeBranches: 0,
        totalServices: 0,
        systemHealth: 'غير متاح'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' && !initialLoading) {
      fetchStats();
    }
  }, [user, fetchStats, initialLoading]);

  // Update isThemeDark when theme changes
  useEffect(() => {
    setIsThemeDark(theme === 'dark');
  }, [theme]);

  const renderContent = () => {
    if ((loading || initialLoading) && !stats) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">جاري تحميل بيانات لوحة التحكم...</p>
          </div>
        </div>
      );
    }

    if (error && !stats) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">خطأ في تحميل البيانات</div>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return stats ? <ReportsAnalytics stats={stats} /> : null;
      case 'users':
        return <UsersManagement onStatsUpdate={fetchStats} />;
      case 'branches':
        return <BranchesManagement onStatsUpdate={fetchStats} />;
      case 'services':
        return <ServicesManagement onStatsUpdate={fetchStats} />;
      case 'reports':
        return stats ? <ReportsAnalytics stats={stats} /> : null;
      case 'settings':
        return <SystemSettings />;
      default:
        return stats ? <ReportsAnalytics stats={stats} /> : null;
    }
  };

  return (
    <AdminLayout
      navigationItems={navigationItems}
      user={user}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      theme={theme}
      onThemeChange={toggleTheme}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
