import { RiskImpact, RiskProbability, Project, User, RiskStatus } from './index';

export interface Risk {
  id: string;
  title: string;
  description: string;
  status: RiskStatus;
  impact: RiskImpact;
  probability: RiskProbability;
  projectId: string;
  project?: Project;
  owner: User;
  createdBy: User;
  mitigationPlan?: string;
  contingencyPlan?: string;
  createdAt: string;
  updatedAt: string;
} 