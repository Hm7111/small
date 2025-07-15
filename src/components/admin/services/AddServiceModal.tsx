import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, Calendar, DollarSign, Info, AlertTriangle, Tag, Briefcase, CreditCard, Package, Heart, GraduationCap } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import { Plus, Trash2, File, PlusCircle, Clock } from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requirements: [''],
    category: '',
    maxAmount: '',
    durationDays: '',
    requiredDocuments: [{ name: '', isRequired: true }],
    reapplicationPeriod: '',
    isOneTimeOnly: false
  });

  // الفئات المتاحة
  const categories = [
    'مساعدات مالية',
    'مساعدات عينية',
    'رعاية اجتماعية',
    'تطوير مهارات',
    'الرعاية الصحية',
    'المساعدات التعليمية',
    'أخرى'
  ];
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'requirements' | 'documents' | 'settings'>('info');

  useEffect(() => {
    // إعادة تعيين النموذج عند فتح النافذة
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        requirements: [''],
        category: '',
        maxAmount: '',
        durationDays: '',
        requiredDocuments: [{ name: '', isRequired: true }],
        reapplicationPeriod: '',
        isOneTimeOnly: false
      });
      setError(null);
      setIsSuccess(false);
      setActiveTab('info');
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };
  
  const addRequirement = () => {
    setFormData(prev => ({ 
      ...prev, 
      requirements: [...prev.requirements, '']
    }));
  };
  
  const removeRequirement = (index: number) => {
    const newRequirements = [...formData.requirements];
    newRequirements.splice(index, 1);
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };
  
  const handleDocumentChange = (index: number, field: 'name' | 'isRequired', value: string | boolean) => {
    const newDocuments = [...formData.requiredDocuments];
    newDocuments[index] = { 
      ...newDocuments[index], 
      [field]: value 
    };
    setFormData(prev => ({ ...prev, requiredDocuments: newDocuments }));
  };
  
  const addDocument = () => {
    setFormData(prev => ({ 
      ...prev, 
      requiredDocuments: [...prev.requiredDocuments, { name: '', isRequired: true }]
    }));
  };
  
  const removeDocument = (index: number) => {
    const newDocuments = [...formData.requiredDocuments];
    newDocuments.splice(index, 1);
    setFormData(prev => ({ ...prev, requiredDocuments: newDocuments }));
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.name.trim()) {
      setError('اسم الخدمة مطلوب');
      setActiveTab('info');
      return false;
    }
    
    if (!formData.category.trim()) {
      setError('فئة الخدمة مطلوبة');
      setActiveTab('info');
      return false;
    }

    if (formData.maxAmount && isNaN(Number(formData.maxAmount))) {
      setError('الحد الأقصى للمبلغ يجب أن يكون رقماً');
      setActiveTab('info');
      return false;
    }

    if (formData.durationDays && isNaN(Number(formData.durationDays))) {
      setError('مدة الخدمة يجب أن تكون رقماً');
      setActiveTab('info');
      return false;
    }
    
    if (formData.requirements.length > 0) {
      const emptyRequirements = formData.requirements.some(req => !req.trim());
      if (emptyRequirements) {
        setError('يجب إدخال جميع الشروط أو حذفها');
        setActiveTab('requirements');
        return false;
      }
    }
    
    if (formData.requiredDocuments.length > 0) {
      const emptyDocuments = formData.requiredDocuments.some(doc => !doc.name.trim());
      if (emptyDocuments) {
        setError('يجب إدخال أسماء جميع المستندات أو حذفها');
        setActiveTab('documents');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // تحويل المتطلبات من مصفوفة إلى نص
      const requirementsText = formData.requirements.filter(r => r.trim()).join('\n');
      
      // تحويل المستندات المطلوبة إلى تنسيق JSON
      const requiredDocumentsData = formData.requiredDocuments
        .filter(doc => doc.name.trim())
        .map(doc => ({
          name: doc.name,
          is_required: doc.isRequired
        }));
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          serviceData: {
            name: formData.name,
            description: formData.description || null,
            requirements: requirementsText || null,
            category: formData.category,
            max_amount: formData.maxAmount ? Number(formData.maxAmount) : null,
            duration_days: formData.durationDays ? Number(formData.durationDays) : null,
            is_active: true,
            required_documents: requiredDocumentsData.length > 0 ? requiredDocumentsData : null,
            reapplication_period_months: !formData.isOneTimeOnly && formData.reapplicationPeriod ? Number(formData.reapplicationPeriod) : null,
            is_one_time_only: formData.isOneTimeOnly
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'فشل في إنشاء الخدمة');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // معرفة الأيقونة المناسبة للفئة
  const getCategoryIcon = () => {
    switch (formData.category) {
      case 'مساعدات مالية': return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'مساعدات عينية': return <Package className="w-6 h-6 text-green-600" />;
      case 'رعاية اجتماعية': return <Heart className="w-6 h-6 text-red-600" />;
      case 'تطوير مهارات': return <Briefcase className="w-6 h-6 text-purple-600" />;
      case 'الرعاية الصحية': return <Heart className="w-6 h-6 text-pink-600" />;
      case 'المساعدات التعليمية': return <GraduationCap className="w-6 h-6 text-indigo-600" />;
      default: return <Tag className="w-6 h-6 text-blue-600" />;
    }
  };

  // تابات النافذة
  const tabs = [
    { id: 'info', label: 'معلومات الخدمة', icon: <FileText className="w-4 h-4" /> },
    { id: 'requirements', label: 'الشروط', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'documents', label: 'المستندات', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Clock className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative z-10">
          {/* رأس النافذة */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">إضافة خدمة جديدة</h2>
                  <p className="text-orange-100 text-sm">أدخل بيانات الخدمة الجديدة</p>
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
          
          {/* التابات */}
          {!isSuccess && (
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                      ${activeTab === tab.id ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    `}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-6">
            {isSuccess ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">تم إنشاء الخدمة بنجاح</h3>
                <p className="text-green-700 mb-6">تم إضافة الخدمة الجديدة للنظام</p>
                <Button onClick={onClose}>إغلاق</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* معلومات الخدمة الأساسية */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="اسم الخدمة *"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="مثال: كفالة أيتام"
                        icon={<FileText className="w-5 h-5" />}
                      />
                      
                      <Select
                        label="فئة الخدمة *"
                        value={formData.category}
                        onChange={(value) => handleInputChange('category', value)}
                        options={categories.map(category => ({
                          value: category,
                          label: category
                        }))}
                        placeholder="اختر فئة الخدمة"
                        icon={<Tag className="w-5 h-5" />}
                      />
                    </div>
                    
                    <Input
                      label="وصف الخدمة"
                      type="text"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="وصف تفصيلي للخدمة"
                      className="h-20"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <Input
                        label="الحد الأقصى للمبلغ (ريال)"
                        type="number"
                        value={formData.maxAmount}
                        onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                        placeholder="مثال: 2000"
                        icon={<DollarSign className="w-5 h-5" />}
                      />
                      
                      <Input
                        label="مدة الخدمة (أيام)"
                        type="number"
                        value={formData.durationDays}
                        onChange={(e) => handleInputChange('durationDays', e.target.value)}
                        placeholder="مثال: 30"
                        icon={<Calendar className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                )}
                
                {/* شروط ومتطلبات الخدمة */}
                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          أضف الشروط والمتطلبات التي يجب توفرها للاستفادة من هذه الخدمة
                        </p>
                      </div>
                    </div>
                    
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-700 flex-shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder={`الشرط رقم ${index + 1}`}
                        />
                        <button 
                          type="button" 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRequirement}
                      icon={<PlusCircle className="w-4 h-4 ml-2" />}
                      className="mt-2"
                    >
                      إضافة شرط جديد
                    </Button>
                  </div>
                )}
                
                {/* المستندات المطلوبة */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">
                          حدد المستندات التي يجب على المستفيد تقديمها للحصول على هذه الخدمة
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.requiredDocuments.map((document, index) => (
                        <div key={index} className="flex flex-col gap-2 p-3 border border-green-200 rounded-lg mb-3 bg-white">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full text-green-700">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium">مستند {index + 1}</span>
                            </div>
                            <button 
                              type="button" 
                              className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => removeDocument(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <Input
                            type="text"
                            value={document.name}
                            onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                            placeholder="اسم المستند المطلوب"
                          />
                          
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id={`required-${index}`}
                              checked={document.isRequired}
                              onChange={(e) => handleDocumentChange(index, 'isRequired', e.target.checked)}
                              className="w-4 h-4 text-green-600 bg-gray-100 rounded border-gray-300 focus:ring-green-500"
                            />
                            <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
                              إجباري
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDocument}
                      icon={<PlusCircle className="w-4 h-4 ml-2" />}
                      className="mt-2"
                    >
                      إضافة مستند جديد
                    </Button>
                  </div>
                )}
                
                {/* إعدادات الخدمة */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          حدد ما إذا كانت الخدمة تقدم مرة واحدة فقط أو دورية مع تحديد مدة إعادة التقديم
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            id="isOneTimeOnly"
                            checked={formData.isOneTimeOnly}
                            onChange={(e) => handleInputChange('isOneTimeOnly', e.target.checked)}
                            className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                          />
                          <label htmlFor="isOneTimeOnly" className="text-gray-900 font-medium">
                            خدمة تقدم مرة واحدة فقط
                          </label>
                        </div>
                        
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {formData.isOneTimeOnly ? (
                            <p>هذه الخدمة ستكون متاحة للمستفيد مرة واحدة فقط طوال فترة استفادته من النظام.</p>
                          ) : (
                            <p>يمكن للمستفيد التقديم على هذه الخدمة بشكل دوري حسب المدة المحددة.</p>
                          )}
                        </div>
                      </div>
                      
                      {!formData.isOneTimeOnly && (
                        <div>
                          <Input
                            label="فترة إعادة التقديم (بالشهور)"
                            type="number"
                            value={formData.reapplicationPeriod}
                            onChange={(e) => handleInputChange('reapplicationPeriod', e.target.value)}
                            placeholder="مثال: 36 (للتقديم كل 3 سنوات)"
                            disabled={formData.isOneTimeOnly}
                            icon={<Clock className="w-5 h-5" />}
                          />
                          
                          <div className="mt-3 text-sm text-gray-600">
                            <div className="flex items-start gap-2 mt-2">
                              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p>يتم احتساب المدة من تاريخ استلام المستفيد للخدمة.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* أزرار التنقل والحفظ */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  {error && <ErrorMessage message={error} className="mb-4" />}
                  
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      إلغاء
                    </Button>
                    
                    <div className="flex gap-2">
                      {activeTab !== 'info' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                            if (currentIndex > 0) {
                              setActiveTab(tabs[currentIndex - 1].id as any);
                            }
                          }}
                        >
                          السابق
                        </Button>
                      )}
                      
                      {activeTab !== 'settings' ? (
                        <Button
                          type="button"
                          onClick={() => {
                            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                            if (currentIndex < tabs.length - 1) {
                              setActiveTab(tabs[currentIndex + 1].id as any);
                            }
                          }}
                        >
                          التالي
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          isLoading={isLoading}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          إضافة الخدمة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
