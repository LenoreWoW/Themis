import { IssueStatus, RiskImpact, TaskPriority, Project, User } from './index';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  impact: RiskImpact;
  priority: TaskPriority;
  projectId: string;
  project?: Project;
  owner: User;
  createdBy: User;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
} 