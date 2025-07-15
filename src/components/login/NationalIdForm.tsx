import React, { useState } from 'react';
import { UserType } from '../../types';
import { validateNationalId } from '../../utils/validation';
import { sendOtp } from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';
import { ArrowRight, Send, CreditCard, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NationalIdFormProps {
  userType: UserType;
  nationalId: string;
  onNationalIdChange: (value: string) => void;
  onNext: (sessionId: number) => void;
  onBack: () => void;
}

const NationalIdForm: React.FC<NationalIdFormProps> = ({
  userType,
  nationalId,
  onNationalIdChange,
  onNext,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserTypeTitle = () => {
    switch (userType) {
      case 'beneficiary':
        return 'المستفيد';
      case 'employee':
        return 'الموظف / مدير الفرع';
      default:
        return '';
    }
  };

  const getUserTypeIcon = () => {
    switch (userType) {
      case 'beneficiary':
        return '👤';
      case 'employee':
        return '💼';
      default:
        return '🔐';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateNationalId(nationalId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-existing-user-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nationalId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        onNext(result.sessionId);
      } else {
        // التحقق من نوع الخطأ
        if (result.error && result.error.includes('غير موجود')) {
          setError(result.error + '\n\n💡 تأكد من:\n• كتابة رقم الهوية بشكل صحيح (10 أرقام)\n• أن لديك حساب مسجل مسبقاً\n• أو سجل كمستفيد جديد');
        } else {
        setError(result.error || 'فشل في إرسال رمز التحقق');
        }
      }
    } catch (error) {
      setError('حدث خطأ أثناء إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <span className="text-3xl">{getUserTypeIcon()}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          دخول {getUserTypeTitle()}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          أدخل رقم الهوية الوطنية لإرسال رمز التحقق
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-5">
          <Input
            label="رقم الهوية الوطنية"
            type="text"
            value={nationalId}
            onChange={(e) => onNationalIdChange(e.target.value)}
            placeholder="1234567890"
            maxLength={10}
            className="text-center text-lg tracking-wider font-semibold dir-ltr"
            icon={<CreditCard className="w-5 h-5" />}
          />

          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 ml-3 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                يرجى إدخال رقم الهوية الوطنية المكون من 10 أرقام بدون أحرف أو رموز
              </p>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            icon={<ArrowRight className="w-5 h-5 ml-1" />}
          >
            رجوع
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            icon={<Send className="w-5 h-5 ml-1" />}
          >
            إرسال رمز التحقق
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        جميع البيانات المدخلة محمية ومشفرة وفق أعلى معايير الأمان
      </p>
    </motion.div>
  );
};

export default NationalIdForm;
