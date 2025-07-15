import React, { useState, useEffect } from 'react';
import { 
  FileCheck, User, Calendar, Check, X, 
  Eye, AlertTriangle, Search, Filter, RefreshCw, 
  FileText, Clock, Briefcase
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import RegistrationDetailsModal from './RegistrationDetailsModal';

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
  assigned_to?: string;
  assigned_by?: string;
  assigned_date?: string;
}

interface RegistrationReviewListProps {
  employeeId: string;
  branchId: string;
  onStatsUpdate: () => void;
}

const RegistrationReviewList: React.FC<RegistrationReviewListProps> = ({
  employeeId,
  branchId,
  onStatsUpdate
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('under_employee_review');
  const [assignedFilter, setAssignedFilter] = useState('all'); // 'all', 'assigned_to_me', 'not_assigned'
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (employeeId && branchId) {
      loadRegistrations();
    }
  }, [employeeId, branchId]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter, assignedFilter]);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employee-registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'list',
          employeeId,
          branchId
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

    if (assignedFilter !== 'all') {
      if (assignedFilter === 'assigned_to_me') {
        filtered = filtered.filter(reg => reg.assigned_to === employeeId);
      } else if (assignedFilter === 'not_assigned') {
        filtered = filtered.filter(reg => !reg.assigned_to);
      }
    }

    setFilteredRegistrations(filtered);
  };

  const handleStatusChange = async (registrationId: string, memberId: string, newStatus: string, notes?: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employee-registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update_status',
          registrationId,
          memberId,
          employeeId,
          newStatus,
          notes,
          branchId
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
    { value: 'under_employee_review', label: 'قيد مراجعة الموظف' },
    { value: 'pending_review', label: 'قيد المراجعة الأولية' },
    { value: 'under_manager_review', label: 'تم تحويله للمدير' },
    { value: 'needs_correction', label: 'يحتاج تصحيح' },
    { value: 'approved', label: 'معتمد' },
    { value: 'rejected', label: 'مرفوض' }
  ];

  const assignedOptions = [
    { value: 'all', label: 'جميع الطلبات' },
    { value: 'assigned_to_me', label: 'المسندة إليّ' },
    { value: 'not_assigned', label: 'غير مسندة' }
  ];

  if (isLoading && registrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل طلبات التسجيل...</p>
          </div>
        </div>
      </div>
    );
  }

  // For demo purposes, create some mock data if no registrations are returned
  const demoData: Registration[] = [
    {
      id: '1',
      member_id: 'm1',
      member_name: 'أحمد محمد علي',
      national_id: '1234567890',
      phone: '0512345678',
      gender: 'male',
      registration_status: 'under_employee_review',
      city: 'الرياض',
      registration_date: new Date().toISOString(),
      disability_type: 'visual_impaired',
      assigned_to: employeeId,
      assigned_by: 'branch_manager',
      assigned_date: new Date().toISOString()
    },
    {
      id: '2',
      member_id: 'm2',
      member_name: 'فاطمة سعيد',
      national_id: '1234567891',
      phone: '0512345679',
      gender: 'female',
      registration_status: 'pending_review',
      city: 'جدة',
      registration_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      disability_type: 'hearing_impaired'
    },
    {
      id: '3',
      member_id: 'm3',
      member_name: 'خالد عبدالله',
      national_id: '1234567892',
      phone: '0512345680',
      gender: 'male',
      registration_status: 'needs_correction',
      city: 'الرياض',
      registration_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      disability_type: 'mobility_impaired',
      assigned_to: employeeId,
      assigned_by: 'branch_manager',
      assigned_date: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  // If we have no real registrations, use the demo data
  const displayData = registrations.length === 0 ? demoData : registrations;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-blue-600" />
              طلبات التسجيل
            </h2>
            <p className="text-gray-600 mt-2">
              مراجعة وتحقق من طلبات التسجيل ({filteredRegistrations.length} طلب)
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
          <Select
            value={assignedFilter}
            onChange={setAssignedFilter}
            options={assignedOptions}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المستفيد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">رقم الهوية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">نوع الإعاقة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المدينة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">تاريخ التقديم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.length > 0 ? filteredRegistrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {registration.member_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{registration.member_name}</p>
                        <p className="text-sm text-gray-500">
                          {registration.phone}
                        </p>
                      </div>
                      {registration.assigned_to === employeeId && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          مسند إليك
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {registration.national_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {registration.disability_type || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {registration.city || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
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
                      
                      {registration.registration_status === 'under_employee_review' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(
                              registration.id, 
                              registration.member_id, 
                              'under_manager_review'
                            )}
                            className="p-2 rounded-lg hover:bg-gray-100 text-blue-600"
                            title="إحالة للمدير"
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(
                              registration.id, 
                              registration.member_id, 
                              'approved'
                            )}
                            className="p-2 rounded-lg hover:bg-gray-100 text-green-600"
                            title="موافقة"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(
                              registration.id, 
                              registration.member_id, 
                              'needs_correction'
                            )}
                            className="p-2 rounded-lg hover:bg-gray-100 text-amber-600"
                            title="طلب تصحيح"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : displayData.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {registration.member_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{registration.member_name}</p>
                        <p className="text-sm text-gray-500">
                          {registration.phone}
                        </p>
                      </div>
                      {registration.assigned_to === employeeId && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          مسند إليك
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {registration.national_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {registration.disability_type || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {registration.city || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
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
                      
                      {registration.registration_status === 'under_employee_review' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(
                              registration.id, 
                              registration.member_id, 
                              'under_manager_review'
                            )}
                            className="p-2 rounded-lg hover:bg-gray-100 text-blue-600"
                            title="إحالة للمدير"
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(
                              registration.id, 
                              registration.member_id, 
                              'approved'
                            )}
                            className="p-2 rounded-lg hover:bg-gray-100 text-green-600"
                            title="موافقة"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(
                              registration.id, 
                              registration.member_id, 
                              'needs_correction'
                            )}
                            className="p-2 rounded-lg hover:bg-gray-100 text-amber-600"
                            title="طلب تصحيح"
                          >
                            <AlertTriangle className="w-4 h-4" />
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

        {filteredRegistrations.length === 0 && displayData.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات تسجيل</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'under_employee_review'
                ? 'لا توجد نتائج تطابق البحث'
                : 'لا توجد طلبات تسجيل مسندة إليك حالياً'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">طلبات بانتظار المراجعة</p>
              <p className="text-2xl font-bold text-amber-600">
                {displayData.filter(r => r.registration_status === 'under_employee_review').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المحالة إلى المدير</p>
              <p className="text-2xl font-bold text-blue-600">
                {displayData.filter(r => r.registration_status === 'under_manager_review').length}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">تمت المراجعة</p>
              <p className="text-2xl font-bold text-green-600">
                {displayData.filter(r => 
                  r.registration_status === 'approved' || 
                  r.registration_status === 'rejected' || 
                  r.registration_status === 'needs_correction'
                ).length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Registration Details Modal */}
      {selectedRegistration && (
        <RegistrationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          registration={selectedRegistration}
          onStatusChange={handleStatusChange}
          userRole="employee"
        />
      )}
    </div>
  );
};

export default RegistrationReviewList;
