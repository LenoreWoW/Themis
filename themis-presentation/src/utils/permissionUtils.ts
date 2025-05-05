import { UserRole } from '../types';
import { PERMISSIONS } from '../config';

// Type for permission names
export type PermissionName = keyof typeof PERMISSIONS;

/**
 * Check if a user with the given role has a specific permission
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export const hasPermission = (role: UserRole | null, permission: PermissionName): boolean => {
  if (!role) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(role);
};

/**
 * Get all permissions for a specific role
 * @param role - The user's role
 * @returns Array of permission names the role has access to
 */
export const getRolePermissions = (role: UserRole | null): PermissionName[] => {
  if (!role) return [];
  
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission as PermissionName);
};

/**
 * Check if a user with the given role can approve a weekly update at a specific level
 * @param role - The user's role
 * @param approvalLevel - The approval level (SUB_PMO, MAIN_PMO)
 * @returns Boolean indicating if the user can approve at this level
 */
export const canApproveWeeklyUpdate = (
  role: UserRole | null, 
  approvalLevel: 'SUB_PMO' | 'MAIN_PMO'
): boolean => {
  if (!role) return false;
  
  if (approvalLevel === 'SUB_PMO') {
    return hasPermission(role, 'UPDATE_APPROVE_SUB_PMO');
  }
  
  if (approvalLevel === 'MAIN_PMO') {
    return hasPermission(role, 'UPDATE_APPROVE_MAIN_PMO');
  }
  
  return false;
};

/**
 * Check if a user with the given role can approve a change request at a specific level
 * @param role - The user's role
 * @param approvalLevel - The approval level (SUB_PMO, MAIN_PMO, DIRECTOR)
 * @returns Boolean indicating if the user can approve at this level
 */
export const canApproveChangeRequest = (
  role: UserRole | null,
  approvalLevel: 'SUB_PMO' | 'MAIN_PMO' | 'DIRECTOR'
): boolean => {
  if (!role) return false;
  
  if (approvalLevel === 'SUB_PMO') {
    return hasPermission(role, 'CHANGE_REQUEST_APPROVE_SUB_PMO');
  }
  
  if (approvalLevel === 'MAIN_PMO') {
    return hasPermission(role, 'CHANGE_REQUEST_APPROVE_MAIN_PMO');
  }
  
  if (approvalLevel === 'DIRECTOR') {
    return hasPermission(role, 'CHANGE_REQUEST_APPROVE_DIRECTOR');
  }
  
  return false;
};

/**
 * Check if a user with the given role can manage users (create, update, delete)
 * @param role - The user's role
 * @returns Boolean indicating if the user can manage users
 */
export const canManageUsers = (role: UserRole | null): boolean => {
  if (!role) return false;
  
  return (
    hasPermission(role, 'USER_CREATE') || 
    hasPermission(role, 'USER_UPDATE') || 
    hasPermission(role, 'USER_DELETE')
  );
};

/**
 * Check if a user with the given role can assign roles to other users
 * @param role - The user's role
 * @returns Boolean indicating if the user can assign roles
 */
export const canAssignRoles = (role: UserRole | null): boolean => {
  return hasPermission(role, 'USER_ASSIGN_ROLE');
};

/**
 * Check if a user with the given role can manage financial data
 * @param role - The user's role
 * @returns Boolean indicating if the user can manage financial data
 */
export const canManageFinancials = (role: UserRole | null): boolean => {
  return hasPermission(role, 'FINANCIAL_UPDATE');
};

/**
 * Check if a user with the given role can view audit logs
 * @param role - The user's role
 * @returns Boolean indicating if the user can view audit logs
 */
export const canViewAuditLogs = (role: UserRole | null): boolean => {
  return hasPermission(role, 'AUDIT_LOGS_VIEW');
};

/**
 * Get the sequence of approval roles for weekly updates
 * @returns Array of roles in the approval sequence
 */
export const getWeeklyUpdateApprovalSequence = (): UserRole[] => {
  return [UserRole.SUB_PMO, UserRole.MAIN_PMO];
};

/**
 * Get the sequence of approval roles for change requests
 * @returns Array of roles in the approval sequence
 */
export const getChangeRequestApprovalSequence = (): UserRole[] => {
  return [UserRole.SUB_PMO, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR];
}; 