import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit, Trash2, Search, Filter, 
  Eye, MoreVertical, Shield, Building, CheckCircle, XCircle 
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { StatusBadge } from '../../../shared';
import AddUserModal from './AddUserModal';
import UserDetailsModal from './UserDetailsModal';
import { adminService } from '../../../features/admin/services/adminService';
import { UserType } from '../../../types';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface User {
  id: string;
  full_name: string;
  email?: string;
  national_id?: string;
  phone: string;
  role: 'admin' | 'branch_manager' | 'employee' | 'beneficiary';
  branch_id?: string;
  branch_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsersManagementProps {
  onStatsUpdate: () => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ onStatsUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      const result = await adminService.users.getAll();


      if (result.success) {
        setUsers(result.users || []);
        onStatsUpdate();
      } else {
        console.error('Failed to load users:', result.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.national_id?.includes(searchTerm) ||
        user.phone.includes(searchTerm)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await adminService.users.toggleStatus(userId, !currentStatus);


      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        ));
        onStatsUpdate();
      } else {
        alert('خطأ في تحديث حالة المستخدم');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('خطأ في الشبكة');
    }
  };

  // Handlers for modals
  const handleAddUserSuccess = () => {
    setShowAddModal(false);
    setSelectedUser(null);
    setShowUserModal(false);
    loadUsers();
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'branch_manager': return 'مدير فرع';
      case 'employee': return 'موظف';
      case 'beneficiary': return 'مستفيد';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'branch_manager': return 'warning';
      case 'employee': return 'info';
      case 'beneficiary': return 'success';
      default: return 'info';
    }
  };

  const roleOptions = [
    { value: 'all', label: 'جميع الأدوار' },
    { value: 'admin', label: 'مدير النظام' },
    { value: 'branch_manager', label: 'مدير فرع' },
    { value: 'employee', label: 'موظف' },
    { value: 'beneficiary', label: 'مستفيد' }
  ];

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">جاري تحميل المستخدمين...</p>
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
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              إدارة المستخدمين
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة جميع المستخدمين في النظام ({filteredUsers.length} مستخدم)
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
            icon={<UserPlus className="w-5 h-5" />}
          >
            إضافة مستخدم جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="البحث بالاسم، الإيميل، الهوية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            icon={<Shield className="w-5 h-5" />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            icon={<Filter className="w-5 h-5" />}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">إجمالي:</span>
            <span className="font-bold text-blue-600">{filteredUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الدور</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الفرع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-white font-bold text-sm">
                          {user.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.full_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email || user.phone}
                        </p>
                        {user.national_id && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">هوية: {user.national_id}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      status={getRoleBadgeColor(user.role) as any} 
                      text={getRoleText(user.role)} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.branch_name || 'غير محدد'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className="flex items-center gap-2"
                    >
                      {user.is_active ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">نشط</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">غير نشط</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatGregorianDate(user.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600 dark:text-green-400"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 dark:bg-gray-800">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">لا توجد مستخدمين</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'لا توجد نتائج تطابق البحث'
                : 'ابدأ بإضافة مستخدمين جدد للنظام'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roleOptions.filter(role => role.value !== 'all').map(role => {
          const count = users.filter(user => user.role === role.value).length;
          const activeCount = users.filter(user => user.role === role.value && user.is_active).length;
          
          return (
            <div key={role.value} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{role.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-green-600">{activeCount} نشط</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  role.value === 'admin' ? 'bg-red-100 text-red-600' :
                  role.value === 'branch_manager' ? 'bg-amber-100 text-amber-600' :
                  role.value === 'employee' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={handleAddUserSuccess} 
      />
      
      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersManagement;
