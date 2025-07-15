import React from 'react';
import { FileText, Edit, Trash2, DollarSign, Calendar, User, CheckCircle, XCircle, Clock, Eye, Ban, Tag, CreditCard, Package, Heart, Briefcase, GraduationCap } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { Service } from '../../../services/AdminService';
import Button from '../../ui/Button';

interface ServiceCardProps {
  service: Service;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
  onEdit: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onToggleStatus,
  onDelete,
  onView,
  onEdit
}) => {
  // الحصول على أيقونة مناسبة لفئة الخدمة
  const getCategoryIcon = () => {
    switch (service.category) {
      case 'مساعدات مالية': return <CreditCard className="w-6 h-6" />;
      case 'مساعدات عينية': return <Package className="w-6 h-6" />;
      case 'رعاية اجتماعية': return <Heart className="w-6 h-6" />;
      case 'تطوير مهارات': return <Briefcase className="w-6 h-6" />;
      case 'الرعاية الصحية': return <Heart className="w-6 h-6" />;
      case 'المساعدات التعليمية': return <GraduationCap className="w-6 h-6" />;
      default: return <Tag className="w-6 h-6" />;
    }
  };
  
  // الحصول على لون خلفية مناسب لفئة الخدمة
  const getCategoryColor = () => {
    switch (service.category) {
      case 'مساعدات مالية': return 'bg-blue-100 text-blue-600';
      case 'مساعدات عينية': return 'bg-green-100 text-green-600';
      case 'رعاية اجتماعية': return 'bg-red-100 text-red-600';
      case 'تطوير مهارات': return 'bg-purple-100 text-purple-600';
      case 'الرعاية الصحية': return 'bg-pink-100 text-pink-600';
      case 'المساعدات التعليمية': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300">
      {/* رأس الخدمة */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
            service.is_active ? getCategoryColor() : 'bg-gray-100 text-gray-600'
          }`}>
            {getCategoryIcon()}
          </div>
          <div className="flex-1 min-w-0 mt-1">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{service.name}</h3>
            {service.category && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Tag className="w-3 h-3" />
                <span className="dark:text-gray-400">{service.category}</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onToggleStatus(service.id, service.is_active)}
          title={service.is_active ? "إيقاف الخدمة" : "تفعيل الخدمة"}
          className={`p-2 rounded-lg ${service.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
        >
          {service.is_active ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </button>
      </div>

      {/* وصف الخدمة */}
      {service.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {service.description}
        </p>
      )}
      
      {/* مدة إعادة التقديم */}
      {(service.is_one_time_only || service.reapplication_period_months) && (
        <div className="mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-amber-800 dark:text-amber-300 font-medium">
              {service.is_one_time_only 
                ? 'متاح مرة واحدة فقط' 
                : `متاح كل ${service.reapplication_period_months} شهر`}
            </span>
          </div>
        </div>
      )}

      {/* متطلبات الخدمة */}
      {service.requirements && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">المتطلبات:</h4>
          <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 max-h-20 overflow-y-auto">
            {service.requirements.split('\n').map((line, index) => (
              <p key={index} className="mb-1 last:mb-0">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* تفاصيل الخدمة */}
      <div className="space-y-2 mb-4">
        {service.max_amount && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-600 dark:text-gray-400">الحد الأقصى:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(service.max_amount)}
            </span>
          </div>
        )}

        {service.duration_days && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-400">المدة:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {service.duration_days} يوم
            </span>
          </div>
        )}

        {service.creator_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-600 dark:text-gray-400">المنشئ:</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {service.creator_name}
            </span>
          </div>
        )}
      </div>

      {/* إحصائيات */}
      <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">الطلبات:</span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 dark:text-white">{service.requests_count || 0}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">طلب</span>
          </div>
        </div>
      </div>

      {/* الإجراءات */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={() => onEdit(service)}
          variant="outline"
          size="sm"
          className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          icon={<Edit className="w-4 h-4 ml-1" />}
        >
          تعديل
        </Button>
        
        <Button
          onClick={() => onDelete(service)}
          variant="outline" 
          size="sm"
          className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/20"
          icon={<Trash2 className="w-4 h-4 ml-1" />}
        >
          حذف
        </Button>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onView(service);
            console.log("View service details:", service.id, service.name);
          }}
          variant="outline"
          size="sm"
          className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 col-span-2"
          icon={<Eye className="w-4 h-4 ml-1" />}
        >
          عرض التفاصيل
        </Button>
      </div>

      {/* تاريخ الإنشاء */}
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        تم الإنشاء في {formatGregorianDate(service.created_at)}
      </div>
    </div>
  );
};

export default ServiceCard;
