import React from 'react';
import RequestDetailsModal from '@/components/shared/modals/RequestDetailsModal';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: any;
}

const BeneficiaryRequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  if (!isOpen) return null;

  const infoContent = (
    <div className="space-y-4">
      {request ? (
        <div className="text-gray-600">
          <p>معلومات الطلب ستظهر هنا</p>
          {/* Add actual request details here */}
        </div>
      ) : (
        <p className="text-gray-500">لا توجد تفاصيل متاحة</p>
      )}
    </div>
  );

  return (
    <RequestDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      request={request}
      title="تفاصيل الطلب"
      subtitle={request ? `طلب #${request.id.slice(-6).toUpperCase()}` : ''}
      statusBadge={null}
      infoContent={infoContent}
      actionsContent={null}
    />
  );
};

export default BeneficiaryRequestDetailsModal;
