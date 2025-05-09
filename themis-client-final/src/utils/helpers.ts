import { ProjectStatus, UserRole, Task, TaskStatus } from '../types';

export const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
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

/**
 * Calculate the progress percentage of a project towards its deadline
 * @param startDate - Project start date
 * @param endDate - Project end date
 * @returns A number between 0-100+ representing percentage of time elapsed
 */
export const calculateDeadlineProgress = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  
  // If the project hasn't started yet
  if (now <= start) return 0;
  
  // Calculate total duration and elapsed time
  const totalDuration = end - start;
  const elapsedTime = now - start;
  
  // Calculate percentage (can be over 100% if past deadline)
  return Math.round((elapsedTime / totalDuration) * 100);
};

/**
 * Get background color based on deadline progress
 * @param status - Project status
 * @param startDate - Project start date
 * @param endDate - Project end date
 * @param completedOnTime - For completed projects: was it completed before deadline
 * @returns Hex color code for the background
 */
export const getDeadlineColor = (
  status: ProjectStatus, 
  startDate?: string, 
  endDate?: string, 
  completedOnTime?: boolean
): string => {
  // Handle completed projects first
  if (status === ProjectStatus.COMPLETED) {
    return completedOnTime ? '#2e7d32' : '#000000'; // Green if on time, black if late
  }
  
  // If missing dates, return a default color
  if (!startDate || !endDate) return '#757575';
  
  // Calculate progress percentage
  const progress = calculateDeadlineProgress(startDate, endDate);
  
  // Determine color based on deadline progress
  if (progress > 100) return '#000000'; // Black for overdue
  if (progress >= 75) return '#d32f2f'; // Red for 75-100%
  if (progress >= 50) return '#ed6c02'; // Orange for 50-74%
  if (progress >= 25) return '#ffc107'; // Yellow for 25-49%
  return '#2e7d32'; // Green for 0-24%
};

/**
 * Calculate project progress based on completed tasks
 * @param tasks - Array of tasks belonging to the project
 * @returns A number between 0-100 representing completion percentage
 */
export const calculateProjectProgress = (tasks: Task[]): number => {
  // If there are no tasks, return 0 progress
  if (!tasks || tasks.length === 0) return 0;
  
  // Count completed tasks - handle both enum and string representations
  const completedTasks = tasks.filter(task => {
    const status = task.status;
    // Handle both enum and string values by converting to strings for comparison
    return String(status) === String(TaskStatus.DONE) || 
           (typeof status === 'string' && 
           (String(status) === 'DONE' || String(status) === 'COMPLETED'));
  });
  
  // Calculate percentage
  const progressPercentage = Math.round((completedTasks.length / tasks.length) * 100);
  
  return Math.min(progressPercentage, 100); // Cap at 100%
};

// Define dashboard access permissions
export interface DashboardAccess {
  canViewAllProjects: boolean;
  canViewRisksAndIssues: boolean;
  canViewFinancials: boolean;
  canViewClientData: boolean;
  canViewDepartmentData: boolean;
  canExportReports: boolean;
  analytics: boolean; // Added analytics permission
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
    canExportReports: false,
    analytics: true // Enable analytics for all users by default
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
        canExportReports: true,
        analytics: true
      };
    
    case UserRole.MAIN_PMO:
      // Main PMO has wide access except some financial details
      return {
        canViewAllProjects: true,
        canViewRisksAndIssues: true,
        canViewFinancials: false,
        canViewClientData: true,
        canViewDepartmentData: true,
        canExportReports: true,
        analytics: true
      };
      
    case UserRole.DEPARTMENT_DIRECTOR:
      // Department directors see their own department data plus some cross-department views
      return {
        canViewAllProjects: false,
        canViewRisksAndIssues: true,
        canViewFinancials: true,
        canViewClientData: false,
        canViewDepartmentData: true,
        canExportReports: true,
        analytics: true
      };
      
    case UserRole.SUB_PMO:
      // Sub PMO has more limited access
      return {
        canViewAllProjects: false,
        canViewRisksAndIssues: true,
        canViewFinancials: false,
        canViewClientData: false,
        canViewDepartmentData: true,
        canExportReports: false,
        analytics: true
      };
      
    case UserRole.PROJECT_MANAGER:
      // Project managers only see their own projects
      return {
        canViewAllProjects: false,
        canViewRisksAndIssues: false,
        canViewFinancials: false,
        canViewClientData: false,
        canViewDepartmentData: false,
        canExportReports: false,
        analytics: true
      };
      
    default:
      return defaultAccess;
  }
};

// Add a formatter for enum values
export const formatEnumValue = (value: string): string => {
  if (!value) return '';
  
  // Handle values with underscores (like IN_PROGRESS)
  if (value.includes('_')) {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Handle camelCase values (like inProgress)
  return value
    // Insert a space before all uppercase letters that are followed by lowercase letters
    .replace(/([A-Z](?=[a-z]))/g, ' $1')
    // Capitalize the first letter
    .replace(/^./, str => str.toUpperCase())
    // Remove any leading space
    .trim();
}; 