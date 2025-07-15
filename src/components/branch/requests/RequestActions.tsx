import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { UIIcons, RequestIcons } from '../../../constants/icons';

export interface RequestAction {
  key: 'approve' | 'reject' | 'review' | 'correction';
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  requiresNotes?: boolean;
  notesPlaceholder?: string;
}

interface RequestActionsProps {
  requestId: string;
  memberId: string;
  onStatusChange: (requestId: string, memberId: string, status: string, notes?: string) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * مكون إجراءات الطلب
 */
const RequestActions: React.FC<RequestActionsProps> = ({
  requestId,
  memberId,
  onStatusChange,
  isSubmitting
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // تعريف الإجراءات المتاحة
  const actions: RequestAction[] = [
    {
      key: 'approve',
      label: 'موافقة على الطلب',
      description: 'الموافقة على طلب الخدمة',
      color: 'from-green-50 to-teal-50 border-green-200/50',
      icon: <RequestIcons.CheckCircle className="w-6 h-6" />,
      requiresNotes: false,
      notesPlaceholder: 'ملاحظات الموافقة (اختياري)'
    },
    {
      key: 'reject',
      label: 'رفض الطلب',
      description: 'رفض الطلب مع ذكر السبب',
      color: 'from-red-50 to-rose-50 border-red-200/50',
      icon: <RequestIcons.XCircle className="w-6 h-6" />,
      requiresNotes: true,
      notesPlaceholder: 'سبب الرفض *'
    },
    {
      key: 'review',
      label: 'بدء المراجعة',
      description: 'البدء في مراجعة الطلب',
      color: 'from-blue-50 to-indigo-50 border-blue-200/50',
      icon: <RequestIcons.Clock className="w-6 h-6" />,
      requiresNotes: false
    },
    {
      key: 'correction',
      label: 'طلب تصحيح',
      description: 'طلب تصحيح البيانات أو إضافة مستندات',
      color: 'from-amber-50 to-yellow-50 border-amber-200/50',
      icon: <UIIcons.AlertTriangle className="w-6 h-6" />,
      requiresNotes: true,
      notesPlaceholder: 'ملاحظات التصحيح *'
    }
  ];

  // معالجة تنفيذ الإجراء
  const handleActionExecute = async (action: RequestAction) => {
    let status = '';
    let notes = '';
    
    switch (action.key) {
      case 'approve':
        status = 'approved';
        notes = approvalNotes;
        break;
      case 'reject':
        if (!rejectionReason.trim() && action.requiresNotes) {
          alert('يرجى كتابة سبب الرفض');
          return;
        }
        status = 'rejected';
        notes = rejectionReason;
        break;
      case 'review':
        status = 'under_review';
        break;
      case 'correction':
        if (!correctionNotes.trim() && action.requiresNotes) {
          alert('يرجى كتابة ملاحظات التصحيح');
          return;
        }
        status = 'needs_correction';
        notes = correctionNotes;
        break;
    }
    
    await onStatusChange(requestId, memberId, status, notes);
    setActiveAction(null);
  };

  // الحصول على قيمة الملاحظات حسب نوع الإجراء
  const getNotesValue = (actionKey: string): string => {
    switch (actionKey) {
      case 'approve': return approvalNotes;
      case 'reject': return rejectionReason;
      case 'correction': return correctionNotes;
      default: return '';
    }
  };

  // تغيير قيمة الملاحظات حسب نوع الإجراء
  const handleNotesChange = (actionKey: string, value: string) => {
    switch (actionKey) {
      case 'approve': setApprovalNotes(value); break;
      case 'reject': setRejectionReason(value); break;
      case 'correction': setCorrectionNotes(value); break;
    }
  };

  return (
    <div className="space-y-6">
      {/* عرض أزرار الإجراءات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => setActiveAction(action.key)}
            className={`flex flex-col items-center gap-3 p-4 bg-gradient-to-r ${action.color} rounded-xl hover:shadow-md transition-shadow disabled:opacity-50`}
            disabled={isSubmitting}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              action.key === 'approve' ? 'bg-green-100 text-green-600' :
              action.key === 'reject' ? 'bg-red-100 text-red-600' :
              action.key === 'review' ? 'bg-blue-100 text-blue-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {action.icon}
            </div>
            <div className="text-center">
              <h4 className={`font-medium ${
                action.key === 'approve' ? 'text-green-800' :
                action.key === 'reject' ? 'text-red-800' :
                action.key === 'review' ? 'text-blue-800' :
                'text-amber-800'
              }`}>
                {action.label}
              </h4>
              <p className={`text-xs ${
                action.key === 'approve' ? 'text-green-600' :
                action.key === 'reject' ? 'text-red-600' :
                action.key === 'review' ? 'text-blue-600' :
                'text-amber-600'
              }`}>
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
      
      {/* عرض تفاصيل الإجراء المحدد */}
      {activeAction && (() => {
        const action = actions.find(a => a.key === activeAction);
        if (!action) return null;
        
        return (
          <div className={`bg-gradient-to-r ${action.color} rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              action.key === 'approve' ? 'text-green-900' :
              action.key === 'reject' ? 'text-red-900' :
              action.key === 'review' ? 'text-blue-900' :
              'text-amber-900'
            }`}>
              {action.icon}
              {action.label}
            </h3>
            
            <div className="space-y-4">
              {action.requiresNotes !== false && (
                <Input
                  label={action.notesPlaceholder || 'ملاحظات'}
                  type="text"
                  value={getNotesValue(action.key)}
                  onChange={(e) => handleNotesChange(action.key, e.target.value)}
                  placeholder={action.notesPlaceholder}
                  className="h-20"
                />
              )}
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveAction(null)}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => handleActionExecute(action)}
                  isLoading={isSubmitting}
                  className={
                    action.key === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    action.key === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    action.key === 'review' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-amber-600 hover:bg-amber-700'
                  }
                  icon={action.icon}
                >
                  تأكيد {action.label}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default RequestActions;
