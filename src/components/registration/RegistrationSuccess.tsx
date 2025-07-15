import React, { useEffect } from 'react';
import { CheckCircle, ArrowLeft, UserCheck } from 'lucide-react';
import Button from '../ui/Button';
import { saveUserToStorage } from '../../utils/navigation';

interface RegistrationSuccessProps {
  user: any;
  onComplete: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ user, onComplete }) => {
  
  useEffect(() => {
    // حفظ بيانات المستخدم فور التحقق الناجح
    if (user) {
      saveUserToStorage(user);
    }
  }, [user]);

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="space-y-8 text-center">
      {/* Success Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          🎉 تم إنشاء حسابك بنجاح!
        </h2>
        <p className="text-xl text-gray-600">
          مرحباً <span className="font-semibold text-blue-600">{user?.full_name || user?.name}</span> في نظام خدمات المستفيدين
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-medium">
            تم التحقق من هويتك وإنشاء حسابك بنجاح
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <UserCheck className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">بيانات الحساب</h3>
        </div>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>رقم الهوية:</strong> {user?.national_id}</p>
          <p><strong>رقم الجوال:</strong> {user?.phone}</p>
          <p><strong>الاسم:</strong> {user?.full_name || user?.name}</p>
          <p><strong>نوع الحساب:</strong> مستفيد</p>
          <p><strong>حالة التسجيل:</strong> <span className="text-amber-600 font-medium">يحتاج إكمال البيانات</span></p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-amber-900 mb-3">الخطوات التالية:</h4>
        <div className="space-y-2 text-sm text-amber-800 text-right">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">1</div>
            <span>إكمال البيانات الشخصية</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">2</div>
            <span>رفع المستندات المطلوبة</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">3</div>
            <span>انتظار موافقة الإدارة</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          onClick={handleContinue}
          className="w-full text-lg py-4"
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          الانتقال إلى لوحة التحكم
        </Button>
      </div>

      {/* Timeline */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          سيتم توجيهك الآن إلى لوحة التحكم الخاصة بك لإكمال خطوات التسجيل
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
