import { UserRole } from './index';

export enum QuestCategory {
  WELCOME = 'WELCOME',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SUB_PMO = 'SUB_PMO',
  MAIN_PMO = 'MAIN_PMO',
  DEPARTMENT_DIRECTOR = 'DEPARTMENT_DIRECTOR',
  EXECUTIVE = 'EXECUTIVE', 
  COMMON = 'COMMON'
}

export enum QuestStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  targetComponent?: string; // Component or page to highlight
}

export interface Quest {
  id: string;
  key: string;
  title: string;
  description: string;
  category: QuestCategory;
  relevantRoles: UserRole[];
  status: QuestStatus;
  steps: QuestStep[];
  priority: number;
  completedAt?: string;
}

export interface UserQuest {
  userId: string;
  questKey: string;
  status: QuestStatus;
  progress: number;
  completedSteps: string[]; // Array of completed step IDs
  startedAt: string;
  completedAt?: string;
  lastUpdatedAt: string;
}

export interface OnboardingState {
  availableQuests: Quest[];
  userQuests: Record<string, UserQuest>; // Indexed by quest key
  activeQuestKey: string | null;
  isLoading: boolean;
  error: string | null;
} 