import React, { useState, useEffect } from 'react';
import { MapPin, Home, Navigation } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import { RegistrationStepComponent } from '../../../types/registration';
import { saudiCities, validateBuildingNumber, validateSaudiPostalCode } from '../../../utils/registrationData';

const AddressInfoStep: React.FC<RegistrationStepComponent> = ({
  data,
  onNext,
  onBack,
  onUpdateData,
  onComplete,
  stepNumber
}) => {
  const [formData, setFormData] = useState({
    buildingNumber: data.addressInfo?.buildingNumber || '',
    streetName: data.addressInfo?.streetName || '',
    district: data.addressInfo?.district || '',
    city: data.addressInfo?.city || '',
    postalCode: data.addressInfo?.postalCode || '',
    additionalNumber: data.addressInfo?.additionalNumber || '',
    address: data.addressInfo?.address || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.buildingNumber) {
      newErrors.buildingNumber = 'رقم المبنى مطلوب';
    } else if (!validateBuildingNumber(formData.buildingNumber)) {
      newErrors.buildingNumber = 'رقم المبنى يجب أن يكون 4 أرقام';
    }

    if (!formData.streetName.trim()) {
      newErrors.streetName = 'اسم الشارع مطلوب';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'الحي مطلوب';
    }

    if (!formData.city) {
      newErrors.city = 'المدينة مطلوبة';
    }

    if (!formData.postalCode) {
      newErrors.postalCode = 'الرمز البريدي مطلوب';
    } else if (!validateSaudiPostalCode(formData.postalCode)) {
      newErrors.postalCode = 'الرمز البريدي يجب أن يكون 5 أرقام';
    }

    if (!formData.additionalNumber) {
      newErrors.additionalNumber = 'الرقم الإضافي مطلوب';
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
      onUpdateData({ addressInfo: formData });
      
      // تأخير قصير للتأكد من حفظ البيانات
      setTimeout(() => {
        onComplete?.();
        onNext();
      }, 100);
    }
  };

  const cityOptions = saudiCities.map(city => ({
    value: city,
    label: city
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl mb-4">
          <MapPin className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          العنوان الوطني
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          أدخل تفاصيل عنوانك الوطني حسب نظام العنونة السعودي
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Building Number & Street Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="رقم المبنى *"
            type="text"
            value={formData.buildingNumber}
            onChange={(e) => handleInputChange('buildingNumber', e.target.value)}
            placeholder="1234"
            maxLength={4}
            className="text-center text-lg font-semibold"
            icon={<Home className="w-5 h-5" />}
            error={errors.buildingNumber}
          />

          <Input
            label="اسم الشارع *"
            type="text"
            value={formData.streetName}
            onChange={(e) => handleInputChange('streetName', e.target.value)}
            placeholder="شارع الملك فهد"
            error={errors.streetName}
          />
        </div>

        {/* District & City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="الحي *"
            type="text"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder="الملز"
            error={errors.district}
          />

          <Select
            label="المدينة *"
            value={formData.city}
            onChange={(value) => handleInputChange('city', value)}
            options={cityOptions}
            placeholder="اختر المدينة"
            icon={<Navigation className="w-5 h-5" />}
            error={errors.city}
          />
        </div>

        {/* Postal Code & Additional Number Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="الرمز البريدي *"
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="12345"
            maxLength={5}
            className="text-center text-lg font-semibold"
            error={errors.postalCode}
          />

          <Input
            label="الرقم الإضافي *"
            type="text"
            value={formData.additionalNumber}
            onChange={(e) => handleInputChange('additionalNumber', e.target.value)}
            placeholder="1234"
            maxLength={4}
            className="text-center text-lg font-semibold"
            error={errors.additionalNumber}
          />
        </div>

        {/* Descriptive Address */}
        <Input
          label="العنوان الوصفي (اختياري)"
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="وصف تفصيلي للعنوان لتسهيل الوصول"
          className="h-20"
        />

        {/* Address Preview */}
        {formData.buildingNumber && formData.streetName && formData.district && formData.city && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">معاينة العنوان:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>رقم المبنى:</strong> {formData.buildingNumber}</p>
              <p><strong>الشارع:</strong> {formData.streetName}</p>
              <p><strong>الحي:</strong> {formData.district}</p>
              <p><strong>المدينة:</strong> {formData.city}</p>
              <p><strong>الرمز البريدي:</strong> {formData.postalCode}</p>
              <p><strong>الرقم الإضافي:</strong> {formData.additionalNumber}</p>
            </div>
          </div>
        )}

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
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-orange-600">3</span>
          </div>
          <div>
            <p className="font-medium text-orange-900">الخطوة 3 من 7</p>
            <p className="text-sm text-orange-700">العنوان الوطني</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInfoStep;
