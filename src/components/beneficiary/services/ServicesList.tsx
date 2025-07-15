import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertCircle, DollarSign, Calendar, Tag, ArrowRight, FileText } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { formatCurrency } from '../../../utils/helpers';
import ServiceRequestModal from './ServiceRequestModal';

interface AvailableService {
  id: string;
  name: string;
  description?: string;
  requirements?: string;
  category?: string;
  max_amount?: number;
  duration_days?: number;
  is_active: boolean;
  required_documents?: Array<{
    name: string;
    is_required: boolean;
  }>;
  reapplication_period_months?: number;
  is_one_time_only?: boolean;
  eligible?: boolean;
}

interface ServicesListProps {
  memberData: any;
}

const ServicesList: React.FC<ServicesListProps> = ({ memberData }) => {
  const [services, setServices] = useState<AvailableService[]>([]);
  const [filteredServices, setFilteredServices] = useState<AvailableService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<AvailableService | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const categories = ['all', 'مساعدات مالية', 'مساعدات عينية', 'رعاية اجتماعية', 'تطوير مهارات', 'المساعدات التعليمية', 'الرعاية الصحية', 'أخرى'];

  useEffect(() => {
    if (memberData?.id) {
      loadServices();
    }
  }, [memberData?.id]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter]);

  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/available-services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId: memberData.id })
      });

      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setServices(result.services || []);
      } else {
        throw new Error(result.error || 'فشل في تحميل الخدمات المتاحة');
      }
    } catch (err) {
      console.error('خطأ في تحميل الخدمات المتاحة:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    setFilteredServices(filtered);
  };

  const handleServiceRequest = (service: AvailableService) => {
    if (memberData?.registration_status !== 'approved') {
      alert('عذراً، يجب أن يتم اعتماد حسابك أولاً قبل طلب الخدمات');
      return;
    }
    
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleRequestSubmit = async (serviceId: string, requestData: any) => {
    try {
      // استدعاء Supabase Edge Function لتقديم طلب خدمة
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-service-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          memberId: memberData.id,
          serviceId: serviceId,
          requestData: requestData
        })
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // إغلاق الموديل وإظهار رسالة نجاح
        setShowRequestModal(false);
        alert('تم تقديم طلب الخدمة بنجاح');
      } else {
        throw new Error(result.error || 'فشل في تقديم طلب الخدمة');
      }
    } catch (err) {
      console.error('خطأ في تقديم طلب الخدمة:', err);
      alert(`فشل في تقديم طلب الخدمة: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'مساعدات مالية': return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'مساعدات عينية': return <Package className="w-5 h-5 text-green-600" />;
      case 'رعاية اجتماعية': return <Package className="w-5 h-5 text-red-600" />;
      case 'تطوير مهارات': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'المساعدات التعليمية': return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'الرعاية الصحية': return <FileText className="w-5 h-5 text-pink-600" />;
      default: return <Package className="w-5 h-5 text-orange-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            الخدمات المتاحة
          </h2>
          <p className="text-gray-600 mt-2">
            استعرض الخدمات المتاحة وتقدم بطلبات الاستفادة
          </p>
        </div>

        {/* Filters */}
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
            options={categories.map(category => ({
              value: category,
              label: category === 'all' ? 'جميع الفئات' : category
            }))}
            icon={<Filter className="w-5 h-5" />}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">إجمالي:</span>
            <span className="font-bold text-blue-600">{filteredServices.length}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">خطأ في تحميل الخدمات</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <Button 
                onClick={loadServices} 
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow"
            >
              {/* Service Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    {getCategoryIcon(service.category)}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{service.name}</h3>
                </div>
                {service.category && (
                  <div className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {service.category}
                  </div>
                )}
              </div>

              {/* Service Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {service.description || 'لا يوجد وصف متاح لهذه الخدمة'}
              </p>

              {/* Service Details */}
              <div className="space-y-2 mb-4">
                {service.max_amount !== undefined && service.max_amount > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">المبلغ الأقصى: {formatCurrency(service.max_amount)}</span>
                  </div>
                )}

                {service.duration_days && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">المدة: {service.duration_days} يوم</span>
                  </div>
                )}

                {service.reapplication_period_months && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      إعادة التقديم: كل {service.reapplication_period_months} شهر
                    </span>
                  </div>
                )}

                {service.is_one_time_only && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700">مرة واحدة فقط</span>
                  </div>
                )}
              </div>

              {/* Request Button */}
              <Button
                onClick={() => handleServiceRequest(service)}
                className="w-full"
                variant="outline"
                icon={<ArrowRight className="w-5 h-5 ml-1" />}
                disabled={memberData?.registration_status !== 'approved'}
              >
                طلب الخدمة
              </Button>
              
              {memberData?.registration_status !== 'approved' && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  يجب اعتماد حسابك لطلب هذه الخدمة
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات متاحة</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'لا توجد نتائج تطابق معايير البحث'
              : 'لا توجد خدمات متاحة حالياً. يرجى المحاولة لاحقاً'}
          </p>
          {(searchTerm || categoryFilter !== 'all') && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              عرض جميع الخدمات
            </Button>
          )}
        </div>
      )}

      {/* Service Request Modal */}
      {selectedService && (
        <ServiceRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          service={selectedService}
          memberData={memberData}
          onSubmit={handleRequestSubmit}
        />
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">كيفية طلب الخدمات</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>استعرض الخدمات المتاحة واختر الخدمة المناسبة لك</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>انقر على "طلب الخدمة" وأكمل نموذج الطلب</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>أرفق المستندات المطلوبة لكل خدمة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>انتظر الموافقة على الطلب وتقديم الخدمة</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">ملاحظات مهمة</h3>
          <ul className="space-y-2 text-amber-800">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>تأكد من استيفاء جميع شروط الخدمة قبل التقديم</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>يجب أن تكون جميع المستندات المرفقة واضحة وحديثة</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>يمكنك متابعة حالة طلباتك من صفحة "طلباتي"</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>تختلف مدة معالجة الطلبات حسب نوع الخدمة (3-7 أيام عمل)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServicesList;
