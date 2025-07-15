import React, { useEffect } from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  id: number | string;
  type: NotificationType;
  title?: string;
  message: string;
  onClose: (id: number | string) => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  // Auto close notification after duration
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, id, onClose]);

  // Get notification config based on type
  const getNotificationConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          titleColor: 'text-green-900',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          titleColor: 'text-red-900',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          titleColor: 'text-amber-900',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          titleColor: 'text-blue-900',
          icon: <Info className="w-6 h-6 text-blue-600" />,
        };
    }
  };

  const config = getNotificationConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        `flex items-center gap-3 rounded-lg shadow-lg border ${config.borderColor} ${config.bgColor} p-4 w-full max-w-md`,
        'dark:bg-opacity-20 dark:border-opacity-50'
      )}
      role="alert"
    >
      <div className="flex-shrink-0">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className={cn(`text-sm font-bold ${config.titleColor}`, 'dark:text-opacity-90')}>{title}</p>}
        <p className={cn(`text-sm ${config.textColor}`, 'dark:text-opacity-80')}>{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="sr-only">إغلاق</span>
      </button>
    </motion.div>
  );
};

export default Notification;
