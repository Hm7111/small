import { DisabilityType, EducationLevel, EmploymentStatus } from '../types/registration';

export const disabilityTypes: Record<DisabilityType, string> = {
  deaf: 'أصم',
  hearing_impaired: 'ضعيف سمع',
  hearing_loss: 'فاقد سمع',
  visual_impaired: 'ضعيف بصر',
  blind: 'فاقد بصر',
  mobility_impaired: 'إعاقة حركية',
  intellectual_disability: 'إعاقة ذهنية',
  multiple_disabilities: 'إعاقات متعددة',
  other: 'أخرى'
};

export const educationLevels: Record<EducationLevel, string> = {
  no_education: 'بدون تعليم',
  primary: 'ابتدائي',
  intermediate: 'متوسط',
  secondary: 'ثانوي',
  diploma: 'دبلوم',
  bachelor: 'بكالوريوس',
  master: 'ماجستير',
  phd: 'دكتوراه'
};

export const employmentStatuses: Record<EmploymentStatus, string> = {
  unemployed: 'عاطل عن العمل',
  employed: 'موظف',
  retired: 'متقاعد',
  student: 'طالب',
  disabled_unable_work: 'غير قادر على العمل بسبب الإعاقة'
};

export const emergencyContactRelations = [
  'أب',
  'أم',
  'زوج/زوجة',
  'ابن/ابنة',
  'أخ/أخت',
  'جد/جدة',
  'عم/خال',
  'عمة/خالة',
  'صديق',
  'آخر'
];

export const saudiCities = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الطائف',
  'بريدة',
  'حائل',
  'خميس مشيط',
  'المجمعة',
  'حفر الباطن',
  'الجبيل',
  'ينبع',
  'القطيف',
  'تبوك',
  'نجران',
  'عرعر',
  'الباحة',
  'جيزان',
  'أبها',
  'القنفذة',
  'وادي الدواسر',
  'الأحساء',
  'القصيم',
  'عسير',
  'الحدود الشمالية'
];

// دالة لحساب العمر من تاريخ الميلاد
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// دالة للتحقق من صحة رقم الهوية الوطنية السعودية
export const validateSaudiNationalId = (nationalId: string): boolean => {
  if (!/^\d{10}$/.test(nationalId)) return false;
  
  const digits = nationalId.split('').map(Number);
  const checksum = digits.pop()!;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (i % 2 === 0) {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digits[i];
    }
  }
  
  return (10 - (sum % 10)) % 10 === checksum;
};

// دالة للتحقق من صحة الرمز البريدي السعودي
export const validateSaudiPostalCode = (postalCode: string): boolean => {
  return /^\d{5}$/.test(postalCode);
};

// دالة للتحقق من صحة رقم المبنى
export const validateBuildingNumber = (buildingNumber: string): boolean => {
  return /^\d{4}$/.test(buildingNumber);
};

// دالة للتحقق من صحة رقم الجوال السعودي
export const validateSaudiPhoneNumber = (phone: string): boolean => {
  return /^((\+966)|0)?5[0-9]{8}$/.test(phone.replace(/\s|-/g, ''));
};

// دالة لتنسيق رقم الجوال
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return `+966${cleaned}`;
  }
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `+966${cleaned.substring(1)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('966')) {
    return `+${cleaned}`;
  }
  return phone;
};
