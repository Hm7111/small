import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ServiceRequest {
  id: string;
  serviceName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  requestDate: string;
  requestedAmount?: number;
  approvedAmount?: number;
  notes?: string;
}

const BeneficiaryServiceRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // Placeholder data for now
      const mockRequests: ServiceRequest[] = [
        {
          id: '1',
          serviceName: 'المساعدة المالية',
          status: 'pending',
          requestDate: '2024-01-15',
          requestedAmount: 5000
        },
        {
          id: '2',
          serviceName: 'الدعم التقني',
          status: 'approved',
          requestDate: '2024-01-10',
          approvedAmount: 3000
        }
      ];
      setRequests(mockRequests);
    } catch (err) {
      setError('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'مُوافق عليه';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">طلبات الخدمات</h3>
          <p className="text-sm text-gray-600 mt-1">
            متابعة حالة طلبات الخدمات المقدمة
          </p>
        </div>
        
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد طلبات خدمات حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      {getStatusIcon(request.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {request.serviceName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          تاريخ الطلب: {new Date(request.requestDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      {request.requestedAmount && (
                        <p className="text-sm text-gray-600 mt-1">
                          المبلغ المطلوب: {request.requestedAmount.toLocaleString()} ريال
                        </p>
                      )}
                      {request.approvedAmount && (
                        <p className="text-sm text-green-600 mt-1">
                          المبلغ المُوافق عليه: {request.approvedAmount.toLocaleString()} ريال
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {request.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{request.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryServiceRequests;
