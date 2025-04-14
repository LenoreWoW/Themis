// Enums
export enum UserRole {
  Pending = 'Pending',
  ProjectManager = 'ProjectManager',
  SubPMO = 'SubPMO',
  MainPMO = 'MainPMO',
  DepartmentDirector = 'DepartmentDirector',
  Executive = 'Executive',
  Admin = 'Admin'
}

export enum ProjectStatus {
  Draft = 'Draft',
  SubPMOReview = 'SubPMOReview',
  MainPMOApproval = 'MainPMOApproval',
  InProgress = 'InProgress',
  Completed = 'Completed',
  OnHold = 'OnHold',
  Cancelled = 'Cancelled'
}

export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Delayed = 'Delayed',
  Blocked = 'Blocked',
  Cancelled = 'Cancelled'
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export enum ApprovalStatus {
  Pending = 'Pending',
  ApprovedBySubPMO = 'ApprovedBySubPMO',
  ApprovedByMainPMO = 'ApprovedByMainPMO',
  RejectedBySubPMO = 'RejectedBySubPMO',
  RejectedByMainPMO = 'RejectedByMainPMO'
}

export enum RequestType {
  NewProject = 'NewProject',
  WeeklyUpdate = 'WeeklyUpdate',
  ChangeRequest = 'ChangeRequest'
}

export enum RiskSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum RiskProbability {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export enum RiskIssueType {
  Risk = 'Risk',
  Issue = 'Issue'
}

export enum RiskIssueStatus {
  Open = 'Open',
  Mitigated = 'Mitigated',
  Closed = 'Closed'
}

export enum RiskIssueImpact {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

// Interfaces
export interface User {
  id: string;
  username: string;
  adIdentifier: string;
  role: UserRole;
  departmentId?: string;
  approved: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  directorId?: string;
  director?: User;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  department?: Department;
  managerId?: string;
  manager?: User;
  executiveId?: string;
  executive?: User;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  assignee?: User;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Approval {
  id: string;
  projectId: string;
  project?: Project;
  approverId: string;
  approver?: User;
  comments?: string;
  approved: boolean;
  approvedAt?: Date;
  createdAt: Date;
}

export interface RiskIssue {
  id: string;
  title: string;
  description: string;
  projectId: string;
  type: RiskIssueType;
  status: RiskIssueStatus;
  impact: RiskIssueImpact;
  mitigationPlan?: string;
  reporterId: string;
  reporter?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskIssueSummary {
  totalRisks: number;
  totalIssues: number;
  openRisks: number;
  openIssues: number;
  mitigatedRisks: number;
  mitigatedIssues: number;
  closedRisks: number;
  closedIssues: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
}

export interface AuthResponse {
  token: string;
  user: User;
} 