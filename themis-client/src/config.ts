// API Configuration
export const API_BASE_URL = 'http://localhost:5065';

// Feature flags
export const FEATURES = {
  OFFLINE_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_AUDIT_LOGS: true,
  ENABLE_ANALYTICS: false
};

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'token',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  TOKEN_EXPIRY_BUFFER_MS: 300000, // 5 minutes before expiry
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
  SENDER_NAME: 'Themis Project Management',
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
  
  // Risk/Issue management
  RISK_CREATE: ['PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  RISK_UPDATE: ['PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'ADMIN'],
  
  // Financial management
  FINANCIAL_VIEW: ['PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE', 'ADMIN'],
  FINANCIAL_UPDATE: ['ADMIN', 'MAIN_PMO', 'DEPARTMENT_DIRECTOR'],
  
  // Audit logs
  AUDIT_LOGS_VIEW: ['ADMIN', 'MAIN_PMO'],
}; 