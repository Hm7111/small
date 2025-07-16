import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { adminService } from '../../features/admin/services/adminService';
import LoadingSpinner from '../ui/LoadingSpinner';
import AdminLayout from './AdminLayout'; // Assuming AdminLayout is default export
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
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الإحصائيات العامة</h2>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي المستخدمين</h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400">إجمالي المستفيدين</h3>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalMembers}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">الطلبات المعلقة</h3>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingRequests}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">الفروع النشطة</h3>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.activeBranches}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">إجمالي الخدمات</h3>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.totalServices}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">حالة النظام</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.systemHealth}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'users':
        return <UsersManagement onStatsUpdate={fetchStats} />;
      case 'branches':
        return <BranchesManagement onStatsUpdate={fetchStats} />;
      case 'services':
        return <ServicesManagement onStatsUpdate={fetchStats} />;
      case 'settings':
        return <SystemSettings />;
      default:
      return <UsersManagement onStatsUpdate={fetchStats} />;
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
