import React from 'react';

interface FormCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
  gradient = 'from-blue-100 to-indigo-100'
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        {icon && (
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl mb-4`}>
            {icon}
          </div>
        )}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default FormCard;
