import React from 'react';
import { Phone, Edit, Save } from 'lucide-react';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import { formatPhoneNumber } from '../../../../utils/helpers';

interface ContactInfoTabProps {
  formData: {
    phone: string;
    alternativePhone: string;
    email: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
  };
  editMode: boolean;
  isSaving: boolean;
  onEditModeChange: (mode: boolean) => void;
  onInputChange: (field: string, value: any) => void;
  onSaveChanges: () => Promise<void>;
}

const ContactInfoTab: React.FC<ContactInfoTabProps> = ({
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
          <Phone className="w-6 h-6 text-purple-600" />
          بيانات التواصل
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
              label="رقم الجوال"
              type="tel"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="05xxxxxxxx"
            />

            <Input
              label="رقم جوال بديل"
              type="tel"
              value={formData.alternativePhone}
              onChange={(e) => onInputChange('alternativePhone', e.target.value)}
              placeholder="05xxxxxxxx"
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="example@email.com"
              className="col-span-2"
            />

            <Input
              label="اسم جهة الاتصال الطارئ"
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => onInputChange('emergencyContactName', e.target.value)}
              placeholder="اسم جهة الاتصال الطارئ"
            />

            <Input
              label="رقم جهة الاتصال الطارئ"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => onInputChange('emergencyContactPhone', e.target.value)}
              placeholder="05xxxxxxxx"
            />

            <Input
              label="صلة القرابة"
              type="text"
              value={formData.emergencyContactRelation}
              onChange={(e) => onInputChange('emergencyContactRelation', e.target.value)}
              placeholder="الأب، الأم، الأخ، الأخت، الزوج، الزوجة، الابن، الابنة"
              className="col-span-2"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">رقم الجوال</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.phone ? formatPhoneNumber(formData.phone) : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">رقم جوال بديل</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.alternativePhone ? formatPhoneNumber(formData.alternativePhone) : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="text-lg font-medium text-gray-900">{formData.email || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">اسم جهة الاتصال الطارئ</p>
                <p className="text-lg font-medium text-gray-900">{formData.emergencyContactName || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">رقم جهة الاتصال الطارئ</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.emergencyContactPhone ? formatPhoneNumber(formData.emergencyContactPhone) : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">صلة القرابة</p>
                <p className="text-lg font-medium text-gray-900">{formData.emergencyContactRelation || 'غير محدد'}</p>
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

export default ContactInfoTab;

