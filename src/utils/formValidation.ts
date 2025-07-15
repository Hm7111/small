// مجموعة شاملة من دوال التحقق من صحة البيانات

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// التحقق من رقم الهوية الوطنية السعودية
export const validateSaudiNationalId = (nationalId: string): ValidationResult => {
  if (!nationalId) {
    return { isValid: false, error: 'رقم الهوية الوطنية مطلوب' };
  }
  
  if (nationalId.length !== 10) {
    return { isValid: false, error: 'رقم الهوية الوطنية يجب أن يكون 10 أرقام' };
  }
  
  if (!/^\d{10}$/.test(nationalId)) {
    return { isValid: false, error: 'رقم الهوية الوطنية يجب أن يحتوي على أرقام فقط' };
  }

  // خوارزمية تحقق إضافية للهوية السعودية
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
  
  const isValidChecksum = (10 - (sum % 10)) % 10 === checksum;
  
  if (!isValidChecksum) {
    return { isValid: false, error: 'رقم الهوية الوطنية غير صحيح' };
  }

  return { isValid: true };
};

// التحقق من رقم الجوال السعودي
export const validateSaudiPhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'رقم الجوال مطلوب' };
  }

  const cleanPhone = phone.replace(/\s|-/g, '');
  
  if (!/^((\+966)|0)?5[0-9]{8}$/.test(cleanPhone)) {
    return { isValid: false, error: 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)' };
  }

  return { isValid: true };
};

// التحقق من البريد الإلكتروني
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'البريد الإلكتروني مطلوب' };
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'البريد الإلكتروني غير صحيح' };
  }

  return { isValid: true };
};

// التحقق من كلمة المرور
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'كلمة المرور مطلوبة' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }

  return { isValid: true };
};

// التحقق من الأسماء
export const validateName = (name: string, fieldName: string = 'الاسم'): ValidationResult => {
  if (!name || !name.trim()) {
    return { 
      isValid: false, 
      error: `${fieldName} مطلوب` 
    };
  }
  
  if (name.trim().length < 2) {
    return { 
      isValid: false, 
      error: `${fieldName} يجب أن يكون حرفين على الأقل` 
    };
  }
  
  if (name.trim().length > 100) {
    return { 
      isValid: false, 
      error: `${fieldName} طويل جداً` 
    };
  }

  return { 
    isValid: true 
  };
};

// التحقق من التاريخ
export const validateDate = (date: string, fieldName: string = 'التاريخ'): ValidationResult => {
  if (!date) {
    return { isValid: false, error: `${fieldName} مطلوب` };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} غير صحيح` };
  }

  return { isValid: true };
};

// التحقق من تاريخ الميلاد
export const validateBirthDate = (birthDate: string): ValidationResult => {
  const dateValidation = validateDate(birthDate, 'تاريخ الميلاد');
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const today = new Date();
  const birth = new Date(birthDate);
  
  if (birth > today) {
    return { isValid: false, error: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل' };
  }

  const age = today.getFullYear() - birth.getFullYear();
  
  if (age < 0 || age > 120) {
    return { isValid: false, error: 'تاريخ الميلاد غير معقول' };
  }

  if (age < 18) {
    return { isValid: false, error: 'يجب أن يكون العمر 18 سنة أو أكثر' };
  }

  return { isValid: true };
};

// التحقق من الرمز البريدي السعودي
export const validateSaudiPostalCode = (postalCode: string): ValidationResult => {
  if (!postalCode) {
    return { isValid: false, error: 'الرمز البريدي مطلوب' };
  }
  
  if (!/^\d{5}$/.test(postalCode)) {
    return { isValid: false, error: 'الرمز البريدي يجب أن يكون 5 أرقام' };
  }

  return { isValid: true };
};

// التحقق من رقم المبنى
export const validateBuildingNumber = (buildingNumber: string): ValidationResult => {
  if (!buildingNumber) {
    return { isValid: false, error: 'رقم المبنى مطلوب' };
  }
  
  if (!/^\d{4}$/.test(buildingNumber)) {
    return { isValid: false, error: 'رقم المبنى يجب أن يكون 4 أرقام' };
  }

  return { isValid: true };
};

// التحقق من المبلغ المالي
export const validateAmount = (amount: number | string, fieldName: string = 'المبلغ'): ValidationResult => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return { isValid: false, error: `${fieldName} يجب أن يكون رقماً` };
  }
  
  if (numericAmount < 0) {
    return { isValid: false, error: `${fieldName} لا يمكن أن يكون سالباً` };
  }

  return { isValid: true };
};

// التحقق من رمز OTP
export const validateOTP = (otp: string, length: number = 4): ValidationResult => {
  if (!otp) {
    return { isValid: false, error: 'رمز التحقق مطلوب' };
  }
  
  if (otp.length !== length) {
    return { isValid: false, error: `رمز التحقق يجب أن يكون ${length} أرقام` };
  }
  
  if (!/^\d+$/.test(otp)) {
    return { isValid: false, error: 'رمز التحقق يجب أن يحتوي على أرقام فقط' };
  }

  return { isValid: true };
};

// دالة شاملة للتحقق من مجموعة حقول
export const validateForm = (fields: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  for (const [fieldName, value] of Object.entries(fields)) {
    if (rules[fieldName]) {
      const validation = rules[fieldName](value);
      if (!validation.isValid && validation.error) {
        errors[fieldName] = validation.error;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
