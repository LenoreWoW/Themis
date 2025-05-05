import { v4 as uuidv4 } from 'uuid';

// Project types
export type ProjectStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type ProjectCategory = 'ERP' | 'WEBSITE' | 'INFRASTRUCTURE' | 'MARKETING' | 'FINANCE' | 'SUPPLY_CHAIN' | 'DIGITAL_TRANSFORMATION' | 'MOBILE_APP' | 'SECURITY' | 'DATA_MIGRATION';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  position: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  manager: string; // User ID
  department: string;
  team: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  risks: number;
  issues: number;
  tasks: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectId: string;
  assignee: string; // User ID
  reporter: string; // User ID
  dueDate: string;
  startDate: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[]; // Task IDs
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string; // User ID
  budget: number;
  employees: number;
  projects: number;
  tasks: number;
}

export interface RiskIssue {
  id: string;
  title: string;
  description: string;
  type: 'RISK' | 'ISSUE';
  status: 'OPEN' | 'MITIGATED' | 'CLOSED' | 'ACCEPTED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectId: string;
  assignee: string; // User ID
  reporter: string; // User ID
  dateIdentified: string;
  dateClosed?: string;
  impact: string;
  mitigation: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string; // User ID
  attendees: string[]; // User IDs
  projectId?: string;
  notes: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT';
  entityType: 'PROJECT' | 'TASK' | 'USER' | 'DEPARTMENT' | 'RISK' | 'ISSUE' | 'MEETING';
  entityId: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

// Mock data generation helpers
const ARAB_NAMES = [
  'Ahmed', 'Mohammed', 'Ali', 'Omar', 'Ibrahim', 'Nasser', 'Khalid', 'Abdullah', 'Hassan', 'Fahad',
  'Saad', 'Majid', 'Yousef', 'Abdulaziz', 'Saleh', 'Faisal', 'Sultan', 'Abdulrahman', 'Tariq', 'Waleed',
  'Fatima', 'Aisha', 'Maryam', 'Layla', 'Noor', 'Sara', 'Hessa', 'Amina', 'Noura', 'Reem',
  'Lina', 'Zainab', 'Salma', 'Hana', 'Leila', 'Dalia', 'Yasmin', 'Rawda', 'Manal', 'Asma'
];

const ARAB_LAST_NAMES = [
  'Al-Thani', 'Al-Dosari', 'Al-Kuwari', 'Al-Hajri', 'Al-Marri', 'Al-Naimi', 'Al-Khater', 'Al-Sulaiti', 'Al-Mohannadi', 'Al-Kaabi',
  'Al-Mansouri', 'Al-Attiyah', 'Al-Jaber', 'Al-Baker', 'Al-Derham', 'Al-Emadi', 'Al-Shahrani', 'Al-Ghanim', 'Al-Nuaimi', 'Al-Misnad'
];

const DEPARTMENTS = [
  'Information Technology', 'Human Resources', 'Finance', 'Marketing', 'Operations',
  'Research & Development', 'Customer Service', 'Sales', 'Legal', 'Executive',
  'Supply Chain', 'Project Management Office', 'Quality Assurance', 'Administration', 'Security'
];

const POSITIONS = [
  'Director', 'Manager', 'Team Lead', 'Senior Specialist', 'Specialist', 'Analyst',
  'Coordinator', 'Assistant', 'Administrator', 'Officer', 'Supervisor', 'Engineer',
  'Architect', 'Developer', 'Designer', 'Consultant', 'Advisor'
];

const ROLES = [
  'ADMIN', 'DEPARTMENT_DIRECTOR', 'PROJECT_MANAGER', 'TEAM_LEAD', 'TEAM_MEMBER',
  'EXECUTIVE', 'MAIN_PMO', 'SUB_PMO', 'VIEWER'
];

const PROJECT_NAMES = [
  'Digital Transformation Initiative', 'Enterprise Resource Planning System', 'Mobile App Development',
  'Cloud Migration Project', 'Cybersecurity Enhancement', 'Data Center Modernization',
  'Business Intelligence Platform', 'Customer Relationship Management', 'E-commerce Website Redesign',
  'Blockchain Implementation', 'Infrastructure Upgrade', 'Knowledge Management System',
  'Supply Chain Optimization', 'Artificial Intelligence Integration', 'Business Process Reengineering',
  'Document Management System', 'Disaster Recovery Planning', 'Network Security Upgrade',
  'Social Media Marketing Campaign', 'Human Resource Information System', 'Financial Management System',
  'IT Service Management Implementation', 'Big Data Analytics Platform', 'DevOps Transformation',
  'IoT Smart Building Initiative', 'Virtual Reality Training Program', 'Customer Experience Enhancement',
  'Automation and Robotics', 'Enterprise Communication Platform', 'Digital Workplace Initiative'
];

const TASK_TITLES = [
  'Requirements Analysis', 'System Design', 'Database Setup', 'Backend Development',
  'Frontend Implementation', 'API Integration', 'Unit Testing', 'Integration Testing',
  'User Acceptance Testing', 'Documentation', 'Deployment Planning', 'Training Materials Creation',
  'User Training', 'Performance Optimization', 'Security Audit', 'Code Review', 'Stakeholder Meeting',
  'Progress Report', 'Risk Assessment', 'Project Planning', 'Resource Allocation', 'Budget Review',
  'Vendor Management', 'Quality Assurance', 'Data Migration', 'Infrastructure Setup', 'Monitoring Setup',
  'Backup Configuration', 'Post-Implementation Review', 'Warranty Support'
];

const RISK_TITLES = [
  'Resource Shortage', 'Budget Overrun', 'Scope Creep', 'Technical Complexity',
  'Stakeholder Resistance', 'Vendor Delays', 'Integration Issues', 'Data Security Breach',
  'Regulatory Compliance Failure', 'Performance Degradation', 'Knowledge Gap',
  'Technology Obsolescence', 'Poor User Adoption', 'Infrastructure Failure',
  'Communication Breakdown', 'Key Personnel Departure', 'Quality Control Issues',
  'Schedule Slippage', 'Requirements Change', 'External Dependency Delay'
];

const MEETING_TITLES = [
  'Kickoff Meeting', 'Weekly Status Update', 'Sprint Planning', 'Sprint Review',
  'Sprint Retrospective', 'Project Review', 'Stakeholder Update', 'Risk Assessment Workshop',
  'Design Review', 'Technical Discussion', 'Requirements Gathering', 'Testing Coordination',
  'Deployment Planning', 'Post-Implementation Review', 'Client Presentation', 'Team Building',
  'Training Session', 'Change Control Board', 'Steering Committee', 'Executive Briefing'
];

const LOCATIONS = [
  'Main Conference Room', 'Executive Boardroom', 'Meeting Room A', 'Meeting Room B',
  'Virtual Conference', 'Zoom Call', 'Microsoft Teams', 'Training Center',
  'Offsite Location', 'Client Office', 'Vendor Facility'
];

// Helper functions
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const result: T[] = [];
  const arrayCopy = [...array];
  for (let i = 0; i < count && arrayCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * arrayCopy.length);
    result.push(arrayCopy[randomIndex]);
    arrayCopy.splice(randomIndex, 1);
  }
  return result;
};

const getRandomDate = (startYear = 2022, endYear = 2024): string => {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const getRandomFutureDate = (fromDate?: string, maxDaysAhead = 180): string => {
  const start = fromDate ? new Date(fromDate) : new Date();
  const daysToAdd = 1 + Math.floor(Math.random() * maxDaysAhead);
  const result = new Date(start);
  result.setDate(result.getDate() + daysToAdd);
  return result.toISOString().split('T')[0];
};

const getRandomPastDate = (fromDate?: string, maxDaysBefore = 180): string => {
  const end = fromDate ? new Date(fromDate) : new Date();
  const daysToSubtract = 1 + Math.floor(Math.random() * maxDaysBefore);
  const result = new Date(end);
  result.setDate(result.getDate() - daysToSubtract);
  return result.toISOString().split('T')[0];
};

const getRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const getRandomProgress = (): number => {
  return Math.floor(Math.random() * 101); // 0-100
};

const getRandomNumber = (min: number, max: number): number => {
  return min + Math.floor(Math.random() * (max - min + 1));
};

// Generator functions
export const generateMockUsers = (count: number = 100): User[] => {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(ARAB_NAMES);
    const lastName = getRandomElement(ARAB_LAST_NAMES);
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s/g, '');
    const email = `${username}@example.com`;
    const role = getRandomElement(ROLES);
    const department = getRandomElement(DEPARTMENTS);
    const position = getRandomElement(POSITIONS);
    
    users.push({
      id: uuidv4(),
      username,
      email,
      firstName,
      lastName,
      role,
      department,
      position,
      isActive: Math.random() > 0.1, // 90% active
      lastLogin: getRandomPastDate(undefined, 30),
      createdAt: getRandomPastDate(undefined, 365),
      phone: `+974 ${getRandomNumber(3000, 7000)} ${getRandomNumber(1000, 9999)}`
    });
  }
  
  return users;
};

export const generateMockProjects = (count: number = 50, users: User[]): Project[] => {
  const projects: Project[] = [];
  const categories: ProjectCategory[] = ['ERP', 'WEBSITE', 'INFRASTRUCTURE', 'MARKETING', 'FINANCE', 'SUPPLY_CHAIN', 'DIGITAL_TRANSFORMATION', 'MOBILE_APP', 'SECURITY', 'DATA_MIGRATION'];
  const statuses: ProjectStatus[] = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
  const priorities: ProjectPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  const managers = users.filter(user => 
    ['PROJECT_MANAGER', 'ADMIN', 'DEPARTMENT_DIRECTOR'].includes(user.role)
  );
  
  for (let i = 0; i < count; i++) {
    const name = getRandomElement(PROJECT_NAMES);
    const category = getRandomElement(categories);
    const status = getRandomElement(statuses);
    const priority = getRandomElement(priorities);
    const startDate = getRandomPastDate(undefined, 365);
    const endDate = getRandomFutureDate(startDate, 365);
    const manager = getRandomElement(managers);
    const department = manager.department;
    const teamSize = getRandomNumber(3, 15);
    const teamMembers = getRandomElements(users, teamSize).map(user => user.id);
    
    const progress = status === 'COMPLETED' ? 100 : 
                    status === 'PENDING' ? 0 :
                    status === 'APPROVED' ? getRandomNumber(0, 10) :
                    status === 'ON_HOLD' ? getRandomNumber(10, 90) :
                    status === 'CANCELLED' ? getRandomNumber(10, 90) :
                    getRandomNumber(10, 90); // IN_PROGRESS
    
    projects.push({
      id: uuidv4(),
      name,
      description: `This project aims to ${name.toLowerCase()} for the organization, focusing on improving efficiency and modernizing processes.`,
      category,
      status,
      priority,
      startDate,
      endDate,
      budget: getRandomNumber(50000, 5000000),
      progress,
      manager: manager.id,
      department,
      team: teamMembers,
      createdAt: getRandomPastDate(startDate, 30),
      updatedAt: getRandomPastDate(undefined, 14),
      createdBy: getRandomElement(teamMembers),
      risks: getRandomNumber(0, 5),
      issues: getRandomNumber(0, 3),
      tasks: getRandomNumber(10, 50),
      completedTasks: Math.floor(getRandomNumber(10, 50) * (progress / 100))
    });
  }
  
  return projects;
};

export const generateMockTasks = (count: number = 200, projects: Project[], users: User[]): Task[] => {
  const tasks: Task[] = [];
  const statuses: Task['status'][] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'];
  const priorities: Task['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  for (let i = 0; i < count; i++) {
    const project = getRandomElement(projects);
    const title = getRandomElement(TASK_TITLES);
    const status = getRandomElement(statuses);
    const priority = getRandomElement(priorities);
    
    // Find team members from this project
    const projectTeamMembers = users.filter(user => project.team.includes(user.id));
    const assignee = getRandomElement(projectTeamMembers);
    const reporter = getRandomElement([...projectTeamMembers, users.find(u => u.id === project.manager)!]);
    
    const startDate = project.startDate;
    const dueDate = getRandomFutureDate(startDate, new Date(project.endDate).getTime() - new Date(startDate).getTime());
    
    const progress = status === 'COMPLETED' ? 100 : 
                    status === 'TODO' ? 0 :
                    status === 'BLOCKED' ? getRandomNumber(10, 70) :
                    status === 'REVIEW' ? getRandomNumber(80, 95) :
                    getRandomNumber(10, 80); // IN_PROGRESS
    
    tasks.push({
      id: uuidv4(),
      title,
      description: `${title} for the ${project.name} project. This task involves detailed analysis and implementation.`,
      status,
      priority,
      projectId: project.id,
      assignee: assignee.id,
      reporter: reporter.id,
      dueDate,
      startDate,
      estimatedHours: getRandomNumber(4, 80),
      actualHours: status === 'COMPLETED' ? getRandomNumber(4, 100) : Math.round(getRandomNumber(4, 100) * (progress / 100)),
      dependencies: [],
      progress,
      createdAt: getRandomPastDate(startDate, 7),
      updatedAt: getRandomPastDate(undefined, 5)
    });
  }
  
  // Add some dependencies
  tasks.forEach(task => {
    const projectTasks = tasks.filter(t => t.projectId === task.projectId && t.id !== task.id);
    if (projectTasks.length > 0 && Math.random() > 0.7) {
      const dependencyCount = getRandomNumber(1, Math.min(3, projectTasks.length));
      task.dependencies = getRandomElements(projectTasks, dependencyCount).map(t => t.id);
    }
  });
  
  return tasks;
};

export const generateMockDepartments = (users: User[]): Department[] => {
  const uniqueDepartments = Array.from(new Set(users.map(user => user.department)));
  
  return uniqueDepartments.map(deptName => {
    const deptUsers = users.filter(user => user.department === deptName);
    const deptManagers = deptUsers.filter(user => 
      ['DEPARTMENT_DIRECTOR', 'ADMIN'].includes(user.role)
    );
    const manager = deptManagers.length > 0 ? getRandomElement(deptManagers) : getRandomElement(deptUsers);
    
    return {
      id: uuidv4(),
      name: deptName,
      description: `The ${deptName} department is responsible for key organizational functions and strategic initiatives.`,
      manager: manager.id,
      budget: getRandomNumber(500000, 10000000),
      employees: deptUsers.length,
      projects: getRandomNumber(2, 10),
      tasks: getRandomNumber(20, 100)
    };
  });
};

export const generateMockRiskIssues = (count: number = 100, projects: Project[], users: User[]): RiskIssue[] => {
  const riskIssues: RiskIssue[] = [];
  const types: RiskIssue['type'][] = ['RISK', 'ISSUE'];
  const statuses: RiskIssue['status'][] = ['OPEN', 'MITIGATED', 'CLOSED', 'ACCEPTED'];
  const severities: RiskIssue['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  for (let i = 0; i < count; i++) {
    const project = getRandomElement(projects);
    const title = getRandomElement(RISK_TITLES);
    const type = getRandomElement(types);
    const status = getRandomElement(statuses);
    const severity = getRandomElement(severities);
    
    // Find team members from this project
    const projectTeamMembers = users.filter(user => project.team.includes(user.id));
    const assignee = getRandomElement(projectTeamMembers);
    const reporter = getRandomElement([...projectTeamMembers, users.find(u => u.id === project.manager)!]);
    
    const dateIdentified = getRandomPastDate(project.startDate, 180);
    const dateClosed = status === 'CLOSED' || status === 'MITIGATED' ? getRandomFutureDate(dateIdentified, 60) : undefined;
    
    riskIssues.push({
      id: uuidv4(),
      title,
      description: `${title} that could impact the ${project.name} project timeline and quality.`,
      type,
      status,
      severity,
      projectId: project.id,
      assignee: assignee.id,
      reporter: reporter.id,
      dateIdentified,
      dateClosed,
      impact: `This ${type.toLowerCase()} could result in ${severity.toLowerCase()} impact to project schedule, budget, or quality if not addressed.`,
      mitigation: `The team will ${status === 'ACCEPTED' ? 'accept and monitor' : 'mitigate'} this ${type.toLowerCase()} by implementing proper controls and monitoring.`
    });
  }
  
  return riskIssues;
};

export const generateMockMeetings = (count: number = 150, projects: Project[], users: User[]): Meeting[] => {
  const meetings: Meeting[] = [];
  const statuses: Meeting['status'][] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
  
  for (let i = 0; i < count; i++) {
    const project = getRandomElement(projects);
    const title = getRandomElement(MEETING_TITLES);
    const status = getRandomElement(statuses);
    
    // Find team members from this project
    const projectTeamMembers = users.filter(user => project.team.includes(user.id));
    
    // Sometimes create meetings without projects (org-wide meetings)
    const useProject = Math.random() > 0.2;
    const organizer = useProject ? 
      getRandomElement([...projectTeamMembers, users.find(u => u.id === project.manager)!]) :
      getRandomElement(users);
    
    const attendeeCount = getRandomNumber(3, 10);
    const attendees = useProject ? 
      getRandomElements(projectTeamMembers, Math.min(attendeeCount, projectTeamMembers.length)) :
      getRandomElements(users, attendeeCount);
    
    const date = useProject ? 
      getRandomFutureDate(project.startDate, new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) :
      getRandomFutureDate(undefined, 90);
    
    const startTime = getRandomTime();
    let endHours = parseInt(startTime.split(':')[0]);
    let endMinutes = parseInt(startTime.split(':')[1]) + 30 + (Math.floor(Math.random() * 4) * 30); // 30 min to 2 hours
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }
    endHours = endHours % 24;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    meetings.push({
      id: uuidv4(),
      title,
      description: `${title} to discuss the progress, challenges, and next steps for ${useProject ? 'the ' + project.name + ' project' : 'organizational initiatives'}.`,
      date,
      startTime,
      endTime,
      location: getRandomElement(LOCATIONS),
      organizer: organizer.id,
      attendees: attendees.map(user => user.id),
      projectId: useProject ? project.id : undefined,
      notes: status === 'COMPLETED' ? 'Meeting notes include action items, decisions, and next steps.' : '',
      status
    });
  }
  
  return meetings;
};

export const generateMockAuditLogs = (count: number = 500, users: User[], projects: Project[], tasks: Task[]): AuditLog[] => {
  const auditLogs: AuditLog[] = [];
  const actions: AuditLog['action'][] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'];
  const entityTypes: AuditLog['entityType'][] = ['PROJECT', 'TASK', 'USER', 'DEPARTMENT', 'RISK', 'ISSUE', 'MEETING'];
  
  for (let i = 0; i < count; i++) {
    const user = getRandomElement(users);
    const action = getRandomElement(actions);
    const entityType = getRandomElement(entityTypes);
    
    // Get realistic entity ID based on entity type
    let entityId = '';
    if (entityType === 'PROJECT') {
      entityId = getRandomElement(projects).id;
    } else if (entityType === 'TASK') {
      entityId = getRandomElement(tasks).id;
    } else if (entityType === 'USER') {
      entityId = getRandomElement(users).id;
    } else {
      entityId = uuidv4(); // For other entity types
    }
    
    const timestamp = getRandomPastDate(undefined, 90);
    
    auditLogs.push({
      id: uuidv4(),
      userId: user.id,
      action,
      entityType,
      entityId,
      timestamp,
      details: `User ${user.username} performed ${action} on ${entityType} with ID ${entityId.substring(0, 8)}...`,
      ipAddress: `192.168.${getRandomNumber(1, 255)}.${getRandomNumber(1, 255)}`
    });
  }
  
  // Sort by timestamp
  auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return auditLogs;
};

// Generate all mock data
export const generateAllMockData = () => {
  console.log('Generating mock data...');
  
  // Generate users first
  const users = generateMockUsers(150);
  console.log(`Generated ${users.length} users`);
  
  // Generate projects using those users
  const projects = generateMockProjects(75, users);
  console.log(`Generated ${projects.length} projects`);
  
  // Generate tasks for those projects
  const tasks = generateMockTasks(350, projects, users);
  console.log(`Generated ${tasks.length} tasks`);
  
  // Generate departments
  const departments = generateMockDepartments(users);
  console.log(`Generated ${departments.length} departments`);
  
  // Generate risks and issues
  const risksIssues = generateMockRiskIssues(120, projects, users);
  console.log(`Generated ${risksIssues.length} risks and issues`);
  
  // Generate meetings
  const meetings = generateMockMeetings(200, projects, users);
  console.log(`Generated ${meetings.length} meetings`);
  
  // Generate audit logs
  const auditLogs = generateMockAuditLogs(800, users, projects, tasks);
  console.log(`Generated ${auditLogs.length} audit logs`);
  
  return {
    users,
    projects,
    tasks,
    departments,
    risksIssues,
    meetings,
    auditLogs
  };
};

// Save data to localStorage
export const saveMockDataToLocalStorage = () => {
  const data = generateAllMockData();
  
  localStorage.setItem('mockUsers', JSON.stringify(data.users));
  localStorage.setItem('mockProjects', JSON.stringify(data.projects));
  localStorage.setItem('mockTasks', JSON.stringify(data.tasks));
  localStorage.setItem('mockDepartments', JSON.stringify(data.departments));
  localStorage.setItem('mockRisksIssues', JSON.stringify(data.risksIssues));
  localStorage.setItem('mockMeetings', JSON.stringify(data.meetings));
  localStorage.setItem('mockAuditLogs', JSON.stringify(data.auditLogs));
  
  console.log('All mock data saved to localStorage');
  
  return data;
}; 