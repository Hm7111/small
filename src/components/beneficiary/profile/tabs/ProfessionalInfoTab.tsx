import React from 'react';
import { Briefcase, Edit, Save } from 'lucide-react';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { educationLevels, employmentStatuses } from '../../../../utils/registrationData';

interface ProfessionalInfoTabProps {
  formData: {
    educationLevel: string;
    employmentStatus: string;
    jobTitle: string;
    employer: string;
    monthlyIncome: string;
  };
  editMode: boolean;
  isSaving: boolean;
  onEditModeChange: (mode: boolean) => void;
  onInputChange: (field: string, value: any) => void;
  onSaveChanges: () => Promise<void>;
}

const ProfessionalInfoTab: React.FC<ProfessionalInfoTabProps> = ({
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
          <Briefcase className="w-6 h-6 text-green-600" />
          البيانات المهنية
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
            <Select
              label="المستوى التعليمي"
              value={formData.educationLevel}
              onChange={(value) => onInputChange('educationLevel', value)}
              options={Object.entries(educationLevels).map(([key, label]) => ({
                value: key,
                label: label
              }))}
            />

            <Select
              label="الحالة الوظيفية"
              value={formData.employmentStatus}
              onChange={(value) => onInputChange('employmentStatus', value)}
              options={Object.entries(employmentStatuses).map(([key, label]) => ({
                value: key,
                label: label
              }))}
            />

            <Input
              label="المسمى الوظيفي"
              type="text"
              value={formData.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              placeholder="المسمى الوظيفي"
            />

            <Input
              label="جهة العمل"
              type="text"
              value={formData.employer}
              onChange={(e) => onInputChange('employer', e.target.value)}
              placeholder="جهة العمل"
            />

            <Input
              label="الراتب الشهري"
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => onInputChange('monthlyIncome', e.target.value)}
              placeholder="الراتب الشهري بالريال"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">المستوى التعليمي</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.educationLevel ? educationLevels[formData.educationLevel as keyof typeof educationLevels] : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">الحالة الوظيفية</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.employmentStatus ? employmentStatuses[formData.employmentStatus as keyof typeof employmentStatuses] : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">المسمى الوظيفي</p>
                <p className="text-lg font-medium text-gray-900">{formData.jobTitle || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">جهة العمل</p>
                <p className="text-lg font-medium text-gray-900">{formData.employer || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">الراتب الشهري</p>
                <p className="text-lg font-medium text-gray-900">
                  {formData.monthlyIncome ? `${formData.monthlyIncome} ريال` : 'غير محدد'}
                </p>
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

export default ProfessionalInfoTab;

