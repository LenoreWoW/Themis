import { ProjectStatus, ProjectPriority, ProjectTemplateType, Goal } from './types/index';

// Re-export from types/index
export { ProjectStatus, ProjectPriority, ProjectTemplateType };
export type { Goal };

// Define and export enums directly
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  QA = 'QA',
  SUB_PMO = 'SUB_PMO',
  MAIN_PMO = 'MAIN_PMO',
  DEPARTMENT_DIRECTOR = 'DEPARTMENT_DIRECTOR',
  EXECUTIVE = 'EXECUTIVE',
  MANAGER = 'MANAGER',
  PENDING = 'PENDING'
}

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ANALYZING = 'ANALYZING',
  MONITORED = 'MONITORED',
  ASSESSED = 'ASSESSED',
  MITIGATED = 'MITIGATED',
  CLOSED = 'CLOSED'
}

export enum RiskImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TaskRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_REVIEW = 'IN_REVIEW'
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Interfaces
export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: Department;
  username?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department?: Department;
  departmentId?: string;
  sponsor?: User;
  sponsorId?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget?: number;
  actualCost?: number;
  projectManager?: User;
  projectManagerId?: string;
  teamMembers?: User[];
  createdAt: string;
  updatedAt: string;
  progress?: number;
  documents?: Document[];
  risks?: Risk[];
  linkedGoals?: Goal[];
  linkedProjects?: Project[];
  projectDependencies?: string[];
  dependentProjects?: string[];
  templateType?: ProjectTemplateType;
}

export interface ProjectWithTeam extends Project {
  team: User[];
}

export interface Attachment {
  id: string;
  name: string;
  filename?: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  projectId: string;
  assignee?: User;
  project: Project;
  isMilestone?: boolean;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  task: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  status: TaskRequestStatus;
  priority: TaskPriority;
  dueDate: string;
  requestor: User;
  project: Project;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskRequest {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskRequestStatus;
  dueDate: string;
  projectId: string;
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  status: RiskStatus;
  impact: RiskImpact;
  probability: number;
  projectId: string;
  owner: User;
  createdBy: User;
  mitigation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  impact: RiskImpact;
  projectId: string;
  owner: User;
  createdBy: User;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date?: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: MeetingStatus;
  organizer: User;
  attendees?: User[];
  participants: User[];
  isActive?: boolean;
  meetingLink?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: AssignmentStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: User;
  assignedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  projectId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialEntry {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  userId?: string;
  username?: string;
  role?: UserRole;
  departmentId?: string;
  success?: boolean;
  message?: string;
}

// Helper functions for role-based permissions
export const canManageProjects = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || 
         role === UserRole.PROJECT_MANAGER || 
         role === UserRole.SUB_PMO || 
         role === UserRole.MAIN_PMO;
};

export const canApproveProjects = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || 
         role === UserRole.SUB_PMO || 
         role === UserRole.MAIN_PMO;
};

export const canAddTasks = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || 
         role === UserRole.PROJECT_MANAGER || 
         role === UserRole.SUB_PMO || 
         role === UserRole.MAIN_PMO;
};

export const canRequestTasks = (role: UserRole): boolean => {
  return role === UserRole.PROJECT_MANAGER || 
         role === UserRole.SUB_PMO || 
         role === UserRole.MAIN_PMO;
};

export const canViewAllProjects = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || 
         role === UserRole.MAIN_PMO || 
         role === UserRole.EXECUTIVE;
}; 