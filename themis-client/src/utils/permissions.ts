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

// Function to check if user can manage projects (create, update, delete)
export const canManageProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.SUB_PMO,
    UserRole.MAIN_PMO
  ].includes(role);
};

// Function to check if user can add tasks to a project
export const canAddTasks = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_LEAD,
    UserRole.SUB_PMO,
    UserRole.MAIN_PMO
  ].includes(role);
};

// Function to check if user can request tasks for a project
export const canRequestTasks = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_LEAD,
    UserRole.DEVELOPER,
    UserRole.DESIGNER,
    UserRole.QA,
    UserRole.SUB_PMO,
    UserRole.MAIN_PMO
  ].includes(role);
};

// Function to check if user can view all projects
export const canViewAllProjects = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.SUB_PMO,
    UserRole.MAIN_PMO,
    UserRole.EXECUTIVE
  ].includes(role);
};

// Function to check if user can manage departments (create, update, delete)
export const canManageDepartments = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.EXECUTIVE,
    UserRole.MAIN_PMO,
    UserRole.DEPARTMENT_DIRECTOR
  ].includes(role);
}; 