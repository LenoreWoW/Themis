export interface Project {
  id: string;
  name: string;
  description: string;
  department: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface ProjectFormProps {
  departments: Department[];
  users: User[];
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Project>;
}

export interface ProjectListProps {
  projects: Project[];
  onAddNew: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView: (project: Project) => void;
} 