import React from 'react';
import { RegistrationStep } from '../../types/registration';
import { CheckCircle, Circle, User, Briefcase, MapPin, Phone, Building, FileText } from 'lucide-react';

interface RegistrationStepperProps {
  currentStep: number;
  steps: RegistrationStep[];
  completedSteps: number[];
}

const RegistrationStepper: React.FC<RegistrationStepperProps> = ({
  currentStep,
  steps,
  completedSteps
}) => {
  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <Briefcase className="w-5 h-5" />;
      case 3: return <MapPin className="w-5 h-5" />;
      case 4: return <Phone className="w-5 h-5" />;
      case 5: return <Building className="w-5 h-5" />;
      case 6: return <FileText className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full mb-8">
      {/* خط التقدم الرئيسي */}
      <div className="relative">
        <div className="absolute top-5 right-0 w-full h-0.5 bg-gray-200 z-0">
          <div 
            className="h-full bg-gradient-to-l from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((completedSteps.length + (currentStep > completedSteps.length ? 0.5 : 0)) / steps.length) * 100}%` }}
          />
        </div>

        {/* الخطوات */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const status = getStepStatus(stepNumber);
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                {/* دائرة الخطوة */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${status === 'completed' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 text-white shadow-lg' 
                    : status === 'active'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg animate-pulse'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    getStepIcon(stepNumber)
                  )}
                </div>

                {/* عنوان الخطوة */}
                <div className="mt-3 text-center max-w-[120px]">
                  <h3 className={`
                    text-sm font-semibold transition-colors duration-300
                    ${status === 'active' ? 'text-blue-600' : status === 'completed' ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">
                    {step.description}
                  </p>
                </div>

                {/* مؤشر الحالة */}
                {status === 'active' && (
                  <div className="absolute -bottom-2 w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* مؤشر التقدم النصي */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl px-4 py-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-xs text-white font-bold">{completedSteps.length}</span>
          </div>
          <span className="text-sm font-medium text-blue-800">
            {completedSteps.length} من {steps.length} خطوات مكتملة
          </span>
          <div className="text-sm text-blue-600 font-semibold">
            ({Math.round((completedSteps.length / steps.length) * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStepper;
