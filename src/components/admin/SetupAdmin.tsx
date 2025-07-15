import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';

interface SetupAdminProps {
  onComplete: () => void;
  onCancel: () => void;
}

const SetupAdmin: React.FC<SetupAdminProps> = ({ onComplete, onCancel }) => {
  const [email, setEmail] = useState('admin@charity.org');
  const [password, setPassword] = useState('Hm711473683@');
  const [confirmPassword, setConfirmPassword] = useState('Hm711473683@');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Clear errors when inputs change
    setError(null);
  }, [email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('جاري إنشاء حساب الإدارة...');
    
    try {
      // Call the Edge Function to create admin user
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // الخطوة 1: تم إنشاء المستخدم بنجاح
        setStatusMessage('تم إنشاء حساب المستخدم. جاري ربط الحساب...');
        
        try {
          // الخطوة 2: ربط المستخدم بقاعدة البيانات
          const linkResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-linking`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ auth_user_id: result.authUserId || result.userId })
          });
          
          const linkResult = await linkResponse.json();
          
          if (linkResult.success) {
            setStatusMessage('تم ربط حساب الإدارة بنجاح!');
            setSuccess(true);
            
            // Wait a moment then call onComplete
            setTimeout(() => {
              onComplete();
            }, 2000);
          } else {
            throw new Error(linkResult.error || 'فشل في ربط حساب الإدارة');
          }
        } catch (linkingError) {
          console.error('Admin account linking error:', linkingError);
          setError(linkingError.message || 'حدث خطأ أثناء ربط حساب الإدارة. يمكنك محاولة تسجيل الدخول الآن.');
          
          // المستخدم تم إنشاؤه، لكن فشل الربط قد لا يمنع تسجيل الدخول
          setTimeout(() => {
            onComplete();
          }, 3000);
        }
      } else {
        throw new Error(result.error || 'فشل في إنشاء حساب الإدارة');
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء حساب الإدارة');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
            تم إنشاء حساب الإدارة بنجاح!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            يمكنك الآن تسجيل الدخول باستخدام بيانات الإدارة
          </p>
        </div>
        
        <Button
          onClick={onComplete}
          className="w-full"
        >
          الانتقال إلى تسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-2xl mx-auto mb-4">
          <Shield className="w-full h-full p-4 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          إنشاء حساب الإدارة
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          أدخل بيانات حساب الإدارة الرئيسي للنظام
        </p>
      </div>

      {/* Admin Setup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@charity.org"
          disabled={isLoading}
        />

        <Input
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
        />

        <Input
          label="تأكيد كلمة المرور"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
        />

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-amber-900 dark:text-amber-300">تنبيه أمان</h4>
              <p className="text-sm text-amber-800 dark:text-amber-400">
                تأكد من استخدام كلمة مرور قوية وآمنة لحساب الإدارة.
              </p>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Loading Message */}
        {isLoading && (
          <div className="text-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{statusMessage}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            icon={<ArrowRight className="w-5 h-5 ml-1 rtl:rotate-180" />}
          >
            إنشاء حساب الإدارة
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SetupAdmin;
