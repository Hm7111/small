import React, { useState } from 'react';
import { 
  X, Building, MapPin, Phone, User, Users,
  CheckCircle, XCircle, Calendar, Mail, FileText, Eye
} from 'lucide-react';
import Button from '../../ui/Button';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { StatusBadge } from '../../../shared';

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: any;
}

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  isOpen,
  onClose,
  branch
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'employees' | 'stats'>('info');
  
  console.log("Branch details modal rendered:", { isOpen, branch });

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{branch.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-green-200" />
                    <span className="text-green-100">{branch.city}</span>
                    <span className="mx-2 text-green-200">•</span>
                    {branch.is_active ? (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">نشط</div>
                    ) : (
                      <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">غير نشط</div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${activeTab === 'info' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              معلومات الفرع
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${activeTab === 'employees' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              الموظفون
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors
                ${activeTab === 'stats' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              الإحصائيات
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    المعلومات الأساسية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-green-800 font-medium">اسم الفرع</p>
                          <p className="text-base text-gray-900">{branch.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-green-800 font-medium">المدينة</p>
                          <p className="text-base text-gray-900">{branch.city}</p>
                        </div>
                      </div>
                      
                      {branch.address && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-green-800 font-medium">العنوان</p>
                            <p className="text-base text-gray-900">{branch.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {branch.phone && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-green-800 font-medium">رقم الهاتف</p>
                            <p className="text-base text-gray-900">{branch.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-green-800 font-medium">مدير الفرع</p>
                          <p className="text-base text-gray-900">{branch.manager_name || 'غير معين'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-green-800 font-medium">تاريخ الإنشاء</p>
                          <p className="text-base text-gray-900">{formatGregorianDate(branch.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    حالة الفرع
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                      <div className="mb-2">
                        {branch.is_active ? (
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 font-medium">حالة الفرع</p>
                      <p className={`text-base font-bold ${branch.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {branch.is_active ? 'نشط' : 'غير نشط'}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {branch.employees_count || 0}
                      </div>
                      <p className="text-sm text-gray-700">عدد الموظفين</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {branch.members_count || 0}
                      </div>
                      <p className="text-sm text-gray-700">عدد المستفيدين</p>
                    </div>
                  </div>
                </div>
                
                {/* Last Update */}
                {branch.updated_at && (
                  <div className="text-right text-sm text-gray-500">
                    آخر تحديث: {formatGregorianDate(branch.updated_at, true)}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'employees' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">موظفو الفرع</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* مدير الفرع */}
                  {branch.manager_name && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{branch.manager_name}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge status="warning" text="مدير الفرع" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* الموظفون - هنا يمكن عرض بيانات افتراضية لأغراض العرض */}
                  {[
                    { id: 'e1', name: 'أحمد محمد', role: 'employee', status: 'active' },
                    { id: 'e2', name: 'فاطمة علي', role: 'employee', status: 'active' },
                    { id: 'e3', name: 'محمد خالد', role: 'employee', status: 'inactive' }
                  ].map(employee => (
                    <div key={employee.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{employee.name}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge status="info" text="موظف" />
                            {employee.status === 'active' ? (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                نشط
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                غير نشط
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {branch.employees_count === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا يوجد موظفين في هذا الفرع</p>
                    <Button 
                      variant="outline" 
                      className="mt-3" 
                      size="sm"
                      onClick={() => alert('إضافة موظفين من خلال قسم إدارة المستخدمين')}
                    >
                      إضافة موظفين
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الفرع</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* إحصائيات المستفيدين */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
                    <h4 className="text-base font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      المستفيدون
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">إجمالي المستفيدين</span>
                        <span className="text-lg font-bold text-purple-700">{branch.members_count || 0}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">المستفيدين المعتمدين</span>
                        <span className="text-base font-medium text-green-600">{Math.round((branch.members_count || 0) * 0.8)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">تحت المراجعة</span>
                        <span className="text-base font-medium text-amber-600">{Math.round((branch.members_count || 0) * 0.2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* إحصائيات الطلبات */}
                  <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-5">
                    <h4 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      الطلبات
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">إجمالي الطلبات الشهرية</span>
                        <span className="text-lg font-bold text-blue-700">{Math.round((branch.members_count || 0) * 1.5)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">طلبات تمت الموافقة عليها</span>
                        <span className="text-base font-medium text-green-600">{Math.round((branch.members_count || 0) * 1.1)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">طلبات قيد المعالجة</span>
                        <span className="text-base font-medium text-amber-600">{Math.round((branch.members_count || 0) * 0.4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chart placeholder */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">تطور عدد المستفيدين</h4>
                  <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">سيتم إضافة الرسوم البيانية قريباً</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetailsModal;
