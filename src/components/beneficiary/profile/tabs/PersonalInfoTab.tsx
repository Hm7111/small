import React from 'react';
import { User, Edit, Save } from 'lucide-react';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { formatGregorianDate } from '../../../../shared/utils/dateHelpers';
import { disabilityTypes } from '../../../../utils/registrationData';

interface PersonalInfoTabProps {
  formData: {
    fullName: string;
    gender: 'male' | 'female';
    birthDate: string;
    age: string;
    disabilityType: string;
    disabilityDetails: string;
    disabilityCardNumber: string;
  };
  editMode: boolean;
  isSaving: boolean;
  onEditModeChange: (mode: boolean) => void;
  onInputChange: (field: string, value: any) => void;
  onSaveChanges: () => Promise<void>;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  formData,
  editMode,
  isSaving,
  onEditModeChange,
  onInputChange,
  onSaveChanges
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <User className="w-6 h-6 text-blue-600" />
          البيانات الشخصية
        </h3>
        {!editMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditModeChange(true)}
            icon={<Edit className="w-4 h-4" />}
          >
            تعديل
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="الاسم الكامل"
              type="text"
              value={formData.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              placeholder="الاسم الكامل"
            />

            <Select
              label="الجنس"
              value={formData.gender}
              onChange={(value) => onInputChange('gender', value)}
              options={[
                { value: 'male', label: 'ذكر' },
                { value: 'female', label: 'أنثى' }
              ]}
            />

            <Input
              label="تاريخ الميلاد"
              type="date"
              value={formData.birthDate}
              onChange={(e) => onInputChange('birthDate', e.target.value)}
            />

            <Input
              label="العمر"
              type="number"
              value={formData.age}
              onChange={(e) => onInputChange('age', e.target.value)}
              disabled={true}
            />

            <Select
              label="نوع الإعاقة"
              value={formData.disabilityType}
              onChange={(value) => onInputChange('disabilityType', value)}
              options={Object.entries(disabilityTypes).map(([key, label]) => ({
                value: key,
                label: label
              }))}
            />

            <Input
              label="رقم بطاقة الإعاقة"
              type="text"
              value={formData.disabilityCardNumber}
              onChange={(e) => onInputChange('disabilityCardNumber', e.target.value)}
            />

            <Input
              label="تفاصيل الإعاقة"
              type="text"
              value={formData.disabilityDetails}
              onChange={(e) => onInputChange('disabilityDetails', e.target.value)}
              className="col-span-2 h-20"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">الاسم الكامل</p>
                <p className="text-lg font-medium text-gray-900">{formData.fullName || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">الجنس</p>
                <p className="text-lg font-medium text-gray-900">{formData.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">تاريخ الميلاد</p>
                <p className="text-lg font-medium text-gray-900">{formData.birthDate ? formatGregorianDate(formData.birthDate) : 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">العمر</p>
                <p className="text-lg font-medium text-gray-900">{formData.age || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">نوع الإعاقة</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.disabilityType ? disabilityTypes[formData.disabilityType as keyof typeof disabilityTypes] : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">رقم بطاقة الإعاقة</p>
                <p className="text-lg font-medium text-gray-900">{formData.disabilityCardNumber || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">تفاصيل الإعاقة</p>
                <p className="text-lg font-medium text-gray-900">{formData.disabilityDetails || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        )}

        {editMode && (
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => onEditModeChange(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={onSaveChanges}
              isLoading={isSaving}
              icon={<Save className="w-5 h-5" />}
            >
              حفظ التغييرات
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoTab;

