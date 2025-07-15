import React from 'react';
import { LogOut, Bell, Search, Menu, X, FileCheck, Calendar, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentGregorianDateTime } from '../../shared/utils/dateHelpers';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

interface EmployeeLayoutProps {
  user: any;
  branch: any;
  theme?: 'light' | 'dark';
  onThemeChange?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  navigationItems: NavigationItem[];
  onLogout: () => void;
  children: React.ReactNode;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({
  user,
  branch,
  theme = 'light',
  onThemeChange,
  activeTab,
  onTabChange,
  navigationItems,
  onLogout,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const renderSidebar = () => (
    <div className={`
      fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      lg:translate-x-0 lg:static lg:inset-0
    `}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">لوحة الموظف</h1>
            <p className="text-xs text-gray-500">{branch?.name || 'جار التحميل...'}</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              setSidebarOpen(false);
            }}
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-xl text-right transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className={`
              flex-shrink-0 ${activeTab === item.id 
                ? 'text-blue-600'
                : 'text-gray-400'
              }
            `}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs opacity-75">{item.description}</p>
            </div>
            {item.badge && (
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.full_name?.charAt(0) || 'E'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {user?.full_name || 'الموظف'}
            </p>
            <p className="text-xs text-gray-500">{branch?.name || 'موظف'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              disabled={isLoading}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.title || 'لوحة التحكم'}
              </h2>
              <p className="text-sm text-gray-500">
                {getCurrentGregorianDateTime()}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              {onThemeChange && (
                <motion.button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
                        <Moon className="w-5 h-5 text-gray-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">تسجيل خروج</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
