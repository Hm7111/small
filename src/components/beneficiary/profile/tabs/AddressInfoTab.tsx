import React from 'react';
import { MapPin, Edit, Save } from 'lucide-react';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { saudiCities } from '../../../../utils/registrationData';

interface AddressInfoTabProps {
  formData: {
    buildingNumber: string;
    streetName: string;
    district: string;
    city: string;
    postalCode: string;
    additionalNumber: string;
    address: string;
  };
  editMode: boolean;
  isSaving: boolean;
  onEditModeChange: (mode: boolean) => void;
  onInputChange: (field: string, value: any) => void;
  onSaveChanges: () => Promise<void>;
}

const AddressInfoTab: React.FC<AddressInfoTabProps> = ({
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
          <MapPin className="w-6 h-6 text-orange-600" />
          بيانات العنوان
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
              label="رقم المبنى"
              type="text"
              value={formData.buildingNumber}
              onChange={(e) => onInputChange('buildingNumber', e.target.value)}
              maxLength={4}
            />

            <Input
              label="اسم الشارع"
              type="text"
              value={formData.streetName}
              onChange={(e) => onInputChange('streetName', e.target.value)}
            />

            <Input
              label="الحي"
              type="text"
              value={formData.district}
              onChange={(e) => onInputChange('district', e.target.value)}
            />

            <Select
              label="المدينة"
              value={formData.city}
              onChange={(value) => onInputChange('city', value)}
              options={saudiCities.map(city => ({
                value: city,
                label: city
              }))}
            />

            <Input
              label="الرمز البريدي"
              type="text"
              value={formData.postalCode}
              onChange={(e) => onInputChange('postalCode', e.target.value)}
              maxLength={5}
            />

            <Input
              label="الرقم الإضافي"
              type="text"
              value={formData.additionalNumber}
              onChange={(e) => onInputChange('additionalNumber', e.target.value)}
              maxLength={4}
            />

            <Input
              label="العنوان التفصيلي"
              type="text"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              className="col-span-2 h-20"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">رقم المبنى</p>
                <p className="text-lg font-medium text-gray-900">{formData.buildingNumber || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">اسم الشارع</p>
                <p className="text-lg font-medium text-gray-900">{formData.streetName || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">الحي</p>
                <p className="text-lg font-medium text-gray-900">{formData.district || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">المدينة</p>
                <p className="text-lg font-medium text-gray-900">{formData.city || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">الرمز البريدي</p>
                <p className="text-lg font-medium text-gray-900">{formData.postalCode || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">الرقم الإضافي</p>
                <p className="text-lg font-medium text-gray-900">{formData.additionalNumber || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">العنوان التفصيلي</p>
                <p className="text-lg font-medium text-gray-900">{formData.address || 'غير محدد'}</p>
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

export default AddressInfoTab;

