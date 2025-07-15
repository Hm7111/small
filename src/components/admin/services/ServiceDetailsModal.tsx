import React, { useState } from 'react';
import { 
  X, FileText, Clock, Calendar, DollarSign, Tag, 
  User, CheckCircle, XCircle, AlertTriangle,
  Package, CreditCard, Heart, Briefcase, GraduationCap
} from 'lucide-react';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../utils/helpers';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { Service } from '../../../services/AdminService';

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  isOpen,
  onClose,
  service
}) => {
  console.log("Service details modal rendered with data:", service);
  const [activeTab, setActiveTab] = useState<'info' | 'requirements' | 'documents'>('info');

  if (!isOpen || !service) return null;

  // الحصول على أيقونة مناسبة للفئة
  const getCategoryIcon = () => {
    switch (service.category) {
      case 'مساعدات مالية': return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'مساعدات عينية': return <Package className="w-6 h-6 text-green-600" />;
      case 'رعاية اجتماعية': return <Heart className="w-6 h-6 text-red-600" />;
      case 'تطوير مهارات': return <Briefcase className="w-6 h-6 text-purple-600" />;
      case 'الرعاية الصحية': return <Heart className="w-6 h-6 text-pink-600" />;
      case 'المساعدات التعليمية': return <GraduationCap className="w-6 h-6 text-indigo-600" />;
      default: return <Tag className="w-6 h-6 text-blue-600" />;
    }
  };

  // الحصول على لون خلفية مناسب لفئة الخدمة
  const getCategoryColor = () => {
    switch (service.category) {
      case 'مساعدات مالية': return 'bg-blue-100 text-blue-600';
      case 'مساعدات عينية': return 'bg-green-100 text-green-600';
      case 'رعاية اجتماعية': return 'bg-red-100 text-red-600';
      case 'تطوير مهارات': return 'bg-purple-100 text-purple-600';
      case 'الرعاية الصحية': return 'bg-pink-100 text-pink-600';
      case 'المساعدات التعليمية': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto dark:bg-black/20">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-4xl relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor()} bg-white/20 backdrop-blur-sm border border-white/30`}>
                    {getCategoryIcon()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{service.name}</h2>
                    <div className="flex items-center gap-2 mt-1 text-orange-100">
                      <Tag className="w-4 h-4" />
                      <span>{service.category || 'غير مصنفة'}</span>
                      <span className="mx-2">•</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {service.is_active ? 'نشطة' : 'غير نشطة'}
                      </span>
                    </div>
                  </div>
                </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${activeTab === 'info' 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              معلومات الخدمة
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${activeTab === 'requirements' 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              الشروط والمتطلبات
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`
                flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${activeTab === 'documents' 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              المستندات المطلوبة
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-auto max-h-[70vh]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    وصف الخدمة
                  </h3>
                  <p className="text-blue-800 dark:text-blue-300">
                    {service.description || 'لا يوجد وصف متاح لهذه الخدمة'}
                  </p>
                </div>

                {/* Service details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount and Duration */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      تفاصيل المبلغ والمدة
                    </h3>
                    <div className="space-y-4">
                      {service.max_amount ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900">الحد الأقصى للمبلغ</p>
                            <p className="text-green-700 text-lg font-bold">{formatCurrency(service.max_amount)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">الحد الأقصى للمبلغ</p>
                            <p className="text-gray-500">غير محدد</p>
                          </div>
                        </div>
                      )}
                      
                      {service.duration_days ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900">مدة الخدمة</p>
                            <p className="text-green-700 text-lg font-bold">{service.duration_days} يوم</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">مدة الخدمة</p>
                            <p className="text-gray-500">غير محددة</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reapplication rules */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      قواعد التقديم
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">فترة إعادة التقديم</p>
                          <p className="text-amber-700 text-lg font-bold">
                            {service.is_one_time_only 
                              ? 'مرة واحدة فقط' 
                              : service.reapplication_period_months 
                                ? `كل ${service.reapplication_period_months} شهر` 
                                : 'غير محدد'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">التقديم المتكرر</p>
                          <p className="text-amber-700">
                            {service.is_one_time_only 
                              ? 'لا يمكن إعادة التقديم على هذه الخدمة' 
                              : service.reapplication_period_months 
                                ? `يجب الانتظار ${service.reapplication_period_months} شهر قبل إعادة التقديم` 
                                : 'يمكن إعادة التقديم دون قيود زمنية'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Creation Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    معلومات الإنشاء
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-900">المنشئ</p>
                        <p className="text-purple-700">{service.creator_name || 'غير معروف'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-900">تاريخ الإنشاء</p>
                        <p className="text-purple-700">{formatGregorianDate(service.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-900">الحالة</p>
                        <p className="text-purple-700 flex items-center gap-1">
                          {service.is_active 
                            ? <CheckCircle className="w-4 h-4 text-green-600" />
                            : <XCircle className="w-4 h-4 text-red-600" />}
                          {service.is_active ? 'نشطة' : 'غير نشطة'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Usage Statistics */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    إحصائيات الاستخدام
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">عدد الطلبات</p>
                        <p className="text-blue-700 text-xl font-bold">{service.requests_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'requirements' && (
              <div className="space-y-6">
                {/* Service Requirements */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    شروط ومتطلبات الخدمة
                  </h3>
                  
                  {service.requirements ? (
                    <div className="space-y-4">
                      <ul className="space-y-2 text-amber-800">
                        {service.requirements.split('\n').map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-amber-600">{index + 1}</span>
                            </div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                      <p className="text-amber-700 font-medium">لم يتم تحديد شروط ومتطلبات لهذه الخدمة</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Required Documents */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    المستندات المطلوبة
                  </h3>
                  
                  {service.required_documents && service.required_documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.required_documents.map((doc, index) => (
                        <div key={index} className="bg-white rounded-lg border border-blue-200 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                                {doc.is_required ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-red-600" />
                                    <span className="text-red-600 font-medium">مطلوب</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-500">اختياري</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-blue-700 font-medium">لم يتم تحديد مستندات مطلوبة لهذه الخدمة</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <div className="w-full text-center">
              <Button
                variant="outline" 
                onClick={onClose}
                className="min-w-32"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
