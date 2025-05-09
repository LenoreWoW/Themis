import { GoalType, GoalCategory, GoalStatus } from './index';

export interface Goal {
  id: string;
  title: string;
  name: string;
  description: string;
  type: GoalType;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  startDate: string;
  endDate: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  children?: Goal[];
} 