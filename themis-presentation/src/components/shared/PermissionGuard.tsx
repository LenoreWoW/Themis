import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  canCreateProjects, 
  canEditProjects, 
  canApproveProjects, 
  canRequestChanges,
} from '../../context/AuthContext';
import { UserRole } from '../../types';

export enum Permission {
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  APPROVE_PROJECT = 'APPROVE_PROJECT',
  VIEW_ALL_PROJECTS = 'VIEW_ALL_PROJECTS',
  VIEW_DEPARTMENT_PROJECTS = 'VIEW_DEPARTMENT_PROJECTS',
  REQUEST_CHANGES = 'REQUEST_CHANGES',
  CREATE_TASK = 'CREATE_TASK',
  EDIT_TASK = 'EDIT_TASK',
  APPROVE_TASK = 'APPROVE_TASK',
  SUBMIT_WEEKLY_UPDATE = 'SUBMIT_WEEKLY_UPDATE',
  APPROVE_WEEKLY_UPDATE = 'APPROVE_WEEKLY_UPDATE'
}

interface PermissionGuardProps {
  permission: Permission;
  isOwnItem?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  isOwnItem = false,
  fallback = null, 
  children 
}) => {
  const { user } = useAuth();
  
  // If no user, no permissions
  if (!user) {
    return <>{fallback}</>;
  }
  
  const hasPermission = checkPermission(permission, user.role, isOwnItem);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export const usePermission = (permission: Permission, isOwnItem = false): boolean => {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return checkPermission(permission, user.role, isOwnItem);
};

const checkPermission = (permission: Permission, userRole: UserRole | string | undefined, isOwnItem: boolean): boolean => {
  if (!userRole) return false;
  
  switch (permission) {
    case Permission.CREATE_PROJECT:
      return canCreateProjects(userRole);
      
    case Permission.EDIT_PROJECT:
      return canEditProjects(userRole, isOwnItem);
      
    case Permission.APPROVE_PROJECT:
      return canApproveProjects(userRole, isOwnItem);
      
    case Permission.REQUEST_CHANGES:
      return canRequestChanges(userRole);
      
    case Permission.CREATE_TASK:
      return userRole === UserRole.ADMIN || 
             userRole === UserRole.PROJECT_MANAGER || 
             userRole === UserRole.TEAM_LEAD;
      
    case Permission.EDIT_TASK:
      return userRole === UserRole.ADMIN || 
             userRole === UserRole.PROJECT_MANAGER || 
             (userRole === UserRole.TEAM_LEAD && isOwnItem) || 
             (userRole === UserRole.DEVELOPER && isOwnItem);
      
    case Permission.APPROVE_TASK:
      return userRole === UserRole.ADMIN || 
             userRole === UserRole.PROJECT_MANAGER || 
             userRole === UserRole.TEAM_LEAD;
      
    case Permission.SUBMIT_WEEKLY_UPDATE:
      return userRole === UserRole.ADMIN || 
             userRole === UserRole.PROJECT_MANAGER;
      
    case Permission.APPROVE_WEEKLY_UPDATE:
      return userRole === UserRole.ADMIN || 
             userRole === UserRole.MAIN_PMO || 
             userRole === UserRole.SUB_PMO;
      
    default:
      return false;
  }
};

export default PermissionGuard; 