import React from 'react';
import { UIIcons, RequestIcons } from '../../constants/icons';
import Button from '../../components/ui/Button';

export interface ActionButton {
  key: string;
  label?: string;
  title?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

export interface ActionButtonsProps {
  actions: ActionButton[];
  direction?: 'row' | 'column';
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
  compact?: boolean;
}

/**
 * مكون أزرار الإجراءات الموحد
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  direction = 'row',
  size = 'md',
  spacing = 'md',
  align = 'start',
  className = '',
  compact = false
}) => {
  // تحديد الأنماط بناءً على الاتجاه والمحاذاة والمسافة
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  
  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4'
  };
  
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  // تعيين الأيقونات الافتراضية لأنواع الإجراءات الشائعة
  const getDefaultIcon = (key: string) => {
    switch (key) {
      case 'view':
        return <UIIcons.Eye className="w-4 h-4" />;
      case 'edit':
        return <UIIcons.Edit className="w-4 h-4" />;
      case 'delete':
        return <UIIcons.Trash2 className="w-4 h-4" />;
      case 'approve':
        return <RequestIcons.CheckCircle className="w-4 h-4" />;
      case 'reject':
        return <RequestIcons.XCircle className="w-4 h-4" />;
      case 'download':
        return <UIIcons.Download className="w-4 h-4" />;
      case 'upload':
        return <UIIcons.Upload className="w-4 h-4" />;
      case 'refresh':
        return <UIIcons.RefreshCw className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${directionClass} ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}>
      {actions.map((action) => {
        // استخدام الأيقونات الافتراضية إذا لم يتم تحديد أيقونة
        const buttonIcon = action.icon || getDefaultIcon(action.key);
        
        // عرض أزرار مضغوطة (أيقونات فقط) أو كاملة
        if (compact) {
          return (
            <button
              key={action.key}
              type={action.type || 'button'}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                action.key === 'delete' || action.key === 'reject' ? 'text-red-600 dark:text-red-400' : 
                action.key === 'edit' ? 'text-green-600 dark:text-green-400' : 
                action.key === 'approve' ? 'text-blue-600 dark:text-blue-400' : 
                'text-gray-600 dark:text-gray-400'
              } ${action.className || ''}`}
              title={action.title || action.label}
            >
              {buttonIcon}
            </button>
          );
        }
        
        // عرض أزرار كاملة
        return (
          <Button
            key={action.key}
            variant={action.variant || 'default'}
            size={action.size || size}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
            icon={buttonIcon}
            type={action.type}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
