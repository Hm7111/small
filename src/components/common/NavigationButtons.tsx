import React from 'react';
import Button from '../ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backText?: string;
  nextText?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  nextIcon?: React.ReactNode;
  backIcon?: React.ReactNode;
  hideBack?: boolean;
  nextVariant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  backText = 'السابق',
  nextText = 'التالي',
  nextDisabled = false,
  nextLoading = false,
  nextIcon = <ArrowLeft className="w-5 h-5" />,
  backIcon = <ArrowRight className="w-5 h-5" />,
  hideBack = false,
  nextVariant = 'primary',
  className = ''
}) => {
  return (
    <div className={`flex gap-4 pt-6 ${className}`}>
      {!hideBack && onBack && (
        <Button
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex-1"
          icon={backIcon}
        >
          {backText}
        </Button>
      )}
      {onNext && (
        <Button
          type="button" 
          onClick={onNext}
          disabled={nextDisabled}
          isLoading={nextLoading}
          className={hideBack ? 'w-full' : 'flex-2'}
          variant={nextVariant}
          icon={nextIcon}
        >
          {nextText}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
