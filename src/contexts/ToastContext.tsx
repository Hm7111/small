import React, { createContext, useContext, useState, useCallback } from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextProps {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // إضافة إشعار جديد
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000, // الوقت الافتراضي هو 5 ثوان
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // إزالة الإشعار تلقائيًا بعد المدة المحددة
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, []);

  // إزالة إشعار محدد
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// مكون عرض الإشعارات
const ToastContainer: React.FC<{ 
  toasts: Toast[]; 
  removeToast: (id: string) => void 
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-3 max-w-md" dir="rtl">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// مكون الإشعار الفردي
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const { type, title, message } = toast;

  // تكوين مظهر الإشعار حسب النوع
  const getToastConfig = () => {
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

  const config = getToastConfig();

  return (
    <div 
      className={`flex items-center gap-3 rounded-lg shadow-lg border ${config.borderColor} ${config.bgColor} p-4 w-full max-w-md animate-fadeIn transition-transform transform`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-bold ${config.titleColor}`}>{title}</p>}
        <p className={`text-sm ${config.textColor}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <X className="w-5 h-5 text-gray-500" />
        <span className="sr-only">إغلاق</span>
      </button>
    </div>
  );
};

export default ToastProvider;
