import { User, TaskPriority } from './index';

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
  startDate?: string; // Add optional startDate field
  dueDate: string;
  assignedBy: User;
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
} 