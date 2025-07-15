import React, { useState } from 'react';
import { LoginState, LoginStep, UserType } from '../types';
import UserTypeSelection from './login/UserTypeSelection';
import NationalIdForm from './login/NationalIdForm';
import { OtpVerification } from './login/OtpVerification';
import AdminLogin from './login/AdminLogin';
import NewBeneficiaryRegistration from './registration/NewBeneficiaryRegistration';
import RegistrationSuccess from './registration/RegistrationSuccess';
import { Building, CheckCircle, Shield, Users, Moon, Sun } from 'lucide-react';
import { useTheme } from './ui/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

const LoginForm: React.FC = () => {
  const [state, setState] = useState<LoginState>({
    step: 'selection' as any,
    userType: null,
    sessionId: null,
    nationalId: '',
    otp: '',
    email: '',
    password: '',
    isLoading: false,
    error: null,
    user: null
  });

  const updateState = (updates: Partial<LoginState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleUserTypeSelect = (userType: UserType | 'new_beneficiary') => {
    if (userType === 'new_beneficiary') {
      updateState({ step: 'new_beneficiary' as any });
    } else if (userType === 'admin') {
      updateState({ userType: userType as UserType, step: 'admin_login' });
    } else {
      updateState({ userType: userType as UserType, step: 'national_id' });
    }
  };

  const handleBackToSelection = () => {
    updateState({ 
      step: 'selection', 
      userType: null, 
      nationalId: '', 
      otp: '', 
      email: '', 
      password: '', 
      error: null 
    });
  };

  const handleNewBeneficiaryComplete = (userData: any) => {
    // Save user data and trigger success state
    console.log('New beneficiary registered successfully:', userData);
    updateState({ user: userData, step: 'success' });
  };
  const handleNationalIdNext = (sessionId: number) => {
    updateState({ step: 'otp', sessionId });
  };

  const handleOtpBack = () => {
    updateState({ step: 'national_id', otp: '', sessionId: null });
  };

  const handleLoginSuccess = () => {
    console.log("Login successful, redirecting to dashboard");
    // Force page reload to refresh the app state
    window.location.reload();
  };

  const handleCompleteRegistration = () => {
    // إعادة تحميل الصفحة للتوجه للوحة التحكم
    window.location.reload();
  };

  const renderStep = () => {
    switch (state.step) {
      case 'selection':
        return <UserTypeSelection onSelectType={handleUserTypeSelect} />;

      case 'new_beneficiary':
        return (
          <NewBeneficiaryRegistration
            onComplete={handleNewBeneficiaryComplete}
            onBack={handleBackToSelection}
          />
        );
      
      case 'success':
        return (
          <RegistrationSuccess
            user={state.user}
            onComplete={handleCompleteRegistration}
          />
        );
        
      case 'national_id':
        return (
          <NationalIdForm
            userType={state.userType!}
            nationalId={state.nationalId}
            onNationalIdChange={(value) => updateState({ nationalId: value })}
            onNext={handleNationalIdNext}
            onBack={handleBackToSelection}
          />
        );

      case 'otp':
        return (
          <OtpVerification
            nationalId={state.nationalId}
            otp={state.otp}
            sessionId={state.sessionId}
            onOtpChange={(value) => updateState({ otp: value })}
            onBack={handleOtpBack}
            onSuccess={handleLoginSuccess}
          />
        );

      case 'admin_login':
        return (
          <AdminLogin
            email={state.email}
            password={state.password}
            onEmailChange={(value) => updateState({ email: value })}
            onPasswordChange={(value) => updateState({ password: value })}
            onBack={handleBackToSelection}
            onSuccess={handleLoginSuccess}
          />
        );

      default:
        return <UserTypeSelection onSelectType={handleUserTypeSelect} />;
    }
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Government-style background with pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
             backgroundSize: '60px 60px'
           }}></div>

      <div className="relative w-full max-w-5xl z-10">
        {/* iOS Style Theme Toggle Button */}
        <div className="absolute top-4 left-4 z-20">
          <motion.button
            className="relative w-14 h-7 rounded-full bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            title={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
          >
            {/* Background Track */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30 dark:from-gray-600 dark:to-gray-800"></div>
            
            {/* Sliding Circle */}
            <motion.div
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-200 shadow-md flex items-center justify-center"
              animate={{
                x: theme === 'light' ? 0 : 26,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'light' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -180, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 180, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <Moon className="w-3 h-3 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 180, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -180, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: theme === 'light' 
                  ? "inset 0 0 0 1px rgba(255,255,255,0.2), 0 0 15px rgba(59, 130, 246, 0.2)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 15px rgba(251, 191, 36, 0.2)"
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden flex flex-col md:flex-row transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 dark:from-gray-700 dark:to-gray-800 p-8 text-white relative md:w-2/5 flex flex-col justify-center transition-colors duration-300">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute left-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute right-0 bottom-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
            
            <div className="relative z-10 text-center md:text-right">
              {/* Government Logo */}
              <div className="flex items-center justify-center md:justify-start mb-8">
                <div className="w-24 h-24 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 dark:border-white/20">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div className="mr-4 hidden md:block">
                  <div className="text-3xl font-bold"> الخدمات</div>
                  <div className="text-sm text-blue-200 dark:text-gray-300">المملكة العربية السعودية</div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-3 md:hidden">
                وزارة الخدمات
              </h1>
              <p className="text-sm text-blue-200 mb-6 md:hidden">
                المملكة العربية السعودية
              </p>
              
              <h2 className="text-2xl font-bold mb-4">
                نظام خدمات المستفيدين الموحد
              </h2>
              
              <p className="text-blue-100 dark:text-gray-300 mb-6 leading-relaxed">
                مرحباً بكم في المنصة الرسمية لخدمات المستفيدين. يرجى تسجيل الدخول باستخدام الحساب المناسب للوصول إلى الخدمات المتاحة.
              </p>
              
              <div className="hidden md:block">
                <div className="space-y-4 mt-8">
                  <div className="flex items-center text-blue-100 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 ml-2 text-green-400 dark:text-green-300" />
                    <span>خدمات إلكترونية متكاملة</span>
                  </div>
                  <div className="flex items-center text-blue-100 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 ml-2 text-green-400 dark:text-green-300" />
                    <span>تسجيل وتتبع الطلبات بسهولة</span>
                  </div>
                  <div className="flex items-center text-blue-100 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 ml-2 text-green-400 dark:text-green-300" />
                    <span>دعم فني على مدار الساعة</span>
                  </div>
                </div>
                
                <div className="mt-12 pt-6 border-t border-blue-700/50 dark:border-gray-600/50">
                  <p className="text-sm text-blue-200 dark:text-gray-400">
                    للمساعدة والاستفسارات يرجى التواصل مع مركز الدعم الفني
                  </p>
                  <p className="text-sm text-blue-200 dark:text-gray-300 mt-1 font-bold">
                    هاتف: 19966
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 md:w-3/5 bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-md mx-auto">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تسجيل الدخول</h3>
                <p className="text-gray-600 dark:text-gray-300">يرجى اختيار نوع الحساب المناسب</p>
              </div>
            {renderStep()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/70 dark:text-gray-400 text-sm">
            جميع الحقوق محفوظة © 2024 | وزارة الخدمات - المملكة العربية السعودية
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
