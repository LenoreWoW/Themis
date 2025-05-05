import { 
  User, 
  UserRole, 
  Department,
  Project,
  ProjectStatus,
  ProjectPriority,
  Task,
  TaskStatus,
  TaskPriority,
  Risk,
  RiskStatus,
  RiskImpact,
  Issue,
  IssueStatus,
  Meeting,
  MeetingStatus,
  ProjectTemplateType
} from '../types';

// Create departments
export const mockDepartments: Department[] = [
  {
    id: 'd1',
    name: 'Information Technology',
    description: 'IT department responsible for all technology infrastructure and support',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd2',
    name: 'Engineering',
    description: 'Engineering department responsible for product development',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd3',
    name: 'Human Resources',
    description: 'HR department handling all personnel matters',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd4',
    name: 'Finance',
    description: 'Finance department handling budgeting and accounting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd5',
    name: 'Marketing',
    description: 'Marketing department responsible for product promotion',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd6',
    name: 'Sales',
    description: 'Sales department handling customer acquisition',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd7',
    name: 'PMO',
    description: 'Project Management Office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create test users with various roles
export const mockUsers: User[] = [
  // Admins
  {
    id: 'admin1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    department: mockDepartments[0],
    username: 'admin.user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Executives
  {
    id: 'exec1',
    email: 'ceo@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.EXECUTIVE,
    department: mockDepartments[3], // Finance
    username: 'sarah.johnson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'exec2',
    email: 'cto@example.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: UserRole.EXECUTIVE,
    department: mockDepartments[0], // IT
    username: 'michael.chen',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Department Directors
  {
    id: 'dir1',
    email: 'itdirector@example.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[0], // IT
    username: 'james.wilson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dir2',
    email: 'engdirector@example.com',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[1], // Engineering
    username: 'emily.rodriguez',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dir3',
    email: 'hrdirector@example.com',
    firstName: 'David',
    lastName: 'Thompson',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[2], // HR
    username: 'david.thompson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Main PMO
  {
    id: 'mainpmo1',
    email: 'mainpmo@example.com',
    firstName: 'Jennifer',
    lastName: 'Garcia',
    role: UserRole.MAIN_PMO,
    department: mockDepartments[6], // PMO
    username: 'jennifer.garcia',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Sub PMO
  {
    id: 'subpmo1',
    email: 'itpmo@example.com',
    firstName: 'Robert',
    lastName: 'Davis',
    role: UserRole.SUB_PMO,
    department: mockDepartments[0], // IT
    username: 'robert.davis',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'subpmo2',
    email: 'engpmo@example.com',
    firstName: 'Lisa',
    lastName: 'Martinez',
    role: UserRole.SUB_PMO,
    department: mockDepartments[1], // Engineering
    username: 'lisa.martinez',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Project Managers
  {
    id: 'pm1',
    email: 'itpm@example.com',
    firstName: 'Thomas',
    lastName: 'Anderson',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[0], // IT
    username: 'thomas.anderson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pm2',
    email: 'engpm@example.com',
    firstName: 'Michelle',
    lastName: 'Lee',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[1], // Engineering
    username: 'michelle.lee',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pm3',
    email: 'marketingpm@example.com',
    firstName: 'Daniel',
    lastName: 'White',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[4], // Marketing
    username: 'daniel.white',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Team Leads
  {
    id: 'tl1',
    email: 'devlead@example.com',
    firstName: 'Patricia',
    lastName: 'Taylor',
    role: UserRole.TEAM_LEAD,
    department: mockDepartments[1], // Engineering
    username: 'patricia.taylor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tl2',
    email: 'networklead@example.com',
    firstName: 'Andrew',
    lastName: 'Clark',
    role: UserRole.TEAM_LEAD,
    department: mockDepartments[0], // IT
    username: 'andrew.clark',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Developers
  {
    id: 'dev1',
    email: 'frontend@example.com',
    firstName: 'Jessica',
    lastName: 'Brown',
    role: UserRole.DEVELOPER,
    department: mockDepartments[1], // Engineering
    username: 'jessica.brown',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev2',
    email: 'backend@example.com',
    firstName: 'Kevin',
    lastName: 'Miller',
    role: UserRole.DEVELOPER,
    department: mockDepartments[1], // Engineering
    username: 'kevin.miller',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev3',
    email: 'fullstack@example.com',
    firstName: 'Amanda',
    lastName: 'Moore',
    role: UserRole.DEVELOPER,
    department: mockDepartments[1], // Engineering
    username: 'amanda.moore',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // QA - using DEVELOPER role since QA isn't in UserRole enum
  {
    id: 'qa1',
    email: 'qaengineer@example.com',
    firstName: 'Brian',
    lastName: 'Jackson',
    role: UserRole.DEVELOPER,
    department: mockDepartments[1], // Engineering
    username: 'brian.jackson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'qa2',
    email: 'qalead@example.com',
    firstName: 'Stephanie',
    lastName: 'Lewis',
    role: UserRole.DEVELOPER,
    department: mockDepartments[1], // Engineering
    username: 'stephanie.lewis',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Other team members - using DEVELOPER role since the other roles aren't in UserRole enum
  {
    id: 'design1',
    email: 'uidesigner@example.com',
    firstName: 'Mark',
    lastName: 'Harris',
    role: UserRole.DEVELOPER,
    department: mockDepartments[4], // Marketing
    username: 'mark.harris',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sales1',
    email: 'salesrep@example.com',
    firstName: 'Laura',
    lastName: 'King',
    role: UserRole.DEVELOPER,
    department: mockDepartments[5], // Sales
    username: 'laura.king',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'finance1',
    email: 'accountant@example.com',
    firstName: 'Christopher',
    lastName: 'Scott',
    role: UserRole.DEVELOPER,
    department: mockDepartments[3], // Finance
    username: 'christopher.scott',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hr1',
    email: 'hrspecialist@example.com',
    firstName: 'Nicole',
    lastName: 'Green',
    role: UserRole.DEVELOPER,
    department: mockDepartments[2], // HR
    username: 'nicole.green',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Digital Transformation',
    description: 'Company-wide digital transformation initiative to modernize systems and processes',
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.HIGH,
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(),
    projectManager: mockUsers[9], // Thomas Anderson
    department: mockDepartments[0], // IT
    budget: 500000,
    actualCost: 150000,
    progress: 35,
    templateType: ProjectTemplateType.DEFAULT,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
  },
  {
    id: 'p2',
    name: 'Product Launch Campaign',
    description: 'Marketing campaign for the new product line launching in Q3',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    startDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
    projectManager: mockUsers[11], // Daniel White
    department: mockDepartments[4], // Marketing
    budget: 250000,
    actualCost: 25000,
    progress: 10,
    templateType: ProjectTemplateType.MARKETING,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
  },
  {
    id: 'p3',
    name: 'Legacy System Migration',
    description: 'Migration from legacy systems to modern cloud-based infrastructure',
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.CRITICAL,
    startDate: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    projectManager: mockUsers[10], // Michelle Lee
    department: mockDepartments[1], // Engineering
    budget: 750000,
    actualCost: 400000,
    progress: 65,
    templateType: ProjectTemplateType.INFRASTRUCTURE,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  }
];

// Mock Risks
export const mockRisks: Risk[] = [
  {
    id: 'r1',
    projectId: 'p1',
    title: 'Vendor Integration Delays',
    description: 'Potential delays in vendor integration for the new system',
    status: RiskStatus.IDENTIFIED,
    impact: RiskImpact.MEDIUM,
    probability: 50,
    mitigation: 'Begin early engagement with vendors and establish clear milestones',
    owner: mockUsers[9], // Thomas Anderson
    createdBy: mockUsers[0], // Admin
    createdAt: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString()
  },
  {
    id: 'r2',
    projectId: 'p1',
    title: 'Data Migration Corruption',
    description: 'Risk of data corruption during the migration process',
    status: RiskStatus.ASSESSED,
    impact: RiskImpact.HIGH,
    probability: 30,
    mitigation: 'Implement comprehensive backup strategy and perform multiple test migrations',
    owner: mockUsers[16], // Kevin Miller
    createdBy: mockUsers[9], // Thomas Anderson
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
  },
  {
    id: 'r3',
    projectId: 'p3',
    title: 'Resource Availability',
    description: 'Key technical resources may not be available for the entire project duration',
    status: RiskStatus.MITIGATED,
    impact: RiskImpact.MEDIUM,
    probability: 40,
    mitigation: 'Cross-train additional team members and create detailed documentation',
    owner: mockUsers[10], // Michelle Lee
    createdBy: mockUsers[4], // Emily Rodriguez
    createdAt: new Date(new Date().setDate(new Date().getDate() - 50)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
  }
];

// Mock Issues
export const mockIssues: Issue[] = [
  {
    id: 'i1',
    projectId: 'p1',
    title: 'API Authentication Failure',
    description: 'The authentication mechanism for the new API is failing in staging environment',
    status: IssueStatus.OPEN,
    impact: RiskImpact.HIGH,
    owner: mockUsers[16], // Kevin Miller
    createdBy: mockUsers[15], // Jessica Brown
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
  },
  {
    id: 'i2',
    projectId: 'p3',
    title: 'Database Performance Degradation',
    description: 'Database performance has degraded after migrating data from legacy system',
    status: IssueStatus.IN_PROGRESS,
    impact: RiskImpact.MEDIUM,
    owner: mockUsers[16], // Kevin Miller
    resolutionSummary: 'Investigating query performance and adding necessary indexes',
    createdBy: mockUsers[15], // Jessica Brown
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()
  },
  {
    id: 'i3',
    projectId: 'p2',
    title: 'Design Asset Discrepancies',
    description: 'Design assets provided by external agency do not match brand guidelines',
    status: IssueStatus.RESOLVED,
    impact: RiskImpact.LOW,
    owner: mockUsers[19], // Mark Harris
    resolutionSummary: 'Worked with agency to update all assets to comply with guidelines',
    createdBy: mockUsers[11], // Daniel White
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
  }
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Sprint Planning',
    description: 'Weekly sprint planning session for the Digital Transformation project',
    startTime: new Date(new Date().setHours(new Date().getHours() + 1)).toISOString(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
    status: MeetingStatus.SCHEDULED,
    organizer: mockUsers[9], // Thomas Anderson
    participants: [mockUsers[9], mockUsers[15], mockUsers[16], mockUsers[17]], // Thomas, Jessica, Kevin, Amanda
    isActive: true,
    meetingLink: 'https://example.com/meeting/123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm2',
    title: 'Product Demo',
    description: 'Demo of the latest features for the executive team',
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    status: MeetingStatus.SCHEDULED,
    organizer: mockUsers[10], // Michelle Lee
    participants: [mockUsers[1], mockUsers[2], mockUsers[10], mockUsers[15], mockUsers[16]], // Sarah, Michael, Michelle, Jessica, Kevin
    isActive: true,
    meetingLink: 'https://example.com/meeting/456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm3',
    title: 'Campaign Strategy Review',
    description: 'Review of the marketing campaign strategy for the new product launch',
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    endTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    status: MeetingStatus.COMPLETED,
    organizer: mockUsers[11], // Daniel White
    participants: [mockUsers[11], mockUsers[19], mockUsers[20]], // Daniel, Mark, Laura
    isActive: false,
    meetingLink: 'https://example.com/meeting/789',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  }
];

// Function to create default tasks for a project
export const createDefaultTasks = (projectId: string): Task[] => {
  // Find the corresponding project by ID
  const project = mockProjects.find(p => p.id === projectId) || mockProjects[0];
  
  return [
    {
      id: `task-${projectId}-1`,
      title: 'Project Kick-off',
      description: 'Initial kick-off meeting with all stakeholders',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      startDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      projectId: projectId,
      project: project,
      assignee: mockUsers[9], // Thomas Anderson (assume project manager)
      createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
    },
    {
      id: `task-${projectId}-2`,
      title: 'Requirements Gathering',
      description: 'Gather detailed requirements from all stakeholders',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      startDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      projectId: projectId,
      project: project,
      assignee: mockUsers[15], // Jessica Brown
      createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
    },
    {
      id: `task-${projectId}-3`,
      title: 'Design Prototype',
      description: 'Create initial design prototypes based on requirements',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      startDate: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      projectId: projectId,
      project: project,
      assignee: mockUsers[19], // Mark Harris
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString()
    },
    {
      id: `task-${projectId}-4`,
      title: 'Backend Development',
      description: 'Develop backend APIs and database structure',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      startDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      projectId: projectId,
      project: project,
      assignee: mockUsers[16], // Kevin Miller
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    },
    {
      id: `task-${projectId}-5`,
      title: 'Frontend Implementation',
      description: 'Implement user interface based on approved designs',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      startDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 18)).toISOString(),
      projectId: projectId,
      project: project,
      assignee: mockUsers[15], // Jessica Brown
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    }
  ];
};

// Function to get users by department
export const getUsersByDepartment = (departmentId: string): User[] => {
  return mockUsers.filter(user => user.department.id === departmentId);
};

// Function to get users by role
export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(user => user.role === role);
};

// Function to get random users for team selection
export const getRandomUsers = (count: number): User[] => {
  const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Export the mock data
export default {
  users: mockUsers,
  departments: mockDepartments,
  projects: mockProjects,
  risks: mockRisks,
  meetings: mockMeetings,
  issues: mockIssues,
  getUsersByDepartment,
  getUsersByRole,
  getRandomUsers,
  createDefaultTasks
}; 