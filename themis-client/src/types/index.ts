// User-related types
export enum UserRole {
  PENDING = 'PENDING',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SUB_PMO = 'SUB_PMO',
  MAIN_PMO = 'MAIN_PMO',
  DEPARTMENT_DIRECTOR = 'DEPARTMENT_DIRECTOR',
  EXECUTIVE = 'EXECUTIVE',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
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

export enum ProjectRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Attachment interface
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  actualCost: number;
  department: string;
  projectManager: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[]; // Array of project attachments
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
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  assignee?: User;
  parentTaskId?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  dependencies: string[]; // IDs of tasks this task depends on
  isMilestone: boolean;
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

export interface WeeklyUpdate {
  id: string;
  projectId: string;
  week: number;
  year: number;
  summary: string;
  accomplishments: string;
  plannedActivities: string;
  issues: string;
  risks: string;
  status: UpdateStatus;
  submittedBy: User;
  submittedAt?: string;
  approvedBySubPmo?: User;
  approvedBySubPmoAt?: string;
  approvedByMainPmo?: User;
  approvedByMainPmoAt?: string;
  rejectedBy?: User;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Change request types
export enum ChangeRequestType {
  SCOPE = 'SCOPE',
  SCHEDULE = 'SCHEDULE',
  BUDGET = 'BUDGET',
  RESOURCE = 'RESOURCE',
  OTHER = 'OTHER'
}

export enum ChangeRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED_BY_SUB_PMO = 'APPROVED_BY_SUB_PMO',
  APPROVED_BY_MAIN_PMO = 'APPROVED_BY_MAIN_PMO',
  APPROVED_BY_DIRECTOR = 'APPROVED_BY_DIRECTOR',
  REJECTED = 'REJECTED'
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: ChangeRequestType;
  impact: string;
  justification: string;
  alternatives: string;
  status: ChangeRequestStatus;
  submittedBy: User;
  submittedAt?: string;
  approvedBySubPmo?: User;
  approvedBySubPmoAt?: string;
  approvedByMainPmo?: User;
  approvedByMainPmoAt?: string;
  approvedByDirector?: User;
  approvedByDirectorAt?: string;
  rejectedBy?: User;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
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