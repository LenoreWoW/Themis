import { ProjectStatus, UserRole } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const getStatusColor = (status: ProjectStatus, endDate?: string): string => {
  // Check if project is overdue
  if (endDate && status === ProjectStatus.IN_PROGRESS) {
    const today = new Date();
    const projectEndDate = new Date(endDate);
    if (projectEndDate < today) {
      return '#d32f2f'; // Red color for overdue projects
    }
  }

  // Default status colors
  switch (status) {
    case ProjectStatus.IN_PROGRESS:
      return '#1976d2'; // blue
    case ProjectStatus.COMPLETED:
      return '#2e7d32'; // green
    case ProjectStatus.ON_HOLD:
      return '#ed6c02'; // orange
    case ProjectStatus.CANCELLED:
      return '#d32f2f'; // red
    case ProjectStatus.PLANNING:
      return '#9c27b0'; // purple
    default:
      return '#757575'; // grey
  }
};

// Define dashboard access permissions
export interface DashboardAccess {
  canViewAllProjects: boolean;
  canViewRisksAndIssues: boolean;
  canViewFinancials: boolean;
  canViewClientData: boolean;
  canViewDepartmentData: boolean;
  canExportReports: boolean;
}

/**
 * Determines dashboard access permissions based on user role
 * @param role The user's role
 * @returns Object with dashboard access permissions
 */
export const getDashboardAccess = (role?: UserRole): DashboardAccess => {
  // Default access (minimum permissions)
  const defaultAccess: DashboardAccess = {
    canViewAllProjects: false,
    canViewRisksAndIssues: false,
    canViewFinancials: false,
    canViewClientData: false,
    canViewDepartmentData: false,
    canExportReports: false
  };
  
  if (!role) return defaultAccess;
  
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.EXECUTIVE:
      // Full access for executives and admins
      return {
        canViewAllProjects: true,
        canViewRisksAndIssues: true,
        canViewFinancials: true,
        canViewClientData: true,
        canViewDepartmentData: true,
        canExportReports: true
      };
    
    case UserRole.MAIN_PMO:
      // Main PMO has wide access except some financial details
      return {
        canViewAllProjects: true,
        canViewRisksAndIssues: true,
        canViewFinancials: false,
        canViewClientData: true,
        canViewDepartmentData: true,
        canExportReports: true
      };
      
    case UserRole.DEPARTMENT_DIRECTOR:
      // Department directors see their own department data plus some cross-department views
      return {
        canViewAllProjects: false,
        canViewRisksAndIssues: true,
        canViewFinancials: true,
        canViewClientData: false,
        canViewDepartmentData: true,
        canExportReports: true
      };
      
    case UserRole.SUB_PMO:
      // Sub PMO has more limited access
      return {
        canViewAllProjects: false,
        canViewRisksAndIssues: true,
        canViewFinancials: false,
        canViewClientData: false,
        canViewDepartmentData: true,
        canExportReports: false
      };
      
    case UserRole.PROJECT_MANAGER:
      // Project managers only see their own projects
      return {
        canViewAllProjects: false,
        canViewRisksAndIssues: false,
        canViewFinancials: false,
        canViewClientData: false,
        canViewDepartmentData: false,
        canExportReports: false
      };
      
    default:
      return defaultAccess;
  }
}; 