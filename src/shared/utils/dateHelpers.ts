/**
 * Date Helper Functions - Unified Version
 * Centralized utilities for date formatting and manipulation
 * Using Gregorian calendar with Arabic locale
 */

/**
 * Format date in Gregorian calendar with Arabic locale
 * @param date Date to format
 * @param includeTime Whether to include time in the formatted date
 * @returns Formatted date string
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
 * Format date in short format (DD/MM/YYYY)
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatShortDate = (date: string | Date): string => {
  const dateObj = new Date(date);
  
  return new Intl.DateTimeFormat('ar', {
    calendar: 'gregory',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

/**
 * Alternative name for formatShortDate for backward compatibility
 */
export const formatShortGregorianDate = formatShortDate;

/**
 * Format time only (HH:MM)
 * @param date Date to extract time from
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = new Date(date);
  
  return new Intl.DateTimeFormat('ar', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Format full date and time with weekday
 * @param date Date to format
 * @returns Formatted full date and time string
 */
export const formatFullGregorianDateTime = (date: string | Date): string => {
  const dateObj = new Date(date);
  
  return new Intl.DateTimeFormat('ar', {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long'
  }).format(dateObj);
};

/**
 * Get current date formatted for display
 * @returns Formatted current date
 */
export const getCurrentGregorianDate = (): string => {
  return formatGregorianDate(new Date());
};

/**
 * Get current date and time formatted for display
 * @returns Formatted current date and time
 */
export const getCurrentGregorianDateTime = (): string => {
  return formatGregorianDate(new Date(), true);
};

/**
 * Calculate age from birth date
 * @param birthDate Birth date
 * @returns Age in years
 */
export const calculateAge = (birthDate: string | Date): number => {
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
 * Calculate difference between two dates in days
 * @param date1 First date
 * @param date2 Second date
 * @returns Difference in days
 */
export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is today
 * @param date Date to check
 * @returns True if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getFullYear() === checkDate.getFullYear() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getDate() === checkDate.getDate();
};

/**
 * Check if date is yesterday
 * @param date Date to check
 * @returns True if date is yesterday
 */
export const isYesterday = (date: string | Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  
  return yesterday.getFullYear() === checkDate.getFullYear() &&
         yesterday.getMonth() === checkDate.getMonth() &&
         yesterday.getDate() === checkDate.getDate();
};

/**
 * Format relative date (today, yesterday, X days ago)
 * @param date Date to format
 * @returns Formatted relative date
 */
export const formatRelativeDate = (date: string | Date): string => {
  const now = new Date();
  const inputDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - inputDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (isToday(date)) {
    return `اليوم ${formatTime(date)}`;
  }
  
  if (isYesterday(date)) {
    return `أمس ${formatTime(date)}`;
  }
  
  if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  }
  
  return formatGregorianDate(date);
};

/**
 * Convert date to ISO string with local timezone
 * @param date Date to convert
 * @returns ISO string with local timezone
 */
export const toLocalISOString = (date: Date = new Date()): string => {
  const offset = date.getTimezoneOffset();
  const localTime = new Date(date.getTime() - (offset * 60 * 1000));
  return localTime.toISOString().split('.')[0];
};

