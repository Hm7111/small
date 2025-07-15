import React, { useState, useEffect } from 'react';
import { 
  FileText, User, Calendar, Check, X, 
  Eye, AlertTriangle, Search, Filter, RefreshCw 
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { StatusBadge } from '../../../shared';
import RegistrationDetailsModal from './RegistrationDetailsModal';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface Registration {
  id: string;
  member_id: string;
  member_name: string;
  national_id: string;
  phone: string;
  gender: 'male' | 'female';
  registration_status: string;
  city: string;
  registration_date: string;
  disability_type?: string;
  email?: string;
}

interface RegistrationReviewListProps {
  branch: any;
  onStatsUpdate: () => void;
}

const RegistrationReviewList: React.FC<RegistrationReviewListProps> = ({
  branch,
  onStatsUpdate
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (branch?.id) {
      loadRegistrations();
    }
  }, [branch]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'list',
          branchId: branch.id
        })
      });

      const result = await response.json();

      if (result.success) {
        setRegistrations(result.registrations || []);
        onStatsUpdate();
      } else {
        console.error('Failed to load registrations:', result.error);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.national_id.includes(searchTerm) ||
        reg.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.registration_status === statusFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const handleStatusChange = async (registrationId: string, memberId: string, newStatus: string, notes?: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update_status',
          registrationId,
          memberId,
          newStatus,
          notes,
          branchId: branch.id
        })
      });

      const result = await response.json();

      if (result.success) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, registration_status: newStatus }
            : reg
        ));
        setShowDetailsModal(false);
        onStatsUpdate();
      } else {
        alert('حدث خطأ في تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_review': return 'قيد المراجعة الأولية';
      case 'under_employee_review': return 'قيد مراجعة الموظف';
      case 'under_manager_review': return 'قيد مراجعة المدير';
      case 'approved': return 'معتمد';
      case 'rejected': return 'مرفوض';
      case 'needs_correction': return 'يحتاج تصحيح';
      default: return status;
    }
  };

  const getStatusBadgeType = (status: string): 'success' | 'error' | 'warning' | 'pending' | 'info' => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'needs_correction': return 'warning';
      case 'pending_review':
      case 'under_employee_review':
      case 'under_manager_review':
        return 'pending';
      default:
        return 'info';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'pending_review', label: 'قيد المراجعة الأولية' },
    { value: 'under_employee_review', label: 'قيد مراجعة الموظف' },
    { value: 'under_manager_review', label: 'قيد مراجعة المدير' },
    { value: 'approved', label: 'معتمد' },
    { value: 'rejected', label: 'مرفوض' },
    { value: 'needs_correction', label: 'يحتاج تصحيح' }
  ];

  if (isLoading && registrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل طلبات التسجيل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
              طلبات التسجيل
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              مراجعة طلبات التسجيل الجديدة في الفرع ({filteredRegistrations.length} طلب)
            </p>
          </div>
          <Button
            onClick={loadRegistrations}
            className="flex items-center gap-2"
            icon={<RefreshCw className="w-5 h-5" />}
          >
            تحديث القائمة
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="البحث بالاسم، الهوية، الجوال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            icon={<Filter className="w-5 h-5" />}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">إجمالي:</span>
            <span className="font-bold text-green-600">{filteredRegistrations.length}</span>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">المستفيد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">رقم الهوية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">المدينة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">تاريخ التقديم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {registration.member_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{registration.member_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {registration.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {registration.national_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {registration.city || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatGregorianDate(registration.registration_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      status={getStatusBadgeType(registration.registration_status)} 
                      text={getStatusText(registration.registration_status)} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-blue-600"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {registration.registration_status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(registration.id, registration.member_id, 'under_employee_review')}
                            className="p-2 rounded-lg hover:bg-gray-100 text-amber-600"
                            title="تحويل للموظف"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(registration.id, registration.member_id, 'approved')}
                            className="p-2 rounded-lg hover:bg-gray-100 text-green-600"
                            title="موافقة"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(registration.id, registration.member_id, 'rejected')}
                            className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                            title="رفض"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">لا توجد طلبات تسجيل</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'pending_review'
                ? 'لا توجد نتائج تطابق البحث'
                : 'لا توجد طلبات تسجيل جديدة في الفرع حالياً'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.slice(1).map((status) => {
          const count = registrations.filter(reg => reg.registration_status === status.value).length;
          
          return (
            <div key={status.value} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{status.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  status.value.includes('review') ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400' :
                  status.value === 'approved' ? 'bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-400' :
                  status.value === 'rejected' ? 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400' :
                  'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Details Modal */}
      {selectedRegistration && (
        <RegistrationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          registration={selectedRegistration}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default RegistrationReviewList;
