import React, { useState } from 'react';
import { 
  X, FileText, DollarSign, Calendar, AlertTriangle,
  Send, CheckCircle, Upload, User, Heart, Phone
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import ErrorMessage from '../../ui/ErrorMessage';
import { formatCurrency } from '../../../utils/helpers';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  memberData: any;
  onSubmit: (serviceId: string, requestData: any) => void;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  service,
  memberData,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    requestedAmount: service?.max_amount || 0,
    reason: '',
    additionalNotes: '',
    agreeToTerms: false
  });
  const [step, setStep] = useState<'details' | 'confirmation' | 'success'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // معالجة تغيير الملفات المرفقة
  const handleFileChange = (documentName: string, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentName]: file
    }));
  };

  // التحقق من اكتمال المرفقات المطلوبة
  const checkRequiredDocuments = (): boolean => {
    if (!service.required_documents || service.required_documents.length === 0) {
      return true;
    }

    let isValid = true;
    const requiredDocs = service.required_documents.filter((doc: any) => doc.is_required);
    
    requiredDocs.forEach((doc: any) => {
      if (!uploadedFiles[doc.name]) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const validateForm = (): boolean => {
    setError(null);
    
    if (service?.max_amount && (formData.requestedAmount <= 0 || formData.requestedAmount > service.max_amount)) {
      setError(`المبلغ المطلوب يجب أن يكون بين 1 و ${service.max_amount} ريال`);
      return false;
    }

    if (!formData.reason.trim()) {
      setError('يرجى إدخال سبب طلب الخدمة');
      return false;
    }
    
    // التحقق من المستندات المطلوبة
    if (!checkRequiredDocuments()) {
      setError('يرجى رفع جميع المستندات المطلوبة');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('يرجى الموافقة على الشروط والأحكام');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep('confirmation');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // هنا يمكن إضافة منطق رفع الملفات إلى التخزين
      // ثم إرسال روابط الملفات مع بيانات الطلب
      
      await onSubmit(service.id, {
        ...formData,
        uploadedDocuments: Object.keys(uploadedFiles).map(name => ({
          name,
          fileInfo: uploadedFiles[name] ? {
            name: uploadedFiles[name]?.name,
            size: uploadedFiles[name]?.size,
            type: uploadedFiles[name]?.type,
          } : null
        }))
      });
      
      setStep('success');
    } catch (error) {
      setError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('details');
  };

  const handleClose = () => {
    if (step === 'success') {
      // Reset the form before closing
      setFormData({
        requestedAmount: service?.max_amount || 0,
        reason: '',
        additionalNotes: '',
        agreeToTerms: false
      });
      setStep('details');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={step !== 'success' ? undefined : handleClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              {step === 'details' ? 'طلب خدمة' : 
               step === 'confirmation' ? 'تأكيد الطلب' : 'تم إرسال الطلب'}
            </h2>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {step === 'details' ? (
            <div className="space-y-6">
              {/* Service Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">{service.name}</h3>
                    <p className="text-sm text-blue-700 mt-1">{service.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3">
                      {service.max_amount && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            حتى {formatCurrency(service.max_amount)}
                          </span>
                        </div>
                      )}
                      
                      {service.duration_days && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            {service.duration_days} يوم
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {service.max_amount && (
                  <Input
                    label={`المبلغ المطلوب (بحد أقصى ${formatCurrency(service.max_amount)})`}
                    type="number"
                    value={formData.requestedAmount}
                    onChange={(e) => handleInputChange('requestedAmount', parseFloat(e.target.value) || 0)}
                    min={1}
                    max={service.max_amount}
                    icon={<DollarSign className="w-5 h-5" />}
                  />
                )}
                
                <Input
                  label="سبب طلب الخدمة *"
                  type="text"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="اذكر سبب حاجتك لهذه الخدمة بشكل مختصر"
                  className="h-20"
                />
                
                <Input
                  label="ملاحظات إضافية (اختياري)"
                  type="text"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="أي معلومات إضافية قد تساعد في دراسة الطلب"
                  className="h-20"
                />
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    المستندات المطلوبة:
                  </h4>
                  <div className="text-sm text-amber-800">
                    {service.requirements || 'لا توجد متطلبات محددة'}
                    {service.requirements && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-700 border-amber-300 hover:bg-amber-100"
                          icon={<Upload className="w-3 h-3 ml-1" />}
                        >
                          رفع المستندات
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* عرض المستندات المرفقة */}
                {Object.keys(uploadedFiles).length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-900">المستندات المرفقة:</span>
                    <div className="text-sm text-blue-800">
                      {Object.entries(uploadedFiles)
                        .filter(([_, file]) => file !== null)
                        .map(([name, file], idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{name}: {file?.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    أوافق على شروط وأحكام الخدمة، وأقر بصحة المعلومات المقدمة، وأتحمل مسؤولية صحتها
                  </label>
                </div>

                {error && <ErrorMessage message={error} />}
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                  icon={<Send className="w-5 h-5 ml-1" />}
                >
                  متابعة
                </Button>
              </div>
            </div>
          ) : step === 'confirmation' ? (
            <div className="space-y-6">
              {/* Confirmation Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-4">ملخص الطلب</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-900">الخدمة:</span>
                    <span className="text-sm text-blue-800">{service.name}</span>
                  </div>
                  
                  {/* عرض متطلبات الخدمة */}
                  {service.requirements && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2">شروط ومتطلبات الخدمة:</h4>
                      <ul className="space-y-1 text-sm text-amber-800 list-disc list-inside">
                        {service.requirements.split('\n').map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* عرض المستندات المطلوبة */}
                  {service.required_documents && service.required_documents.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">المستندات المطلوبة:</h4>
                      <div className="space-y-3">
                        {service.required_documents.map((doc: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                {doc.name}
                                {doc.is_required && (
                                  <span className="text-red-600 mr-1">*</span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id={`document-${idx}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files && e.target.files[0];
                                  handleFileChange(doc.name, file || null);
                                }}
                              />
                              <label
                                htmlFor={`document-${idx}`}
                                className="px-3 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                              >
                                اختيار ملف
                              </label>
                              {uploadedFiles[doc.name] ? (
                                <span className="text-sm text-green-600">
                                  تم اختيار: {uploadedFiles[doc.name]?.name}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  لم يتم اختيار ملف
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {service.max_amount && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-blue-900">المبلغ المطلوب:</span>
                      <span className="text-sm text-blue-800">{formatCurrency(formData.requestedAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-900">سبب الطلب:</span>
                    <span className="text-sm text-blue-800">{formData.reason}</span>
                  </div>
                </div>
              </div>
              
              {/* Beneficiary Info */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200/50 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-4">بيانات المستفيد</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-green-800">الاسم:</span>
                    <p className="text-sm font-medium text-green-900">{memberData?.full_name || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-green-800">رقم الهوية:</span>
                    <p className="text-sm font-medium text-green-900">{memberData?.national_id || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-green-800">رقم الجوال:</span>
                    <p className="text-sm font-medium text-green-900">{memberData?.phone || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-green-800">نوع الإعاقة:</span>
                    <p className="text-sm font-medium text-green-900">{memberData?.disability_type || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
              
              {/* Terms */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="font-medium text-amber-900">ملاحظات مهمة</h4>
                </div>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• سيتم مراجعة طلبك من قبل موظفي الجمعية</li>
                  <li>• قد تستغرق الموافقة على الطلب من 3-7 أيام عمل</li>
                  <li>• قد يتم التواصل معك لطلب مستندات إضافية</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  رجوع
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                  icon={<Send className="w-5 h-5 ml-1" />}
                >
                  تقديم الطلب
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">تم إرسال الطلب بنجاح</h3>
              <p className="text-green-700 mb-6">
                تم استلام طلبك وسيتم مراجعته من قبل فريق العمل
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
                <p className="text-sm font-medium text-gray-900">رقم الطلب: <span className="text-blue-600">#123456</span></p>
                <p className="text-sm text-gray-600">تاريخ التقديم: {new Date().toLocaleDateString('ar')}</p>
                <p className="text-sm text-gray-600">الحالة: <span className="text-amber-600">قيد المراجعة</span></p>
              </div>
              
              <Button onClick={handleClose}>
                إغلاق
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestModal;
