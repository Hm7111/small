import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 text-red-700 dark:text-red-300 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-xl border border-red-200/50 dark:border-red-800/30 ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-300" />
        </div>
      </div>
      <span className="text-sm font-medium leading-relaxed mr-2">{message}</span>
    </div>
  );
};

export default ErrorMessage;
