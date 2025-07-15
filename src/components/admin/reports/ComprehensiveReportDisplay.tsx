import React, { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, Calendar, DollarSign, 
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  Download, Share2, Edit, Eye, MessageSquare,
  TrendingUp, Shield, Award, Activity, Building,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Button from '../../ui/Button';
import { ComprehensiveReport, AdminAction } from '../../../types/reports';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { formatCurrency } from '../../../utils/helpers';

interface ComprehensiveReportDisplayProps {
  report: ComprehensiveReport;
  onAdminAction: (action: AdminAction) => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  isLoading?: boolean;
}

const ComprehensiveReportDisplay: React.FC<ComprehensiveReportDisplayProps> = ({
  report,
  onAdminAction,
  onExport,
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    financial: true,
    requests: true,
    timeline: false,
    documents: false,
    recommendations: true
  });

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      case 'under_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'suspended': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const handleAdminAction = (actionType: string) => {
    const action: AdminAction = {
      type: actionType as any,
      target_id: report.beneficiary.id,
      target_type: 'beneficiary'
    };
    onAdminAction(action);
    setShowActionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{report.beneficiary.full_name}</h2>
              <div className="flex items-center gap-4 mt-2 text-blue-100">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {report.beneficiary.national_id}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {report.beneficiary.phone}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(report.beneficiary.status)}`}>
                  {getStatusIcon(report.beneficiary.status)}
                  {report.beneficiary.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setShowActionModal(true)}
              icon={<Edit className="w-4 h-4 ml-2" />}
            >
              إجراءات إدارية
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => onExport('pdf')}
                icon={<Download className="w-4 h-4" />}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => onExport('excel')}
                icon={<Download className="w-4 h-4" />}
              >
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.activity_summary.total_requests}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الطلبات</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.activity_summary.approved_requests}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">طلبات موافق عليها</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(report.financial_summary.total_approved)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبالغ المعتمدة</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.activity_summary.average_processing_time?.toFixed(1) || 'N/A'} يوم
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">متوسط وقت المعالجة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer"
          onClick={() => toggleSection('personal')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">المعلومات الشخصية</h3>
          </div>
          {expandedSections.personal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        {expandedSections.personal && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">الاسم الكامل</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">رقم الهوية الوطنية</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.national_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">تاريخ الميلاد</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {report.beneficiary.birth_date ? formatGregorianDate(report.beneficiary.birth_date) : 'غير محدد'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">رقم الجوال</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">البريد الإلكتروني</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.email || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">الحالة الاجتماعية</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.marital_status || 'غير محدد'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">المدينة</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.address?.city || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">الحي</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.address?.district || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">عدد أفراد الأسرة</label>
                  <p className="text-gray-900 dark:text-white font-medium">{report.beneficiary.family_members_count || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">نسبة اكتمال الملف الشخصي</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تاريخ التسجيل: {formatGregorianDate(report.beneficiary.registration_date)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {report.beneficiary.completion_percentage}%
                  </div>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${report.beneficiary.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer"
          onClick={() => toggleSection('financial')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">الملخص المالي</h3>
          </div>
          {expandedSections.financial ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        {expandedSections.financial && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(report.financial_summary.total_requested)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">إجمالي المطلوب</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(report.financial_summary.total_approved)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">إجمالي المعتمد</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(report.financial_summary.total_received)}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">إجمالي المستلم</div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(report.financial_summary.pending_amount)}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">المبلغ المعلق</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer"
          onClick={() => toggleSection('requests')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              طلبات الخدمات ({report.service_requests.length})
            </h3>
          </div>
          {expandedSections.requests ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        {expandedSections.requests && (
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {report.service_requests.map((request, index) => (
                <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{request.service_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          رقم الطلب: {request.id} • {formatGregorianDate(request.request_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status === 'approved' ? 'موافق عليه' :
                         request.status === 'pending' ? 'معلق' :
                         request.status === 'under_review' ? 'قيد المراجعة' :
                         request.status === 'rejected' ? 'مرفوض' : request.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {request.requested_amount && (
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">المبلغ المطلوب</label>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(request.requested_amount)}
                        </p>
                      </div>
                    )}
                    {request.approved_amount && (
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">المبلغ المعتمد</label>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(request.approved_amount)}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">الموظف المسؤول</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.employee_name || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <label className="text-xs text-gray-500 dark:text-gray-400">ملاحظات</label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{request.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAdminAction({
                        type: 'approve_request',
                        target_id: request.id,
                        target_type: 'service_request'
                      })}
                      disabled={request.status === 'approved'}
                      icon={<CheckCircle className="w-4 h-4 ml-1" />}
                    >
                      موافقة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAdminAction({
                        type: 'reject_request',
                        target_id: request.id,
                        target_type: 'service_request'
                      })}
                      disabled={request.status === 'rejected'}
                      icon={<XCircle className="w-4 h-4 ml-1" />}
                    >
                      رفض
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Eye className="w-4 h-4 ml-1" />}
                    >
                      التفاصيل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment & Recommendations */}
      {report.risk_assessment && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer"
            onClick={() => toggleSection('recommendations')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">تقييم المخاطر والتوصيات</h3>
            </div>
            {expandedSections.recommendations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {expandedSections.recommendations && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">تقييم المخاطر</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">مستوى المخاطر</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(report.risk_assessment.level)}`}>
                        {report.risk_assessment.level === 'low' ? 'منخفض' :
                         report.risk_assessment.level === 'medium' ? 'متوسط' : 'عالي'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">النقاط</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {report.risk_assessment.score}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-2">العوامل المؤثرة</span>
                      <ul className="space-y-1">
                        {report.risk_assessment.factors.map((factor, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">التوصيات</h4>
                  <ul className="space-y-3">
                    {report.recommendations?.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Actions Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowActionModal(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md relative z-10">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الإجراءات الإدارية</h3>
                <div className="space-y-2">
                  {[
                    { id: 'add_note', label: 'إضافة ملاحظة', icon: <MessageSquare className="w-4 h-4" /> },
                    { id: 'suspend_beneficiary', label: 'إيقاف المستفيد', icon: <AlertTriangle className="w-4 h-4" /> },
                    { id: 'activate_beneficiary', label: 'تفعيل المستفيد', icon: <CheckCircle className="w-4 h-4" /> },
                    { id: 'schedule_interview', label: 'جدولة مقابلة', icon: <Calendar className="w-4 h-4" /> },
                    { id: 'request_documents', label: 'طلب مستندات إضافية', icon: <FileText className="w-4 h-4" /> },
                    { id: 'transfer_branch', label: 'نقل إلى فرع آخر', icon: <Building className="w-4 h-4" /> }
                  ].map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAdminAction(action.id)}
                      className="w-full flex items-center gap-3 p-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {action.icon}
                      <span className="text-gray-900 dark:text-white">{action.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowActionModal(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReportDisplay;
