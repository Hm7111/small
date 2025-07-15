export interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  icon: string;
}

export interface PersonalInfo {
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female';
  disabilityType: DisabilityType;
  disabilityDetails: string;
  disabilityCardNumber: string;
}

export interface ProfessionalInfo {
  educationLevel: EducationLevel;
  employmentStatus: EmploymentStatus;
  jobTitle?: string;
  employer?: string;
  monthlyIncome?: number;
}

export interface AddressInfo {
  buildingNumber: string;
  streetName: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
  address?: string; // العنوان الوصفي
}

export interface ContactInfo {
  phone: string;
  alternativePhone?: string;
  email?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export interface BranchSelection {
  preferredBranchId: string;
  branchName?: string;
}

export interface DocumentUpload {
  nationalIdDocument?: File;
  disabilityCardDocument?: File;
  otherDocuments?: File[];
}

export interface RegistrationData {
  personalInfo: Partial<PersonalInfo>;
  professionalInfo: Partial<ProfessionalInfo>;
  addressInfo: Partial<AddressInfo>;
  contactInfo: Partial<ContactInfo>;
  branchSelection: Partial<BranchSelection>;
  documentUpload: Partial<DocumentUpload>;
}

export type DisabilityType = 
  | 'deaf' 
  | 'hearing_impaired' 
  | 'hearing_loss'
  | 'visual_impaired'
  | 'blind'
  | 'mobility_impaired'
  | 'intellectual_disability'
  | 'multiple_disabilities'
  | 'other';

export type EducationLevel = 
  | 'no_education'
  | 'primary'
  | 'intermediate'
  | 'secondary'
  | 'diploma'
  | 'bachelor'
  | 'master'
  | 'phd';

export type EmploymentStatus = 
  | 'unemployed'
  | 'employed'
  | 'retired'
  | 'student'
  | 'disabled_unable_work';

export type RegistrationStatus = 
  | 'profile_incomplete'
  | 'pending_documents'
  | 'pending_review'
  | 'under_employee_review'
  | 'under_manager_review'
  | 'approved'
  | 'rejected'
  | 'needs_correction';

export interface RegistrationStepComponent {
  stepNumber: number;
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdateData: (stepData: Partial<RegistrationData>) => void;
}
