import React, { useState, useEffect } from 'react';
import { Phone, Mail, UserPlus, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import { RegistrationStepComponent } from '../../../types/registration';
import { validateSaudiPhoneNumber, emergencyContactRelations } from '../../../utils/registrationData';

const ContactInfoStep: React.FC<RegistrationStepComponent> = ({
  data,
  onNext,
  onBack,
  onUpdateData,
  onComplete,
  stepNumber
}) => {
  const [formData, setFormData] = useState({
    phone: data.contactInfo?.phone || '',
    alternativePhone: data.contactInfo?.alternativePhone || '',
    email: data.contactInfo?.email || '',
    emergencyContactName: data.contactInfo?.emergencyContactName || '',
    emergencyContactPhone: data.contactInfo?.emergencyContactPhone || '',
    emergencyContactRelation: data.contactInfo?.emergencyContactRelation || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!validateSaudiPhoneNumber(formData.phone)) {
      newErrors.phone = 'رقم الجوال غير صحيح';
    }

    if (formData.alternativePhone && !validateSaudiPhoneNumber(formData.alternativePhone)) {
      newErrors.alternativePhone = 'رقم الجوال البديل غير صحيح';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'اسم جهة الاتصال للطوارئ مطلوب';
    }

    if (!formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'رقم جوال جهة الاتصال للطوارئ مطلوب';
    } else if (!validateSaudiPhoneNumber(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'رقم جوال جهة الاتصال للطوارئ غير صحيح';
    }

    if (!formData.emergencyContactRelation) {
      newErrors.emergencyContactRelation = 'صلة القرابة مطلوبة';
    }

    // Check if emergency contact phone is same as main phone
    if (formData.phone && formData.emergencyContactPhone && 
        formData.phone === formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'رقم جهة الاتصال للطوارئ يجب أن يختلف عن رقمك';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isValid) {
      // حفظ البيانات أولاً
      onUpdateData({ contactInfo: formData });
      
      // تأخير قصير للتأكد من حفظ البيانات
      setTimeout(() => {
        onComplete?.();
        onNext();
      }, 100);
    }
  };

  const relationOptions = emergencyContactRelations.map(relation => ({
    value: relation,
    label: relation
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
          <Phone className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          بيانات التواصل
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          أدخل بيانات التواصل وجهة الاتصال للطوارئ
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Primary Contact Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            بيانات التواصل الأساسية
          </h4>
          
          <div className="space-y-4">
            <Input
              label="رقم الجوال *"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="05xxxxxxxx"
              maxLength={10}
              className="text-center text-lg tracking-wider font-semibold"
              icon={<Phone className="w-5 h-5" />}
              error={errors.phone}
            />

            <Input
              label="رقم الجوال البديل"
              type="tel"
              value={formData.alternativePhone}
              onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
              placeholder="05xxxxxxxx"
              maxLength={10}
              className="text-center text-lg tracking-wider font-semibold"
              icon={<Phone className="w-5 h-5" />}
              error={errors.alternativePhone}
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            جهة الاتصال للطوارئ
          </h4>
          
          <div className="space-y-4">
            <Input
              label="الاسم الكامل *"
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              placeholder="اسم الشخص المسؤول عنك"
              error={errors.emergencyContactName}
            />

            <Input
              label="رقم الجوال *"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              placeholder="05xxxxxxxx"
              maxLength={10}
              className="text-center text-lg tracking-wider font-semibold"
              icon={<Phone className="w-5 h-5" />}
              error={errors.emergencyContactPhone}
            />

            <Select
              label="صلة القرابة *"
              value={formData.emergencyContactRelation}
              onChange={(value) => handleInputChange('emergencyContactRelation', value)}
              options={relationOptions}
              placeholder="اختر صلة القرابة"
              icon={<UserPlus className="w-5 h-5" />}
              error={errors.emergencyContactRelation}
            />
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">تنبيه مهم</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• تأكد من صحة أرقام الجوال المدخلة</li>
                <li>• جهة الاتصال للطوارئ ستكون مسؤولة عنك في حالات الطوارئ</li>
                <li>• سيتم إرسال تنبيهات مهمة على رقم الجوال الأساسي</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <ErrorMessage message={`يرجى تصحيح ${Object.keys(errors).length} خطأ في النموذج`} />
        )}

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
            onClick={handleNext}
            disabled={!isValid}
            className="flex-2"
          >
            التالي
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-purple-600">4</span>
          </div>
          <div>
            <p className="font-medium text-purple-900">الخطوة 4 من 7</p>
            <p className="text-sm text-purple-700">بيانات التواصل والطوارئ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStep;
