export interface Project {
  id: string;
  name: string;
  description: string;
  department: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ProjectFormProps {
  onSubmit: (project: Omit<Project, 'id'>) => void;
}

export interface ProjectListProps {
  projects: Project[];
  onViewProject: (projectId: string) => void;
}

export interface ProjectDetailsProps {
  project: Project;
} 