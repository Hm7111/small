import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../../utils/validation';
import { saveUserToStorage } from '../../utils/navigation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';
import { useDispatch } from 'react-redux';
import { loginWithEmail } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { ArrowRight, LogIn, Mail, Lock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import SetupAdmin from '../admin/SetupAdmin';
import { motion } from 'framer-motion';

interface AdminLoginProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onBack,
  onSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
      setError(emailError);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(loginWithEmail({ email, password })).unwrap();
      
      if (result) {
        setLoginSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError('فشل تسجيل الدخول');
      }
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول');
      
      // Check if this is an attempt to login as admin
      if (email === 'admin@charity.org' && 
          (error.message?.includes('Invalid login credentials') || 
           error.message?.includes('invalid_credentials') ||
           error.message?.includes('المستخدم غير موجود'))) {
        setShowAdminSetup(true);
      } else {
        setShowSetupInstructions(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin setup completion
  const handleAdminSetupComplete = () => {
    setShowAdminSetup(false);
    setError(null);
    setShowSetupInstructions(false);
  };

  // If in admin setup mode, show setup form
  if (showAdminSetup) {
    return <SetupAdmin onComplete={handleAdminSetupComplete} onCancel={() => setShowAdminSetup(false)} />;
  }

  // If login was successful, show success message
  if (loginSuccess) {
    return (
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            تم تسجيل الدخول بنجاح!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            جاري توجيهك إلى لوحة التحكم...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Shield className="w-10 h-10 text-blue-700 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            دخول الإدارة
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            الدخول مخصص للإدارة العليا ومسؤولي النظام فقط
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="البريد الإلكتروني"
            icon={<Mail className="w-5 h-5" />}
            label="البريد الإلكتروني"
          />
  
          <Input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="كلمة المرور"
            icon={<Lock className="w-5 h-5" />}
            label="كلمة المرور"
          />
  
          {error && <ErrorMessage message={error} />}
  
          {showSetupInstructions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
             <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
               </div>
               <div className="text-sm text-blue-800 dark:text-blue-200">
                 <p className="font-medium mb-2">حساب الإدارة غير موجود</p>
                 <p className="mb-2">حساب المدير غير موجود أو غير مرتبط بشكل صحيح. يجب إنشاء حساب إداري.</p>
                 <div className="mt-3">
                   <Button
                     onClick={() => setShowAdminSetup(true)}
                     size="sm"
                     className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                     icon={<Shield className="w-4 h-4 ml-2" />}
                   >
                     إنشاء حساب الإدارة
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}
  
          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              رجوع
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              icon={<LogIn className="w-5 h-5" />}
            >
              تسجيل الدخول
            </Button>
          </div>
        </form>
      </motion.div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          هذه منطقة محمية. الدخول غير المصرح به يعرض للمساءلة القانونية.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
