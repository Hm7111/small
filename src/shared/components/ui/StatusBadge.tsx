import React from 'react';
import { CheckCircle, Clock, AlertTriangle, X, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type StatusType = 'success' | 'warning' | 'error' | 'pending' | 'info';

export interface StatusBadgeProps {
  status: StatusType;
  text: string;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Unified Status Badge Component
 * Displays status with appropriate colors and icons
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  icon,
  className = '',
  size = 'md'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/40',
          textColor: 'text-green-800 dark:text-green-300',
          defaultIcon: <CheckCircle className="w-4 h-4" />
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-100 dark:bg-amber-900/40',
          textColor: 'text-amber-800 dark:text-amber-300',
          defaultIcon: <AlertTriangle className="w-4 h-4" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-100 dark:bg-red-900/40',
          textColor: 'text-red-800 dark:text-red-300',
          defaultIcon: <X className="w-4 h-4" />
        };
      case 'pending':
        return {
          bgColor: 'bg-blue-100 dark:bg-blue-900/40',
          textColor: 'text-blue-800 dark:text-blue-300',
          defaultIcon: <Clock className="w-4 h-4" />
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-gray-100 dark:bg-gray-800/70',
          textColor: 'text-gray-700 dark:text-gray-300',
          defaultIcon: <Info className="w-4 h-4" />
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  const { bgColor, textColor, defaultIcon } = getStatusConfig();

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        bgColor,
        textColor,
        sizeClasses[size],
        className
      )}
    >
      {icon || defaultIcon}
      {text}
    </span>
  );
};

export default StatusBadge;

