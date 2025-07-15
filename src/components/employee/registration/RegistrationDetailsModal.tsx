import React, { useState } from 'react';
import RegistrationDetailsModal from '@/components/shared/modals/RegistrationDetailsModal';
import { 
  User, Phone, Mail, Calendar, MapPin, 
  FileText, Check, UserCheck, Heart, Briefcase,
  CheckCircle, XCircle, AlertTriangle, Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface RegistrationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
  onStatusChange: (id: string, memberId: string, status: string, notes?: string) => void;
  userRole: 'employee' | 'branch_manager';
}

const EmployeeRegistrationDetailsModal: React.FC<RegistrationDetailsModalProps> = ({
  isOpen,
  onClose,
  registration,
  onStatusChange,
  userRole
}) => {
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onStatusChange(
        registration.id, 
        registration.member_id, 
        'under_manager_review', 
        verificationNotes
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onStatusChange(
        registration.id, 
        registration.member_id, 
        'approved', 
        verificationNotes
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('يرجى كتابة سبب الرفض');
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(
        registration.id, 
        registration.member_id, 
        'rejected', 
        rejectionReason
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNeedsCorrection = async () => {
    if (!correctionNotes.trim()) {
      alert('يرجى كتابة الملاحظات المطلوب تصحيحها');
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(
        registration.id, 
        registration.member_id, 
        'needs_correction', 
        correctionNotes
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !registration) return null;

  const getStatusBadge = () => {
    let icon, bgColor, textColor;

    switch (registration.registration_status) {
      case 'approved':
        icon = <CheckCircle className="w-4 h-4" />;
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'rejected':
        icon = <XCircle className="w-4 h-4" />;
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'needs_correction':
        icon = <AlertTriangle className="w-4 h-4" />;
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-800';
        break;
      default:
        icon = <Clock className="w-4 h-4" />;
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
    }

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor} ${textColor}`}>
        {icon}
        <span>
          {registration.registration_status === 'pending_review' ? 'قيد المراجعة الأولية' : 
            registration.registration_status === 'under_employee_review' ? 'قيد مراجعة الموظف' :
            registration.registration_status === 'under_manager_review' ? 'قيد مراجعة المدير' : 
            registration.registration_status === 'approved' ? 'معتمد' :
            registration.registration_status === 'rejected' ? 'مرفوض' :
            registration.registration_status === 'needs_correction' ? 'يحتاج تصحيح' : 
            registration.registration_status}
        </span>
      </div>
    );
  };

  const infoContent = (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          البيانات الشخصية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">الاسم الكامل</p>
                <p className="text-sm text-blue-700">{registration.member_name || 'اسم المستفيد'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">رقم الهوية</p>
                <p className="text-sm text-blue-700">{registration.national_id || '1234567890'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">الجنس</p>
                <p className="text-sm text-blue-700">
                  {registration.gender === 'male' ? 'ذكر' : 'أنثى'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">رقم الجوال</p>
                <p className="text-sm text-blue-700">{registration.phone || '0512345678'}</p>
              </div>
            </div>
            
            {registration.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">البريد الإلكتروني</p>
                  <p className="text-sm text-blue-700">{registration.email}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">تاريخ التقديم</p>
                <p className="text-sm text-blue-700">{formatGregorianDate(registration.registration_date)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">المدينة</p>
                <p className="text-sm text-blue-700">{registration.city || 'الرياض'}</p>
              </div>
            </div>
            
            {registration.disability_type && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">نوع الإعاقة</p>
                  <p className="text-sm text-blue-700">{registration.disability_type || 'ضعف بصر'}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">الحالة الوظيفية</p>
                <p className="text-sm text-blue-700">{registration.employment_status || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assignment Information */}
      {registration.assigned_to && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            معلومات الإسناد
          </h3>
        </div>
      )}
    </div>
  );

  const actionsContent = (
    <div className="space-y-6">
      {/* Review Actions */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          اتخاذ القرار
        </h3>
        
        <div className="space-y-4">
          <p className="text-green-700">
            بعد التحقق من بيانات المستفيد والمستندات، يمكنك اتخاذ أحد الإجراءات التالية:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-3 p-4 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <Briefcase className="w-8 h-8" />
              <span className="font-medium">إحالة للمدير</span>
              <span className="text-xs text-center">إحالة الطلب لمدير الفرع للمراجعة النهائية</span>
            </button>
            
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-3 p-4 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-8 h-8" />
              <span className="font-medium">موافقة</span>
              <span className="text-xs text-center">الموافقة على طلب التسجيل مباشرة</span>
            </button>
            
            <button
              onClick={() => {}}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-3 p-4 bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-8 h-8" />
              <span className="font-medium">طلب تصحيح</span>
              <span className="text-xs text-center">طلب تصحيح أو إضافة معلومات</span>
            </button>
          </div>
          
          <Input
            label="ملاحظات المراجعة"
            type="text"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder="أدخل ملاحظاتك حول المراجعة (اختياري)"
            className="h-20"
          />
        </div>
      </div>
      
      {/* Rejection Section */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <X className="w-5 h-5" />
          رفض الطلب
        </h3>
        
        <div className="space-y-4">
          <p className="text-red-700">
            يمكنك رفض الطلب في حال عدم استيفاء الشروط أو عدم صحة البيانات.
          </p>
          
          <Input
            label="سبب الرفض *"
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="أدخل سبب رفض الطلب بشكل واضح ليتم إرساله للمستفيد"
            className="h-20"
          />
          
          <Button
            onClick={handleReject}
            isLoading={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
            icon={<X className="w-5 h-5" />}
          >
            رفض الطلب
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <RegistrationDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      registration={registration}
      title={registration.member_name || 'اسم المستفيد'}
      subtitle={`رقم الهوية: ${registration.national_id || '1234567890'}`}
      statusBadge={getStatusBadge()}
      infoContent={infoContent}
      actionsContent={actionsContent}
    />
  );
};

export default EmployeeRegistrationDetailsModal;
