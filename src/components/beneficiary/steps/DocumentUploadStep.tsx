import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Button from '../../ui/Button';
import ErrorMessage from '../../ui/ErrorMessage';
import { RegistrationStepComponent } from '../../../types/registration';

const DocumentUploadStep: React.FC<RegistrationStepComponent> = ({
  data,
  onNext,
  onBack,
  onUpdateData,
  onComplete,
  stepNumber
}) => {
  const [formData, setFormData] = useState({
    nationalIdDocument: data.documentUpload?.nationalIdDocument || null,
    disabilityCardDocument: data.documentUpload?.disabilityCardDocument || null,
    additionalDocuments: data.documentUpload?.additionalDocuments || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Required document types
  const requiredDocuments = [
    {
      key: 'nationalIdDocument',
      label: 'صورة الهوية الوطنية',
      description: 'صورة واضحة من الوجهين',
      icon: <FileText className="w-5 h-5" />,
      required: true
    },
    {
      key: 'disabilityCardDocument', 
      label: 'بطاقة الإعاقة',
      description: 'صورة واضحة من بطاقة الإعاقة',
      icon: <FileText className="w-5 h-5" />,
      required: true
    }
  ];

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.nationalIdDocument) {
      newErrors.nationalIdDocument = 'صورة الهوية الوطنية مطلوبة';
    }

    if (!formData.disabilityCardDocument) {
      newErrors.disabilityCardDocument = 'صورة بطاقة الإعاقة مطلوبة';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'نوع الملف غير مدعوم. يُسمح بـ JPG، PNG، PDF فقط'
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
      }));
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));

    try {
      // Simulate file upload - in real app, upload to Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const documentData = {
        file,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
      };

      setFormData(prev => ({
        ...prev,
        [documentType]: documentData
      }));

      // Clear any previous errors for this document
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[documentType];
        return newErrors;
      });

    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        [documentType]: 'فشل في رفع الملف. يرجى المحاولة مرة أخرى'
      }));
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleFileRemove = (documentType: string) => {
    setFormData(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  const handleNext = () => {
    if (isValid) {
      // حفظ البيانات أولاً
      onUpdateData({ documentUpload: formData });
      
      // تأخير قصير للتأكد من حفظ البيانات
      setTimeout(() => {
        onComplete?.();
        onNext();
      }, 100);
    }
  };

  const FileUploadArea: React.FC<{
    documentType: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    required?: boolean;
  }> = ({ documentType, label, description, icon, required = false }) => {
    const hasFile = formData[documentType as keyof typeof formData] as any;
    const isUploading = uploading[documentType];
    const error = errors[documentType];

    return (
      <div className={`
        border-2 border-dashed rounded-xl p-6 transition-all duration-200
        ${error 
          ? 'border-red-300 bg-red-50' 
          : hasFile 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }
      `}>
        <div className="text-center">
          {hasFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">{label}</h4>
                <p className="text-sm text-green-700 mt-1">
                  {hasFile.fileName} ({Math.round(hasFile.fileSize / 1024)} KB)
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileRemove(documentType)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  إزالة
                </Button>
              </div>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">جاري الرفع...</h4>
                <p className="text-sm text-blue-700">يرجى الانتظار</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full mx-auto
                ${error ? 'bg-red-100' : 'bg-gray-100'}
              `}>
                {error ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  icon
                )}
              </div>
              <div>
                <h4 className={`font-semibold ${error ? 'text-red-900' : 'text-gray-900'}`}>
                  {label} {required && '*'}
                </h4>
                <p className={`text-sm mt-1 ${error ? 'text-red-700' : 'text-gray-600'}`}>
                  {error || description}
                </p>
              </div>
              <input
                type="file"
                id={documentType}
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, documentType);
                  }
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(documentType)?.click()}
                className={error ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
              >
                <Upload className="w-4 h-4 mr-2" />
                اختر ملف
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          رفع المستندات
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          أرفق المستندات المطلوبة لإتمام عملية التسجيل
        </p>
      </div>

      {/* Document Upload Areas */}
      <div className="space-y-6">
        {requiredDocuments.map((doc) => (
          <FileUploadArea
            key={doc.key}
            documentType={doc.key}
            label={doc.label}
            description={doc.description}
            icon={doc.icon}
            required={doc.required}
          />
        ))}
      </div>

      {/* Upload Guidelines */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">إرشادات رفع المستندات</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• تأكد من وضوح الصورة وإمكانية قراءة النص</li>
              <li>• الحد الأقصى لحجم الملف: 5 ميجابايت</li>
              <li>• الصيغ المدعومة: JPG، PNG، PDF</li>
              <li>• تأكد من صحة البيانات في المستندات</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <ErrorMessage message={`يرجى رفع ${Object.keys(errors).length} مستند مطلوب`} />
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          السابق
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isValid || Object.values(uploading).some(Boolean)}
          className="flex-2"
        >
          {Object.values(uploading).some(Boolean) ? 'جاري الرفع...' : 'التالي'}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">6</span>
          </div>
          <div>
            <p className="font-medium text-blue-900">الخطوة 6 من 7</p>
            <p className="text-sm text-blue-700">رفع المستندات المطلوبة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadStep;
