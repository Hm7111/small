import React from 'react';
import { Phone, Mail, MapPin, Edit } from 'lucide-react';
import Button from '../../ui/Button';

interface ContactInfoSectionProps {
  registrationStatus: string;
  memberData: any;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ 
  registrationStatus,
  memberData
}) => {
  if (registrationStatus !== 'approved' || !memberData) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <span>معلومات التواصل المسجلة</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
              <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-purple-900 dark:text-purple-300">رقم الجوال</h4>
          </div>
          <p className="text-gray-800 dark:text-gray-200 font-medium">{memberData.phone || 'غير محدد'}</p>
        </div>
        
        {memberData.email && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-purple-900 dark:text-purple-300">البريد الإلكتروني</h4>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium">{memberData.email}</p>
          </div>
        )}
        
        {memberData.alternative_phone && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
                <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-purple-900 dark:text-purple-300">رقم جوال بديل</h4>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium">{memberData.alternative_phone}</p>
          </div>
        )}
        
        {(memberData.city || memberData.address) && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 md:col-span-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-purple-900 dark:text-purple-300">العنوان</h4>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              {[
                memberData.city,
                memberData.district && `حي ${memberData.district}`,
                memberData.street_name && `شارع ${memberData.street_name}`,
                memberData.building_number && `مبنى ${memberData.building_number}`,
                memberData.address
              ].filter(Boolean).join('، ')}
            </p>
          </div>
        )}
        
        <div className="md:col-span-3 text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="outline"
            className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
            icon={<Edit className="w-5 h-5 ml-3" />}
            onClick={() => window.location.href = '/beneficiary?tab=profile'}
          >
            تحديث بيانات الاتصال
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
