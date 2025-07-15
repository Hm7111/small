import React, { useState } from 'react';
import { CheckCircle, Edit, Send, Eye, FileText, User, Briefcase, MapPin, Phone, Building } from 'lucide-react';
import Button from '../../ui/Button';
import { RegistrationStepComponent, RegistrationData } from '../../../types/registration';
import { disabilityTypes, educationLevels, employmentStatuses } from '../../../utils/registrationData';

interface ReviewSubmitStepProps extends RegistrationStepComponent {
  onFinalSubmit: () => void;
  completedSteps: number[];
  onSkipToStep: (stepNumber: number) => void;
  userId: string;
  onStatusChange: (status: string) => void;
}

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  data,
  onBack,
  onFinalSubmit,
  completedSteps,
  onSkipToStep,
  stepNumber,
  userId,
  onStatusChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreement, setAgreement] = useState(false);

  const handleSubmit = async () => {
    if (!agreement) {
      alert('يجب الموافقة على الشروط والأحكام');
      return;
    }

    setIsSubmitting(true);
    try {
      // استدعاء Edge Function لحفظ البيانات
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-registration`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          registrationData: data
        })
      });

      const result = await response.json();

      if (result.success) {
        // تحديث حالة التسجيل
        onStatusChange('pending_review');
        
        // إظهار رسالة نجاح مع رقم القيد
        const requestId = result.member?.id?.slice(-8).toUpperCase() || 'غير محدد';
        alert(`✅ تم إرسال طلب التسجيل بنجاح!\n\nرقم القيد: ${requestId}\n\nسيتم مراجعة طلبك من قبل الموظفين خلال 3-5 أيام عمل.`);
        
        // تحديث localStorage مع الحالة الجديدة
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.member = { 
            ...userData.member, 
            ...result.member,
            registration_status: 'pending_review'
          };
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // إعادة تحميل الصفحة بعد تأخير قصير لإظهار الحالة الجديدة
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('Error submitting registration:', result.error);
        alert('حدث خطأ في إرسال البيانات: ' + result.error);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('حدث خطأ في الشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          البيانات الشخصية
        </h4>
        <button
          onClick={() => onSkipToStep(1)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          تعديل
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-blue-800"><strong>الاسم الكامل:</strong> {data.personalInfo?.fullName || 'غير محدد'}</p>
          <p className="text-blue-800"><strong>رقم الهوية:</strong> {data.personalInfo?.nationalId || 'غير محدد'}</p>
          <p className="text-blue-800"><strong>تاريخ الميلاد:</strong> {data.personalInfo?.dateOfBirth || 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-blue-800"><strong>العمر:</strong> {data.personalInfo?.age || 'غير محدد'} سنة</p>
          <p className="text-blue-800"><strong>الجنس:</strong> {data.personalInfo?.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
          <p className="text-blue-800"><strong>نوع الإعاقة:</strong> {data.personalInfo?.disabilityType ? disabilityTypes[data.personalInfo.disabilityType] : 'غير محدد'}</p>
        </div>
      </div>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-green-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          البيانات المهنية
        </h4>
        <button
          onClick={() => onSkipToStep(2)}
          className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          تعديل
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-green-800"><strong>المؤهل الدراسي:</strong> {data.professionalInfo?.educationLevel ? educationLevels[data.professionalInfo.educationLevel] : 'غير محدد'}</p>
          <p className="text-green-800"><strong>الحالة الوظيفية:</strong> {data.professionalInfo?.employmentStatus ? employmentStatuses[data.professionalInfo.employmentStatus] : 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-green-800"><strong>المسمى الوظيفي:</strong> {data.professionalInfo?.jobTitle || 'غير محدد'}</p>
          <p className="text-green-800"><strong>جهة العمل:</strong> {data.professionalInfo?.employer || 'غير محدد'}</p>
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          العنوان الوطني
        </h4>
        <button
          onClick={() => onSkipToStep(3)}
          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          تعديل
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-orange-800"><strong>رقم المبنى:</strong> {data.addressInfo?.buildingNumber || 'غير محدد'}</p>
          <p className="text-orange-800"><strong>اسم الشارع:</strong> {data.addressInfo?.streetName || 'غير محدد'}</p>
          <p className="text-orange-800"><strong>الحي:</strong> {data.addressInfo?.district || 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-orange-800"><strong>المدينة:</strong> {data.addressInfo?.city || 'غير محدد'}</p>
          <p className="text-orange-800"><strong>الرمز البريدي:</strong> {data.addressInfo?.postalCode || 'غير محدد'}</p>
          <p className="text-orange-800"><strong>الرقم الإضافي:</strong> {data.addressInfo?.additionalNumber || 'غير محدد'}</p>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          بيانات التواصل
        </h4>
        <button
          onClick={() => onSkipToStep(4)}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          تعديل
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-purple-800"><strong>رقم الجوال:</strong> {data.contactInfo?.phone || 'غير محدد'}</p>
          <p className="text-purple-800"><strong>البريد الإلكتروني:</strong> {data.contactInfo?.email || 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-purple-800"><strong>اسم جهة الطوارئ:</strong> {data.contactInfo?.emergencyContactName || 'غير محدد'}</p>
          <p className="text-purple-800"><strong>هاتف جهة الطوارئ:</strong> {data.contactInfo?.emergencyContactPhone || 'غير محدد'}</p>
        </div>
      </div>
    </div>
  );

  const renderBranchSelection = () => (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Building className="w-5 h-5" />
          الفرع المفضل
        </h4>
        <button
          onClick={() => onSkipToStep(5)}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          تعديل
        </button>
      </div>
      
      <p className="text-indigo-800 text-sm">
        <strong>الفرع المختار:</strong> {data.branchSelection?.branchName || 'غير محدد'}
      </p>
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-teal-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          المستندات المرفوعة
        </h4>
        <button
          onClick={() => onSkipToStep(6)}
          className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          تعديل
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {data.documentUpload?.nationalIdDocument ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
          )}
          <span className="text-teal-800">صورة الهوية الوطنية</span>
        </div>
        <div className="flex items-center gap-2">
          {data.documentUpload?.disabilityCardDocument ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
          )}
          <span className="text-teal-800">صورة بطاقة إثبات الإعاقة</span>
        </div>
      </div>
    </div>
  );

  const isDataComplete = completedSteps.length >= 6;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4">
          <Eye className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          مراجعة البيانات والإرسال
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          راجع جميع البيانات المدخلة قبل إرسال الطلب
        </p>
      </div>

      {/* Data Review */}
      <div className="space-y-6">
        {renderPersonalInfo()}
        {renderProfessionalInfo()}
        {renderAddressInfo()}
        {renderContactInfo()}
        {renderBranchSelection()}
        {renderDocuments()}
      </div>

      {/* Agreement */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="agreement"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
            className="mt-1"
          />
          <div>
            <label htmlFor="agreement" className="text-amber-900 font-medium cursor-pointer">
              أوافق على الشروط والأحكام
            </label>
            <div className="text-sm text-amber-800 mt-2 space-y-1">
              <p>• أقر بأن جميع البيانات المدخلة صحيحة</p>
              <p>• أوافق على استخدام بياناتي لأغراض تقديم الخدمات</p>
              <p>• أتحمل مسؤولية دقة المعلومات المقدمة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">الخطوات التالية:</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
            <span>سيتم إرسال طلبك إلى مدير الفرع للمراجعة الأولية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
            <span>سيقوم موظف مختص بالتحقق من البيانات والمستندات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
            <span>سيتم إشعارك بنتيجة المراجعة خلال 3-5 أيام عمل</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          السابق
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isDataComplete || !agreement}
          isLoading={isSubmitting}
          className="flex-2"
          variant="success"
          icon={<Send className="w-5 h-5" />}
        >
          إرسال الطلب
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-green-600">7</span>
          </div>
          <div>
            <p className="font-medium text-green-900">الخطوة 7 من 7</p>
            <p className="text-sm text-green-700">مراجعة البيانات والإرسال</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
