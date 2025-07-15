import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ThemeProvider from './components/ui/ThemeProvider';
import { ToastProvider } from './contexts/ToastContext';
import { RootState } from './store';
import { initAuth } from './store/slices/authSlice';
import { AppDispatch } from './store';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/admin/AdminDashboard';
import BranchManagerDashboard from './components/branch/BranchManagerDashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import BeneficiaryDashboard from './components/beneficiary/BeneficiaryDashboard';
import ErrorBoundary from './components/ui/ErrorBoundary';
import NotificationContainer from './components/ui/NotificationContainer';
import LoadingSpinner from './components/ui/LoadingSpinner';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    if (!initAttemptedRef.current) {
      dispatch(initAuth());
      initAttemptedRef.current = true;
    }
  }, [dispatch]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderContent = () => {
    // Only show login form if we're initialized and not authenticated
    if (!isAuthenticated || !user) {      
      return (
        <div className="min-h-screen flex flex-col" dir="rtl">
          <LoginForm />
        </div>
      );
    }

    switch (user.role) {
      case 'admin':
        return <AdminDashboard initialLoading={false} />;
      case 'branch_manager':
        return <BranchManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'beneficiary':
      default:
        return <BeneficiaryDashboard />;
    }
  };

  return (
    <ToastProvider>
      <ThemeProvider defaultTheme={theme}>
        <ErrorBoundary>
          <NotificationContainer position="bottom-left" />
          {renderContent()}
        </ErrorBoundary>
      </ThemeProvider>
    </ToastProvider>
  );
};

export default App;
