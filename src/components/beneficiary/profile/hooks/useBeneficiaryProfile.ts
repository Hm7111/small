import { useState, useEffect } from 'react';

interface BeneficiaryProfileData {
  // Personal Info
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: string;
  disabilityType: string;
  disabilityDetails: string;
  disabilityCardNumber: string;
  // Professional Info
  educationLevel: string;
  employmentStatus: string;
  jobTitle: string;
  employer: string;
  monthlyIncome: string;
  // Address Info
  buildingNumber: string;
  streetName: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
  address: string;
  // Contact Info
  phone: string;
  alternativePhone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

interface UseBeneficiaryProfileReturn {
  formData: BeneficiaryProfileData;
  editMode: boolean;
  isSaving: boolean;
  isLoading: boolean;
  errors: Record<string, string>;
  setEditMode: (mode: boolean) => void;
  handleInputChange: (field: string, value: any) => void;
  handleSaveChanges: () => Promise<void>;
}

export const useBeneficiaryProfile = (
  memberData: any,
  activeSubTab: string
): UseBeneficiaryProfileReturn => {
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BeneficiaryProfileData>({
    // Personal Info
    fullName: '',
    gender: 'male',
    birthDate: '',
    age: '',
    disabilityType: '',
    disabilityDetails: '',
    disabilityCardNumber: '',
    // Professional Info
    educationLevel: '',
    employmentStatus: '',
    jobTitle: '',
    employer: '',
    monthlyIncome: '',
    // Address Info
    buildingNumber: '',
    streetName: '',
    district: '',
    city: '',
    postalCode: '',
    additionalNumber: '',
    address: '',
    // Contact Info
    phone: '',
    alternativePhone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  // Update form data when memberData changes
  useEffect(() => {
    if (memberData) {
      setFormData({
        // Personal Info
        fullName: memberData.full_name || '',
        gender: memberData.gender || 'male',
        birthDate: memberData.birth_date || '',
        age: memberData.age || '',
        disabilityType: memberData.disability_type || '',
        disabilityDetails: memberData.disability_details || '',
        disabilityCardNumber: memberData.disability_card_number || '',
        // Professional Info
        educationLevel: memberData.education_level || '',
        employmentStatus: memberData.employment_status || '',
        jobTitle: memberData.job_title || '',
        employer: memberData.employer || '',
        monthlyIncome: memberData.monthly_income || '',
        // Address Info
        buildingNumber: memberData.building_number || '',
        streetName: memberData.street_name || '',
        district: memberData.district || '',
        city: memberData.city || '',
        postalCode: memberData.postal_code || '',
        additionalNumber: memberData.additional_number || '',
        address: memberData.address || '',
        // Contact Info
        phone: memberData.phone || '',
        alternativePhone: memberData.alternative_phone || '',
        email: memberData.email || '',
        emergencyContactName: memberData.emergency_contact_name || '',
        emergencyContactPhone: memberData.emergency_contact_phone || '',
        emergencyContactRelation: memberData.emergency_contact_relation || ''
      });
    }
  }, [memberData]);

  // Load additional data when tab changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // In a real app, you might load additional data from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    loadData();
  }, [activeSubTab]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // In a real app, save changes to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('تم حفظ التغييرات بنجاح');
      setEditMode(false);
    } catch (error) {
      alert('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    editMode,
    isSaving,
    isLoading,
    errors,
    setEditMode,
    handleInputChange,
    handleSaveChanges
  };
};

