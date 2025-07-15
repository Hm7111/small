// ملف موحد لأدوات التحقق من الصحة
import { ValidationResult } from '@/utils/types';

// ================ المنطق المشترك ================
const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} مطلوب` };
  }
  return { isValid: true };
};

const validateLength = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
  if (value.length < min) {
    return { isValid: false, error: `${fieldName} يجب أن يكون ${min} أحرف على الأقل` };
  }
  if (value.length > max) {
    return { isValid: false, error: `${fieldName} يجب أن يكون أقل من ${max} أحرف` };
  }
  return { isValid: true };
};

// ================ تحقق الفروع ================
export const validateBranchName = (name: string): ValidationResult => {
  const required = validateRequired(name, 'اسم الفرع');
  if (!required.isValid) return required;
  
  return validateLength(name, 3, 50, 'اسم الفرع');
};

export const validateBranchCode = (code: string): ValidationResult => {
  if (!/^\d{4}$/.test(code)) {
    return { isValid: false, error: 'كود الفرع يجب أن يكون 4 أرقام' };
  }
  return { isValid: true };
};

// ================ تحقق الموظفين ================
export const validateEmployeeId = (id: string): ValidationResult => {
  if (!/^\d{6}$/.test(id)) {
    return { isValid: false, error: 'رقم الموظف يجب أن يكون 6 أرقام' };
  }
  return { isValid: true };
};

export const validateEmployeePosition = (position: string): ValidationResult => {
  const required = validateRequired(position, 'المنصب');
  if (!required.isValid) return required;
  
  return validateLength(position, 3, 30, 'المنصب');
};

// ================ تحقق المستفيدين ================
export const validateBeneficiaryNationalId = (id: string): ValidationResult => {
  if (!/^\d{10}$/.test(id)) {
    return { isValid: false, error: 'رقم الهوية يجب أن يكون 10 أرقام' };
  }
  
  // خوارزمية التحقق من رقم الهوية
  const digits = id.split('').map(Number);
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
  
  if ((10 - (sum % 10)) % 10 !== checksum) {
    return { isValid: false, error: 'رقم الهوية غير صحيح' };
  }

  return { isValid: true };
};

export const validateBeneficiaryPhone = (phone: string): ValidationResult => {
  const cleanPhone = phone.replace(/\s|-/g, '');
  if (!/^05\d{8}$/.test(cleanPhone)) {
    return { isValid: false, error: 'رقم الجوال يجب أن يبدأ بـ 05 ويتبعه 8 أرقام' };
  }
  return { isValid: true };
};

// ================ واجهة موحدة ================
export default {
  branch: {
    name: validateBranchName,
    code: validateBranchCode
  },
  employee: {
    id: validateEmployeeId,
    position: validateEmployeePosition
  },
  beneficiary: {
    nationalId: validateBeneficiaryNationalId,
    phone: validateBeneficiaryPhone
  }
};
