import React, { useState, useEffect } from 'react';
import { 
  LogOut, Bell, Search, Menu, X, Building, Calendar,
  Moon, Sun, ChevronDown, Settings, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentGregorianDateTime } from '../../shared/utils/dateHelpers';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color?: string;
  description: string;
  badge?: string;
}

interface BranchManagerLayoutProps {
  user: any;
  branch: any;
  theme: 'light' | 'dark';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onThemeChange: () => void;
  navigationItems: NavigationItem[];
  onLogout: () => void;
  children: React.ReactNode;
}

const BranchManagerLayout: React.FC<BranchManagerLayoutProps> = ({
  user,
  branch,
  theme,
  activeTab,
  onTabChange,
  onThemeChange,
  navigationItems,
  onLogout,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'طلب تسجيل جديد يحتاج المراجعة', time: '5 دقائق', read: false },
    { id: 2, text: 'تم الموافقة على طلب المستفيد أحمد', time: '20 دقائق', read: false },
    { id: 3, text: 'اكتمال مراجعة المستندات', time: 'ساعة واحدة', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const renderSidebar = () => (
    <motion.div 
      className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        shadow-2xl lg:shadow-none
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Building className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">لوحة مدير الفرع</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{branch?.name || 'جار التحميل...'}</p>
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
        {navigationItems.map((item, index) => (
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
                    item.color === 'amber' ? 'from-amber-50 to-amber-100 text-amber-700 border border-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300 dark:border-amber-800/50' :
                    item.color === 'indigo' ? 'from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300 dark:border-indigo-800/50' :
                    'from-green-50 to-emerald-50 text-green-700 border border-green-200 dark:from-green-900/40 dark:to-emerald-800/40 dark:text-green-300 dark:border-green-800/50'
                  }` 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              } shadow-sm hover:shadow-md
            `}
          >
            <div className={`
              flex-shrink-0 ${activeTab === item.id
                ? item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  item.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                  item.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                  'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
              }
            `}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs opacity-75">{item.description}</p>
            </div>
            {item.badge && (
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 animate-pulse">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-bold">
              {user?.full_name?.charAt(0) || 'M'}
            </span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.full_name || 'مدير الفرع'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">مدير فرع</p>
          </div>
          <div>
            <motion.button
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('سيتم إضافة إعدادات المستخدم قريباً')}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
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
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              disabled={false}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
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
              
              {/* Search Bar */}
              <div className="relative hidden lg:block">
                <div className="flex items-center">
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="flex items-center">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-green-500 dark:focus:border-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <motion.button 
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </motion.button>
                
                {showNotifications && (
                  <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white">الإشعارات</h4>
                      <button 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                      >
                        تعيين الكل كمقروء
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                          لا توجد إشعارات جديدة
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 rounded-lg mb-1 ${notification.read ? 'bg-gray-50 dark:bg-gray-900' : 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500 dark:border-blue-600'}`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${notification.read ? 'text-gray-800 dark:text-gray-300' : 'text-gray-900 dark:text-gray-200 font-medium'}`}>
                                {notification.text}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              منذ {notification.time}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        عرض كافة الإشعارات
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Dropdown */}
              <div className="relative">
                <motion.button 
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.full_name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.full_name?.split(' ')[0] || 'مدير الفرع'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Logout */}
              <motion.button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">تسجيل خروج</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-pattern">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BranchManagerLayout;
