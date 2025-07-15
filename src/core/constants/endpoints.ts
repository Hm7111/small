/**
 * API Endpoints for the application
 * Centralized location for all API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SEND_OTP: '/functions/v1/send-otp',
    VERIFY_OTP: '/functions/v1/verify-otp',
    SEND_EXISTING_USER_OTP: '/functions/v1/send-existing-user-otp',
    VERIFY_EXISTING_USER_OTP: '/functions/v1/verify-existing-user-otp',
    ADMIN_LOGIN: '/functions/v1/admin-login',
    ADMIN_USER_LINKING: '/functions/v1/admin-user-linking'
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: '/functions/v1/admin-users',
    BRANCHES: '/functions/v1/admin-branches',
    SERVICES: '/functions/v1/admin-services',
    STATS: '/functions/v1/admin-stats'
  },
  
  // Branch manager endpoints
  BRANCH: {
    DASHBOARD: '/functions/v1/branch-manager',
    EMPLOYEES: '/functions/v1/branch-employees',
    MEMBERS: '/functions/v1/branch-members',
    REGISTRATIONS: '/functions/v1/branch-registrations',
    REQUESTS: '/functions/v1/branch-requests'
  },
  
  // Employee endpoints
  EMPLOYEE: {
    DASHBOARD: '/functions/v1/employee-data',
    REGISTRATIONS: '/functions/v1/employee-registrations'
  },
  
  // Beneficiary endpoints
  BENEFICIARY: {
    MEMBER_DATA: '/functions/v1/get-member-data',
    DOCUMENTS: '/functions/v1/member-documents',
    REQUESTS: '/functions/v1/member-requests',
    SERVICES: '/functions/v1/available-services',
    REGISTRATION: {
      LOAD: '/functions/v1/load-registration-data',
      SAVE: '/functions/v1/save-registration-draft',
      SUBMIT: '/functions/v1/submit-registration'
    }
  }
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'supabase.auth.token',
  THEME: 'theme'
};
