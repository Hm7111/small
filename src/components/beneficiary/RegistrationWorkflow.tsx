import React, { useState, useEffect, useRef, useCallback } from 'react';
import RegistrationStepper from '../registration/RegistrationStepper';
import PersonalInfoStep from './steps/PersonalInfoStep';
import ProfessionalInfoStep from './steps/ProfessionalInfoStep';
import AddressInfoStep from './steps/AddressInfoStep';
import ContactInfoStep from './steps/ContactInfoStep';
import BranchSelectionStep from './steps/BranchSelectionStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import ReviewSubmitStep from './steps/ReviewSubmitStep';
import { RegistrationData, RegistrationStep } from '../../types/registration';

interface RegistrationWorkflowProps {
  userId: string;
  memberId: string;
  onProgress: (percentage: number) => void;
  onStatusChange: (status: string) => void;
}

const RegistrationWorkflow: React.FC<RegistrationWorkflowProps> = ({
  userId,
  memberId,
  onProgress,
  onStatusChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    personalInfo: {},
    professionalInfo: {},
    addressInfo: {},
    contactInfo: {},
    branchSelection: {},
    documentUpload: {}
  });

  // Ref to store the latest data for saving
  const latestDataRef = useRef<RegistrationData>({
    personalInfo: {},
    professionalInfo: {},
    addressInfo: {},
    contactInfo: {},
    branchSelection: {},
    documentUpload: {}
  });
  // Load saved registration data on mount
  useEffect(() => {
    if (userId) {
      loadRegistrationData();
    }
  }, [userId]);

  const loadRegistrationData = async () => {
    try {
      setIsLoading(true);
      
      // تقليل logging للإنتاج
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/load-registration-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (result.success) {
        setRegistrationData(result.registrationData);
        latestDataRef.current = result.registrationData;
        setCompletedSteps(result.completedSteps || []);
        setCurrentStep(result.currentStep || 1);
        setHasSavedData(result.completedSteps?.length > 0);
      } else {
        console.warn('Failed to load registration data:', result.error);
      }
    } catch (error) {
      console.warn('Network error loading registration data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraftImmediate = async (stepData: any, stepName: string, stepNumber: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-registration-draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          stepData,
          stepName,
          completedSteps: [...completedSteps, stepNumber].filter((step, index, arr) => arr.indexOf(step) === index)
        })
      });

      const result = await response.json();

      if (result.success) {
        setHasSavedData(true);
        console.log(`✅ مسودة محفوظة: ${stepName}`);
      } else {
        console.warn('Failed to save draft:', result.error);
      }
    } catch (error) {
      console.warn('Network error saving draft:', error);
    }
  };

  const steps: RegistrationStep[] = [
    {
      id: 'personal',
      title: 'البيانات الشخصية',
      description: 'الاسم والعمر ونوع الإعاقة',
      isCompleted: completedSteps.includes(1),
      isActive: currentStep === 1,
      icon: '👤'
    },
    {
      id: 'professional',
      title: 'البيانات المهنية',
      description: 'التعليم والوظيفة',
      isCompleted: completedSteps.includes(2),
      isActive: currentStep === 2,
      icon: '💼'
    },
    {
      id: 'address',
      title: 'العنوان الوطني',
      description: 'تفاصيل العنوان',
      isCompleted: completedSteps.includes(3),
      isActive: currentStep === 3,
      icon: '📍'
    },
    {
      id: 'contact',
      title: 'بيانات التواصل',
      description: 'الهاتف والإيميل والطوارئ',
      isCompleted: completedSteps.includes(4),
      isActive: currentStep === 4,
      icon: '📞'
    },
    {
      id: 'branch',
      title: 'اختيار الفرع',
      description: 'الفرع المفضل للخدمة',
      isCompleted: completedSteps.includes(5),
      isActive: currentStep === 5,
      icon: '🏢'
    },
    {
      id: 'documents',
      title: 'رفع المستندات',
      description: 'الهوية وبطاقة الإعاقة',
      isCompleted: completedSteps.includes(6),
      isActive: currentStep === 6,
      icon: '📄'
    },
    {
      id: 'review',
      title: 'مراجعة وإرسال',
      description: 'مراجعة البيانات والإرسال',
      isCompleted: completedSteps.includes(7),
      isActive: currentStep === 7,
      icon: '✅'
    }
  ];

  // Calculate progress percentage
  useEffect(() => {
    const progressPercentage = Math.round((completedSteps.length / steps.length) * 100);
    
    // فقط إذا تغيرت النسبة فعلياً
    if (progressPercentage !== previousProgressRef.current) {
      onProgress(progressPercentage);
      previousProgressRef.current = progressPercentage;
    }
  }, [completedSteps.length, steps.length]); // إزالة onProgress من dependencies

  // Use ref to track previous progress to avoid infinite updates
  const previousProgressRef = useRef<number>(0);

  const handleNext = () => {
    if (currentStep < steps.length) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUpdateData = (stepData: Partial<RegistrationData>) => {
    const newData = {
      ...registrationData,
      ...stepData
    };
    
    setRegistrationData(newData);
    latestDataRef.current = newData;
    
    // حفظ المسودة فوراً عند التحديث
    const stepInfo = getCurrentStepInfo(stepData);
    if (stepInfo) {
      saveDraftImmediate(stepInfo.data, stepInfo.name, currentStep);
    }
  };

  // Helper function to determine step info from data
  const getCurrentStepInfo = (stepData: Partial<RegistrationData>) => {
    if (stepData.personalInfo) {
      return { data: stepData.personalInfo, name: 'personalInfo' };
    }
    if (stepData.professionalInfo) {
      return { data: stepData.professionalInfo, name: 'professionalInfo' };
    }
    if (stepData.addressInfo) {
      return { data: stepData.addressInfo, name: 'addressInfo' };
    }
    if (stepData.contactInfo) {
      return { data: stepData.contactInfo, name: 'contactInfo' };
    }
    if (stepData.branchSelection) {
      return { data: stepData.branchSelection, name: 'branchSelection' };
    }
    if (stepData.documentUpload) {
      return { data: stepData.documentUpload, name: 'documentUpload' };
    }
    return null;
  };

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
    }
  };

  const handleSkipToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const handleFinalSubmit = async () => {
    // This function is now handled by ReviewSubmitStep
    // It will call the submit-registration Edge Function
  };

  const renderCurrentStep = () => {
    const commonProps = {
      data: registrationData,
      onNext: handleNext,
      onBack: handleBack,
      onUpdateData: handleUpdateData,
      onComplete: () => handleStepComplete(currentStep),
      stepNumber: currentStep
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...commonProps} />;
      case 2:
        return <ProfessionalInfoStep {...commonProps} />;
      case 3:
        return <AddressInfoStep {...commonProps} />;
      case 4:
        return <ContactInfoStep {...commonProps} />;
      case 5:
        return <BranchSelectionStep {...commonProps} />;
      case 6:
        return <DocumentUploadStep {...commonProps} />;
      case 7:
        return (
          <ReviewSubmitStep 
            {...commonProps} 
            onFinalSubmit={handleFinalSubmit}
            completedSteps={completedSteps}
            onSkipToStep={handleSkipToStep}
            userId={userId}
            onStatusChange={onStatusChange}
          />
        );
      default:
        return <PersonalInfoStep {...commonProps} />;
    }
  };

  // Show loading while fetching saved data
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              جاري تحميل بيانات التسجيل...
            </h2>
            <p className="text-gray-600">
              يتم استرجاع البيانات المحفوظة
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Registration Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Draft Notice */}
        {hasSavedData && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                💾
              </div>
              <div>
                <h4 className="font-semibold text-green-900">تم استرجاع البيانات المحفوظة</h4>
                <p className="text-sm text-green-700">
                  يمكنك المتابعة من حيث توقفت. يتم حفظ التقدم تلقائياً عند إدخال البيانات.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            إكمال بيانات التسجيل
          </h2>
          {hasSavedData ? (
            <p className="text-lg text-blue-600 max-w-2xl mx-auto leading-relaxed font-medium">
              استكمل باقي الخطوات لإتمام التسجيل • يتم الحفظ تلقائياً
            </p>
          ) : (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              أكمل جميع الخطوات التالية لتتمكن من الاستفادة من خدمات الجمعية الخيرية • يتم الحفظ تلقائياً
            </p>
          )}
        </div>

        {/* Stepper */}
        <RegistrationStepper
          currentStep={currentStep}
          steps={steps}
          completedSteps={completedSteps}
        />
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {renderCurrentStep()}
      </div>

      {/* Progress Summary */}
      <div className={`border rounded-xl p-6 ${
        hasSavedData 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              hasSavedData ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <span className={`text-lg ${
                hasSavedData ? 'text-green-600' : 'text-blue-600'
              }`}>
                💾
              </span>
            </div>
            <div>
              <h3 className={`font-semibold ${
                hasSavedData ? 'text-green-900' : 'text-blue-900'
              }`}>
                حفظ تلقائي - {Math.round((completedSteps.length / steps.length) * 100)}%
              </h3>
              <p className={hasSavedData ? 'text-green-700' : 'text-blue-700'}>
                تم إكمال {completedSteps.length} من {steps.length} خطوات • محفوظ تلقائياً
              </p>
            </div>
          </div>
          
          {completedSteps.length === steps.length && (
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">تم إكمال جميع الخطوات!</span>
            </div>
          )}
          
          {hasSavedData && (
            <div className="flex items-center gap-2 text-green-700">
              ✅
              <span className="font-medium">محفوظ تلقائياً</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationWorkflow;
