import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format phone number to international format
 */
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

/**
 * Format currency with SAR symbol
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(amount);
};

/**
 * Format date in Gregorian calendar with Arabic locale
 */
export const formatGregorianDate = (date: string | Date, includeTime: boolean = false): string => {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('ar', options).format(dateObj);
};

/**
 * Calculate age from birth date
 */
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

/**
 * Validate Saudi national ID
 */
export const validateSaudiNationalId = (nationalId: string): { isValid: boolean; error?: string } => {
  if (!nationalId) {
    return { isValid: false, error: 'رقم الهوية الوطنية مطلوب' };
  }
  
  if (nationalId.length !== 10) {
    return { isValid: false, error: 'رقم الهوية الوطنية يجب أن يكون 10 أرقام' };
  }
  
  if (!/^\d{10}$/.test(nationalId)) {
    return { isValid: false, error: 'رقم الهوية الوطنية يجب أن يحتوي على أرقام فقط' };
  }

  // Additional validation algorithm for Saudi IDs could be added here

  return { isValid: true };
};

/**
 * Validate Saudi phone number
 */
export const validateSaudiPhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'رقم الجوال مطلوب' };
  }

  const cleanPhone = phone.replace(/\s|-/g, '');
  
  if (!/^((\+966)|0)?5[0-9]{8}$/.test(cleanPhone)) {
    return { isValid: false, error: 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)' };
  }

  return { isValid: true };
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
