import api from '../services/api';

export enum AuditAction {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  APPROVAL_REQUESTED = 'approval_requested',
  APPROVAL_GRANTED = 'approval_granted',
  APPROVAL_REJECTED = 'approval_rejected',
  CHANGE_REQUEST_CREATED = 'change_request_created',
  CHANGE_REQUEST_UPDATED = 'change_request_updated',
  CHANGE_REQUEST_APPROVED = 'change_request_approved',
  CHANGE_REQUEST_REJECTED = 'change_request_rejected',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SYSTEM_ERROR = 'system_error'
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

/**
 * Get a human-readable description of an audit action
 * @param action - The audit action
 * @returns Human-readable string describing the action
 */
export const getAuditActionDescription = (action: AuditAction): string => {
  switch (action) {
    case 'user_created':
      return 'User Created';
    case 'user_updated':
      return 'User Updated';
    case 'user_deleted':
      return 'User Deleted';
    case 'user_role_changed':
      return 'User Role Changed';
    case 'project_created':
      return 'Project Created';
    case 'project_updated':
      return 'Project Updated';
    case 'project_deleted':
      return 'Project Deleted';
    case 'task_created':
      return 'Task Created';
    case 'task_updated':
      return 'Task Updated';
    case 'task_deleted':
      return 'Task Deleted';
    case 'approval_requested':
      return 'Approval Requested';
    case 'approval_granted':
      return 'Approval Granted';
    case 'approval_rejected':
      return 'Approval Rejected';
    case 'change_request_created':
      return 'Change Request Created';
    case 'change_request_updated':
      return 'Change Request Updated';
    case 'change_request_approved':
      return 'Change Request Approved';
    case 'change_request_rejected':
      return 'Change Request Rejected';
    case 'login':
      return 'User Login';
    case 'logout':
      return 'User Logout';
    case 'system_error':
      return 'System Error';
    default:
      return action;
  }
};

/**
 * Get a human-readable entity type name
 * @param entityType - The entity type string
 * @returns Formatted entity type name
 */
export const getEntityTypeName = (entityType: string): string => {
  switch (entityType) {
    case 'user':
      return 'User';
    case 'project':
      return 'Project';
    case 'task':
      return 'Task';
    case 'change_request':
      return 'Change Request';
    case 'weekly_update':
      return 'Weekly Update';
    case 'risk':
      return 'Risk';
    case 'issue':
      return 'Issue';
    case 'system':
      return 'System';
    default:
      return entityType;
  }
};

/**
 * Filter audit logs by date range
 * @param logs - Array of audit logs
 * @param startDate - Start date for filtering
 * @param endDate - End date for filtering
 * @returns Filtered array of audit logs
 */
export const filterLogsByDateRange = (logs: AuditLog[], startDate: Date, endDate: Date): AuditLog[] => {
  if (!Array.isArray(logs)) {
    console.warn('Expected an array in filterLogsByDateRange but received:', logs);
    return [];
  }
  
  return logs.filter(log => {
    if (!log || !log.timestamp) return false;
    try {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    } catch (err) {
      console.error('Error parsing date:', log.timestamp, err);
      return false;
    }
  });
};

/**
 * Filter audit logs by user ID
 * @param logs - Array of audit logs
 * @param userId - User ID to filter by
 * @returns Filtered array of audit logs
 */
export const filterLogsByUser = (logs: AuditLog[], userId: string): AuditLog[] => {
  if (!Array.isArray(logs)) {
    console.warn('Expected an array in filterLogsByUser but received:', logs);
    return [];
  }
  
  return logs.filter(log => log && log.userId === userId);
};

/**
 * Filter audit logs by action type
 * @param logs - Array of audit logs
 * @param action - Action type to filter by
 * @returns Filtered array of audit logs
 */
export const filterLogsByAction = (logs: AuditLog[], action: AuditAction): AuditLog[] => {
  if (!Array.isArray(logs)) {
    console.warn('Expected an array in filterLogsByAction but received:', logs);
    return [];
  }
  
  return logs.filter(log => log && log.action === action);
};

/**
 * Filter audit logs by entity type
 * @param logs - Array of audit logs
 * @param entityType - Entity type to filter by
 * @returns Filtered array of audit logs
 */
export const filterLogsByEntityType = (logs: AuditLog[], entityType: string): AuditLog[] => {
  if (!Array.isArray(logs)) {
    console.warn('Expected an array in filterLogsByEntityType but received:', logs);
    return [];
  }
  
  return logs.filter(log => log && log.entityType === entityType);
};

/**
 * Search audit logs for a query string
 * @param logs - Array of audit logs
 * @param query - Search query string
 * @returns Filtered array of audit logs
 */
export const searchLogs = (logs: AuditLog[], query: string): AuditLog[] => {
  if (!Array.isArray(logs)) {
    console.warn('Expected an array in searchLogs but received:', logs);
    return [];
  }
  
  const lowerCaseQuery = query.toLowerCase();
  
  return logs.filter(log => 
    log && 
    (
      (log.username && log.username.toLowerCase().includes(lowerCaseQuery)) ||
      (log.action && log.action.toLowerCase().includes(lowerCaseQuery)) ||
      (log.entityType && log.entityType.toLowerCase().includes(lowerCaseQuery)) ||
      (log.entityId && log.entityId.toLowerCase().includes(lowerCaseQuery)) ||
      (log.details && log.details.toLowerCase().includes(lowerCaseQuery))
    )
  );
};

/**
 * Fetch audit logs with filters
 * @param token - Auth token
 * @param filters - Filter object containing filter criteria
 * @returns Promise resolving to filtered audit logs
 */
export const fetchAuditLogsWithFilters = async (
  token: string,
  filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    search?: string;
  }
): Promise<AuditLog[]> => {
  try {
    const queryParams: Record<string, string> = {};
    
    if (filters.startDate) {
      queryParams.startDate = filters.startDate.toISOString();
    }
    
    if (filters.endDate) {
      queryParams.endDate = filters.endDate.toISOString();
    }
    
    if (filters.userId) {
      queryParams.userId = filters.userId;
    }
    
    if (filters.action) {
      queryParams.action = filters.action;
    }
    
    if (filters.entityType) {
      queryParams.entityType = filters.entityType;
    }
    
    if (filters.search) {
      queryParams.search = filters.search;
    }
    
    // Only pass the token parameter since the API doesn't support queryParams yet
    const logs = await api.auditLogs.getAuditLogs(token);
    
    // Make sure logs is an array before applying filters
    let filteredLogs: AuditLog[] = Array.isArray(logs) ? logs : [];
    
    if (!Array.isArray(logs)) {
      console.warn('Expected an array of audit logs, but received:', logs);
    }
    
    if (filters.startDate && filters.endDate && filteredLogs.length > 0) {
      filteredLogs = filterLogsByDateRange(filteredLogs, filters.startDate, filters.endDate);
    }
    
    if (filters.userId && filteredLogs.length > 0) {
      filteredLogs = filterLogsByUser(filteredLogs, filters.userId);
    }
    
    if (filters.action && filteredLogs.length > 0) {
      filteredLogs = filterLogsByAction(filteredLogs, filters.action);
    }
    
    if (filters.entityType && filteredLogs.length > 0) {
      filteredLogs = filterLogsByEntityType(filteredLogs, filters.entityType);
    }
    
    if (filters.search && filteredLogs.length > 0) {
      filteredLogs = searchLogs(filteredLogs, filters.search);
    }
    
    return filteredLogs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}; 