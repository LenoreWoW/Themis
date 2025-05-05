import api from '../services/api';
import { UserRole } from '../types';
import { AuditAction } from './auditLogUtils';

interface LogParams {
  userId: string;
  username?: string;
  action: AuditAction | string;
  entityType: string;
  entityId: string;
  details: string;
  projectId?: string;
  department?: string;
}

/**
 * Create an audit log entry
 * @param params Log parameters
 * @param token Authentication token
 * @returns Promise that resolves when the log is created
 */
export const logAction = async (params: LogParams, token: string): Promise<boolean> => {
  try {
    const response = await api.auditLogs.createAuditLog({
      action: params.action,
      details: params.details,
      entityType: params.entityType,
      entityId: params.entityId,
      projectId: params.projectId,
      department: params.department,
      user: {
        id: params.userId,
        firstName: params.username?.split(' ')[0] || '',
        lastName: params.username?.split(' ')[1] || ''
      },
      timestamp: new Date().toISOString()
    }, token);

    return response.success;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return false;
  }
};

/**
 * Log a project-related action
 * @param projectId Project ID
 * @param action Action performed
 * @param details Action details
 * @param userId User who performed the action
 * @param username User's display name
 * @param department Department ID (optional)
 * @param token Authentication token
 */
export const logProjectAction = async (
  projectId: string,
  action: AuditAction,
  details: string,
  userId: string,
  username: string,
  department: string | undefined,
  token: string
): Promise<boolean> => {
  return logAction({
    userId,
    username,
    action,
    entityType: 'PROJECT',
    entityId: projectId,
    details,
    projectId,
    department
  }, token);
};

/**
 * Log a change request action
 * @param requestId Change request ID
 * @param projectId Project ID
 * @param action Action performed
 * @param details Action details
 * @param userId User who performed the action
 * @param username User's display name
 * @param department Department ID (optional)
 * @param token Authentication token
 */
export const logChangeRequestAction = async (
  requestId: string,
  projectId: string,
  action: AuditAction,
  details: string,
  userId: string,
  username: string,
  department: string | undefined,
  token: string
): Promise<boolean> => {
  return logAction({
    userId,
    username,
    action,
    entityType: 'CHANGE_REQUEST',
    entityId: requestId,
    details,
    projectId,
    department
  }, token);
};

/**
 * Log a task action
 * @param taskId Task ID
 * @param projectId Project ID
 * @param action Action performed
 * @param details Action details
 * @param userId User who performed the action
 * @param username User's display name
 * @param department Department ID (optional)
 * @param token Authentication token
 */
export const logTaskAction = async (
  taskId: string,
  projectId: string,
  action: AuditAction,
  details: string,
  userId: string,
  username: string,
  department: string | undefined,
  token: string
): Promise<boolean> => {
  return logAction({
    userId,
    username,
    action,
    entityType: 'TASK',
    entityId: taskId,
    details,
    projectId,
    department
  }, token);
};

/**
 * Log a user action
 * @param targetUserId User ID of the user that was modified
 * @param action Action performed
 * @param details Action details
 * @param performerId User who performed the action
 * @param performerName User's display name
 * @param department Department ID (optional)
 * @param token Authentication token
 */
export const logUserAction = async (
  targetUserId: string,
  action: AuditAction,
  details: string,
  performerId: string,
  performerName: string,
  department: string | undefined,
  token: string
): Promise<boolean> => {
  return logAction({
    userId: performerId,
    username: performerName,
    action,
    entityType: 'USER',
    entityId: targetUserId,
    details,
    department
  }, token);
};

/**
 * Log a system action
 * @param action Action performed
 * @param details Action details
 * @param userId User who performed the action (or 'system')
 * @param username User's display name (or 'System')
 * @param token Authentication token
 */
export const logSystemAction = async (
  action: AuditAction,
  details: string,
  userId: string = 'system',
  username: string = 'System',
  token: string
): Promise<boolean> => {
  return logAction({
    userId,
    username,
    action,
    entityType: 'SYSTEM',
    entityId: 'system',
    details
  }, token);
};

/**
 * Determine if a user can view audit logs based on role and relationships
 * @param userRole Role of the user
 * @param logProjectId Project ID associated with the log
 * @param logDepartment Department ID associated with the log
 * @param logUserId User ID who created the log
 * @param userProjectIds Projects managed by the user
 * @param userDepartment Department of the user
 * @param userId ID of the user
 * @returns Whether the user can view the log
 */
export const canViewAuditLog = (
  userRole: UserRole,
  logProjectId: string | undefined,
  logDepartment: string | undefined,
  logUserId: string,
  userProjectIds: string[],
  userDepartment: string | undefined,
  userId: string
): boolean => {
  // Admin, Executive can see all logs
  if (userRole === UserRole.ADMIN || userRole === UserRole.EXECUTIVE) {
    return true;
  }

  // Users can always see their own logs
  if (logUserId === userId) {
    return true;
  }

  // Project Managers can see logs for their projects
  if (userRole === UserRole.PROJECT_MANAGER && logProjectId && userProjectIds.includes(logProjectId)) {
    return true;
  }

  // PMO roles can see logs for their department
  if ((userRole === UserRole.MAIN_PMO || userRole === UserRole.SUB_PMO) && 
      logDepartment && userDepartment && logDepartment === userDepartment) {
    return true;
  }

  // Department directors can see logs for their department
  if (userRole === UserRole.DEPARTMENT_DIRECTOR && 
      logDepartment && userDepartment && logDepartment === userDepartment) {
    return true;
  }

  return false;
}; 