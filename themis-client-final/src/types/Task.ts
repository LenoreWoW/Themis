import { User, Project, TaskStatus, TaskPriority } from './index';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  projectId: string;
  project?: Project;
  assignee?: User;
  assignedBy?: User;
  createdAt: string;
  updatedAt: string;
} 