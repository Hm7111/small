import React, { useState, useEffect } from 'react';
import { 
  Building, Plus, Edit, Trash2, MapPin, Phone, 
  User, Users, CheckCircle, XCircle, Search 
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { StatusBadge } from '../../../shared';
import AddBranchModal from './AddBranchModal';
import BranchDetailsModal from './BranchDetailsModal';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { adminService } from '../../../features/admin/services/adminService';
import { useToast } from '../../../contexts/ToastContext';

interface Branch {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  manager_id?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employees_count?: number;
  members_count?: number;
}

interface BranchesManagementProps {
  onStatsUpdate: () => void;
}

const BranchesManagement: React.FC<BranchesManagementProps> = ({ onStatsUpdate }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    filterBranches();
  }, [branches, searchTerm]);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      
      const result = await adminService.branches.getAll();

      if (result.success) {
        setBranches(result.branches || []);
        onStatsUpdate();
      } else {
        console.error('Failed to load branches:', result.error);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBranches = () => {
    let filtered = branches;

    if (searchTerm) {
      filtered = filtered.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBranches(filtered);
  };

  const toggleBranchStatus = async (branchId: string, currentStatus: boolean) => {
    try {
      const result = await adminService.branches.toggleStatus(branchId, !currentStatus);

      if (result.success) {
        setBranches(prev => prev.map(branch => 
          branch.id === branchId 
            ? { ...branch, is_active: !currentStatus }
            : branch
        ));
        onStatsUpdate();
      } else {
        alert('خطأ في تحديث حالة الفرع');
      }
    } catch (error) {
      console.error('Error toggling branch status:', error);
      alert('خطأ في الشبكة');
    }
  };

  // Handlers for modals
  const handleAddBranchSuccess = () => {
    setShowAddModal(false);
    loadBranches();
  };

  // فتح التفاصيل
  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDetailsModal(true);
    console.log("Opening branch details:", branch.name, branch);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">جاري تحميل الفروع...</p>
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
              <Building className="w-8 h-8 text-green-600 dark:text-green-400" />
              إدارة الفروع
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة فروع الجمعية ومدرائها ({filteredBranches.length} فرع)
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            icon={<Plus className="w-5 h-5" />}
          >
            إضافة فرع جديد
          </Button>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            type="text"
            placeholder="البحث في الفروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <div key={branch.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300">
            {/* Branch Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                  branch.is_active ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 
                  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{branch.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 dark:text-gray-400" />
                    {branch.city}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleBranchStatus(branch.id, branch.is_active)}
                className="flex items-center gap-1"
              >
                {branch.is_active ? (
                  <StatusBadge status="success" text="نشط" />
                ) : (
                  <StatusBadge status="error" text="غير نشط" />
                )}
              </button>
            </div>

            {/* Branch Details */}
            <div className="space-y-3 mb-4">
              {branch.address && ( 
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="truncate dark:text-gray-300">{branch.address}</span>
                </div>
              )}
              
              {branch.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{branch.phone}</span>
                </div>
              )}

              {branch.manager_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>المدير: {branch.manager_name}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {branch.employees_count || 0}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">موظف</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {branch.members_count || 0}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">مستفيد</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleViewDetails(branch)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                تعديل
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Users className="w-4 h-4" />
                الموظفين
              </button>
            </div>

            {/* Creation Date */}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              أُنشئ في {formatGregorianDate(branch.created_at)}
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Building className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">لا توجد فروع</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm 
              ? 'لا توجد نتائج تطابق البحث' 
              : 'ابدأ بإضافة فروع جديدة للجمعية'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-5 h-5" />}
            >
              إضافة فرع جديد
            </Button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الفروع</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{branches.length}</p>
            </div>
            <Building className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الفروع النشطة</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {branches.filter(b => b.is_active).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الفروع غير النشطة</p>
              <p className="text-2xl font-bold text-red-600">
                {branches.filter(b => !b.is_active).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-blue-600">
                {branches.reduce((sum, b) => sum + (b.employees_count || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      <AddBranchModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={handleAddBranchSuccess} 
      />
      
      {/* Branch Details Modal */}
      {selectedBranch && (
        <BranchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          branch={selectedBranch}
        />
      )}
    </div>
  );
};

export default BranchesManagement;
