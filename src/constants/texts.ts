/**
 * ملف النصوص العربية المستخدمة في التطبيق
 */

// عام
export const APP_TEXTS = {
  APP_NAME: 'نظام خدمات المستفيدين المتكامل',
  ORGANIZATION: 'الجمعية الخيرية',
  COPYRIGHT: 'جميع الحقوق محفوظة © 2024',
  LOADING: 'جاري التحميل...',
  SEARCH: 'بحث...',
  NO_DATA: 'لا توجد بيانات',
  SAVE: 'حفظ',
  CANCEL: 'إلغاء',
  BACK: 'رجوع',
  NEXT: 'التالي',
  CLOSE: 'إغلاق',
  DELETE: 'حذف',
  EDIT: 'تعديل',
  VIEW: 'عرض',
  SUBMIT: 'إرسال',
  LOGOUT: 'تسجيل خروج',
  REFRESH: 'تحديث',
  TOTAL: 'إجمالي',
  DETAILS: 'التفاصيل'
};

// المستفيد
export const BENEFICIARY_TEXTS = {
  DASHBOARD_TITLE: 'لوحة المستفيد',
  PROFILE_TITLE: 'الملف الشخصي',
  REQUESTS_TITLE: 'طلباتي',
  SERVICES_TITLE: 'الخدمات المتاحة',
  DOCUMENTS_TITLE: 'المستندات',
  WELCOME: 'مرحباً',
  SERVICE_REQUEST: 'طلب خدمة جديدة',
  VIEW_REQUESTS: 'عرض طلباتي',
  UPDATE_PROFILE: 'تحديث بياناتي',
  MEMBERSHIP_CARD: 'بطاقة العضوية الرسمية',
  VIEW_CARD: 'عرض البطاقة الرقمية',
  NEED_HELP: 'تحتاج مساعدة؟',
  CONTACT_SUPPORT: 'تواصل مع فريق الدعم الفني'
};

// الفروع
export const BRANCH_TEXTS = {
  BRANCH_MANAGEMENT: 'إدارة الفروع',
  BRANCH_MANAGER_DASHBOARD: 'لوحة مدير الفرع',
  ADD_BRANCH: 'إضافة فرع جديد',
  BRANCH_DETAILS: 'تفاصيل الفرع',
  BRANCH_EMPLOYEES: 'موظفي الفرع',
  ACTIVE_BRANCHES: 'الفروع النشطة',
  INACTIVE_BRANCHES: 'الفروع غير النشطة',
  BRANCH_STATS: 'إحصائيات الفرع',
  REQUESTS_MANAGEMENT: 'إدارة الطلبات',
  REGISTRATIONS_MANAGEMENT: 'إدارة طلبات التسجيل'
};

// طلبات
export const REQUESTS_TEXTS = {
  REQUESTS_LIST: 'قائمة الطلبات',
  NEW_REQUESTS: 'طلبات جديدة',
  PENDING_REVIEW: 'قيد المراجعة',
  UNDER_REVIEW: 'قيد المراجعة',
  APPROVED: 'تمت الموافقة',
  REJECTED: 'مرفوض',
  NEEDS_CORRECTION: 'يحتاج تصحيح',
  REQUEST_DETAILS: 'تفاصيل الطلب',
  SUBMIT_REQUEST: 'تقديم الطلب',
  REQUEST_SUBMITTED: 'تم تقديم الطلب بنجاح',
  REQUESTED_AMOUNT: 'المبلغ المطلوب',
  APPROVED_AMOUNT: 'المبلغ المعتمد',
  REQUEST_DATE: 'تاريخ الطلب',
  REQUEST_STATUS: 'حالة الطلب',
  NO_REQUESTS: 'لا توجد طلبات'
};

// المستندات
export const DOCUMENTS_TEXTS = {
  DOCUMENTS_LIST: 'قائمة المستندات',
  UPLOAD_DOCUMENT: 'رفع مستند جديد',
  DOCUMENT_VERIFICATION: 'التحقق من المستندات',
  DOCUMENT_DETAILS: 'تفاصيل المستند',
  VERIFIED: 'تم التحقق',
  PENDING_VERIFICATION: 'قيد التحقق',
  REJECTED_DOCUMENT: 'مستند مرفوض',
  NEEDS_REPLACEMENT: 'يحتاج استبدال',
  DOCUMENT_NAME: 'اسم المستند',
  DOCUMENT_TYPE: 'نوع المستند',
  UPLOAD_DATE: 'تاريخ الرفع',
  VERIFICATION_DATE: 'تاريخ التحقق',
  VERIFICATION_NOTES: 'ملاحظات التحقق',
  NATIONAL_ID: 'صورة الهوية الوطنية',
  DISABILITY_CARD: 'بطاقة الإعاقة'
};

// الخدمات
export const SERVICES_TEXTS = {
  SERVICES_MANAGEMENT: 'إدارة الخدمات',
  AVAILABLE_SERVICES: 'الخدمات المتاحة',
  SERVICE_DETAILS: 'تفاصيل الخدمة',
  ADD_SERVICE: 'إضافة خدمة جديدة',
  EDIT_SERVICE: 'تعديل الخدمة',
  SERVICE_NAME: 'اسم الخدمة',
  SERVICE_DESCRIPTION: 'وصف الخدمة',
  SERVICE_CATEGORY: 'فئة الخدمة',
  SERVICE_REQUIREMENTS: 'متطلبات الخدمة',
  MAX_AMOUNT: 'الحد الأقصى للمبلغ',
  DURATION_DAYS: 'المدة بالأيام',
  REQUIRED_DOCUMENTS: 'المستندات المطلوبة',
  ONE_TIME_ONLY: 'خدمة تقدم مرة واحدة فقط'
};

// الإدارة
export const ADMIN_TEXTS = {
  ADMIN_DASHBOARD: 'لوحة الإدارة',
  USERS_MANAGEMENT: 'إدارة المستخدمين',
  ADD_USER: 'إضافة مستخدم جديد',
  USER_DETAILS: 'تفاصيل المستخدم',
  USER_ROLES: 'أدوار المستخدمين',
  ADMIN_ROLE: 'مدير النظام',
  BRANCH_MANAGER_ROLE: 'مدير فرع',
  EMPLOYEE_ROLE: 'موظف',
  BENEFICIARY_ROLE: 'مستفيد',
  ACTIVE_USERS: 'المستخدمين النشطين',
  INACTIVE_USERS: 'المستخدمين غير النشطين',
  SYSTEM_SETTINGS: 'إعدادات النظام'
};

// التسجيل
export const REGISTRATION_TEXTS = {
  REGISTRATION_STEPS: 'خطوات التسجيل',
  PERSONAL_INFO: 'البيانات الشخصية',
  PROFESSIONAL_INFO: 'البيانات المهنية',
  ADDRESS_INFO: 'العنوان الوطني',
  CONTACT_INFO: 'بيانات التواصل',
  BRANCH_SELECTION: 'اختيار الفرع',
  DOCUMENTS_UPLOAD: 'رفع المستندات',
  REVIEW_SUBMIT: 'المراجعة والإرسال',
  REGISTRATION_COMPLETE: 'تم إكمال التسجيل',
  REGISTRATION_PENDING: 'التسجيل قيد المراجعة',
  REGISTRATION_APPROVED: 'تم اعتماد التسجيل',
  REGISTRATION_REJECTED: 'تم رفض التسجيل'
};
