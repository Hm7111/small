import { User } from '../types';

export const getRedirectPath = (user: User): string => {
  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'branch_manager':
      return '/branch';
    case 'employee':
      return '/employee';
    case 'beneficiary':
      // إذا كان المستخدم في مرحلة التسجيل، نوجهه مباشرة لصفحة التسجيل
      if (user.member?.registration_status === 'profile_incomplete' || 
          user.member?.registration_status === 'pending_documents' ||
          user.member?.registration_status === 'needs_correction') {
        return '/beneficiary?tab=registration';
      }
      return '/beneficiary'; 
    default:
      return '/';
  }
};

export const saveUserToStorage = (user: User): void => {
  // Make sure we're saving a full object
  if (!user || typeof user !== 'object') {
    console.error("Invalid user data:", user);
    return;
  }
  
  // Ensure critical fields exist
  if (!user.id || !user.role) {
    console.error("User data missing critical fields:", user);
    return;
  }
  
  console.log("Saving user to localStorage:", user.id, user.role);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      
      // Check for minimum required fields
      if (!user.id) {
        console.warn('User from localStorage missing ID, removing');
        localStorage.removeItem('user');
        return null; 
      }
      
      if (!user.role) {
        console.warn('User from localStorage missing role, removing');
        localStorage.removeItem('user'); 
        return null;
      }
      
      console.log("Retrieved valid user from localStorage:", user.id, user.role);
      return user;
    } catch (error) {
      // Clear corrupted data
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const clearUserFromStorage = (): void => {
  localStorage.removeItem('user');
};

// Helper to validate user object structure
export const isValidUser = (user: any): boolean => {
  if (!user) return false;
  
  // Check for required fields
  if (!user.id) {
    return false;
  }
  
  if (!user.role) {
    return false;
  }
  
  // Check that role is one of the valid roles
  const validRoles = ['admin', 'branch_manager', 'employee', 'beneficiary'];
  if (!validRoles.includes(user.role)) {
    return false;
  }
  
  return true;
};

// المساعدة في الحصول على معلومات الجلسة
export const getSessionFromStorage = (): any => {
  try {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (error) {
    console.error('Error parsing session from storage', error);
    return null;
  }
};
