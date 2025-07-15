import React, { useState, useEffect } from 'react';
import { Building, MapPin, Phone, User } from 'lucide-react';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import { RegistrationStepComponent } from '../../../types/registration';

const BranchSelectionStep: React.FC<RegistrationStepComponent> = ({
  data,
  onNext,
  onBack,
  onUpdateData,
  onComplete,
  stepNumber
}) => {
  const [formData, setFormData] = useState({
    preferredBranchId: data.branchSelection?.preferredBranchId || '',
    branchName: data.branchSelection?.branchName || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Mock branches data - في التطبيق الحقيقي ستجلب من قاعدة البيانات
  const branches = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'فرع الرياض',
      city: 'الرياض',
      address: 'حي الملز - شارع الملك فهد',
      phone: '011-123-4567',
      manager: 'أحمد محمد الأحمد'
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'فرع جدة',
      city: 'جدة',
      address: 'حي الحمراء - شارع الأمير محمد بن عبدالعزيز',
      phone: '012-123-4567',
      manager: 'سارة علي السعد'
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'فرع الدمام',
      city: 'الدمام',
      address: 'حي الفيصلية - شارع الملك عبدالعزيز',
      phone: '013-123-4567',
      manager: 'خالد سعد الخالد'
    }
  ];

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.preferredBranchId) {
      newErrors.preferredBranchId = 'يجب اختيار الفرع المفضل';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  const handleBranchChange = (branchId: string) => {
    const selectedBranch = branches.find(branch => branch.id === branchId);
    setFormData({
      preferredBranchId: branchId,
      branchName: selectedBranch?.name || ''
    });
  };

  const handleNext = () => {
    if (isValid) {
      // حفظ البيانات أولاً
      onUpdateData({ branchSelection: formData });
      
      // تأخير قصير للتأكد من حفظ البيانات
      setTimeout(() => {
        onComplete?.();
        onNext();
      }, 100);
    }
  };

  const branchOptions = branches.map(branch => ({
    value: branch.id,
    label: branch.name
  }));

  const selectedBranch = branches.find(branch => branch.id === formData.preferredBranchId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl mb-4">
          <Building className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          اختيار الفرع
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          اختر الفرع المفضل لك لتلقي الخدمات
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Branch Selection */}
        <Select
          label="الفرع المفضل *"
          value={formData.preferredBranchId}
          onChange={handleBranchChange}
          options={branchOptions}
          placeholder="اختر الفرع الأقرب لك"
          icon={<Building className="w-5 h-5" />}
          error={errors.preferredBranchId}
        />

        {/* Selected Branch Details */}
        {selectedBranch && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              تفاصيل الفرع المختار
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{selectedBranch.name}</p>
                    <p className="text-sm text-blue-700">{selectedBranch.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">العنوان</p>
                    <p className="text-sm text-blue-700">{selectedBranch.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">رقم الهاتف</p>
                    <p className="text-sm text-blue-700">{selectedBranch.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">مدير الفرع</p>
                    <p className="text-sm text-blue-700">{selectedBranch.manager}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branches Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`
                border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer
                ${formData.preferredBranchId === branch.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
              onClick={() => handleBranchChange(branch.id)}
            >
              <div className="text-center">
                <div className={`
                  w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center
                  ${formData.preferredBranchId === branch.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  <Building className="w-6 h-6" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">{branch.name}</h5>
                <p className="text-sm text-gray-600">{branch.city}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">ملاحظة مهمة</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• يمكنك تغيير الفرع المفضل لاحقاً من خلال لوحة التحكم</li>
                <li>• سيتم تحويل طلباتك إلى الفرع المختار</li>
                <li>• اختر الفرع الأقرب لك جغرافياً لسهولة الوصول</li>
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
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">5</span>
          </div>
          <div>
            <p className="font-medium text-indigo-900">الخطوة 5 من 7</p>
            <p className="text-sm text-indigo-700">اختيار الفرع المفضل</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchSelectionStep;
