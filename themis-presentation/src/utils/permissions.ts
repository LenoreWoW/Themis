import { UserRole } from '../types';

/**
 * Checks if a user with the given role can approve projects
 * @param role - The user's role
 * @returns Boolean indicating if the user can approve projects
 */
export const canApproveProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.EXECUTIVE
  ].includes(role);
};

/**
 * Checks if a user with the given role can manage projects
 * @param role - The user's role
 * @returns Boolean indicating if the user can manage projects
 */
export const canManageProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.PROJECT_MANAGER
  ].includes(role);
};

/**
 * Checks if a user with the given role can add tasks
 * @param role - The user's role
 * @returns Boolean indicating if the user can add tasks
 */
export const canAddTasks = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_LEAD
  ].includes(role);
};

/**
 * Checks if a user with the given role can request tasks
 * @param role - The user's role
 * @returns Boolean indicating if the user can request tasks
 */
export const canRequestTasks = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_LEAD,
    UserRole.DEVELOPER
  ].includes(role);
};

/**
 * Checks if a user with the given role can view all projects
 * @param role - The user's role
 * @returns Boolean indicating if the user can view all projects
 */
export const canViewAllProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.SUB_PMO,
    UserRole.MAIN_PMO,
    UserRole.EXECUTIVE
  ].includes(role);
};

/**
 * Checks if a user with the given role can manage departments
 * @param role - The user's role
 * @returns Boolean indicating if the user can manage departments
 */
export const canManageDepartments = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.EXECUTIVE,
    UserRole.MAIN_PMO,
    UserRole.DEPARTMENT_DIRECTOR
  ].includes(role);
};

/**
 * Checks if a user with the given role can manage legacy projects
 * @param role - The user's role
 * @returns Boolean indicating if the user can manage legacy projects
 */
export const canManageLegacyProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.SUB_PMO,
    UserRole.MAIN_PMO
  ].includes(role);
};

/**
 * Checks if a user with the given role has admin privileges
 * @param role - The user's role
 * @returns Boolean indicating if the user has admin privileges
 */
export const isAdmin = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MAIN_PMO].includes(role);
};

/**
 * Checks if a user with the given role has final approval authority
 * @param role - The user's role
 * @returns Boolean indicating if the user has final approval authority
 */
export const hasFinalApprovalAuthority = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO
  ].includes(role);
};

/**
 * Checks if a user with the given role has view-only permissions
 * @param role - The user's role
 * @returns Boolean indicating if the user has view-only permissions
 */
export const isViewOnly = (role: UserRole): boolean => {
  return [
    UserRole.DEPARTMENT_DIRECTOR,
    UserRole.EXECUTIVE
  ].includes(role);
};

/**
 * Checks if a user with the given role can edit others' projects
 * @param role - The user's role
 * @returns Boolean indicating if the user can edit others' projects
 */
export const canEditOthersProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO
  ].includes(role);
};

/**
 * Checks if a user with the given role can approve projects in a specific department
 * @param userRole - The user's role
 * @param userDepartmentId - The user's department ID
 * @param projectDepartmentId - The project's department ID
 * @returns Boolean indicating if the user can approve projects in the department
 */
export const canApproveProjectsInDepartment = (
  userRole: UserRole, 
  userDepartmentId: string, 
  projectDepartmentId: string
): boolean => {
  // Main PMO and Admin can approve projects in any department
  if ([UserRole.ADMIN, UserRole.MAIN_PMO].includes(userRole)) {
    return true;
  }
  
  // Sub PMO can only approve projects in their department
  if (userRole === UserRole.SUB_PMO) {
    return userDepartmentId === projectDepartmentId;
  }
  
  return false;
};

/**
 * Checks if a user with the given role can see sensitive project data
 * @param role - The user's role
 * @returns Boolean indicating if the user can see sensitive project data
 */
export const canSeeSensitiveData = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.DEPARTMENT_DIRECTOR,
    UserRole.EXECUTIVE
  ].includes(role);
};

/**
 * Gets the filterable access level for the given role
 * @param role - The user's role
 * @returns The access level: 'all', 'department', or 'own'
 */
export const getAccessLevel = (role: UserRole): 'all' | 'department' | 'own' => {
  if ([UserRole.ADMIN, UserRole.MAIN_PMO, UserRole.EXECUTIVE].includes(role)) {
    return 'all';
  }
  
  if ([UserRole.SUB_PMO, UserRole.DEPARTMENT_DIRECTOR].includes(role)) {
    return 'department';
  }
  
  return 'own';
}; 