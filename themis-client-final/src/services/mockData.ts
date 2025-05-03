import { Project, User, Department, ProjectStatus, ProjectPriority, Task, TaskStatus, Risk, Meeting, Issue, UserRole, RiskStatus, IssueStatus, RiskImpact, TaskRequestStatus, MeetingStatus, TaskPriority, ProjectTemplateType } from '../types';

// Mock Departments
export const mockDepartments: Department[] = [
  { 
    id: 'd1', 
    name: 'Information Technology', 
    description: 'Manages all IT infrastructure and software development',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd2', 
    name: 'Marketing', 
    description: 'Handles all marketing campaigns and brand management',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd3', 
    name: 'Finance', 
    description: 'Manages company finances and budgeting',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd4', 
    name: 'Operations', 
    description: 'Oversees daily business operations and logistics',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd5', 
    name: 'Human Resources', 
    description: 'Responsible for recruitment and employee management',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd6', 
    name: 'Research & Development', 
    description: 'Focuses on innovation and new product development',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd7', 
    name: 'Customer Support', 
    description: 'Provides assistance and technical support to customers',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  },
  { 
    id: 'd8', 
    name: 'Legal', 
    description: 'Handles legal matters and compliance',
    createdAt: '2023-01-01T00:00:00Z', 
    updatedAt: '2023-01-01T00:00:00Z' 
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'u1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@themis.com',
    role: UserRole.ADMIN,
    department: mockDepartments[0],
    username: 'john.smith',
    isActive: true,
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2023-06-10T14:45:00Z'
  },
  {
    id: 'u2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@themis.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[0],
    username: 'sarah.johnson',
    isActive: true,
    createdAt: '2023-01-20T09:15:00Z',
    updatedAt: '2023-05-25T11:30:00Z'
  },
  {
    id: 'u3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@themis.com',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0],
    username: 'michael.chen',
    isActive: true,
    createdAt: '2023-02-05T10:45:00Z',
    updatedAt: '2023-06-15T16:20:00Z'
  },
  {
    id: 'u4',
    firstName: 'Emma',
    lastName: 'Garcia',
    email: 'emma.garcia@themis.com',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[1],
    username: 'emma.garcia',
    isActive: true,
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2023-06-05T13:15:00Z'
  },
  {
    id: 'u5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@themis.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[1],
    username: 'david.wilson',
    isActive: true,
    createdAt: '2023-02-10T11:20:00Z',
    updatedAt: '2023-05-30T15:45:00Z'
  },
  {
    id: 'u6',
    firstName: 'Sophia',
    lastName: 'Kim',
    email: 'sophia.kim@themis.com',
    role: UserRole.DESIGNER,
    department: mockDepartments[1],
    username: 'sophia.kim',
    isActive: true,
    createdAt: '2023-03-01T09:30:00Z',
    updatedAt: '2023-06-20T10:10:00Z'
  },
  {
    id: 'u7',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@themis.com',
    role: UserRole.EXECUTIVE,
    department: mockDepartments[2],
    username: 'robert.taylor',
    isActive: true,
    createdAt: '2023-01-05T08:15:00Z',
    updatedAt: '2023-05-20T14:00:00Z'
  },
  {
    id: 'u8',
    firstName: 'Olivia',
    lastName: 'Martinez',
    email: 'olivia.martinez@themis.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[2],
    username: 'olivia.martinez',
    isActive: true,
    createdAt: '2023-02-15T10:00:00Z',
    updatedAt: '2023-06-25T11:45:00Z'
  },
  {
    id: 'u9',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@themis.com',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[3],
    username: 'james.brown',
    isActive: true,
    createdAt: '2023-01-25T09:45:00Z',
    updatedAt: '2023-06-01T15:30:00Z'
  },
  {
    id: 'u10',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@themis.com',
    role: UserRole.MANAGER,
    department: mockDepartments[3],
    username: 'emily.davis',
    isActive: true,
    createdAt: '2023-03-05T10:15:00Z',
    updatedAt: '2023-06-30T09:20:00Z'
  },
  {
    id: 'u11',
    firstName: 'Daniel',
    lastName: 'Rodriguez',
    email: 'daniel.rodriguez@themis.com',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0],
    username: 'daniel.rodriguez',
    isActive: true,
    createdAt: '2023-02-20T14:20:00Z',
    updatedAt: '2023-06-12T11:30:00Z'
  },
  {
    id: 'u12',
    firstName: 'Ava',
    lastName: 'Thompson',
    email: 'ava.thompson@themis.com',
    role: UserRole.QA,
    department: mockDepartments[0],
    username: 'ava.thompson',
    isActive: true,
    createdAt: '2023-03-15T09:40:00Z',
    updatedAt: '2023-07-01T10:15:00Z'
  },
  {
    id: 'u13',
    firstName: 'Mohammed',
    lastName: 'Al-Farsi',
    email: 'mohammed.alfarsi@themis.com',
    role: UserRole.SUB_PMO,
    department: mockDepartments[5],
    username: 'mohammed.alfarsi',
    isActive: true,
    createdAt: '2023-01-30T12:00:00Z',
    updatedAt: '2023-06-18T16:45:00Z'
  },
  {
    id: 'u14',
    firstName: 'Fatima',
    lastName: 'Al-Said',
    email: 'fatima.alsaid@themis.com',
    role: UserRole.MAIN_PMO,
    department: mockDepartments[5],
    username: 'fatima.alsaid',
    isActive: true,
    createdAt: '2023-01-18T11:10:00Z',
    updatedAt: '2023-05-22T14:30:00Z'
  },
  {
    id: 'u15',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@themis.com',
    role: UserRole.TEAM_LEAD,
    department: mockDepartments[0],
    username: 'ahmed.hassan',
    isActive: true,
    createdAt: '2023-02-08T10:30:00Z',
    updatedAt: '2023-06-14T15:00:00Z'
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Enterprise Resource Planning System',
    description: 'Implement a new ERP system to improve business processes and operations.',
    department: mockDepartments[0], // IT Department
    departmentId: mockDepartments[0].id,
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.HIGH,
    startDate: '2023-05-01T00:00:00Z',
    endDate: '2023-10-31T00:00:00Z',
    budget: 250000,
    actualCost: 120000,
    projectManager: mockUsers[1], // Sarah Johnson (Project Manager)
    projectManagerId: mockUsers[1].id,
    teamMembers: [mockUsers[2], mockUsers[10], mockUsers[11]], // Michael Chen, Daniel Rodriguez, Ava Thompson
    progress: 45,
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2023-06-20T00:00:00Z',
    templateType: ProjectTemplateType.ERP
  },
  {
    id: 'p2',
    name: 'Marketing Campaign for Q3',
    description: 'Plan and execute marketing campaign for the third quarter focusing on new product launch.',
    department: mockDepartments[1], // Marketing Department
    departmentId: mockDepartments[1].id,
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-07-01T00:00:00Z',
    endDate: '2023-09-30T00:00:00Z',
    budget: 100000,
    projectManager: mockUsers[4], // David Wilson (Project Manager)
    projectManagerId: mockUsers[4].id,
    teamMembers: [mockUsers[5]], // Sophia Kim (Designer)
    progress: 15,
    createdAt: '2023-06-10T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z',
    templateType: ProjectTemplateType.MARKETING
  },
  {
    id: 'p3',
    name: 'Financial System Upgrade',
    description: 'Upgrade the financial reporting system to comply with new regulations.',
    department: mockDepartments[2], // Finance Department
    departmentId: mockDepartments[2].id,
    status: ProjectStatus.ON_HOLD,
    priority: ProjectPriority.CRITICAL,
    startDate: '2023-04-01T00:00:00Z',
    endDate: '2023-08-31T00:00:00Z',
    budget: 180000,
    actualCost: 65000,
    projectManager: mockUsers[7], // Olivia Martinez (Project Manager)
    projectManagerId: mockUsers[7].id,
    teamMembers: [mockUsers[2], mockUsers[6]], // Michael Chen (Developer), Robert Taylor (Executive)
    progress: 30,
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-06-05T00:00:00Z',
    templateType: ProjectTemplateType.FINANCE
  },
  {
    id: 'p4',
    name: 'Operations Optimization',
    description: 'Optimize warehouse operations to improve efficiency and reduce costs.',
    department: mockDepartments[3], // Operations Department
    departmentId: mockDepartments[3].id,
    status: ProjectStatus.COMPLETED,
    priority: ProjectPriority.HIGH,
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2023-05-15T00:00:00Z',
    budget: 120000,
    actualCost: 118000,
    projectManager: mockUsers[9], // Emily Davis (Manager)
    projectManagerId: mockUsers[9].id,
    teamMembers: [mockUsers[8]], // James Brown (Department Director)
    progress: 100,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-05-20T00:00:00Z',
    templateType: ProjectTemplateType.SUPPLY_CHAIN
  },
  {
    id: 'p5',
    name: 'Website Redesign',
    description: 'Completely redesign the company website to improve user experience and conversion rates.',
    department: mockDepartments[1], // Marketing Department
    departmentId: mockDepartments[1].id,
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2023-07-31T00:00:00Z',
    budget: 75000,
    actualCost: 40000,
    projectManager: mockUsers[4], // David Wilson (Project Manager)
    projectManagerId: mockUsers[4].id,
    teamMembers: [mockUsers[5], mockUsers[2]], // Sophia Kim (Designer), Michael Chen (Developer)
    progress: 60,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-06-10T00:00:00Z',
    templateType: ProjectTemplateType.WEBSITE,
    projectDependencies: ['p2'], // Depends on Marketing Campaign
    dependentProjects: [] // No projects depend on this one yet
  }
];

// Empty Tasks
export const mockTasks: Task[] = [];

// Empty Risks
export const mockRisks: Risk[] = [];

// Empty Meetings
export const mockMeetings: Meeting[] = [];

// Empty Issues
export const mockIssues: Issue[] = [];

// Helper function to generate random activities - returns empty array
export const generateRandomActivities = (count: number) => {
  return [];
};

// Empty activities
export const mockActivities = [];

// Empty change requests
export const mockChangeRequests = [];

// Empty task requests
export const mockTaskRequests = [];

// Create default tasks for a given project
export const createDefaultTasks = (projectId: string): Task[] => {
  return [
    {
      id: `t1-${projectId}`,
      title: 'Initial planning',
      description: 'Define project scope and deliverables',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      startDate: '2023-05-01T09:00:00Z',
      dueDate: '2023-05-05T17:00:00Z',
      projectId: projectId,
      assignee: mockUsers[1], // Sarah Johnson (Project Manager)
      project: {} as Project, // Will be filled by the caller
      createdAt: '2023-04-28T14:30:00Z',
      updatedAt: '2023-05-05T16:45:00Z'
    },
    {
      id: `t2-${projectId}`,
      title: 'Requirements gathering',
      description: 'Collect and document all requirements from stakeholders',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      startDate: '2023-05-08T09:00:00Z',
      dueDate: '2023-05-12T17:00:00Z',
      projectId: projectId,
      assignee: mockUsers[1], // Sarah Johnson (Project Manager)
      project: {} as Project, // Will be filled by the caller
      createdAt: '2023-05-05T11:20:00Z',
      updatedAt: '2023-05-12T15:30:00Z'
    },
    {
      id: `t3-${projectId}`,
      title: 'Design system architecture',
      description: 'Create system architecture diagrams and documentation',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      startDate: '2023-05-15T09:00:00Z',
      dueDate: '2023-05-19T17:00:00Z',
      projectId: projectId,
      assignee: mockUsers[2], // Michael Chen (Developer)
      project: {} as Project, // Will be filled by the caller
      createdAt: '2023-05-12T16:00:00Z',
      updatedAt: '2023-05-17T10:15:00Z'
    },
    {
      id: `t4-${projectId}`,
      title: 'UI/UX Design',
      description: 'Create wireframes and high-fidelity designs',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      startDate: '2023-05-22T09:00:00Z',
      dueDate: '2023-05-31T17:00:00Z',
      projectId: projectId,
      assignee: mockUsers[5], // Sophia Kim (Designer)
      project: {} as Project, // Will be filled by the caller
      createdAt: '2023-05-17T14:45:00Z',
      updatedAt: '2023-05-17T14:45:00Z'
    },
    {
      id: `t5-${projectId}`,
      title: 'Backend development',
      description: 'Implement API endpoints and database models',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      startDate: '2023-06-01T09:00:00Z',
      dueDate: '2023-06-14T17:00:00Z',
      projectId: projectId,
      assignee: mockUsers[2], // Michael Chen (Developer)
      project: {} as Project, // Will be filled by the caller
      createdAt: '2023-05-20T09:30:00Z',
      updatedAt: '2023-05-20T09:30:00Z'
    }
  ];
};

// Helper function to get project for task
export const getProjectForTask = (task: Task, projects: Project[]): Project | undefined => {
  return projects.find(project => project.id === task.projectId);
};

// Empty Notifications
export const mockNotifications = []; 