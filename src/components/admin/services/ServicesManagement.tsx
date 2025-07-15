import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Tag, 
  CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { adminService } from '../../../features/admin/services/adminService';
import { formatCurrency } from '../../../utils/helpers';
import { useToast } from '../../../contexts/ToastContext';
import ServiceCard from './ServiceCard';
import AddServiceModal from './AddServiceModal';
import ServiceDetailsModal from './ServiceDetailsModal';
import Alert from '../../ui/Alert';

interface ServicesManagementProps {
  onStatsUpdate: () => void;
}

const ServicesManagement: React.FC<ServicesManagementProps> = ({ onStatsUpdate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter]);

  // تحميل الخدمات
  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await adminService.services.getAll();

      if (result.success) {
        setServices(result.services || []);
        onStatsUpdate();
      } else {
        console.error('Failed to load services:', result.error);
        setError(result.error || 'حدث خطأ في تحميل الخدمات');
        addToast({
          type: 'error',
          title: 'خطأ في تحميل الخدمات',
          message: result.error || 'حدث خطأ في تحميل الخدمات'
        });
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  // تصفية الخدمات حسب البحث والفئة
  const filterServices = () => {
    let filtered = services;

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // تصفية حسب الفئة
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    setFilteredServices(filtered);
  };

  // تبديل حالة الخدمة (نشطة/غير نشطة)
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const result = await adminService.services.toggleStatus(serviceId, !currentStatus);

      if (result.success) {
        // تحديث حالة الخدمة في القائمة
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, is_active: !currentStatus }
            : service
        ));
        onStatsUpdate();
        
        addToast({
          type: 'success',
          message: `تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} الخدمة بنجاح`
        });
      } else {
        addToast({
          type: 'error',
          title: 'خطأ في تحديث الخدمة',
          message: result.error || 'حدث خطأ في تحديث حالة الخدمة'
        });
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      addToast({
        type: 'error',
        message: 'حدث خطأ في الشبكة'
      });
    }
  };

  // الحذف الفعلي للخدمة
  const deleteService = async (serviceId: string) => {
    try {
      // التحقق أولاً من وجود طلبات مرتبطة بالخدمة
      const checkResult = await adminService.services.checkHasRequests(serviceId);
      
      if (checkResult.hasRequests) {
        addToast({
          type: 'error',
          title: 'لا يمكن حذف الخدمة',
          message: `هذه الخدمة مرتبطة بـ ${checkResult.requestCount} طلب. يمكن إيقافها بدلاً من الحذف.`
        });
        setShowDeleteConfirmModal(false);
        return;
      }
      
      // إذا لم تكن مرتبطة بطلبات، يمكن حذفها
      const result = await adminService.services.delete(serviceId);

      if (result.success) {
        // حذف الخدمة من القائمة
        setServices(prev => prev.filter(service => service.id !== serviceId));
        onStatsUpdate();
        
        addToast({
          type: 'success',
          message: 'تم حذف الخدمة بنجاح'
        });
        
        setShowDeleteConfirmModal(false);
        setServiceToDelete(null);
      } else {
        if (result.hasRequests) {
          addToast({
            type: 'error',
            title: 'لا يمكن حذف الخدمة',
            message: 'هذه الخدمة مرتبطة بطلبات سابقة. يمكن إيقافها بدلاً من الحذف.'
          });
        } else {
          addToast({
            type: 'error',
            title: 'خطأ في حذف الخدمة',
            message: result.error || 'حدث خطأ في حذف الخدمة'
          });
        }
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      addToast({
        type: 'error',
        message: 'حدث خطأ في الشبكة'
      });
    } finally {
      setShowDeleteConfirmModal(false);
      setServiceToDelete(null);
    }
  };

  // تأكيد حذف خدمة
  const confirmDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setShowDeleteConfirmModal(true);
  };

  // إضافة خدمة جديدة
  const handleAddServiceSuccess = () => {
    loadServices();
    setShowAddModal(false);
  };

  // الحصول على قائمة الفئات الفريدة
  const getUniqueCategories = () => {
    const categories = services
      .map(service => service.category)
      .filter(Boolean)
      .filter((category, index, arr) => arr.indexOf(category) === index);
    
    return [
      { value: 'all', label: 'جميع الفئات' },
      ...categories.map(category => ({ value: category as string, label: category as string }))
    ];
  };

  // فتح نافذة عرض تفاصيل الخدمة
  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    console.log("Opening service details:", service.name, service);
    setShowDetailsModal(true);
  };

  // تعديل الخدمة
  const handleEditService = (service: Service) => {
    // هنا يمكن إضافة منطق لتعديل الخدمة
    alert(`تعديل الخدمة: ${service.name}`);
  };

  // محتوى شاشة التحميل
  if (isLoading && services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
          <p className="text-center text-gray-600">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              إدارة الخدمات
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة خدمات الجمعية المقدمة للمستفيدين ({filteredServices.length} خدمة)
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            icon={<Plus className="w-5 h-5" />}
          >
            إضافة خدمة جديدة
          </Button>
        </div>

        {/* الفلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="البحث في الخدمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={getUniqueCategories()}
            icon={<Filter className="w-5 h-5" />}
          />
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={loadServices}
              icon={<RefreshCw className="w-5 h-5 ml-2" />}
            >
              تحديث
            </Button>
          </div>
        </div>
      </div>

      {/* رسالة خطأ إذا وجدت */}
      {error && (
        <Alert
          type="error"
          title="خطأ في تحميل الخدمات"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* قائمة الخدمات */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            return (
              <ServiceCard 
                key={service.id}
                service={service}
                onToggleStatus={toggleServiceStatus}
                onDelete={confirmDeleteService}
                onView={handleViewDetails}
                onEdit={handleEditService}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">لا توجد خدمات</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter !== 'all'
              ? 'لا توجد نتائج تطابق البحث' 
              : 'ابدأ بإضافة خدمات جديدة للمستفيدين'}
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-5 h-5" />}
            >
              إضافة خدمة جديدة
            </Button>
          )}
        </div>
      )}

      {/* ملخص الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الخدمات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الخدمات النشطة</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {services.filter(s => s.is_active).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الفئات</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getUniqueCategories().length - 1}
              </p>
            </div>
            <Tag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {services.reduce((sum, s) => sum + (s.requests_count || 0), 0)}
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>
      
      {/* مودال إضافة الخدمة */}
      <AddServiceModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={handleAddServiceSuccess} 
      />

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          service={selectedService}
        />
      )}
      
      {/* مودال تأكيد الحذف */}
      {showDeleteConfirmModal && serviceToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirmModal(false)}></div>
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 p-6">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">تأكيد حذف الخدمة</h3>
                <p className="text-gray-600 mt-2">
                  هل أنت متأكد من حذف الخدمة "{serviceToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => deleteService(serviceToDelete.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  تأكيد الحذف
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
