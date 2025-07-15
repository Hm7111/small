import React from 'react';
import { FileText, CheckCircle, Upload, Eye } from 'lucide-react';
import Button from '../../../ui/Button';

interface DocumentsTabProps {
  userData: any;
  memberData: any;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  userData,
  memberData
}) => {
  const documents = [
    {
      id: 'national_id',
      name: 'صورة الهوية الوطنية',
      status: 'uploaded',
      uploadDate: '2024-01-15'
    },
    {
      id: 'disability_card',
      name: 'صورة بطاقة الإعاقة',
      status: 'uploaded',
      uploadDate: '2024-01-15'
    },
    {
      id: 'medical_report',
      name: 'التقرير الطبي',
      status: 'pending',
      uploadDate: null
    },
    {
      id: 'income_certificate',
      name: 'شهادة الراتب',
      status: 'uploaded',
      uploadDate: '2024-01-16'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            مرفوع
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Upload className="w-3 h-3" />
            مطلوب
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-600" />
          المستندات
        </h3>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">{doc.name}</h4>
                {doc.uploadDate && (
                  <p className="text-sm text-gray-500">
                    تم الرفع في: {new Date(doc.uploadDate).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(doc.status)}
              
              {doc.status === 'uploaded' ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                >
                  عرض
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Upload className="w-4 h-4" />}
                >
                  رفع
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">ملاحظات مهمة</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• يجب أن تكون جميع المستندات واضحة ومقروءة</li>
              <li>• الحد الأقصى لحجم الملف 5 ميجابايت</li>
              <li>• الصيغ المقبولة: PDF, JPG, PNG</li>
              <li>• يتم مراجعة المستندات خلال 3-5 أيام عمل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;

