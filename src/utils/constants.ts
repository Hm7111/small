// ثوابت النظام

export const APP_CONFIG = {
  NAME: 'نظام خدمات المستفيدين المتكامل',
  ORGANIZATION: 'الجمعية الخيرية',
  VERSION: '1.0.0',
  COPYRIGHT: 'جميع الحقوق محفوظة © 2024'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  EMPLOYEE: '/employee',
  BRANCH_MANAGER: '/branch',
  BENEFICIARY: '/beneficiary'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  BRANCH_MANAGER: 'branch_manager',
  EMPLOYEE: 'employee',
  BENEFICIARY: 'beneficiary'
} as const;

export const REGISTRATION_STATUS = {
  PROFILE_INCOMPLETE: 'profile_incomplete',
  PENDING_DOCUMENTS: 'pending_documents', 
  PENDING_REVIEW: 'pending_review',
  UNDER_EMPLOYEE_REVIEW: 'under_employee_review',
  UNDER_MANAGER_REVIEW: 'under_manager_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NEEDS_CORRECTION: 'needs_correction'
} as const;

export const REGISTRATION_STATUS_LABELS = {
  [REGISTRATION_STATUS.PROFILE_INCOMPLETE]: 'بيانات ناقصة',
  [REGISTRATION_STATUS.PENDING_DOCUMENTS]: 'مطلوب مستندات', 
  [REGISTRATION_STATUS.PENDING_REVIEW]: 'قيد المراجعة الأولية',
  [REGISTRATION_STATUS.UNDER_EMPLOYEE_REVIEW]: 'قيد مراجعة الموظف',
  [REGISTRATION_STATUS.UNDER_MANAGER_REVIEW]: 'قيد مراجعة المدير',
  [REGISTRATION_STATUS.APPROVED]: 'مُعتمد',
  [REGISTRATION_STATUS.REJECTED]: 'مرفوض',
  [REGISTRATION_STATUS.NEEDS_CORRECTION]: 'يحتاج تصحيح'
};

export const FORM_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  NATIONAL_ID_LENGTH: 10,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 10,
  POSTAL_CODE_LENGTH: 5,
  BUILDING_NUMBER_LENGTH: 4,
  MIN_AGE: 18,
  MAX_AGE: 120,
  OTP_LENGTH: 4,
  PASSWORD_MIN_LENGTH: 6
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
};

export const COLORS = {
  PRIMARY: 'blue',
  SUCCESS: 'green',
  WARNING: 'amber',
  ERROR: 'red',
  INFO: 'blue'
};

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

export const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

export const API_ENDPOINTS = {
  SEND_OTP: '/functions/v1/send-otp',
  VERIFY_OTP: '/functions/v1/verify-otp', 
  SEND_EXISTING_USER_OTP: '/functions/v1/send-existing-user-otp',
  VERIFY_EXISTING_USER_OTP: '/functions/v1/verify-existing-user-otp',
  GET_USER_BY_NATIONAL_ID: '/functions/v1/get-user-by-national-id',
  ADMIN_LOGIN: '/functions/v1/admin-login',
  LOAD_REGISTRATION_DATA: '/functions/v1/load-registration-data',
  SAVE_REGISTRATION_DRAFT: '/functions/v1/save-registration-draft',
  SUBMIT_REGISTRATION: '/functions/v1/submit-registration'
};

export const VALIDATION_PATTERNS = {
  SAUDI_NATIONAL_ID: /^[0-9]{10}$/,
  SAUDI_PHONE: /^((\+966)|0)?5[0-9]{8}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSTAL_CODE: /^[0-9]{5}$/,
  BUILDING_NUMBER: /^[0-9]{4}$/,
  NUMBERS_ONLY: /^[0-9]+$/,
  ARABIC_TEXT: /^[\u0600-\u06FF\s]+$/
};
