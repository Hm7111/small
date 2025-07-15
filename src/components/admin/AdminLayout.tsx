import React from 'react';
import { LogOut, Shield, Bell, Search, Menu, X, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getCurrentGregorianDateTime } from '../../shared/utils/dateHelpers';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  badge?: string;
}

interface AdminLayoutProps {
  user: any;
  activeTab: string;
  navigationItems: NavigationItem[];
  onTabChange: (tab: string) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: () => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  activeTab,
  onTabChange,
  navigationItems,
  theme = 'light',
  onThemeChange,
  children
}) => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  const renderSidebar = () => (
    <div className={`
      fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      lg:translate-x-0 lg:static lg:inset-0
    `}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">لوحة الإدارة</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">نظام المستفيدين</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5 dark:text-gray-300" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems && navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              setSidebarOpen(false);
            }}
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-xl text-right transition-all duration-300
              ${activeTab === item.id
                ? `bg-gradient-to-r ${
                    item.color === 'blue' ? 'from-blue-50 to-blue-100 text-blue-700 border border-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:border-blue-800/50' :
                    item.color === 'purple' ? 'from-purple-50 to-purple-100 text-purple-700 border border-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-300 dark:border-purple-800/50' :
                    item.color === 'green' ? 'from-green-50 to-green-100 text-green-700 border border-green-200 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300 dark:border-green-800/50' :
                    item.color === 'orange' ? 'from-orange-50 to-orange-100 text-orange-700 border border-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-300 dark:border-orange-800/50' :
                    item.color === 'indigo' ? 'from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300 dark:border-indigo-800/50' :
                    'from-gray-50 to-gray-100 text-gray-700 border border-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 dark:text-gray-300 dark:border-gray-800/50'
                  }`
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              } shadow-sm hover:shadow-md
            `}
          >
            <div className={`
              flex-shrink-0 ${activeTab === item.id 
                ? item.color === 'blue' ? 'text-blue-600' :
                  item.color === 'purple' ? 'text-purple-600' :
                  item.color === 'green' ? 'text-green-600' :
                  item.color === 'orange' ? 'text-orange-600' :
                  item.color === 'indigo' ? 'text-indigo-600' :
                  'text-gray-600'
                : 'text-gray-400 dark:text-gray-500'
              }
            `}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs opacity-75 dark:opacity-60">{item.description}</p>
            </div>
            {item.badge && (
              <span className={`
                px-2 py-1 text-xs font-bold rounded-full
                ${item.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  item.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  item.color === 'green' ? 'bg-green-100 text-green-700' :
                  item.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  item.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
              `}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.full_name || 'مدير النظام'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">مدير النظام</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      {/* Sidebar */}
      {renderSidebar()}

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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 dark:text-gray-300" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {navigationItems.find(item => item.id === activeTab)?.title || 'لوحة التحكم'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getCurrentGregorianDateTime()}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              {onThemeChange && (
                <motion.button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onThemeChange}
                  title={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === 'light' ? (
                      <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-5 h-5 text-amber-400 dark:text-amber-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="flex items-center">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="بحث..."
                      className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={false}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">تسجيل خروج</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
