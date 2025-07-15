import React from 'react';
import FilterBar, { FilterField } from '../../../shared/components/FilterBar';
import { REQUEST_LABELS } from '../../../constants/labels';
import { UIIcons, RequestIcons } from '../../../constants/icons';

export interface RequestsFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
  onSearch: () => void;
  isLoading: boolean;
  className?: string;
}

const RequestsFilters: React.FC<RequestsFiltersProps> = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onReset,
  onSearch,
  isLoading,
  className
}) => {
  // تعريف حقول الفلترة
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      label: 'بحث',
      type: 'text',
      placeholder: 'البحث بالاسم، الهوية، الخدمة...',
      icon: <UIIcons.Search className="w-5 h-5" />
    },
    {
      key: 'statusFilter',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: 'all', label: 'جميع الحالات' },
        { value: 'pending', label: REQUEST_LABELS.PENDING },
        { value: 'under_review', label: REQUEST_LABELS.UNDER_REVIEW },
        { value: 'approved', label: REQUEST_LABELS.APPROVED },
        { value: 'rejected', label: REQUEST_LABELS.REJECTED }
      ],
      icon: <UIIcons.Filter className="w-5 h-5" />
    }
  ];

  // حالة الفلترة الحالية
  const filterValues = {
    searchTerm,
    statusFilter
  };

  // تغيير قيم الفلترة
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'searchTerm') {
      onSearchChange(value);
    } else if (key === 'statusFilter') {
      onStatusChange(value);
    }
  };

  return (
    <FilterBar
      fields={filterFields}
      values={filterValues}
      onChange={handleFilterChange}
      onReset={onReset}
      onSearch={onSearch}
      loading={isLoading}
      className={className}
      searchLabel="تحديث"
      resetLabel="إعادة ضبط"
    />
  );
};

export default RequestsFilters;
