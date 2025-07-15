import React, { useState, useEffect } from 'react';
import { User, Calendar, Users as UsersIcon, Heart } from 'lucide-react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import FormSection from '../../ui/FormSection';
import StepWrapper from './StepWrapper';
import { RegistrationStepComponent } from '../../../types/registration';
import { disabilityTypes, calculateAge } from '../../../utils/registrationData';
import { validateForm, validateSaudiNationalId, validateName, validateBirthDate } from '../../../utils/formValidation';

const PersonalInfoStep: React.FC<RegistrationStepComponent> = ({
  data,
  onNext,
  onBack,
  onUpdateData,
  onComplete,
  stepNumber
}) => {
  const [formData, setFormData] = useState({
    fullName: data.personalInfo?.fullName || '',
    nationalId: data.personalInfo?.nationalId || '',
    dateOfBirth: data.personalInfo?.dateOfBirth || '',
    age: data.personalInfo?.age || 0,
    gender: data.personalInfo?.gender || 'male',
    disabilityType: data.personalInfo?.disabilityType || '',
    disabilityDetails: data.personalInfo?.disabilityDetails || '',
    disabilityCardNumber: data.personalInfo?.disabilityCardNumber || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Calculate age when birth date changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const calculatedAge = calculateAge(formData.dateOfBirth);
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    }
  }, [formData.dateOfBirth]);

  // Validate form
  useEffect(() => {
    const validation = validateForm(formData, {
      fullName: (value) => validateName(value, 'الاسم الكامل'),
      nationalId: (value) => validateSaudiNationalId(value),
      dateOfBirth: (value) => validateBirthDate(value),
      disabilityType: (value) => value ? { isValid: true } : { isValid: false, error: 'نوع الإعاقة مطلوب' },
      disabilityCardNumber: (value) => validateName(value, 'رقم بطاقة الإعاقة')
    });

    setErrors(validation.errors);
    setIsValid(validation.isValid);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isValid) {
      // حفظ البيانات أولاً
      onUpdateData({ personalInfo: formData });
      
      // تأخير قصير للتأكد من حفظ البيانات
      setTimeout(() => {
        onComplete?.();
        onNext();
      }, 100);
    }
  };

  const disabilityOptions = Object.entries(disabilityTypes).map(([key, label]) => ({
    value: key,
    label
  }));

  return (
    <StepWrapper
      stepNumber={stepNumber}
      title="البيانات الشخصية"
      description="أدخل بياناتك الشخصية الأساسية"
      icon={<User className="w-8 h-8 text-blue-600" />}
      onNext={handleNext}
      onBack={onBack}
      nextDisabled={!isValid}
      errors={errors}
      progressColor="blue"
    >
      {/* Form Fields */}
      <Input
        label="الاسم الكامل *"
        type="text"
        value={formData.fullName}
        onChange={(e) => handleInputChange('fullName', e.target.value)}
        placeholder="مثال: أحمد محمد عبدالله"
        icon={<User className="w-5 h-5" />}
        error={errors.fullName}
      />

      <Input
        label="رقم الهوية الوطنية *"
        type="text"
        value={formData.nationalId}
        onChange={(e) => handleInputChange('nationalId', e.target.value)}
        placeholder="1234567890"
        maxLength={10}
        className="text-center text-lg tracking-wider font-semibold"
        icon={<UsersIcon className="w-5 h-5" />}
        error={errors.nationalId}
      />

      {/* Birth Date & Gender Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Input
            label="تاريخ الميلاد *"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            icon={<Calendar className="w-5 h-5" />}
            error={errors.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
          />
          {formData.age > 0 && (
            <p className="text-sm text-blue-600 font-medium">
              العمر: {formData.age} سنة
            </p>
          )}
        </div>

        <Select
          label="الجنس *"
          value={formData.gender}
          onChange={(value) => handleInputChange('gender', value)}
          options={[
            { value: 'male', label: 'ذكر' },
            { value: 'female', label: 'أنثى' }
          ]}
          icon={<UsersIcon className="w-5 h-5" />}
        />
      </div>

      {/* Disability Information */}
      <FormSection
        title="معلومات الإعاقة"
        icon={<Heart className="w-5 h-5" />}
        gradient="from-purple-50 to-indigo-50 border-purple-200/50"
      >
        <Select
          label="نوع الإعاقة *"
          value={formData.disabilityType}
          onChange={(value) => handleInputChange('disabilityType', value)}
          options={disabilityOptions}
          placeholder="اختر نوع الإعاقة"
          error={errors.disabilityType}
        />

        <Input
          label="تفاصيل إضافية عن الإعاقة"
          type="text"
          value={formData.disabilityDetails}
          onChange={(e) => handleInputChange('disabilityDetails', e.target.value)}
          placeholder="اذكر أي تفاصيل إضافية مهمة"
          className="h-20"
        />

        <Input
          label="رقم بطاقة الإعاقة *"
          type="text"
          value={formData.disabilityCardNumber}
          onChange={(e) => handleInputChange('disabilityCardNumber', e.target.value)}
          placeholder="رقم بطاقة إثبات الإعاقة"
          error={errors.disabilityCardNumber}
        />
      </FormSection>
    </StepWrapper>
  );
};

export default PersonalInfoStep;
