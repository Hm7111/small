import React, { useState } from 'react';
import { 
  X, BarChart3, PieChart, TrendingUp, Download, 
  Calendar, Users, FileText, Clock, CheckCircle, 
  Building, RefreshCw
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { formatGregorianDate } from '../../../../shared/utils/dateHelpers';

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id: string;
    title: string;
    type: string;
    generatedAt: string;
    data: any;
  };
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !report) return null;

  const handleDownload = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('تم تنزيل التقرير بنجاح');
    }, 1500);
  };

  const getReportIcon = () => {
    switch (report.type) {
      case 'users': return <Users className="w-6 h-6" />;
      case 'branches': return <Building className="w-6 h-6" />;
      case 'services': return <FileText className="w-6 h-6" />;
      case 'performance': return <TrendingUp className="w-6 h-6" />;
      default: return <BarChart3 className="w-6 h-6" />;
    }
  };

  // تنسيق البيانات حسب نوع التقرير
  const renderReportData = () => {
    if (!report.data) return <p>لا توجد بيانات متاحة</p>;

    switch (report.type) {
      case 'users':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-3">إحصائيات المستخدمين</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h4 className="text-base font-medium text-blue-900 mb-4">توزيع الأدوار</h4>
                <div className="space-y-3">
                  {report.data.roleDistribution.map((item: any) => (
                    <div key={item.role} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.count}</span>
                        <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="text-base font-medium text-green-900 mb-4">نشاط المستخدمين</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">مستخدمين نشطين</span>
                    <span className="font-bold text-green-700">{report.data.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">مستخدمين غير نشطين</span>
                    <span className="font-bold text-red-600">{report.data.inactiveUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">مستخدمين جدد (آخر 30 يوم)</span>
                    <span className="font-bold text-blue-600">{report.data.newUsers}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <h4 className="text-base font-medium text-purple-900 mb-4">نسبة اكتمال الملفات</h4>
              <div className="flex items-center justify-center gap-4">
                <div className="w-32 h-32 rounded-full border-8 border-purple-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">{report.data.completionRate}%</div>
                    <div className="text-xs text-purple-600">اكتمال الملفات</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">مكتمل ({report.data.completeProfiles})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">جزئي ({report.data.partialProfiles})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">غير مكتمل ({report.data.incompleteProfiles})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'branches':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-3">إحصائيات الفروع</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-right">الفرع</th>
                    <th className="py-2 px-4 border-b text-center">الموظفين</th>
                    <th className="py-2 px-4 border-b text-center">المستفيدين</th>
                    <th className="py-2 px-4 border-b text-center">الطلبات النشطة</th>
                    <th className="py-2 px-4 border-b text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.branches.map((branch: any) => (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{branch.name}</td>
                      <td className="py-2 px-4 border-b text-center">{branch.employeesCount}</td>
                      <td className="py-2 px-4 border-b text-center">{branch.membersCount}</td>
                      <td className="py-2 px-4 border-b text-center">{branch.activeRequests}</td>
                      <td className="py-2 px-4 border-b text-center">
                        {branch.isActive ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">نشط</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">غير نشط</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h4 className="text-base font-medium text-blue-900 mb-4">توزيع المستفيدين حسب الفرع</h4>
                <div className="space-y-3">
                  {report.data.branches.map((branch: any) => (
                    <div key={`mem-${branch.id}`} className="flex items-center justify-between">
                      <span className="text-sm">{branch.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{branch.membersCount}</span>
                        <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${branch.memberPercentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="text-base font-medium text-green-900 mb-4">معدل إنجاز الطلبات</h4>
                <div className="space-y-3">
                  {report.data.branches.map((branch: any) => (
                    <div key={`req-${branch.id}`} className="flex items-center justify-between">
                      <span className="text-sm">{branch.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{branch.completionRate}%</span>
                        <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600" style={{ width: `${branch.completionRate}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'services':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-3">إحصائيات الخدمات</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
              <h4 className="text-base font-medium text-blue-900 mb-4">أكثر الخدمات طلباً</h4>
              <div className="space-y-3">
                {report.data.topServices.map((service: any) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{service.requestCount}</span>
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${service.percentage}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{service.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h4 className="text-base font-medium text-amber-900 mb-4">توزيع الخدمات حسب الفئة</h4>
                <div className="space-y-3">
                  {report.data.categoryDistribution.map((category: any) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{category.count}</span>
                        <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-600" style={{ width: `${category.percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="text-base font-medium text-green-900 mb-4">نسب الموافقة على الطلبات</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{report.data.approvalRate}%</div>
                    <div className="text-xs text-gray-500">نسبة الموافقة</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{report.data.rejectionRate}%</div>
                    <div className="text-xs text-gray-500">نسبة الرفض</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{report.data.averageProcessingDays} يوم</div>
                    <div className="text-xs text-gray-500">متوسط وقت المعالجة</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{report.data.pendingRequests}</div>
                    <div className="text-xs text-gray-500">طلبات معلقة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'performance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-3">مؤشرات الأداء</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <h4 className="text-base font-medium text-blue-900 mb-2">متوسط زمن المعالجة</h4>
                <div className="text-3xl font-bold text-blue-700">{report.data.averageResponseTime} يوم</div>
                <p className="text-sm text-blue-600 mt-2">{report.data.responseTimeChange}% عن الشهر السابق</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <h4 className="text-base font-medium text-green-900 mb-2">معدل الإنجاز</h4>
                <div className="text-3xl font-bold text-green-700">{report.data.completionRate}%</div>
                <p className="text-sm text-green-600 mt-2">{report.data.completionRateChange}% عن الشهر السابق</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
                <h4 className="text-base font-medium text-purple-900 mb-2">رضا المستفيدين</h4>
                <div className="text-3xl font-bold text-purple-700">{report.data.satisfactionRate}/5</div>
                <p className="text-sm text-purple-600 mt-2">{report.data.satisfactionRateChange}% عن الشهر السابق</p>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h4 className="text-base font-medium text-gray-900 mb-4">تحليل الأداء الشهري</h4>
              <div className="h-60 bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">سيتم إضافة الرسوم البيانية قريباً</p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h4 className="text-base font-medium text-amber-900 mb-4">تحليل الفعالية</h4>
              <div className="space-y-3">
                {report.data.performanceMetrics.map((metric: any) => (
                  <div key={metric.name} className="flex items-center justify-between">
                    <span className="text-sm">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{metric.value}%</span>
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${metric.status === 'good' ? 'bg-green-600' : metric.status === 'warning' ? 'bg-amber-600' : 'bg-red-600'}`} 
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${metric.status === 'good' ? 'text-green-600' : metric.status === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-6">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد بيانات متاحة لهذا التقرير</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  {getReportIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{report.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-indigo-200" />
                    <span className="text-sm text-indigo-100">
                      {formatGregorianDate(report.generatedAt || new Date().toISOString(), true)}
                    </span>
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
          
          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-150px)]">
            {renderReportData()}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              <Calendar className="w-4 h-4 inline mr-1" />
              تم إنشاء التقرير: {formatGregorianDate(report.generatedAt || new Date().toISOString())}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                إغلاق
              </Button>
              <Button
                onClick={handleDownload}
                isLoading={isLoading}
                icon={<Download className="w-5 h-5 ml-2" />}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                تنزيل التقرير
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;
