import { Project, User, Department, ProjectStatus, ProjectPriority, Task, TaskStatus, Risk, Meeting, Issue, UserRole, RiskStatus, IssueStatus, RiskImpact, TaskRequestStatus, MeetingStatus, TaskPriority } from '../types';

// Mock Departments
export const mockDepartments: Department[] = [
  { id: 'd1', name: 'IT', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
  { id: 'd2', name: 'Marketing', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
  { id: 'd3', name: 'Finance', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
  { id: 'd4', name: 'Operations', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
  { id: 'd5', name: 'HR', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
  { id: 'd6', name: 'Research & Development', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'u1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@acme.com',
    role: UserRole.ADMIN,
    department: mockDepartments[0],
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2023-06-10T14:45:00Z'
  },
  {
    id: 'u2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@acme.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[0],
    createdAt: '2023-01-20T09:15:00Z',
    updatedAt: '2023-05-25T11:30:00Z'
  },
  {
    id: 'u3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@acme.com',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0],
    createdAt: '2023-02-05T10:45:00Z',
    updatedAt: '2023-06-15T16:20:00Z'
  },
  {
    id: 'u4',
    firstName: 'Emma',
    lastName: 'Garcia',
    email: 'emma.garcia@acme.com',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[1],
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2023-06-05T13:15:00Z'
  },
  {
    id: 'u5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@acme.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[1],
    createdAt: '2023-02-10T11:20:00Z',
    updatedAt: '2023-05-30T15:45:00Z'
  },
  {
    id: 'u6',
    firstName: 'Sophia',
    lastName: 'Kim',
    email: 'sophia.kim@acme.com',
    role: UserRole.DESIGNER,
    department: mockDepartments[1],
    createdAt: '2023-03-01T09:30:00Z',
    updatedAt: '2023-06-20T10:10:00Z'
  },
  {
    id: 'u7',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@acme.com',
    role: UserRole.EXECUTIVE,
    department: mockDepartments[2],
    createdAt: '2023-01-05T08:15:00Z',
    updatedAt: '2023-05-20T14:00:00Z'
  },
  {
    id: 'u8',
    firstName: 'Olivia',
    lastName: 'Martinez',
    email: 'olivia.martinez@acme.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[2],
    createdAt: '2023-02-15T10:00:00Z',
    updatedAt: '2023-06-25T11:45:00Z'
  },
  {
    id: 'u9',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@acme.com',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[3],
    createdAt: '2023-01-25T09:45:00Z',
    updatedAt: '2023-06-01T15:30:00Z'
  },
  {
    id: 'u10',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@acme.com',
    role: UserRole.MANAGER,
    department: mockDepartments[3],
    createdAt: '2023-03-05T10:15:00Z',
    updatedAt: '2023-06-30T09:20:00Z'
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'ERP System Implementation',
    description: 'Implementation of a new enterprise resource planning system to streamline business operations and improve efficiency.',
    startDate: '2023-02-01T00:00:00Z',
    endDate: '2023-08-30T00:00:00Z',
    department: mockDepartments[0],
    projectManager: mockUsers[1],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.HIGH,
    client: 'Internal',
    progress: 65,
    budget: 250000,
    actualCost: 162500,
    createdAt: '2023-01-15T09:00:00Z',
    updatedAt: '2023-07-10T14:30:00Z'
  },
  {
    id: 'p2',
    name: 'Q3 Marketing Campaign',
    description: 'Strategic marketing campaign aimed at increasing brand awareness and customer engagement for Q3 2023.',
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-09-30T00:00:00Z',
    department: mockDepartments[1],
    projectManager: mockUsers[4],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.MEDIUM,
    client: 'Internal',
    progress: 40,
    budget: 75000,
    actualCost: 32000,
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-07-05T11:15:00Z'
  },
  {
    id: 'p3',
    name: 'Financial Reporting System',
    description: 'Development of a new financial reporting system to comply with updated regulatory requirements and improve data accuracy.',
    startDate: '2023-03-15T00:00:00Z',
    endDate: '2023-10-15T00:00:00Z',
    department: mockDepartments[2],
    projectManager: mockUsers[7],
    status: ProjectStatus.ON_HOLD,
    priority: ProjectPriority.CRITICAL,
    client: 'Internal',
    progress: 30,
    budget: 180000,
    actualCost: 54000,
    createdAt: '2023-02-28T08:45:00Z',
    updatedAt: '2023-07-01T16:20:00Z'
  },
  {
    id: 'p4',
    name: 'Supply Chain Optimization',
    description: 'Project to optimize the supply chain network, reduce costs, and improve delivery times across all regions.',
    startDate: '2023-01-10T00:00:00Z',
    endDate: '2023-06-30T00:00:00Z',
    department: mockDepartments[3],
    projectManager: mockUsers[8],
    status: ProjectStatus.COMPLETED,
    priority: ProjectPriority.HIGH,
    client: 'Internal',
    progress: 100,
    budget: 120000,
    actualCost: 115000,
    createdAt: '2022-12-15T09:30:00Z',
    updatedAt: '2023-07-02T10:45:00Z'
  },
  {
    id: 'p5',
    name: 'Employee Training Program',
    description: 'Development of a comprehensive training program for new employees to improve onboarding and skill development.',
    startDate: '2023-04-01T00:00:00Z',
    endDate: '2023-09-15T00:00:00Z',
    department: mockDepartments[4],
    projectManager: mockUsers[1],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.MEDIUM,
    client: 'Internal',
    progress: 55,
    budget: 50000,
    actualCost: 27500,
    createdAt: '2023-03-15T11:00:00Z',
    updatedAt: '2023-07-08T15:30:00Z'
  },
  {
    id: 'p6',
    name: 'New Product Development',
    description: 'Research and development of a new product line to expand market presence and drive revenue growth.',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2024-01-15T00:00:00Z',
    department: mockDepartments[5],
    projectManager: mockUsers[4],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.CRITICAL,
    client: 'Internal',
    progress: 35,
    budget: 300000,
    actualCost: 105000,
    createdAt: '2022-12-20T10:15:00Z',
    updatedAt: '2023-07-12T11:45:00Z'
  },
  {
    id: 'p7',
    name: 'Website Redesign',
    description: 'Comprehensive redesign of the company website to improve user experience, mobile responsiveness, and conversion rates.',
    startDate: '2023-05-01T00:00:00Z',
    endDate: '2023-08-15T00:00:00Z',
    department: mockDepartments[1],
    projectManager: mockUsers[4],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.HIGH,
    client: 'Internal',
    progress: 70,
    budget: 85000,
    actualCost: 59500,
    createdAt: '2023-04-15T09:45:00Z',
    updatedAt: '2023-07-15T14:00:00Z'
  },
  {
    id: 'p8',
    name: 'Data Center Migration',
    description: 'Migration of on-premises data center to cloud infrastructure to improve scalability and reduce maintenance costs.',
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2023-07-31T00:00:00Z',
    department: mockDepartments[0],
    projectManager: mockUsers[1],
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.CRITICAL,
    client: 'Internal',
    progress: 15,
    budget: 200000,
    actualCost: 30000,
    createdAt: '2023-02-15T08:30:00Z',
    updatedAt: '2023-07-18T16:45:00Z'
  },
  {
    id: 'p9',
    name: 'Budget Planning 2024',
    description: 'Strategic budget planning for fiscal year 2024 including forecasting, allocation, and optimization.',
    startDate: '2023-06-15T00:00:00Z',
    endDate: '2023-11-30T00:00:00Z',
    department: mockDepartments[2],
    projectManager: mockUsers[7],
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.HIGH,
    client: 'Internal',
    progress: 10,
    budget: 40000,
    actualCost: 4000,
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-07-20T11:30:00Z'
  },
  {
    id: 'p10',
    name: 'Cybersecurity Enhancement',
    description: 'Implementation of advanced cybersecurity measures to protect company data and ensure compliance with industry regulations.',
    startDate: '2023-02-15T00:00:00Z',
    endDate: '2023-10-31T00:00:00Z',
    department: mockDepartments[0],
    projectManager: mockUsers[1],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.CRITICAL,
    client: 'Internal',
    progress: 50,
    budget: 175000,
    actualCost: 87500,
    createdAt: '2023-01-30T09:15:00Z',
    updatedAt: '2023-07-22T15:15:00Z'
  },
  {
    id: 'p11',
    name: 'Customer Experience Improvement',
    description: 'Initiative to enhance customer experience across all touchpoints through process optimization and technology implementation.',
    startDate: '2023-04-15T00:00:00Z',
    endDate: '2023-12-15T00:00:00Z',
    department: mockDepartments[1],
    projectManager: mockUsers[4],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.MEDIUM,
    client: 'Internal',
    progress: 25,
    budget: 90000,
    actualCost: 22500,
    createdAt: '2023-04-01T11:30:00Z',
    updatedAt: '2023-07-25T10:00:00Z'
  },
  {
    id: 'p12',
    name: 'Mobile App Development',
    description: 'Development of a mobile application to provide customers with easy access to services and information on the go.',
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2023-09-30T00:00:00Z',
    department: mockDepartments[0],
    projectManager: mockUsers[1],
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.HIGH,
    client: 'Internal',
    progress: 60,
    budget: 120000,
    actualCost: 72000,
    createdAt: '2023-02-15T10:45:00Z',
    updatedAt: '2023-07-28T14:30:00Z'
  }
];

// Get a mock project reference to use in tasks
const getProjectForTask = (projectId: string): Project => {
  const mockProject: Project = {
    id: projectId,
    name: `Project ${projectId}`,
    description: 'A mock project',
    client: 'Internal',
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-12-31T00:00:00Z',
    projectManager: mockUsers[1],
    department: mockDepartments[0],
    progress: 50,
    budget: 100000,
    actualCost: 50000,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };
  return mockProject;
};

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Requirements Gathering',
    description: 'Collect and document all system requirements from stakeholders.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: 'p1',
    assignee: mockUsers[2],
    startDate: '2023-02-01T00:00:00Z',
    dueDate: '2023-02-15T00:00:00Z',
    createdBy: mockUsers[1],
    createdAt: '2023-01-25T10:00:00Z',
    updatedAt: '2023-02-16T09:30:00Z',
    project: getProjectForTask('p1')
  },
  {
    id: 't2',
    title: 'System Design',
    description: 'Create detailed system design documents based on requirements.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: 'p1',
    assignee: mockUsers[2],
    startDate: '2023-02-16T00:00:00Z',
    dueDate: '2023-03-15T00:00:00Z',
    createdBy: mockUsers[1],
    createdAt: '2023-02-10T14:00:00Z',
    updatedAt: '2023-03-16T11:15:00Z',
    project: getProjectForTask('p1')
  },
  {
    id: 't3',
    title: 'Database Implementation',
    description: 'Set up database structure and implement data models.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    projectId: 'p1',
    assignee: mockUsers[2],
    startDate: '2023-03-16T00:00:00Z',
    dueDate: '2023-04-15T00:00:00Z',
    createdBy: mockUsers[1],
    createdAt: '2023-03-10T09:45:00Z',
    updatedAt: '2023-07-01T15:30:00Z',
    project: getProjectForTask('p1')
  },
  {
    id: 't4',
    title: 'Campaign Strategy Development',
    description: 'Develop comprehensive marketing strategy for Q3 campaign.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: 'p2',
    assignee: mockUsers[5],
    startDate: '2023-06-01T00:00:00Z',
    dueDate: '2023-06-15T00:00:00Z',
    createdBy: mockUsers[4],
    createdAt: '2023-05-25T11:30:00Z',
    updatedAt: '2023-06-16T10:00:00Z',
    project: getProjectForTask('p2')
  },
  {
    id: 't5',
    title: 'Content Creation',
    description: 'Create content for various channels including social media, website, and email.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    projectId: 'p2',
    assignee: mockUsers[5],
    startDate: '2023-06-16T00:00:00Z',
    dueDate: '2023-07-15T00:00:00Z',
    createdBy: mockUsers[4],
    createdAt: '2023-06-10T14:15:00Z',
    updatedAt: '2023-07-05T16:00:00Z',
    project: getProjectForTask('p2')
  },
  {
    id: 't6',
    title: 'Requirements Analysis',
    description: 'Analyze and document financial reporting requirements.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: 'p3',
    assignee: mockUsers[7],
    startDate: '2023-03-15T00:00:00Z',
    dueDate: '2023-04-15T00:00:00Z',
    createdBy: mockUsers[7],
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2023-04-16T11:45:00Z',
    project: getProjectForTask('p3')
  },
  {
    id: 't7',
    title: 'Supply Chain Assessment',
    description: 'Conduct comprehensive assessment of current supply chain processes.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: 'p4',
    assignee: mockUsers[9],
    startDate: '2023-01-10T00:00:00Z',
    dueDate: '2023-02-10T00:00:00Z',
    createdBy: mockUsers[8],
    createdAt: '2023-01-05T10:30:00Z',
    updatedAt: '2023-02-11T14:00:00Z',
    project: getProjectForTask('p4')
  }
];

// Mock Risks
export const mockRisks: Risk[] = [
  {
    id: 'r1',
    title: 'Data Migration Failure',
    description: 'Risk of data loss or corruption during the migration process.',
    status: RiskStatus.IDENTIFIED,
    projectId: 'p1',
    probability: 0.5,
    impact: RiskImpact.HIGH,
    mitigation: 'Implement comprehensive backup strategy and conduct multiple test migrations.',
    owner: mockUsers[1],
    createdBy: mockUsers[0],
    createdAt: '2023-02-05T11:30:00Z',
    updatedAt: '2023-02-05T11:30:00Z'
  },
  {
    id: 'r2',
    title: 'Budget Overrun',
    description: 'Risk of exceeding allocated budget due to unforeseen technical challenges.',
    status: RiskStatus.MONITORED,
    projectId: 'p1',
    probability: 0.3,
    impact: RiskImpact.HIGH,
    mitigation: 'Implement strict budget controls and establish contingency fund.',
    owner: mockUsers[1],
    createdBy: mockUsers[0],
    createdAt: '2023-02-10T09:45:00Z',
    updatedAt: '2023-06-15T14:30:00Z'
  },
  {
    id: 'r3',
    title: 'Market Response Below Expectations',
    description: 'Risk of campaign not generating expected customer engagement.',
    status: RiskStatus.IDENTIFIED,
    projectId: 'p2',
    probability: 0.2,
    impact: RiskImpact.HIGH,
    mitigation: 'Conduct thorough market research and prepare contingency plans for campaign adjustments.',
    owner: mockUsers[4],
    createdBy: mockUsers[3],
    createdAt: '2023-05-20T10:15:00Z',
    updatedAt: '2023-05-20T10:15:00Z'
  }
];

// Mock Issues
export const mockIssues: Issue[] = [
  {
    id: 'i1',
    title: 'Integration Failure with Legacy System',
    description: 'The new ERP system is unable to integrate with the existing legacy accounting system.',
    status: IssueStatus.OPEN,
    projectId: 'p1',
    impact: RiskImpact.HIGH,
    owner: mockUsers[1],
    createdBy: mockUsers[2],
    createdAt: '2023-04-10T09:30:00Z',
    updatedAt: '2023-04-10T09:30:00Z'
  },
  {
    id: 'i2',
    title: 'Vendor Delivery Delays',
    description: 'Critical hardware components are delayed by the vendor, affecting project timeline.',
    status: IssueStatus.IN_PROGRESS,
    projectId: 'p4',
    impact: RiskImpact.CRITICAL,
    owner: mockUsers[8],
    createdBy: mockUsers[8],
    createdAt: '2023-03-15T14:45:00Z',
    updatedAt: '2023-04-20T11:30:00Z'
  }
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'ERP Implementation Kickoff',
    description: 'Initial project kickoff meeting to align on goals, timeline, and responsibilities.',
    date: '2023-02-01T09:00:00Z',
    startTime: '2023-02-01T09:00:00Z',
    endTime: '2023-02-01T10:30:00Z',
    location: 'Conference Room A',
    projectId: 'p1',
    organizer: mockUsers[1],
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[6]],
    status: MeetingStatus.COMPLETED,
    createdAt: '2023-01-25T10:30:00Z',
    updatedAt: '2023-01-25T10:30:00Z'
  },
  {
    id: 'm2',
    title: 'Marketing Campaign Strategy Review',
    description: 'Review and finalize the Q3 marketing campaign strategy.',
    date: '2023-06-05T14:00:00Z',
    startTime: '2023-06-05T14:00:00Z',
    endTime: '2023-06-05T15:00:00Z',
    location: 'Virtual - Zoom',
    projectId: 'p2',
    organizer: mockUsers[4],
    participants: [mockUsers[3], mockUsers[4], mockUsers[5]],
    status: MeetingStatus.COMPLETED,
    createdAt: '2023-05-30T11:15:00Z',
    updatedAt: '2023-05-30T11:15:00Z'
  }
];

// Mock Notifications
export const mockNotifications = [
  {
    id: 'n1',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Database Implementation" task.',
    type: 'TASK_ASSIGNMENT',
    isRead: false,
    createdAt: '2023-03-10T09:45:00Z',
    userId: 'u2'
  },
  {
    id: 'n2',
    title: 'Meeting Reminder',
    message: 'ERP Implementation Kickoff meeting starts in 1 hour.',
    type: 'MEETING_REMINDER',
    isRead: true,
    createdAt: '2023-02-01T08:00:00Z',
    userId: 'u1'
  },
  {
    id: 'n3',
    title: 'Project Status Update',
    message: 'ERP System Implementation project status changed to "In Progress".',
    type: 'PROJECT_UPDATE',
    isRead: false,
    createdAt: '2023-03-01T10:30:00Z',
    userId: 'u1'
  },
  {
    id: 'n4',
    title: 'Risk Identified',
    message: 'New risk "Data Migration Failure" identified for ERP System Implementation.',
    type: 'RISK_ALERT',
    isRead: false,
    createdAt: '2023-02-05T11:30:00Z',
    userId: 'u1'
  },
  {
    id: 'n5',
    title: 'Task Completed',
    message: 'Task "Requirements Gathering" has been marked as completed.',
    type: 'TASK_UPDATE',
    isRead: true,
    createdAt: '2023-02-16T09:30:00Z',
    userId: 'u1'
  }
];

// Generate random activities for dashboard
export const generateRandomActivities = (count = 20) => {
  const activities = [];
  const activityTypes = ['task_created', 'task_completed', 'project_created', 'project_updated', 'meeting_scheduled', 'risk_identified', 'issue_reported'];
  const users = mockUsers;
  const projects = mockProjects;
  
  for (let i = 0; i < count; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    // Calculate a random date in the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    let message = '';
    
    switch (type) {
      case 'task_created':
        message = `${user.firstName} ${user.lastName} created a new task in ${project.name}`;
        break;
      case 'task_completed':
        message = `${user.firstName} ${user.lastName} completed a task in ${project.name}`;
        break;
      case 'project_created':
        message = `${user.firstName} ${user.lastName} created a new project: ${project.name}`;
        break;
      case 'project_updated':
        message = `${user.firstName} ${user.lastName} updated the status of ${project.name}`;
        break;
      case 'meeting_scheduled':
        message = `${user.firstName} ${user.lastName} scheduled a new meeting for ${project.name}`;
        break;
      case 'risk_identified':
        message = `${user.firstName} ${user.lastName} identified a new risk in ${project.name}`;
        break;
      case 'issue_reported':
        message = `${user.firstName} ${user.lastName} reported an issue in ${project.name}`;
        break;
    }
    
    activities.push({
      id: `a${i+1}`,
      type,
      user,
      project,
      message,
      timestamp: date.toISOString(),
    });
  }
  
  // Sort by timestamp (newest first)
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const mockActivities = generateRandomActivities(30); 