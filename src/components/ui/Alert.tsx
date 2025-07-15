import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type: AlertType;
  title?: string;
  message: string | React.ReactNode;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  actions,
  className = '',
  icon
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800/50',
          textColor: 'text-green-800 dark:text-green-300',
          iconColor: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800/60',
          defaultIcon: <CheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800/50',
          textColor: 'text-red-800 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-800/60',
          defaultIcon: <AlertCircle className="w-5 h-5" />
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50 dark:bg-amber-900/30',
          borderColor: 'border-amber-200 dark:border-amber-800/50',
          textColor: 'text-amber-800 dark:text-amber-300',
          iconColor: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-800/60',
          defaultIcon: <AlertTriangle className="w-5 h-5" />
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          textColor: 'text-blue-800 dark:text-blue-300',
          iconColor: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-800/60',
          defaultIcon: <Info className="w-5 h-5" />
        };
    }
  };

  const {
    bgColor,
    borderColor,
    textColor,
    iconColor,
    iconBg,
    defaultIcon
  } = getTypeConfig();

  return (
    <div className={cn(`border rounded-xl p-4 ${bgColor} ${borderColor} ${className}`)}>
      <div className="flex">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
            {icon || defaultIcon}
          </div>
        </div>
        <div className="mr-3 flex-1">
          {title && (
            <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
          )}
          <div className={`text-sm ${textColor} mt-1`}>
            {typeof message === 'string' ? message : 
              React.Children.toArray(message).map((child, i) => 
                typeof child === 'string' ? <p key={i} className="mb-1">{child}</p> : child
              )
            }
          </div>
          {actions && <div className="mt-4">{actions}</div>}
        </div>
        {onClose && (
          <button 
            type="button"
            className={`${iconColor} hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-1.5`}
            onClick={onClose}
          >
            <span className="sr-only">إغلاق</span>
            <X className="w-5 h-5 dark:text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
