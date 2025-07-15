import React from 'react';
import FormCard from '../../common/FormCard';
import ProgressIndicator from '../../common/ProgressIndicator';
import NavigationButtons from '../../common/NavigationButtons';
import ErrorMessage from '../../ui/ErrorMessage';

interface StepWrapperProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  nextText?: string;
  errors?: Record<string, string>;
  progressColor?: string;
  hideBack?: boolean;
  className?: string;
}

const StepWrapper: React.FC<StepWrapperProps> = ({
  stepNumber,
  totalSteps = 7,
  title,
  description,
  icon,
  children,
  onNext,
  onBack,
  nextDisabled = false,
  nextLoading = false,
  nextText = 'التالي',
  errors = {},
  progressColor = 'blue',
  hideBack = false,
  className = ''
}) => {
  const errorCount = Object.keys(errors).length;
  const hasErrors = errorCount > 0;

  return (
    <div className={`space-y-8 ${className}`}>
      <FormCard
        title={title}
        description={description}
        icon={icon}
        gradient="from-blue-100 to-indigo-100"
      >
        <div className="space-y-6">
          {children}
          
          {hasErrors && (
            <ErrorMessage 
              message={`يرجى تصحيح ${errorCount} خطأ في النموذج`}
            />
          )}
          
          <NavigationButtons
            onBack={stepNumber > 1 && !hideBack ? onBack : undefined}
            onNext={onNext}
            nextDisabled={nextDisabled || hasErrors}
            nextLoading={nextLoading}
            nextText={nextText}
            hideBack={hideBack || stepNumber === 1}
          />
        </div>
      </FormCard>

      <ProgressIndicator
        currentStep={stepNumber}
        totalSteps={totalSteps}
        stepTitle={title}
        color={progressColor}
      />
    </div>
  );
};

export default StepWrapper;
