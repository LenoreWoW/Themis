export interface Project {
  id: string;
  name: string;
  title?: string;
  description: string;
  department: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  clientName?: string;
  client?: string;
  projectManager?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFormProps {
  onSubmit: (project: Omit<Project, 'id'> & { id?: string }) => void;
  project?: Project;
}

export interface ProjectListProps {
  projects: Project[];
  onViewProject: (projectId: string) => void;
}

export interface ProjectDetailsProps {
  project: Project;
} 