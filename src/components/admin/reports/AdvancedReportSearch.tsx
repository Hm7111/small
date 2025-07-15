import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, User, Phone, FileText, Filter, X, 
  Clock, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { reportService } from '../../../features/admin/services/reportService';
import { SearchCriteria, QuickSearchResult } from '../../../types/reports';

interface AdvancedReportSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading?: boolean;
}

const AdvancedReportSearch: React.FC<AdvancedReportSearchProps> = ({
  onSearch,
  isLoading = false
}) => {
  const [searchType, setSearchType] = useState<'national_id' | 'transaction_id' | 'phone_number'>('national_id');
  const [searchValue, setSearchValue] = useState('');
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // البحث السريع أثناء الكتابة
  useEffect(() => {
    const performQuickSearch = async () => {
      if (searchValue.length >= 3) {
        setIsSearching(true);
        try {
          const result = await reportService.quickSearch(searchValue);
          if (result.success && result.data) {
            setQuickResults(result.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Quick search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setQuickResults([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(performQuickSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  // إخفاء الاقتراحات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch({
        type: searchType,
        value: searchValue.trim()
      });
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: QuickSearchResult) => {
    setSearchValue(suggestion.title);
    setShowSuggestions(false);
    
    // تحديد نوع البحث بناءً على نوع النتيجة
    const searchType = suggestion.type === 'beneficiary' ? 'national_id' : 'transaction_id';
    onSearch({
      type: searchType,
      value: suggestion.id
    });
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case 'national_id': return <User className="w-5 h-5" />;
      case 'phone_number': return <Phone className="w-5 h-5" />;
      case 'transaction_id': return <FileText className="w-5 h-5" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'national_id': return 'أدخل رقم الهوية الوطنية (مثال: 1234567890)';
      case 'phone_number': return 'أدخل رقم الجوال (مثال: 0501234567)';
      case 'transaction_id': return 'أدخل رقم المعاملة (مثال: REQ123456)';
      default: return 'أدخل معايير البحث';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'inactive': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">البحث الشامل</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ابحث بالهوية الوطنية أو رقم المعاملة أو رقم الجوال
          </p>
        </div>
      </div>

      {/* نوع البحث */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          نوع البحث
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'national_id', label: 'رقم الهوية الوطنية', icon: <User className="w-4 h-4" /> },
            { value: 'transaction_id', label: 'رقم المعاملة', icon: <FileText className="w-4 h-4" /> },
            { value: 'phone_number', label: 'رقم الجوال', icon: <Phone className="w-4 h-4" /> }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value as any)}
              className={`
                flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                ${searchType === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              {type.icon}
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* حقل البحث */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              getSearchIcon()
            )}
          </div>
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={getPlaceholder()}
            className="pr-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* الاقتراحات السريعة */}
        {showSuggestions && quickResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                نتائج البحث السريع
              </div>
              {quickResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(result)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    {result.type === 'beneficiary' ? (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.subtitle}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(result.status)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-3 mt-6">
        <Button
          onClick={handleSearch}
          disabled={!searchValue.trim() || isLoading}
          isLoading={isLoading}
          icon={<Search className="w-5 h-5 ml-2" />}
          className="flex-1 md:flex-none"
        >
          إنشاء التقرير
        </Button>
        
        {searchValue && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('');
              setQuickResults([]);
              setShowSuggestions(false);
            }}
            icon={<X className="w-4 h-4 ml-2" />}
          >
            مسح
          </Button>
        )}
      </div>

      {/* نصائح البحث */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          نصائح للبحث الفعال:
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• استخدم رقم الهوية الوطنية كاملاً (10 أرقام)</li>
          <li>• رقم المعاملة يبدأ عادة بـ REQ متبوعاً بأرقام</li>
          <li>• رقم الجوال يجب أن يبدأ بـ 05 أو 5</li>
          <li>• يمكنك البحث بجزء من الاسم للحصول على اقتراحات</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedReportSearch;
