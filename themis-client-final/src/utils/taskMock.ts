import { ProjectStatus, ProjectPriority, User, ProjectTemplateType, Task, TaskStatus, TaskPriority } from '../types';

// Sample project data
const demoProject = {
  id: '1',
  name: 'Sample Project',
  description: '',
  department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
  status: ProjectStatus.IN_PROGRESS,
  priority: ProjectPriority.HIGH,
  startDate: '',
  endDate: '',
  projectManager: {} as User,
  budget: 0,
  actualCost: 0,
  progress: 0,
  createdAt: '',
  updatedAt: '',
  templateType: ProjectTemplateType.DEFAULT
};

// Sample task data for initial state
const demoTasks: Task[] = [
  {
    id: '1',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new dashboard design',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    startDate: '2023-09-01',
    dueDate: '2023-09-15',
    projectId: '1',
    project: demoProject, // Add project property
    assignee: {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      username: 'janesmith',
      role: 'DEVELOPER',
      department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    } as User,
    assignedBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      role: 'PROJECT_MANAGER',
      department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    } as User,
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2023-09-05T15:30:00Z'
  },
  // ... repeat for other tasks ...
];

export default demoTasks; 