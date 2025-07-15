import React from 'react';
import { UIIcons } from '../../constants/icons';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: FilterOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset?: () => void;
  onSearch?: () => void;
  loading?: boolean;
  className?: string;
  searchLabel?: string;
  resetLabel?: string;
}

/**
 * مكون شريط الفلترة الموحد
 */
const FilterBar: React.FC<FilterBarProps> = ({
  fields,
  values,
  onChange,
  onReset,
  onSearch,
  loading = false,
  className = '',
  searchLabel = 'بحث',
  resetLabel = 'إعادة ضبط'
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {fields.map((field) => {
          const colSpan = field.type === 'text' ? 'md:col-span-4' : 'md:col-span-3';
          
          switch (field.type) {
            case 'text':
              return (
                <div key={field.key} className={colSpan}>
                  <Input
                    type="text"
                    placeholder={field.placeholder || field.label}
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    icon={field.icon || <UIIcons.Search className="w-5 h-5" />}
                    className={field.className}
                  />
                </div>
              );
            case 'select':
              return (
                <div key={field.key} className={colSpan}>
                  <Select
                    value={values[field.key] || ''}
                    onChange={(value) => onChange(field.key, value)}
                    options={field.options || []}
                    placeholder={field.placeholder || field.label}
                    icon={field.icon || <UIIcons.Filter className="w-5 h-5" />}
                    className={field.className}
                  />
                </div>
              );
            case 'date':
              return (
                <div key={field.key} className={colSpan}>
                  <Input
                    type="date"
                    placeholder={field.placeholder || field.label}
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    icon={field.icon || <UIIcons.Calendar className="w-5 h-5" />}
                    className={field.className}
                  />
                </div>
              );
            case 'number':
              return (
                <div key={field.key} className={colSpan}>
                  <Input
                    type="number"
                    placeholder={field.placeholder || field.label}
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    icon={field.icon}
                    className={field.className}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
        
        <div className="md:col-span-2 flex gap-2 items-center justify-end">
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1"
              disabled={loading}
            >
              {resetLabel}
            </Button>
          )}
          
          {onSearch && (
            <Button
              onClick={onSearch}
              isLoading={loading}
              icon={<UIIcons.Search className="w-5 h-5 ml-1" />}
              className="flex-1"
            >
              {searchLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
