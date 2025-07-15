import React, { useState } from 'react';
import { UIIcons } from '../../constants/icons';

type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  className?: string;
}

/**
 * مكون جدول البيانات الموحد
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  onRowClick,
  sortable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // دالة فرز البيانات
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) {
      return [...data];
    }

    return [...data].sort((a: any, b: any) => {
      if (a[sortKey] === null) return 1;
      if (b[sortKey] === null) return -1;

      const valueA = typeof a[sortKey] === 'string' ? a[sortKey].toLowerCase() : a[sortKey];
      const valueB = typeof b[sortKey] === 'string' ? b[sortKey].toLowerCase() : b[sortKey];

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  // حساب عدد الصفحات
  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  // البيانات المعروضة في الصفحة الحالية
  const pageData = React.useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  // تغيير ترتيب الفرز
  const handleSort = (key: string) => {
    if (!sortable) return;
    
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // التنقل بين الصفحات
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // عرض حالة فارغة
  if (data.length === 0 && !loading) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {emptyState ? (
            emptyState
          ) : (
            <div className="text-center py-12">
              <UIIcons.FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد بيانات</h3>
              <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على أي سجلات</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={column.sortable !== false && sortable ? () => handleSort(column.key) : undefined}
                    className={`px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200 ${
                      column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                    } ${column.className || ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      {column.sortable !== false && sortable && sortKey === column.key && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <UIIcons.ChevronDown className="w-4 h-4" />
                          ) : sortDirection === 'desc' ? (
                            <UIIcons.ChevronUp className="w-4 h-4" />
                          ) : null}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pageData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${keyExtractor(row)}-${column.key}`}
                      className={`px-6 py-4 ${column.className || ''}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              عرض {(currentPage - 1) * pageSize + 1} إلى {Math.min(currentPage * pageSize, sortedData.length)} من أصل {sortedData.length} سجل
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <UIIcons.ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <UIIcons.ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
