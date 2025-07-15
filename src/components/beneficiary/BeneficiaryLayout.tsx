import React, { useState } from 'react';
import { 
  LogOut, Bell, Menu, X, 
  User, Shield, Check, Phone, 
  HelpCircle, BookOpen, Clock
} from 'lucide-react';
import { formatGregorianDate } from '../../shared/utils/dateHelpers';
import { motion } from 'framer-motion';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

interface BeneficiaryLayoutProps {
  children: React.ReactNode;
  user: any;
  activeTab: string;
  navigationItems: NavigationItem[];
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  memberData?: any;
  isLoading?: boolean;
}

const BeneficiaryLayout: React.FC<BeneficiaryLayoutProps> = ({ 
  children, 
  user,
  activeTab,
  navigationItems,
  onTabChange,
  onLogout = () => {},
  memberData,
  isLoading = false
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastLoginTime] = useState(() => {
    return formatGregorianDate(new Date().toISOString(), true);
  });
  
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out shadow-xl
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-gray-800">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              {memberData?.status === 'active' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 dark:bg-green-400 rounded-full p-1 border-2 border-white dark:border-gray-800">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">لوحة المستفيد</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">نظام الخدمات الإلكتروني</p>
            </div>
          </motion.div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 dark:text-gray-300" />
          </button>
        </div>

        {/* Last Login Info */}
        <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-700 dark:text-blue-300">آخر تسجيل دخول:</span>
            </div>
            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">{lastLoginTime}</span>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <div className="mb-2 px-2">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">الخدمات والطلبات</h3>
          </div>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const newUrl = `${window.location.pathname}?tab=${item.id}`;
                window.history.pushState({}, '', newUrl);
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-right transition-all duration-300
                ${activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/30 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <div className={`
                flex-shrink-0 ${activeTab === item.id 
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="font-medium">{item.title}</p>
                {item.description && activeTab === item.id && (
                  <p className="text-xs opacity-75 dark:opacity-60">{item.description}</p>
                )}
              </div>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          
          <div className="my-4 px-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">الدعم والمساعدة</h3>
          </div>
          
          <button
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-lg text-right transition-colors duration-200
              text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50
            `}
          >
            <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">الدعم الفني</p>
            </div>
          </button>
          
          <button
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-lg text-right transition-colors duration-200
              text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50
            `}
          >
            <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">دليل الاستخدام</p>
            </div>
          </button>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white dark:text-white font-bold">
                {user?.full_name?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {user?.full_name || 'المستفيد'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {memberData?.registration_status === 'approved' 
                  ? <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>مستفيد معتمد</span>
                    </span>
                  : 'التسجيل قيد المراجعة'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 dark:text-gray-300" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                {navigationItems.find(item => item.id === activeTab)?.icon || <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {navigationItems.find(item => item.id === activeTab)?.title || 'لوحة التحكم'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatGregorianDate(new Date().toISOString(), true)}
              </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></span>
              </button>

              {/* Help */}
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                <Phone className="w-4 h-4" />
                <span className="hidden md:block">920000000</span>
              </button>

              {/* Logout */}
              <button 
                onClick={onLogout} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">تسجيل خروج</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
        
        {/* Government Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">جميع الحقوق محفوظة © {new Date().getFullYear()} | نظام خدمات المستفيدين الموحد</p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-3">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">الشروط والأحكام</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">سياسة الخصوصية</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">اتصل بنا</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BeneficiaryLayout;
