import { ProjectStatus, GoalStatus, GoalType, GoalCategory } from './index';

export interface MindMapNode {
  id: string;
  name: string;
  type: string;
  status?: ProjectStatus | GoalStatus;
  progress?: number;
  attributes?: {
    status?: ProjectStatus | GoalStatus;
    progress?: string;
    type?: GoalType;
    category?: GoalCategory;
  };
  children?: MindMapNode[];
  __type?: string; // Include __type property to fix type errors
} 