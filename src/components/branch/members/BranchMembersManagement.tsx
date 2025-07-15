import React, { useState, useEffect } from 'react';
import { 
  Users, Search, User, Calendar, MapPin, CheckCircle,
  Phone, FileText, Filter, Eye, RefreshCw, Heart
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { StatusBadge } from '../../../shared';
import MemberDetailsModal from './MemberDetailsModal';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface Member {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  gender: 'male' | 'female';
  city: string;
  status: 'active' | 'inactive' | 'suspended';
  registration_status: string;
  disability_type?: string;
  email?: string;
  created_at: string;
}

interface BranchMembersManagementProps {
  branch: any;
  onStatsUpdate: () => void;
}

const BranchMembersManagement: React.FC<BranchMembersManagementProps> = ({
  branch,
  onStatsUpdate
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (branch?.id) {
      loadMembers();
    }
  }, [branch]);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-members`, {
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
        setMembers(result.members || []);
        onStatsUpdate();
      } else {
        console.error('Failed to load members:', result.error);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.national_id.includes(searchTerm) ||
        member.phone.includes(searchTerm) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  };

  const getMemberStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <StatusBadge status="success" text="نشط" />;
      case 'inactive': return <StatusBadge status="pending" text="غير نشط" />;
      case 'suspended': return <StatusBadge status="error" text="معلق" />;
      default: return <StatusBadge status="info" text={status} />;
    }
  };

  const getRegistrationStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <StatusBadge status="success" text="معتمد" />;
      case 'rejected': return <StatusBadge status="error" text="مرفوض" />;
      case 'pending_review': 
      case 'under_employee_review':
      case 'under_manager_review':
        return <StatusBadge status="pending" text="قيد المراجعة" />;
      case 'needs_correction':
        return <StatusBadge status="warning" text="يحتاج تصحيح" />;
      default:
        return <StatusBadge status="info" text={status} />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
    { value: 'suspended', label: 'معلق' }
  ];

  if (isLoading && members.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل المستفيدين...</p>
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
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              المستفيدين
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة المستفيدين في فرع {branch?.name || 'الفرع'} ({filteredMembers.length} مستفيد)
            </p>
          </div>
          <Button onClick={loadMembers} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500" icon={<RefreshCw className="w-5 h-5" />}>
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
            <span className="font-bold text-purple-600">{filteredMembers.length}</span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">المستفيد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">رقم الهوية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">نوع الإعاقة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">المدينة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">حالة العضوية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">حالة التسجيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {member.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{member.full_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.national_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.disability_type || 'غير محدد'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.city || 'غير محدد'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getMemberStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getRegistrationStatusBadge(member.registration_status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                        className="flex items-center gap-2 dark:text-gray-300"
                          setShowDetailsModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-purple-600"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 text-blue-600"
                        title="الطلبات"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">لا يوجد مستفيدين</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'لا توجد نتائج تطابق البحث' 
                : 'لا يوجد مستفيدين مسجلين في الفرع حالياً'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المستفيدين</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المستفيدين النشطين</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {members.filter(m => m.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">طلبات بحاجة للمراجعة</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {members.filter(m => m.registration_status.includes('review')).length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          member={selectedMember}
        />
      )}
    </div>
  );
};

export default BranchMembersManagement;
