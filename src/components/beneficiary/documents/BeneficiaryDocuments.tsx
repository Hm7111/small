import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Eye, Download, AlertTriangle, CheckCircle, 
  X, Clock, Plus, Search, Filter
} from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface DocumentInfo {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'needs_replacement';
  is_required: boolean;
  uploaded_at: string;
  verification_notes?: string;
}

interface BeneficiaryDocumentsProps {
  memberData: any;
}

const BeneficiaryDocuments: React.FC<BeneficiaryDocumentsProps> = ({ memberData }) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberData?.id) {
      loadDocuments();
    }
  }, [memberData?.id]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/member-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId: memberData.id })
      });

      if (!response.ok) {
        throw new Error(`فشل في جلب المستندات: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDocuments(result.documents || []);
      } else {
        throw new Error(result.error || 'فشل في تحميل المستندات');
      }
    } catch (err) {
      console.error('خطأ في تحميل المستندات:', err);
      setError('فشل في تحميل المستندات');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <StatusBadge status="success" text="تم التحقق" />;
      case 'pending':
        return <StatusBadge status="pending" text="قيد المراجعة" />;
      case 'rejected':
        return <StatusBadge status="error" text="مرفوض" />;
      case 'needs_replacement':
        return <StatusBadge status="warning" text="يحتاج استبدال" />;
      default:
        return <StatusBadge status="info" text={status} />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
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
            <FileText className="w-8 h-8 text-blue-600" />
            مستنداتي
          </h2>
          <p className="text-gray-600 mt-2">
            إدارة ومتابعة حالة المستندات المرفوعة
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="البحث في المستندات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'جميع الحالات' },
              { value: 'pending', label: 'قيد المراجعة' },
              { value: 'verified', label: 'تم التحقق' },
              { value: 'rejected', label: 'مرفوض' },
              { value: 'needs_replacement', label: 'يحتاج استبدال' }
            ]}
            icon={<Filter className="w-5 h-5" />}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">إجمالي:</span>
            <span className="font-bold text-blue-600">{filteredDocuments.length}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">خطأ في تحميل المستندات</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <Button 
                onClick={loadDocuments} 
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">قائمة المستندات</h3>
        
        {filteredDocuments.length > 0 ? (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div 
                key={document.id} 
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      document.verification_status === 'verified' ? 'bg-green-100 text-green-600' :
                      document.verification_status === 'rejected' ? 'bg-red-100 text-red-600' :
                      document.verification_status === 'needs_replacement' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{document.file_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatGregorianDate(document.uploaded_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      {getStatusBadge(document.verification_status)}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => window.open(document.file_path, '_blank')}
                    >
                      عرض
                    </Button>
                  </div>
                </div>
                
                {document.verification_notes && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>ملاحظات:</strong> {document.verification_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستندات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'لا توجد نتائج تطابق معايير البحث'
                : 'لم يتم رفع أي مستندات حتى الآن'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">رفع مستندات جديدة</h3>
            <p className="text-blue-700 mb-4">
              يمكنك رفع المستندات المطلوبة من خلال صفحة التسجيل أو عن طريق التواصل مع الفرع
            </p>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              icon={<Plus className="w-5 h-5 ml-2" />}
              onClick={() => window.location.href = '/beneficiary?tab=registration'}
            >
              إضافة مستندات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDocuments;
