import React from 'react';
import { 
  User, Phone, MapPin, 
  Briefcase, FileText, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useBeneficiaryProfile } from './profile/hooks/useBeneficiaryProfile';
import {
  PersonalInfoTab,
  ProfessionalInfoTab,
  AddressInfoTab,
  ContactInfoTab,
  DocumentsTab
} from './profile/tabs';

interface BeneficiaryProfileProps {
  userData: any;
  memberData: any;
  activeSubTab: 'personal' | 'professional' | 'address' | 'contact' | 'documents';
  onChangeSubTab: (subTab: 'personal' | 'professional' | 'address' | 'contact' | 'documents') => void;
}

const BeneficiaryProfile: React.FC<BeneficiaryProfileProps> = ({
  userData,
  memberData,
  activeSubTab,
  onChangeSubTab
}) => {
  const {
    formData,
    editMode,
    isSaving,
    isLoading,
    errors,
    setEditMode,
    handleInputChange,
    handleSaveChanges
  } = useBeneficiaryProfile(memberData, activeSubTab);

  const tabItems = [
    { id: 'personal', label: 'البيانات الشخصية', icon: <User className="w-5 h-5" /> },
    { id: 'professional', label: 'البيانات المهنية', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'address', label: 'العنوان', icon: <MapPin className="w-5 h-5" /> },
    { id: 'contact', label: 'بيانات التواصل', icon: <Phone className="w-5 h-5" /> },
    { id: 'documents', label: 'المستندات', icon: <FileText className="w-5 h-5" /> }
  ];

  const currentTabIndex = tabItems.findIndex(tab => tab.id === activeSubTab);
  const canGoNext = currentTabIndex < tabItems.length - 1;
  const canGoPrev = currentTabIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      onChangeSubTab(tabItems[currentTabIndex + 1].id as any);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      onChangeSubTab(tabItems[currentTabIndex - 1].id as any);
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      editMode,
      isSaving,
      onEditModeChange: setEditMode,
      onInputChange: handleInputChange,
      onSaveChanges: handleSaveChanges
    };

    switch (activeSubTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            formData={{
              fullName: formData.fullName,
              gender: formData.gender,
              birthDate: formData.birthDate,
              age: formData.age,
              disabilityType: formData.disabilityType,
              disabilityDetails: formData.disabilityDetails,
              disabilityCardNumber: formData.disabilityCardNumber
            }}
            {...commonProps}
          />
        );
      case 'professional':
        return (
          <ProfessionalInfoTab
            formData={{
              educationLevel: formData.educationLevel,
              employmentStatus: formData.employmentStatus,
              jobTitle: formData.jobTitle,
              employer: formData.employer,
              monthlyIncome: formData.monthlyIncome
            }}
            {...commonProps}
          />
        );
      case 'address':
        return (
          <AddressInfoTab
            formData={{
              buildingNumber: formData.buildingNumber,
              streetName: formData.streetName,
              district: formData.district,
              city: formData.city,
              postalCode: formData.postalCode,
              additionalNumber: formData.additionalNumber,
              address: formData.address
            }}
            {...commonProps}
          />
        );
      case 'contact':
        return (
          <ContactInfoTab
            formData={{
              phone: formData.phone,
              alternativePhone: formData.alternativePhone,
              email: formData.email,
              emergencyContactName: formData.emergencyContactName,
              emergencyContactPhone: formData.emergencyContactPhone,
              emergencyContactRelation: formData.emergencyContactRelation
            }}
            {...commonProps}
          />
        );
      case 'documents':
        return <DocumentsTab userData={userData} memberData={memberData} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap gap-2">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            canGoPrev
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </button>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BeneficiaryProfile;

