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
}

const BranchRegistrationDetailsModal: React.FC<RegistrationDetailsModalProps> = ({
  isOpen,
  onClose,
  registration,
  onStatusChange
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onStatusChange(registration.id, registration.member_id, 'approved', approvalNotes);
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
      await onStatusChange(registration.id, registration.member_id, 'rejected', rejectionReason);
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
      await onStatusChange(registration.id, registration.member_id, 'needs_correction', correctionNotes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToEmployee = async () => {
    setIsSubmitting(true);
    try {
      await onStatusChange(registration.id, registration.member_id, 'under_employee_review');
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
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          البيانات الشخصية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-300">الاسم الكامل</p>
                <p className="text-sm text-green-700 dark:text-green-400">{registration.member_name || 'اسم المستفيد'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">رقم الهوية</p>
                <p className="text-sm text-green-700">{registration.national_id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">الجنس</p>
                <p className="text-sm text-green-700">
                  {registration.gender === 'male' ? 'ذكر' : 'أنثى'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">رقم الجوال</p>
                <p className="text-sm text-green-700">{registration.phone}</p>
              </div>
            </div>
            
            {registration.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">البريد الإلكتروني</p>
                  <p className="text-sm text-green-700">{registration.email}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">تاريخ التقديم</p>
                <p className="text-sm text-green-700">{formatGregorianDate(registration.registration_date)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">المدينة</p>
                <p className="text-sm text-green-700">{registration.city || 'غير محدد'}</p>
              </div>
            </div>
            
            {registration.disability_type && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">نوع الإعاقة</p>
                  <p className="text-sm text-green-700">{registration.disability_type}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">الحالة الوظيفية</p>
                <p className="text-sm text-green-700">{registration.employment_status || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Documents */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          المستندات المرفقة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">صورة الهوية الوطنية</h4>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                تم التحقق
              </span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <button className="text-blue-600 hover:underline">
                عرض المستند
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">بطاقة الإعاقة</h4>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                تم التحقق
              </span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <button className="text-blue-600 hover:underline">
                عرض المستند
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          معلومات إضافية
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-purple-100 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">ملاحظات الموظف</h4>
            <p className="text-sm text-purple-700">
              {registration.employee_notes || 'لا توجد ملاحظات من الموظف'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-purple-100 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">حالة المستندات</h4>
            <p className="text-sm text-purple-700">
              تم التحقق من جميع المستندات المطلوبة
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const actionsContent = (
    <div className="space-y-6">
      {/* Review Actions */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          الموافقة على الطلب
        </h3>
        
        <div className="space-y-4">
          <p className="text-green-700 dark:text-green-400">
            الموافقة على طلب التسجيل سيمكن المستفيد من الاستفادة من خدمات الجمعية.
            يرجى التأكد من صحة البيانات والمستندات قبل الموافقة.
          </p>
          
          <Input
            label="ملاحظات الموافقة (اختياري)"
            type="text"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="أي ملاحظات إضافية عند الموافقة"
            className="h-20"
          />
          
          <Button
            onClick={handleApprove}
            isLoading={isSubmitting}
            className="bg-green-600 hover:bg-green-700 w-full"
            icon={<Check className="w-5 h-5" />}
          >
            موافقة على التسجيل
          </Button>
        </div>
      </div>
      
      {/* Correction Request */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          طلب تصحيح
        </h3>
        
        <div className="space-y-4">
          <p className="text-amber-700 dark:text-amber-400">
            إذا كانت هناك بيانات أو مستندات تحتاج إلى تصحيح، يرجى تحديدها بوضوح ليتمكن المستفيد من تصحيحها.
          </p>
          
          <Input
            label="ملاحظات التصحيح *"
            type="text"
            value={correctionNotes}
            onChange={(e) => setCorrectionNotes(e.target.value)}
            placeholder="مثال: يرجى تحديث صورة الهوية، صورة بطاقة الإعاقة غير واضحة..."
            className="h-20"
          />
          
          <Button
            onClick={handleNeedsCorrection}
            isLoading={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 w-full"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            طلب تصحيح
          </Button>
        </div>
      </div>
      
      {/* Rejection */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
          <X className="w-5 h-5" />
          رفض الطلب
        </h3>
        
        <div className="space-y-4">
          <p className="text-red-700 dark:text-red-400">
            رفض الطلب يعني عدم قبول المستفيد في الجمعية. يرجى ذكر سبب الرفض بوضوح.
          </p>
          
          <Input
            label="سبب الرفض *"
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="مثال: عدم انطباق شروط الاستحقاق، وثائق غير صحيحة..."
            className="h-20"
          />
          
          <Button
            onClick={handleReject}
            isLoading={isSubmitting}
            className="bg-red-600 hover:bg-red-700 w-full"
            icon={<X className="w-5 h-5" />}
          >
            رفض الطلب
          </Button>
        </div>
      </div>
      
      {/* Assign to Employee */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          تحويل للموظف
        </h3>
        
        <div className="space-y-4">
          <p className="text-blue-700 dark:text-blue-400">
            يمكنك تحويل الطلب لأحد الموظفين للمراجعة التفصيلية قبل اتخاذ القرار النهائي.
          </p>
          
          <Button
            onClick={handleAssignToEmployee}
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 w-full"
            icon={<UserCheck className="w-5 h-5" />}
          >
            تحويل للموظف للمراجعة
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

export default BranchRegistrationDetailsModal;
