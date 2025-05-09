// Get the current environment
const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (isProduction ? window.location.origin + '/api' : 'http://localhost:3000/api');

// Export API config for services
export const apiConfig = {
  API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  WITH_CREDENTIALS: false,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Feature flags
export const FEATURES = {
  OFFLINE_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_AUDIT_LOGS: true,
  ENABLE_ANALYTICS: false,
  CHAT_ENABLED: true
};

// Auth0 Configuration
export const AUTH0_CONFIG = {
  DOMAIN: 'your-auth0-tenant.auth0.com',
  CLIENT_ID: 'your-auth0-client-id',
  REDIRECT_URI: window.location.origin,
  AUDIENCE: 'https://api.themis.app',
  SCOPE: 'openid profile email',
};

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'token',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  TOKEN_EXPIRY_BUFFER_MS: 300000, // 5 minutes before expiry
};

// Passport.js Configuration
export const PASSPORT_CONFIG = {
  AUTH_SERVER_URL: 'http://localhost:4000',
  LOGIN_ENDPOINT: '/auth/login',
  REGISTER_ENDPOINT: '/auth/register',
  PROFILE_ENDPOINT: '/auth/profile',
  REFRESH_TOKEN_ENDPOINT: '/auth/refresh-token',
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key', // Should be set via environment variables
  TOKEN_EXPIRY: '1d', // 1 day
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  POLLING_INTERVAL_MS: 30000, // 30 seconds
  SNACKBAR_AUTO_HIDE_DURATION: 6000 // 6 seconds
};

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL_MS: 60000, // 1 minute
  DEFAULT_DATE_RANGE: 30, // 30 days
};

// Active Directory Configuration
export const AD_CONFIG = {
  ENABLED: true, // Set to true to enable AD integration
  AUTHORITY: 'https://login.microsoftonline.com/common',
  CLIENT_ID: 'your-client-id',
  REDIRECT_URI: 'http://localhost:3000',
  SCOPES: ['user.read', 'profile', 'email'],
  GROUPS_TO_ROLES_MAPPING: {
    // Map AD group IDs to application roles
    'project-managers-group-id': 'PROJECT_MANAGER',
    'sub-pmo-group-id': 'SUB_PMO',
    'main-pmo-group-id': 'MAIN_PMO',
    'department-directors-group-id': 'DEPARTMENT_DIRECTOR',
    'executive-management-group-id': 'EXECUTIVE',
    'admin-group-id': 'ADMIN',
  }
};

// Email/SMTP Configuration
export const EMAIL_CONFIG = {
  ENABLED: true, // Set to true to enable email notifications
  SENDER_EMAIL: 'themis-no-reply@yourcompany.com',
  SENDER_NAME: 'Project Management System',
  // Email templates
  TEMPLATES: {
    TASK_ASSIGNED: {
      SUBJECT: 'Task Assigned: {taskTitle}',
      BODY: 'You have been assigned a new task: {taskTitle}. Due date: {dueDate}. Please login to view details.'
    },
    UPDATE_DUE: {
      SUBJECT: 'Weekly Update Due for {projectName}',
      BODY: 'The weekly update for project {projectName} is due. Please login to submit your update.'
    },
    APPROVAL_NEEDED: {
      SUBJECT: 'Approval Required: {requestType} for {projectName}',
      BODY: 'Your approval is required for a {requestType} in project {projectName}. Please login to review.'
    },
    NEW_USER_REQUEST: {
      SUBJECT: 'New User Request: {username}',
      BODY: 'A new user request has been submitted for {username}. Please login to review and approve.'
    },
    USER_REQUEST_APPROVED: {
      SUBJECT: 'User Request Approved',
      BODY: 'Your user request has been approved. You can now log in with the temporary password provided. You will be prompted to change your password on first login.'
    }
  }
};

// Role-based access control permissions
export const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO'],
  PROJECT_UPDATE: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER'],
  PROJECT_DELETE: ['ADMIN', 'DEPARTMENT_DIRECTOR'],
  PROJECT_VIEW: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER', 'EXECUTIVE'],
  
  // Task permissions
  TASK_CREATE: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER'],
  TASK_UPDATE: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER'],
  TASK_DELETE: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'PROJECT_MANAGER'],
  
  // Weekly update permissions
  UPDATE_CREATE: ['PROJECT_MANAGER'],
  UPDATE_APPROVE_SUB_PMO: ['SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  UPDATE_APPROVE_MAIN_PMO: ['MAIN_PMO', 'ADMIN'],
  
  // Change request permissions
  CHANGE_REQUEST_CREATE: ['PROJECT_MANAGER', 'SUB_PMO'],
  CHANGE_REQUEST_APPROVE_SUB_PMO: ['SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  CHANGE_REQUEST_APPROVE_MAIN_PMO: ['MAIN_PMO', 'ADMIN'],
  CHANGE_REQUEST_APPROVE_DIRECTOR: ['DEPARTMENT_DIRECTOR', 'ADMIN'],
  
  // User management
  USER_CREATE: ['ADMIN'],
  USER_UPDATE: ['ADMIN'],
  USER_DELETE: ['ADMIN'],
  USER_ASSIGN_ROLE: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO'],
  USER_REQUEST_CREATE: ['SUB_PMO', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'EXECUTIVE'],
  USER_REQUEST_APPROVE_DEPT: ['DEPARTMENT_DIRECTOR'],
  USER_REQUEST_APPROVE_SUB_PMO: ['SUB_PMO'],
  USER_REQUEST_APPROVE_MAIN_PMO: ['MAIN_PMO'],
  USER_REQUEST_VIEW: ['SUB_PMO', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'EXECUTIVE', 'ADMIN'],
  
  // Risk/Issue management
  RISK_CREATE: ['PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  RISK_UPDATE: ['PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  
  // Financial management
  FINANCIAL_VIEW: ['PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE', 'ADMIN'],
  FINANCIAL_UPDATE: ['ADMIN', 'MAIN_PMO', 'DEPARTMENT_DIRECTOR'],
  
  // Audit logs
  AUDIT_LOGS_VIEW: ['ADMIN', 'MAIN_PMO'],
  
  // Faculty management
  FACULTY_VIEW: ['SUB_PMO', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'EXECUTIVE', 'ADMIN'],
  FACULTY_MANAGE: ['DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'ADMIN'],
  
  // Chat & Announcements permissions
  GENERAL_ANNOUNCEMENT_POST: ['MAIN_PMO', 'EXECUTIVE', 'ADMIN'],
  DEPARTMENT_ANNOUNCEMENT_POST: ['DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  CHAT_VIEW: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER', 'EXECUTIVE'],
  CHAT_POST: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER', 'EXECUTIVE'],
  CHAT_MANAGE: ['ADMIN', 'MAIN_PMO']
}; 