import React, { useState } from 'react';
import { User, Users, Phone, CreditCard, Send, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';
import OtpInput from '../ui/OtpInput';
import { validateNationalId, validatePhoneNumber } from '../../utils/validation';
import { formatGregorianDate } from '../../shared/utils/dateHelpers';

interface RegistrationStep {
  step: 'form' | 'otp' | 'success';
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  otpCode: string;
  sessionId: number | null;
  isLoading: boolean;
  error: string | null;
  user: any | null;
}

interface NewBeneficiaryRegistrationProps {
  onComplete: (userData: any) => void;
  onBack: () => void;
}

const NewBeneficiaryRegistration: React.FC<NewBeneficiaryRegistrationProps> = ({
  onComplete,
  onBack
}) => {
  const [state, setState] = useState<RegistrationStep>({
    step: 'form',
    fullName: '',
    phoneNumber: '',
    nationalId: '',
    otpCode: '',
    sessionId: null,
    isLoading: false,
    error: null,
    user: null
  });

  const updateState = (updates: Partial<RegistrationStep>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ error: null });

    // Validate inputs
    if (!state.fullName.trim()) {
      updateState({ error: 'الاسم الكامل مطلوب' });
      return;
    }

    if (state.fullName.trim().length < 6) {
      updateState({ error: 'الاسم الكامل يجب أن يكون 6 أحرف على الأقل' });
      return;
    }

    const nationalIdError = validateNationalId(state.nationalId);
    const phoneError = validatePhoneNumber(state.phoneNumber);

    if (nationalIdError) {
      updateState({ error: nationalIdError });
      return;
    }

    if (phoneError) {
      updateState({ error: phoneError });
      return;
    }

    updateState({ isLoading: true });

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: state.phoneNumber,
          nationalId: state.nationalId,
          fullName: state.fullName
        })
      });

      const result = await response.json();

      if (result.success) {
        updateState({ 
          step: 'otp', 
          sessionId: result.sessionId,
          isLoading: false 
        });
      } else {
      // التحقق من وجود مستخدم مسبقاً
      if (result.userExists) {
        updateState({ 
          error: result.error + '\n\nمعلومات الحساب الموجود:\n' +
                  `الاسم: ${result.existingUser?.name || 'غير محدد'}\n` +
                  `رقم الجوال: ${result.existingUser?.phone || 'غير محدد'}\n` +
                  `تاريخ التسجيل: ${result.existingUser?.registrationDate ? formatGregorianDate(result.existingUser.registrationDate) : 'غير محدد'}`,
          isLoading: false 
        });
      } else {
        updateState({ 
          error: result.error || 'فشل في إرسال رمز التحقق',
          isLoading: false 
        });
      }
      }
    } catch (error) {
      updateState({ 
        error: 'حدث خطأ في الشبكة',
        isLoading: false 
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ error: null });

    if (!state.otpCode || state.otpCode.length < 4) {
      updateState({ error: 'رمز التحقق مطلوب' });
      return;
    }

    if (!state.sessionId) {
      updateState({ error: 'جلسة التحقق غير صالحة' });
      return;
    }

    updateState({ isLoading: true });

    try {
      // استخدام الوظيفة المحدثة للتحقق من OTP
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: state.phoneNumber,
          nationalId: state.nationalId,
          fullName: state.fullName,
          otpCode: state.otpCode,
          sessionId: state.sessionId
        })
      });

      const result = await response.json();

      if (result.success) {
        // حفظ معلومات الجلسة إذا كانت متاحة
        if (result.session) {
          // قم بضبط جلسة Supabase Auth
          const { supabase } = await import('../../shared/utils/supabase');
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        }
        
        // استمر بالخطوات القديمة
        updateState({ 
          step: 'success',
          user: {
            ...result.user,
            member: result.member,
            name: state.fullName
          },
          isLoading: false 
        });

        // Auto-continue after success message
        // Add longer delay for Supabase Auth session to be established
        setTimeout(() => {
          // Also ensure the user data is properly formatted
          const userData = {
            ...result.user,
            member: result.member,
            name: state.fullName,
            full_name: state.fullName,
            // Make sure the ID is consistently set
            id: result.user?.id
          };
          console.log("Completing registration with user data:", userData);
          onComplete(userData);
        }, 1500);
      } else {
        updateState({ 
          error: result.error || 'رمز التحقق غير صحيح',
          isLoading: false 
        });
      }
    } catch (error) {
      updateState({ 
        error: 'حدث خطأ في التحقق',
        isLoading: false 
      });
    }
  };

  const handleResendOtp = async () => {
    updateState({ otpCode: '', error: null });
    await handleSendOtp(new Event('submit') as any);
  };

  const renderFormStep = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          تسجيل مستفيد جديد
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          أدخل بياناتك الأساسية لبدء التسجيل في النظام
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSendOtp} className="space-y-6">
        <div className="space-y-5">
          <Input
            label="الاسم الكامل *"
            type="text"
            value={state.fullName}
            onChange={(e) => updateState({ fullName: e.target.value })}
            placeholder="مثال: أحمد محمد عبدالله السعد"
            icon={<User className="w-5 h-5" />}
          />

          <Input
            label="رقم الهوية الوطنية *"
            type="text"
            value={state.nationalId}
            onChange={(e) => updateState({ nationalId: e.target.value })}
            placeholder="1234567890"
            maxLength={10}
            className="text-center text-lg tracking-wider font-semibold"
            icon={<CreditCard className="w-5 h-5" />}
          />

          <Input
            label="رقم الجوال *"
            type="tel"
            value={state.phoneNumber}
            onChange={(e) => updateState({ phoneNumber: e.target.value })}
            placeholder="05xxxxxxxx"
            maxLength={10}
            className="text-center text-lg tracking-wider font-semibold"
            icon={<Phone className="w-5 h-5" />}
          />
        </div>

        {state.error && <ErrorMessage message={state.error} />}

        {/* Buttons */}
        <div className="flex gap-4">
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
            isLoading={state.isLoading}
            className="flex-2"
            icon={<Send className="w-5 h-5" />}
          >
            إرسال رمز التحقق
          </Button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-800">
              أدخل اسمك الكامل كما هو في الهوية الوطنية
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-800">
              تأكد من صحة رقم الهوية (10 أرقام)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-800">
              ستصلك رسالة نصية بها رمز التحقق
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          تحقق من رقم الجوال
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-3">
          أدخل رمز التحقق المرسل إلى رقم جوالك
        </p>
        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Phone className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {state.phoneNumber}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-sm text-gray-600">
            المسجل باسم: <span className="font-medium text-blue-600">{state.fullName}</span>
          </span>
        </div>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <OtpInput
          value={state.otpCode}
          onChange={(value) => updateState({ otpCode: value })}
          error={state.error}
          length={4}
        />

        {state.error && <ErrorMessage message={state.error} />}

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => updateState({ step: 'form', otpCode: '', error: null })}
            className="flex-1"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            رجوع
          </Button>
          <Button
            type="submit"
            isLoading={state.isLoading}
            className="flex-2"
            icon={<CheckCircle className="w-5 h-5" />}
          >
            تحقق
          </Button>
        </div>
      </form>

      {/* Resend Option */}
      <div className="text-center">
        <div className="bg-gray-50/80 border border-gray-200/50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-3">
            لم تستلم رمز التحقق؟
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={state.isLoading}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            إعادة إرسال رمز التحقق
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          تم التحقق بنجاح!
        </h2>
        <p className="text-gray-600">
          مرحباً <span className="font-semibold text-blue-600">{state.fullName}</span>
        </p>
        <p className="text-sm text-gray-500">
          سيتم توجيهك الآن لإكمال بيانات التسجيل...
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          تم إنشاء حسابك بنجاح. يرجى إكمال البيانات المطلوبة للاستفادة من الخدمات.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {state.step === 'form' && renderFormStep()}
      {state.step === 'otp' && renderOtpStep()}
      {state.step === 'success' && renderSuccessStep()}
    </div>
  );
};

export default NewBeneficiaryRegistration;
