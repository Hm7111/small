import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
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
  const [activeTab, setActiveTab] = useState('users');
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

  useEffect(() => {
    // تعيين التاب الافتراضي إلى إدارة المستخدمين
    setActiveTab('users');
  }, []);

  // Update isThemeDark when theme changes
  useEffect(() => {
    setIsThemeDark(theme === 'dark');
  }, [theme]);

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersManagement onStatsUpdate={fetchStats} />;
      case 'branches':
        return <BranchesManagement onStatsUpdate={fetchStats} />;
      case 'services':
        return <ServicesManagement onStatsUpdate={fetchStats} />;
      case 'settings':
        return <SystemSettings />;
      default:
      return <UsersManagement onStatsUpdate={() => {}} />;
    }
  };

  return (
    <AdminLayout
      navigationItems={navigationItems}
      user={user}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      theme={theme}
      onThemeChange={toggleTheme}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
