import React from 'react';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  gradient = 'from-blue-50 to-indigo-50 border-blue-200/50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30',
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} border rounded-xl p-6 ${className}`}>
      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
