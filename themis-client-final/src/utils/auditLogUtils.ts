import i18n from '../i18n/index'; // Import i18n directly instead of using useTranslation hook

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  COMPLETE = 'COMPLETE',
  VIEW = 'VIEW'
}

export interface AuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  userId: string;
  username: string;
  timestamp: string;
  ipAddress?: string;
  details: string;
  projectId?: string;
  changes?: Record<string, any>;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  department?: string;
}

// Removed useTranslation hook from regular function
export const getEntityTypeName = (entityType: string): string => {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  
  switch (entityType.toUpperCase()) {
    case 'PROJECT':
      return t('auditLog.entityTypes.project', 'Project');
    case 'TASK':
      return t('auditLog.entityTypes.task', 'Task');
    case 'USER':
      return t('auditLog.entityTypes.user', 'User');
    case 'ROLE':
      return t('auditLog.entityTypes.role', 'Role');
    case 'DEPARTMENT':
      return t('auditLog.entityTypes.department', 'Department');
    case 'DOCUMENT':
      return t('auditLog.entityTypes.document', 'Document');
    case 'MEETING':
      return t('auditLog.entityTypes.meeting', 'Meeting');
    case 'RISK':
      return t('auditLog.entityTypes.risk', 'Risk');
    case 'ISSUE':
      return t('auditLog.entityTypes.issue', 'Issue');
    case 'CHANGE_REQUEST':
      return t('auditLog.entityTypes.changeRequest', 'Change Request');
    default:
      return entityType;
  }
};

// Removed useTranslation hook from regular function
export const getAuditActionDescription = (action: string): string => {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  
  switch (action.toUpperCase()) {
    case AuditAction.CREATE:
      return t('auditLog.actions.create', 'Created');
    case AuditAction.UPDATE:
      return t('auditLog.actions.update', 'Updated');
    case AuditAction.DELETE:
      return t('auditLog.actions.delete', 'Deleted');
    case AuditAction.APPROVE:
      return t('auditLog.actions.approve', 'Approved');
    case AuditAction.REJECT:
      return t('auditLog.actions.reject', 'Rejected');
    case AuditAction.SUBMIT:
      return t('auditLog.actions.submit', 'Submitted');
    case AuditAction.LOGIN:
      return t('auditLog.actions.login', 'Logged In');
    case AuditAction.LOGOUT:
      return t('auditLog.actions.logout', 'Logged Out');
    case AuditAction.ASSIGN:
      return t('auditLog.actions.assign', 'Assigned');
    case AuditAction.UNASSIGN:
      return t('auditLog.actions.unassign', 'Unassigned');
    case AuditAction.COMPLETE:
      return t('auditLog.actions.complete', 'Completed');
    case AuditAction.VIEW:
      return t('auditLog.actions.view', 'Viewed');
    default:
      return action;
  }
};

// Actual fetch function for audit logs with filtering capability
export const fetchAuditLogsWithFilters = async (
  token: string,
  filters: {
    startDate?: Date | null;
    endDate?: Date | null;
    action?: string;
    entityType?: string;
    userId?: string;
    searchQuery?: string;
    projectId?: string;
  }
): Promise<AuditLog[]> => {
  // This would normally call the API, but for now we're using localStorage
  try {
    const storedLogs = localStorage.getItem('auditLogs');
    if (!storedLogs) return [];
    
    let logs: AuditLog[] = JSON.parse(storedLogs);
    
    // Apply filters
    if (filters.startDate) {
      const startTime = filters.startDate.getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() >= startTime);
    }
    
    if (filters.endDate) {
      const endTime = filters.endDate.getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() <= endTime);
    }
    
    if (filters.action && filters.action !== 'all') {
      logs = logs.filter(log => log.action.toUpperCase() === filters.action?.toUpperCase());
    }
    
    if (filters.entityType && filters.entityType !== 'all') {
      logs = logs.filter(log => log.entityType.toUpperCase() === filters.entityType?.toUpperCase());
    }
    
    if (filters.userId && filters.userId !== 'all') {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.projectId) {
      logs = logs.filter(log => log.projectId === filters.projectId);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      logs = logs.filter(log => 
        (log.details && log.details.toLowerCase().includes(query)) ||
        (log.entityId && log.entityId.toLowerCase().includes(query)) ||
        (log.entityType && log.entityType.toLowerCase().includes(query)) ||
        (log.user && `${log.user.firstName} ${log.user.lastName}`.toLowerCase().includes(query)) ||
        (log.username && log.username.toLowerCase().includes(query))
      );
    }
    
    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}; 