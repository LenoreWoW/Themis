// Add this import at the top of the file
import { ApprovalStatus } from '../context/AuthContext';

// User-related types
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SUB_PMO = 'SUB_PMO',
  MAIN_PMO = 'MAIN_PMO',
  DEPARTMENT_DIRECTOR = 'DEPARTMENT_DIRECTOR',
  EXECUTIVE = 'EXECUTIVE',
  TEAM_LEAD = 'TEAM_LEAD',
  DEVELOPER = 'DEVELOPER',
  PENDING = 'PENDING'
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
  return role === UserRole.ADMIN ||
         role === UserRole.PROJECT_MANAGER || 
         role === UserRole.SUB_PMO || 
         role === UserRole.MAIN_PMO;
};

export const canViewAllProjects = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || 
         role === UserRole.MAIN_PMO || 
         role === UserRole.EXECUTIVE;
};

// Department interface
export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  role: UserRole;
  departmentId?: string;
  token: string;
  success: boolean;
  message: string;
  user?: User; // Keep for backward compatibility
}

// Project-related types
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ProjectRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Attachment interface
export interface Attachment {
  id: string;
  name: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  projectManager?: User;
  department?: Department;
  budget: number;
  goalsLink?: string;
  client?: string;
  actualCost?: number;
  priority: ProjectPriority;
  createdAt: string;
  updatedAt: string;
  // Add approval workflow properties
  approvalStatus?: ApprovalStatus;
  comments?: string;
  reviewHistory?: ReviewComment[];
  lastReviewedBy?: User;
  lastReviewedAt?: string;
  progress?: number;
  // Legacy project properties
  legacyImport?: boolean;
  isDraft?: boolean;
}

// Task-related types
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
  createdAt: string;
  updatedAt: string;
  comments?: TaskComment[];
}

// Task comment interface
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

// Risk-related types
export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
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

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: RiskStatus;
  impact: RiskImpact;
  probability: number; // 0-100
  mitigation: string;
  owner: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Issue-related types
export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  impact: RiskImpact;
  owner: User;
  resolutionSummary?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Weekly update types
export enum UpdateStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED_BY_SUB_PMO = 'APPROVED_BY_SUB_PMO',
  APPROVED_BY_MAIN_PMO = 'APPROVED_BY_MAIN_PMO',
  REJECTED = 'REJECTED'
}

// Weekly Update interface for project update tracking
export interface WeeklyUpdate {
  id: string;
  projectId: string;
  content: string;
  weekNumber: number;
  weekYear: number;
  attachments: Attachment[];
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Change Request Types
export enum ChangeRequestType {
  SCHEDULE = 'SCHEDULE',
  BUDGET = 'BUDGET',
  SCOPE = 'SCOPE',
  RESOURCE = 'RESOURCE',
  CLOSURE = 'CLOSURE',
  OTHER = 'OTHER'
}

export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  submittedBy: string;
  submittedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  reviewNotes?: string;
  
  // Type-specific fields
  newEndDate?: Date;           // For SCHEDULE type
  additionalBudget?: number;   // For BUDGET type
  currentBudget?: number;      // For BUDGET type
  newBudget?: number;          // For BUDGET type
  scopeDetails?: string;       // For SCOPE type
  resourceDetails?: string;    // For RESOURCE type
  closureDetails?: string;     // For CLOSURE type
  otherDetails?: string;       // For OTHER type
  
  createdAt: Date;
  updatedAt: Date;
}

// Financial types
export interface FinancialEntry {
  id: string;
  projectId: string;
  category: string;
  description: string;
  amount: number;
  type: 'BUDGET' | 'ACTUAL'; // Budget or actual expense
  date: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  UPDATE_DUE = 'UPDATE_DUE',
  UPDATE_APPROVED = 'UPDATE_APPROVED',
  UPDATE_REJECTED = 'UPDATE_REJECTED',
  CHANGE_REQUEST_APPROVED = 'CHANGE_REQUEST_APPROVED',
  CHANGE_REQUEST_REJECTED = 'CHANGE_REQUEST_REJECTED',
  APPROVAL_NEEDED = 'APPROVAL_NEEDED'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedItemId?: string;
  relatedItemType?: string;
  isRead: boolean;
  createdAt: string;
}

// Audit log types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT'
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// KPI types
export interface KPI {
  id: string;
  projectId: string;
  name: string;
  description: string;
  target: number;
  actual: number;
  unit: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  isHigherBetter: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Project Charter types
export interface ProjectCharter {
  id: string;
  projectId: string;
  vision: string;
  objectives: string;
  scope: string;
  outOfScope: string;
  assumptions: string;
  constraints: string;
  stakeholders: string;
  deliverables: string;
  successCriteria: string;
  risks: string;
  approvedBy?: User;
  approvedAt?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Meeting-related types
export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  organizer: User;
  participants: User[];
  isActive: boolean;
  meetingLink: string;
  createdAt: string;
  updatedAt?: string;
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: AssignmentStatus;
  priority: TaskPriority;
  assignedBy: User;
  assignedTo: User;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export enum TaskRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_REVIEW = 'IN_REVIEW'
}

export interface TaskRequest {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  projectId: string;
  requestedBy: User;
  status: TaskRequestStatus;
  reviewer?: User;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Goal-related types
export enum GoalType {
  STRATEGIC = 'STRATEGIC',
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY'
}

export enum GoalCategory {
  PERFORMANCE = 'PERFORMANCE',
  FINANCIAL = 'FINANCIAL',
  CUSTOMER = 'CUSTOMER',
  LEARNING = 'LEARNING',
  PROCESS = 'PROCESS'
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  startDate: string;
  endDate: string;
  assignedTo: string;
  linkedProjects: string[];
  isProgressAutoCalculated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add a new interface for review comments
export interface ReviewComment {
  id?: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUBMIT';
}

export * from './project-closure';
export * from './change-request'; 