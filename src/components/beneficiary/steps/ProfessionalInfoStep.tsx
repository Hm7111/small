import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, DollarSign, Building } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import { RegistrationStepComponent } from '../../../types/registration';
import { educationLevels, employmentStatuses } from '../../../utils/registrationData';

const ProfessionalInfoStep: React.FC<RegistrationStepComponent> = ({
  data,
  onNext,
  onBack,
  onUpdateData,
  onComplete,
  stepNumber
}) => {
  const [formData, setFormData] = useState({
    educationLevel: data.professionalInfo?.educationLevel || '',
    employmentStatus: data.professionalInfo?.employmentStatus || '',
    jobTitle: data.professionalInfo?.jobTitle || '',
    employer: data.professionalInfo?.employer || '',
    monthlyIncome: data.professionalInfo?.monthlyIncome || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.educationLevel) {
      newErrors.educationLevel = 'المؤهل الدراسي مطلوب';
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = 'الحالة الوظيفية مطلوبة';
    }

    // If employed, job title and employer are required
    if (formData.employmentStatus === 'employed') {
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'المسمى الوظيفي مطلوب للموظفين';
      }
      if (!formData.employer.trim()) {
        newErrors.employer = 'جهة العمل مطلوبة للموظفين';
      }
    }

    if (formData.monthlyIncome < 0) {
      newErrors.monthlyIncome = 'الراتب لا يمكن أن يكون سالباً';
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
      onUpdateData({ professionalInfo: formData });
      
      // تأخير قصير للتأكد من حفظ البيانات
      setTimeout(() => {
        onComplete?.();
        onNext();
      }, 100);
    }
  };

  const educationOptions = Object.entries(educationLevels).map(([key, label]) => ({
    value: key,
    label
  }));

  const employmentOptions = Object.entries(employmentStatuses).map(([key, label]) => ({
    value: key,
    label
  }));

  const isEmployed = formData.employmentStatus === 'employed';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4">
          <Briefcase className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          البيانات المهنية
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          أدخل بياناتك التعليمية والمهنية
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Education Level */}
        <Select
          label="المؤهل الدراسي *"
          value={formData.educationLevel}
          onChange={(value) => handleInputChange('educationLevel', value)}
          options={educationOptions}
          placeholder="اختر المؤهل الدراسي"
          icon={<GraduationCap className="w-5 h-5" />}
          error={errors.educationLevel}
        />

        {/* Employment Status */}
        <Select
          label="الحالة الوظيفية *"
          value={formData.employmentStatus}
          onChange={(value) => handleInputChange('employmentStatus', value)}
          options={employmentOptions}
          placeholder="اختر الحالة الوظيفية"
          icon={<Briefcase className="w-5 h-5" />}
          error={errors.employmentStatus}
        />

        {/* Employment Details (if employed) */}
        {isEmployed && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              تفاصيل العمل
            </h4>
            
            <div className="space-y-4">
              <Input
                label="المسمى الوظيفي *"
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="مثال: محاسب، مهندس، معلم"
                error={errors.jobTitle}
              />

              <Input
                label="جهة العمل *"
                type="text"
                value={formData.employer}
                onChange={(e) => handleInputChange('employer', e.target.value)}
                placeholder="اسم الشركة أو الجهة"
                error={errors.employer}
              />
            </div>
          </div>
        )}

        {/* Monthly Income */}
        <Input
          label="الدخل الشهري (ريال سعودي)"
          type="number"
          value={formData.monthlyIncome}
          onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value) || 0)}
          placeholder="0"
          min="0"
          icon={<DollarSign className="w-5 h-5" />}
          error={errors.monthlyIncome}
        />

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
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-green-600">2</span>
          </div>
          <div>
            <p className="font-medium text-green-900">الخطوة 2 من 7</p>
            <p className="text-sm text-green-700">البيانات المهنية والتعليمية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfoStep;
