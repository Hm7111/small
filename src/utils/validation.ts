export const validateNationalId = (nationalId: string): string | null => {
  if (!nationalId) return 'رقم الهوية الوطنية مطلوب';
  if (nationalId.length !== 10) return 'رقم الهوية الوطنية يجب أن يكون 10 أرقام';
  if (!/^\d{10}$/.test(nationalId)) return 'رقم الهوية الوطنية يجب أن يحتوي على أرقام فقط';
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'البريد الإلكتروني مطلوب';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'البريد الإلكتروني غير صحيح';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'كلمة المرور مطلوبة';
  if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  return null;
};

export const validateOtp = (otp: string): string | null => {
  if (!otp) return 'رمز التحقق مطلوب';
  if (otp.length < 4) return 'رمز التحقق يجب أن يكون 4 أرقام على الأقل';
  if (!/^\d+$/.test(otp)) return 'رمز التحقق يجب أن يحتوي على أرقام فقط';
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return 'رقم الجوال مطلوب';
  
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/\s|-/g, '');
  
  // Check Saudi mobile format
  if (!/^((\+966)|0)?5[0-9]{8}$/.test(cleanPhone)) {
    return 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)';
  }
  
  return null;
};
