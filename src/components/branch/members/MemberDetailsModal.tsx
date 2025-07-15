import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, Calendar, MapPin, 
  FileText, Heart, Briefcase, Building, DollarSign, 
  CheckCircle, XCircle
} from 'lucide-react';
import Button from '../../ui/Button';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member
}) => {
  const [tab, setTab] = useState<'info' | 'documents' | 'requests'>('info');

  if (!isOpen || !member) return null;

  const getDisabilityTypeText = (type: string) => {
    const disabilityTypes: Record<string, string> = {
      'deaf': 'أصم',
      'hearing_impaired': 'ضعيف سمع',
      'hearing_loss': 'فاقد سمع',
      'visual_impaired': 'ضعيف بصر',
      'blind': 'فاقد بصر',
      'mobility_impaired': 'إعاقة حركية',
      'intellectual_disability': 'إعاقة ذهنية',
      'multiple_disabilities': 'إعاقات متعددة',
      'other': 'أخرى'
    };
    
    return disabilityTypes[type] || type;
  };

  const getEducationLevelText = (level: string) => {
    const educationLevels: Record<string, string> = {
      'no_education': 'بدون تعليم',
      'primary': 'ابتدائي',
      'intermediate': 'متوسط',
      'secondary': 'ثانوي',
      'diploma': 'دبلوم',
      'bachelor': 'بكالوريوس',
      'master': 'ماجستير',
      'phd': 'دكتوراه'
    };
    
    return educationLevels[level] || level;
  };

  const getEmploymentStatusText = (status: string) => {
    const employmentStatuses: Record<string, string> = {
      'unemployed': 'عاطل عن العمل',
      'employed': 'موظف',
      'retired': 'متقاعد',
      'student': 'طالب',
      'disabled_unable_work': 'غير قادر على العمل بسبب الإعاقة'
    };
    
    return employmentStatuses[status] || status;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {member.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{member.full_name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">رقم الهوية: {member.national_id}</span>
                  <StatusBadge 
                    status={member.status === 'active' ? 'success' : member.status === 'suspended' ? 'error' : 'pending'} 
                    text={member.status === 'active' ? 'نشط' : member.status === 'suspended' ? 'معلق' : 'غير نشط'} 
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('info')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${tab === 'info' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              المعلومات الشخصية
            </button>
            <button
              onClick={() => setTab('documents')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${tab === 'documents' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              المستندات
            </button>
            <button
              onClick={() => setTab('requests')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${tab === 'requests' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              الطلبات
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {tab === 'info' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    البيانات الشخصية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">الاسم الكامل</p>
                          <p className="text-sm text-purple-700">{member.full_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">رقم الهوية</p>
                          <p className="text-sm text-purple-700">{member.national_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">الجنس</p>
                          <p className="text-sm text-purple-700">
                            {member.gender === 'male' ? 'ذكر' : 'أنثى'}
                          </p>
                        </div>
                      </div>
                      
                      {member.age && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-900">العمر</p>
                            <p className="text-sm text-purple-700">{member.age} سنة</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">رقم الجوال</p>
                          <p className="text-sm text-purple-700">{member.phone}</p>
                        </div>
                      </div>
                      
                      {member.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-900">البريد الإلكتروني</p>
                            <p className="text-sm text-purple-700">{member.email}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">المدينة</p>
                          <p className="text-sm text-purple-700">{member.city || 'غير محدد'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">تاريخ التسجيل</p>
                          <p className="text-sm text-purple-700">{formatGregorianDate(member.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {member.disability_type && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-900">نوع الإعاقة</p>
                            <p className="text-sm text-purple-700">{getDisabilityTypeText(member.disability_type)}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.disability_card_number && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-900">رقم بطاقة الإعاقة</p>
                            <p className="text-sm text-purple-700">{member.disability_card_number}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.education_level && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-900">المؤهل الدراسي</p>
                            <p className="text-sm text-purple-700">{getEducationLevelText(member.education_level)}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.employment_status && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-900">الحالة الوظيفية</p>
                            <p className="text-sm text-purple-700">{getEmploymentStatusText(member.employment_status)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      العنوان
                    </h3>
                    
                    <div className="space-y-3">
                      {member.address && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">العنوان التفصيلي</p>
                            <p className="text-sm text-blue-700">{member.address}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.district && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">الحي</p>
                            <p className="text-sm text-blue-700">{member.district}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.building_number && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">رقم المبنى</p>
                            <p className="text-sm text-blue-700">{member.building_number}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      البيانات المهنية والمالية
                    </h3>
                    
                    <div className="space-y-3">
                      {member.employment_status && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900">الحالة الوظيفية</p>
                            <p className="text-sm text-green-700">{getEmploymentStatusText(member.employment_status)}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.job_title && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900">المسمى الوظيفي</p>
                            <p className="text-sm text-green-700">{member.job_title}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.monthly_income !== undefined && member.monthly_income !== null && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900">الدخل الشهري</p>
                            <p className="text-sm text-green-700">{member.monthly_income} ريال</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Emergency Contact */}
                {(member.emergency_contact_name || member.emergency_contact_phone) && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      جهة اتصال للطوارئ
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {member.emergency_contact_name && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-red-900">الاسم</p>
                            <p className="text-sm text-red-700">{member.emergency_contact_name}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.emergency_contact_phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-red-900">رقم الجوال</p>
                            <p className="text-sm text-red-700">{member.emergency_contact_phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {member.emergency_contact_relation && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-red-900">صلة القرابة</p>
                            <p className="text-sm text-red-700">{member.emergency_contact_relation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    المستندات
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-purple-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-900">صورة الهوية الوطنية</h4>
                        <StatusBadge status="success" text="تم التحقق" />
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <button className="text-purple-600 hover:underline">
                          عرض المستند
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-purple-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-900">بطاقة الإعاقة</h4>
                        <StatusBadge status="success" text="تم التحقق" />
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <button className="text-purple-600 hover:underline">
                          عرض المستند
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-6">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">نظام المستندات المتقدم</h4>
                  <p className="text-gray-500">
                    نظام إدارة المستندات المتقدم قيد التطوير
                  </p>
                </div>
              </div>
            )}

            {tab === 'requests' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    طلبات الخدمات
                  </h3>
                  
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات نشطة</h4>
                    <p className="text-gray-500">
                      لم يقدم المستفيد أي طلبات خدمة بعد
                    </p>
                  </div>
                </div>

                <div className="text-center py-6">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">نظام إدارة الطلبات</h4>
                  <p className="text-gray-500">
                    نظام إدارة طلبات الخدمات قيد التطوير
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal;
