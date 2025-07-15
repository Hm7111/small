import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  color?: string;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-900 dark:text-blue-300 text-blue-700 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-900 dark:text-green-300 text-green-700 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30 text-purple-900 dark:text-purple-300 text-purple-700 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30 text-orange-900 dark:text-orange-300 text-orange-700 dark:text-orange-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30 text-indigo-900 dark:text-indigo-300 text-indigo-700 dark:text-indigo-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/30 text-teal-900 dark:text-teal-300 text-teal-700 dark:text-teal-400'
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  const [bgColor, borderColor, titleColor, descColor] = colors.split(' ');

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${bgColor.replace('50', '100').replace('dark:bg-', 'dark:bg-').replace('/20', '/40')} rounded-full flex items-center justify-center`}>
          <span className={`text-sm font-bold ${titleColor.replace('900', '600')}`}>
            {currentStep}
          </span>
        </div>
        <div>
          <p className={`font-medium ${titleColor}`}>
            الخطوة {currentStep} من {totalSteps}
          </p>
          <p className={`text-sm ${descColor}`}>
            {stepTitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
