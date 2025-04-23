import axios from 'axios';
import { API_BASE_URL, FEATURES } from '../config';
import LocalStorageService from './LocalStorageService';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus, TaskStatus, UserRole, TaskPriority, RiskStatus, RiskImpact, IssueStatus, Project, Task, User, Department, Meeting, Risk, Issue, Assignment, AssignmentStatus, ApiResponse, MeetingStatus, ProjectPriority } from '../types';
import { 
  mockProjects, 
  mockUsers, 
  mockRisks, 
  mockMeetings, 
  mockIssues 
} from './mockData';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to simulate delay
const delay = () => new Promise(resolve => setTimeout(resolve, 500));

// Add simulateDelay function if not already present
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Create a reusable mock IT department
const mockITDepartment: Department = {
  id: '1',
  name: 'IT',
  description: 'Information Technology Department',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock Departments
const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software Engineering Department',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Design',
    description: 'Product Design Department',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Product',
    description: 'Product Management Department',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Test users with different roles
const testUsers = {
  admin: {
    id: 'user-1',
    username: 'john.smith',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@themis.com',
    role: UserRole.ADMIN,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  manager1: {
    id: 'user-2',
    username: 'sarah.johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@themis.com',
    role: UserRole.MANAGER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  manager2: {
    id: 'user-3',
    username: 'michael.chen',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@themis.com',
    role: UserRole.MANAGER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  developer: {
    id: 'user-4',
    username: 'emma.davis',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@themis.com',
    role: UserRole.DEVELOPER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  designer: {
    id: 'user-5',
    username: 'david.wilson',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@themis.com',
    role: UserRole.DESIGNER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Define a default projectId
const defaultProjectId = 'default-project-id';

// Add a default project reference for the task objects
const getDefaultProject = (projectId: string) => {
  return {
    id: projectId,
    name: 'Sample Project',
    description: 'A sample project for task testing',
    client: 'Sample Client',
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    projectManager: testUsers.admin,
    department: mockDepartments[0],
    progress: 50,
    budget: 100000,
    actualCost: 50000,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };
};

// Update the mock tasks with the required 'project' property
const mockTasks: Task[] = [
  {
    id: '1',
    projectId: defaultProjectId,
    title: 'Requirements Analysis',
    description: 'Analyze the requirements for the new system',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    startDate: '2023-01-15',
    dueDate: '2023-01-31',
    assignee: testUsers.admin,
    createdBy: testUsers.admin,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    isMilestone: false,
    project: getDefaultProject(defaultProjectId)
  },
  {
    id: '2',
    projectId: defaultProjectId,
    title: 'Database Schema Design',
    description: 'Design the database schema for the new system',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    startDate: '2023-02-01',
    dueDate: '2023-02-15',
    assignee: testUsers.developer,
    createdBy: testUsers.admin,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    isMilestone: false,
    project: getDefaultProject(defaultProjectId)
  }
];

/**
 * Generic API request function with error handling
 */
export const apiRequest = async (
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  token?: string, 
  isFormData?: boolean
): Promise<any> => {
  const USE_MOCK_DATA = true; // Set to true for development without backend
  
  try {
    // Set up the full URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set up options
    const headers: HeadersInit = {}; 
    
    // Set content type if not form data
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add auth token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options: RequestInit = {
      method,
      headers,
    };
    
    // Add body to the request if needed
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = isFormData ? data : JSON.stringify(data);
    }
    
    // Make the request
    if (!USE_MOCK_DATA) {
      const response = await fetch(url, options);
      
      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed with status ${response.status}`);
      }
      
      // Check if the response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } else {
      // Return mock data (with persistence)
      console.log(`Using mock data for endpoint: ${endpoint}, method: ${method}`);
      return getMockData(endpoint, method, data);
    }
  } catch (error) {
    console.error('API request failed:', error);
    if (USE_MOCK_DATA) {
      console.log(`Falling back to mock data for endpoint: ${endpoint}`);
      return getMockData(endpoint, method, data);
    }
    throw error;
  }
};

/**
 * Returns mock data for development based on the endpoint
 * Uses localStorage for persistence when available
 */
const getMockData = (endpoint: string, method: string = 'GET', data?: any): any => {
  // Create a new resource (POST)
  if (method === 'POST') {
    // Handle creating a new project
    if (endpoint === '/api/projects') {
      // Generate a random ID for the new project
      const newId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // Create the new project with the provided data
      const newProject = {
        id: newId,
        ...data,
        createdAt,
        updatedAt: createdAt,
      };
      
      // Save to local storage
      LocalStorageService.addProject(newProject);
      
      return {
        data: newProject,
        success: true
      };
    }
    
    // Handle creating a new task for a project
    if (endpoint.includes('/api/projects/') && endpoint.includes('/tasks')) {
      const projectId = endpoint.split('/projects/')[1].split('/tasks')[0];
      
      // Generate a random ID for the new task
      const newId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // Create the new task with the provided data
      const newTask = {
        id: newId,
        projectId,
        ...data,
        createdAt,
        updatedAt: createdAt,
      };
      
      // Save to local storage
      LocalStorageService.addTask(newTask);
      
      return {
        data: newTask,
        success: true
      };
    }
    
    // Handle creating a new independent task
    if (endpoint === '/api/tasks/independent') {
      // Generate a random ID for the new task
      const newId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // Create the new task with the provided data
      const newTask = {
        id: newId,
        ...data,
        createdAt,
        updatedAt: createdAt,
      };
      
      // Save to local storage
      LocalStorageService.addIndependentTask(newTask);
      
      return {
        data: newTask,
        success: true
      };
    }
    
    // Handle creating a new meeting
    if (endpoint === '/api/meetings') {
      // Generate a random ID for the new meeting
      const newId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // Create the new meeting with the provided data
      const newMeeting: Meeting = {
        id: newId,
        ...data,
        createdAt,
        updatedAt: createdAt,
        meetingLink: data.meetingLink || `https://meet.example.com/${newId}`,
        status: data.status || MeetingStatus.SCHEDULED,
        isActive: data.isActive || false,
        organizer: data.organizer || testUsers.admin,
        participants: data.participants || []
      };
      
      // Save to local storage
      LocalStorageService.addMeeting(newMeeting);
      
      return {
        data: newMeeting,
        success: true
      };
    }

    // Handle creating a new risk
    if (endpoint.includes('/projects/') && endpoint.includes('/risks')) {
      const projectId = endpoint.split('/projects/')[1].split('/risks')[0];
      
      // Generate a random ID for the new risk
      const newId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // Create the new risk with the provided data
      const newRisk = {
        id: newId,
        projectId,
        ...data,
        createdAt,
        updatedAt: createdAt
      };
      
      // Save to local storage
      LocalStorageService.addRisk(newRisk);
      
      return {
        data: newRisk,
        success: true
      };
    }
    
    // Handle creating a new issue
    if (endpoint.includes('/projects/') && endpoint.includes('/issues')) {
      const projectId = endpoint.split('/projects/')[1].split('/issues')[0];
      
      // Generate a random ID for the new issue
      const newId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // Create the new issue with the provided data
      const newIssue = {
        id: newId,
        projectId,
        ...data,
        createdAt,
        updatedAt: createdAt
      };
      
      // Save to local storage
      LocalStorageService.addIssue(newIssue);
      
      return {
        data: newIssue,
        success: true
      };
    }

    // Handle creating a new department
    if (endpoint === '/api/departments') {
      const newDepartment: Department = {
        id: uuidv4(),
        name: data.name,
        description: data.description || `${data.name} Department`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      LocalStorageService.addDepartment(newDepartment);
      
      return {
        data: newDepartment,
        success: true
      };
    }
  }
  
  // Update an existing resource (PUT)
  if (method === 'PUT') {
    // Handle updating a project
    if (endpoint.match(/\/api\/projects\/[\w-]+$/)) {
      const projectId = endpoint.split('/projects/')[1];
      
      // Update the project in local storage
      const updatedProject = LocalStorageService.updateProject(projectId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        data: updatedProject,
        success: !!updatedProject
      };
    }
    
    // Handle updating a task for a project
    if (endpoint.match(/\/api\/projects\/[\w-]+\/tasks\/[\w-]+$/)) {
      const parts = endpoint.split('/');
      const projectId = parts[parts.length - 3];
      const taskId = parts[parts.length - 1];
      
      // Update the task in local storage
      const updatedTask = LocalStorageService.updateTask(projectId, taskId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        data: updatedTask,
        success: !!updatedTask
      };
    }
    
    // Handle updating an independent task
    if (endpoint.match(/\/api\/tasks\/independent\/[\w-]+$/)) {
      const taskId = endpoint.split('/independent/')[1];
      
      // Update the task in local storage
      const updatedTask = LocalStorageService.updateIndependentTask(taskId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        data: updatedTask,
        success: !!updatedTask
      };
    }
    
    // Handle updating a meeting
    if (endpoint.match(/\/api\/meetings\/[\w-]+$/)) {
      const meetingId = endpoint.split('/meetings/')[1];
      
      // Update the meeting in local storage
      const updatedMeeting = LocalStorageService.updateMeeting(meetingId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        data: updatedMeeting,
        success: !!updatedMeeting
      };
    }

    // Handle updating a risk
    if (endpoint.match(/\/api\/projects\/[\w-]+\/risks\/[\w-]+$/)) {
      const parts = endpoint.split('/');
      const projectId = parts[parts.length - 3];
      const riskId = parts[parts.length - 1];
      
      // Update the risk in local storage
      const updatedRisk = LocalStorageService.updateRisk(projectId, riskId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        data: updatedRisk,
        success: !!updatedRisk
      };
    }
    
    // Handle updating an issue
    if (endpoint.match(/\/api\/projects\/[\w-]+\/issues\/[\w-]+$/)) {
      const parts = endpoint.split('/');
      const projectId = parts[parts.length - 3];
      const issueId = parts[parts.length - 1];
      
      // Update the issue in local storage
      const updatedIssue = LocalStorageService.updateIssue(projectId, issueId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        data: updatedIssue,
        success: !!updatedIssue
      };
    }
  }
  
  // Delete a resource (DELETE)
  if (method === 'DELETE') {
    // Handle deleting a project
    if (endpoint.match(/\/api\/projects\/[\w-]+$/)) {
      const projectId = endpoint.split('/projects/')[1];
      
      // Delete the project from local storage
      LocalStorageService.deleteProject(projectId);
      
      return {
        success: true
      };
    }
    
    // Handle deleting a task from a project
    if (endpoint.match(/\/api\/projects\/[\w-]+\/tasks\/[\w-]+$/)) {
      const parts = endpoint.split('/');
      const projectId = parts[parts.length - 3];
      const taskId = parts[parts.length - 1];
      
      // Delete the task from local storage
      LocalStorageService.deleteTask(projectId, taskId);
      
      return {
        success: true
      };
    }
    
    // Handle deleting an independent task
    if (endpoint.match(/\/api\/tasks\/independent\/[\w-]+$/)) {
      const taskId = endpoint.split('/independent/')[1];
      
      // Delete the task from local storage
      LocalStorageService.deleteIndependentTask(taskId);
      
      return {
        success: true
      };
    }
    
    // Handle deleting a meeting
    if (endpoint.match(/\/api\/meetings\/[\w-]+$/)) {
      const meetingId = endpoint.split('/meetings/')[1];
      
      // Delete the meeting from local storage
      LocalStorageService.deleteMeeting(meetingId);
      
      return {
        success: true
      };
    }

    // Handle deleting a risk
    if (endpoint.match(/\/api\/projects\/[\w-]+\/risks\/[\w-]+$/)) {
      const parts = endpoint.split('/');
      const projectId = parts[parts.length - 3];
      const riskId = parts[parts.length - 1];
      
      // Delete the risk from local storage
      LocalStorageService.deleteRisk(projectId, riskId);
      
      return {
        success: true
      };
    }
    
    // Handle deleting an issue
    if (endpoint.match(/\/api\/projects\/[\w-]+\/issues\/[\w-]+$/)) {
      const parts = endpoint.split('/');
      const projectId = parts[parts.length - 3];
      const issueId = parts[parts.length - 1];
      
      // Delete the issue from local storage
      LocalStorageService.deleteIssue(projectId, issueId);
      
      return {
        success: true
      };
    }
  }
  
  // GET requests for fetching data
  if (method === 'GET') {
    // Get all projects
    if (endpoint === '/api/projects') {
      // Get projects from local storage or use mock data if none
      const storedProjects = LocalStorageService.getProjects();
      
      if (storedProjects.length > 0) {
        return {
          data: storedProjects,
          success: true
        };
      }
      
      // Initialize localStorage with mockProjects from mockData.ts
      LocalStorageService.saveProjects(mockProjects);
      
      return {
        data: mockProjects,
        success: true
      };
    }
    
    // Get a specific project
    if (endpoint.match(/\/api\/projects\/[\w-]+$/)) {
      const projectId = endpoint.split('/projects/')[1];
      
      // Get project from local storage
      const project = LocalStorageService.getProject(projectId);
      
      if (project) {
        return {
          data: project,
          success: true
        };
      }
      
      return {
        success: false,
        message: 'Project not found'
      };
    }
    
    // Get tasks for a project
    if (endpoint.includes('/projects/') && endpoint.includes('/tasks')) {
      const projectId = endpoint.split('/projects/')[1].split('/tasks')[0];
      
      // Get tasks from local storage or use mock data if none
      const storedTasks = LocalStorageService.getTasks(projectId);
      
      if (storedTasks.length > 0) {
        return {
          data: storedTasks,
          success: true
        };
      }
      
      // Create default tasks for this project
      const tasks = mockTasks;
      
      // Save default tasks to local storage
      LocalStorageService.saveTasks(projectId, tasks);
      
      return {
        data: tasks,
        success: true
      };
    }
    
    // Get independent tasks
    if (endpoint === '/api/tasks/independent') {
      // Get tasks from local storage or use mock data if none
      const storedTasks = LocalStorageService.getIndependentTasks();
      
      if (storedTasks.length > 0) {
        return {
          data: storedTasks,
          success: true
        };
      }
      
      // Default empty response
      return {
        data: [],
        success: true
      };
    }
    
    // Get all meetings
    if (endpoint === '/api/meetings') {
      // Get meetings from local storage or use mock data if none
      const storedMeetings = LocalStorageService.getMeetings();
      
      if (storedMeetings.length > 0) {
        return {
          data: storedMeetings,
          success: true
        };
      }
      
      // Add isActive field for LocalStorageService compatibility
      const meetingsWithIsActive = defaultMeetings.map(meeting => ({
        ...meeting,
        isActive: meeting.status === MeetingStatus.IN_PROGRESS
      }));
      
      // Save default meetings to local storage
      LocalStorageService.saveMeetings(meetingsWithIsActive);
      
      return {
        data: meetingsWithIsActive,
        success: true
      };
    }
    
    // Get risks for a project
    if (endpoint.includes('/projects/') && endpoint.includes('/risks')) {
      const projectId = endpoint.split('/projects/')[1].split('/risks')[0];
      
      // Get risks from local storage or use mock data if none
      const storedRisks = LocalStorageService.getRisks(projectId);
      
      if (storedRisks.length > 0) {
        return {
          data: storedRisks,
          success: true
        };
      }
      
      // Default mock risks
      const defaultRisks = createDefaultRisks(projectId);
      
      // Save default risks to local storage
      LocalStorageService.saveRisks(projectId, defaultRisks);
      
      return {
        data: defaultRisks,
        success: true
      };
    }
    
    // Get issues for a project
    if (endpoint.includes('/projects/') && endpoint.includes('/issues')) {
      const projectId = endpoint.split('/projects/')[1].split('/issues')[0];
      
      // Get issues from local storage or use mock data if none
      const storedIssues = LocalStorageService.getIssues(projectId);
      
      if (storedIssues.length > 0) {
        return {
          data: storedIssues,
          success: true
        };
      }
      
      // Default mock issues
      const defaultIssues = createDefaultIssues(projectId);
      
      // Save default issues to local storage
      LocalStorageService.saveIssues(projectId, defaultIssues);
      
      return {
        data: defaultIssues,
        success: true
      };
    }
    
    // Get departments
    if (endpoint === '/api/departments') {
      const departments = LocalStorageService.getDepartments();
      
      if (departments.length > 0) {
        return {
          data: departments,
          success: true
        };
      }
      
      return {
        data: [],
        success: true
      };
    }
  }
  
  // Default empty response for unhandled endpoints
  return {
    data: [],
    success: true
  };
};

// Default mock meetings
const defaultMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Sprint Planning',
    description: 'Plan tasks for the next sprint',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: MeetingStatus.SCHEDULED,
    isActive: false,
    meetingLink: 'https://meet.example.com/sprint-planning',
    organizer: testUsers.admin,
    participants: [testUsers.manager1, testUsers.developer],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Project Status Review',
    description: 'Review the current status of the Digital Transformation project',
    startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: MeetingStatus.SCHEDULED,
    isActive: false,
    meetingLink: 'https://meet.example.com/project-status',
    organizer: testUsers.admin,
    participants: [testUsers.manager1, testUsers.manager2],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default mock risks
const createDefaultRisks = (projectId: string) => [
  {
    id: '1',
    projectId,
    title: 'Data Migration Risk',
    description: 'Risk of data loss during migration process',
    status: RiskStatus.IDENTIFIED,
    impact: RiskImpact.HIGH,
    probability: 70,
    mitigation: 'Create multiple backups before migration and perform test migrations on sample data',
    owner: testUsers.admin,
    createdBy: testUsers.admin,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-01-10T00:00:00Z'
  },
  {
    id: '2',
    projectId,
    title: 'Resource Availability Risk',
    description: 'Risk of key team members being unavailable during critical project phases',
    status: RiskStatus.ASSESSED,
    impact: RiskImpact.MEDIUM,
    probability: 50,
    mitigation: 'Develop contingency plans and cross-train team members',
    owner: testUsers.admin,
    createdBy: testUsers.admin,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  }
];

// Default mock issues
const createDefaultIssues = (projectId: string) => [
  {
    id: '1',
    projectId,
    title: 'Integration Failure with Legacy System',
    description: 'The new system cannot properly integrate with the existing legacy system',
    status: IssueStatus.OPEN,
    impact: RiskImpact.HIGH,
    owner: testUsers.admin,
    createdBy: testUsers.admin,
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2023-02-10T00:00:00Z'
  },
  {
    id: '2',
    projectId,
    title: 'Performance Bottleneck in Module A',
    description: 'Module A performance is not meeting expected throughput requirements',
    status: IssueStatus.IN_PROGRESS,
    impact: RiskImpact.MEDIUM,
    owner: testUsers.admin,
    createdBy: testUsers.admin,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-20T00:00:00Z'
  },
  {
    id: '3',
    projectId,
    title: 'Security Vulnerability in Authentication',
    description: 'Security audit identified a potential vulnerability in the authentication process',
    status: IssueStatus.RESOLVED,
    impact: RiskImpact.CRITICAL,
    resolutionSummary: 'Implemented updated security protocols and fixed the vulnerability with patch 1.2.3',
    owner: testUsers.admin,
    createdBy: testUsers.admin,
    createdAt: '2023-01-25T00:00:00Z',
    updatedAt: '2023-02-05T00:00:00Z'
  }
];

// Update the defaultProjects array with the required properties
const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Digital Transformation',
    description: 'Enterprise digital transformation project',
    client: 'Acme Corporation',
    priority: ProjectPriority.HIGH,
    startDate: '2023-01-15',
    endDate: '2023-12-31',
    status: ProjectStatus.IN_PROGRESS,
    progress: 65,
    budget: 500000,
    actualCost: 325000,
    department: mockDepartments[0],
    projectManager: testUsers.manager1,
    createdBy: testUsers.admin,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'proj-2',
    name: 'Cloud Migration',
    description: 'Migration of on-premises infrastructure to cloud',
    client: 'TechSolutions Inc',
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-02-01',
    endDate: '2023-08-31',
    status: ProjectStatus.ON_HOLD,
    progress: 40,
    budget: 300000,
    actualCost: 120000,
    department: mockDepartments[1],
    projectManager: testUsers.manager2,
    createdBy: testUsers.manager1,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'proj-3',
    name: 'E-commerce Platform Redesign',
    description: 'Redesign and modernization of e-commerce platform',
    client: 'Retail Giants',
    priority: ProjectPriority.CRITICAL,
    startDate: '2023-03-01',
    endDate: '2023-07-15',
    status: ProjectStatus.COMPLETED,
    progress: 100,
    budget: 450000,
    actualCost: 435000,
    department: mockDepartments[0],
    projectManager: testUsers.manager1,
    createdBy: testUsers.admin,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-07-18T00:00:00Z'
  },
  {
    id: 'proj-4',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for customer engagement',
    client: 'FinTech Solutions',
    priority: ProjectPriority.HIGH,
    startDate: '2023-04-01',
    endDate: '2023-10-31',
    status: ProjectStatus.IN_PROGRESS,
    progress: 55,
    budget: 380000,
    actualCost: 210000,
    department: mockDepartments[1],
    projectManager: testUsers.manager2,
    createdBy: testUsers.manager1,
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-07-20T00:00:00Z'
  },
  {
    id: 'proj-5',
    name: 'Security Infrastructure Enhancement',
    description: 'Upgrade of security systems and implementation of advanced protection measures',
    client: 'Internal',
    priority: ProjectPriority.CRITICAL,
    startDate: '2023-01-15',
    endDate: '2023-05-30',
    status: ProjectStatus.COMPLETED,
    progress: 100,
    budget: 275000,
    actualCost: 268000,
    department: mockDepartments[0],
    projectManager: testUsers.manager1,
    createdBy: testUsers.admin,
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-06-02T00:00:00Z'
  },
  {
    id: 'proj-6',
    name: 'Data Center Relocation',
    description: 'Physical relocation of data center to new facility',
    client: 'Internal',
    priority: ProjectPriority.HIGH,
    startDate: '2023-02-15',
    endDate: '2023-09-15',
    status: ProjectStatus.ON_HOLD,
    progress: 35,
    budget: 600000,
    actualCost: 210000,
    department: mockDepartments[0],
    projectManager: testUsers.manager1,
    createdBy: testUsers.admin,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-06-30T00:00:00Z'
  },
  {
    id: 'proj-7',
    name: 'AI Chatbot Implementation',
    description: 'Development and integration of AI-powered customer service chatbot',
    client: 'Service Plus Inc',
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-04-15',
    endDate: '2023-08-15',
    status: ProjectStatus.IN_PROGRESS,
    progress: 70,
    budget: 225000,
    actualCost: 157500,
    department: mockDepartments[1],
    projectManager: testUsers.manager2,
    createdBy: testUsers.manager1,
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-07-15T00:00:00Z'
  },
  {
    id: 'proj-8',
    name: 'CRM Integration',
    description: 'Integration of new CRM system with existing applications',
    client: 'Sales Masters',
    priority: ProjectPriority.HIGH,
    startDate: '2023-01-10',
    endDate: '2023-04-10',
    status: ProjectStatus.COMPLETED,
    progress: 100,
    budget: 180000,
    actualCost: 172000,
    department: mockDepartments[1],
    projectManager: testUsers.manager2,
    createdBy: testUsers.manager1,
    createdAt: '2022-12-20T00:00:00Z',
    updatedAt: '2023-04-12T00:00:00Z'
  },
  {
    id: 'proj-9',
    name: 'Financial Reporting System',
    description: 'Implementation of new financial reporting system',
    client: 'Internal',
    priority: ProjectPriority.MEDIUM,
    startDate: '2023-05-01',
    endDate: '2023-11-30',
    status: ProjectStatus.PLANNING,
    progress: 15,
    budget: 320000,
    actualCost: 48000,
    department: mockDepartments[0],
    projectManager: testUsers.manager1,
    createdBy: testUsers.admin,
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2023-06-10T00:00:00Z'
  }
];

// Helper function to simulate login
export const login = async (email: string, password: string) => {
  // For testing purposes, we'll match the email and return the corresponding test user
  const user = Object.values(testUsers).find(u => u.email === email);
  
  if (user) {
    return {
      success: true,
      data: user,
      message: 'Login successful'
    };
  }
  
  return {
    success: false,
    data: null,
    message: 'Invalid credentials'
  };
};

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'john.doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@themis.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'jane.smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@themis.com',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'mike.johnson',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@themis.com',
    role: UserRole.DESIGNER,
    department: mockDepartments[1],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    username: 'sarah.wilson',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@themis.com',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    username: 'david.brown',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@themis.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[2],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Implement User Authentication',
    description: 'Set up JWT authentication and user session management for the application. Include password reset functionality and email verification.',
    status: AssignmentStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assignedBy: defaultUsers[0],
    assignedTo: defaultUsers[1],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Design Landing Page Mockups',
    description: 'Create high-fidelity mockups for the new landing page. Include mobile and desktop versions, with dark mode support.',
    status: AssignmentStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assignedBy: defaultUsers[0],
    assignedTo: defaultUsers[2],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'API Performance Optimization',
    description: 'Optimize database queries and implement caching for frequently accessed endpoints. Target 50% reduction in response times.',
    status: AssignmentStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    assignedBy: defaultUsers[0],
    assignedTo: defaultUsers[3],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Write End-to-End Tests',
    description: 'Implement comprehensive E2E tests using Cypress for critical user flows. Achieve minimum 80% coverage.',
    status: AssignmentStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assignedBy: defaultUsers[4],
    assignedTo: defaultUsers[1],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Security Audit',
    description: 'Conduct a comprehensive security audit of the application. Check for vulnerabilities, update dependencies, and implement security best practices.',
    status: AssignmentStatus.PENDING,
    priority: TaskPriority.HIGH,
    assignedBy: defaultUsers[0],
    assignedTo: defaultUsers[3],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Mobile Responsive Design',
    description: 'Ensure all components are fully responsive on mobile devices. Fix any existing layout issues and implement mobile-specific optimizations.',
    status: AssignmentStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assignedBy: defaultUsers[4],
    assignedTo: defaultUsers[2],
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Documentation Update',
    description: 'Update API documentation and add usage examples for all endpoints. Include authentication requirements and response formats.',
    status: AssignmentStatus.COMPLETED,
    priority: TaskPriority.LOW,
    assignedBy: defaultUsers[0],
    assignedTo: defaultUsers[1],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'User Analytics Dashboard',
    description: 'Create a new dashboard to display user engagement metrics. Include charts for daily active users, session duration, and feature usage.',
    status: AssignmentStatus.PENDING,
    priority: TaskPriority.HIGH,
    assignedBy: defaultUsers[4],
    assignedTo: defaultUsers[3],
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const assignments = {
  getAllAssignments: async (token: string): Promise<ApiResponse<Assignment[]>> => {
    await delay();
    return {
      success: true,
      data: mockAssignments,
    };
  },
  
  getAssignmentById: async (id: string, token: string): Promise<ApiResponse<Assignment>> => {
    await delay();
    const assignment = mockAssignments.find(a => a.id === id);
    return {
      success: !!assignment,
      data: assignment || mockAssignments[0],
    };
  },

  createAssignment: async (data: Partial<Assignment>, token: string): Promise<ApiResponse<Assignment>> => {
    await delay();
    const newAssignment: Assignment = {
      id: String(mockAssignments.length + 1),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Assignment;
    mockAssignments.push(newAssignment);
    return {
      success: true,
      data: newAssignment,
    };
  },

  updateAssignment: async (id: string, data: Partial<Assignment>, token: string): Promise<ApiResponse<Assignment>> => {
    await delay();
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Assignment not found',
      };
    }
    mockAssignments[index] = {
      ...mockAssignments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return {
      success: true,
      data: mockAssignments[index],
    };
  },

  deleteAssignment: async (id: string, token: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Assignment not found',
      };
    }
    mockAssignments.splice(index, 1);
    return {
      success: true,
    };
  },
};

// Create a named API object to export instead of using anonymous default export
const apiRoutes = {
  // Auth endpoints
  auth: {
    login: (adIdentifier: string) => {
      // Mock implementation for testing without backend
      console.log('Using mock login implementation');
      return Promise.resolve({
        userId: '1',
        username: adIdentifier,
        role: UserRole.ADMIN, // Defaulting to ADMIN for testing
        departmentId: '1',
        token: 'mock-token-' + Date.now(),
        success: true,
        message: 'Login successful'
      });
    },
    
    refreshToken: (refreshToken: string) => 
      apiRequest('/api/auth/refresh', 'POST', { refreshToken }),
    
    logout: (token: string) => 
      apiRequest('/api/auth/logout', 'POST', {}, token),
  },

  // User endpoints
  users: {
    getCurrentUser: (token: string) => 
      apiRequest('/api/users/me', 'GET', undefined, token),
    
    getAllUsers: async (token: string): Promise<ApiResponse<User[]>> => {
      await delay();
      return {
        success: true,
        data: defaultUsers,
      };
    },
    
    getUserById: (userId: string, token: string) => 
      apiRequest(`/api/users/${userId}`, 'GET', undefined, token),
    
    createUser: (userData: any, token: string) => 
      apiRequest('/api/users', 'POST', userData, token),
    
    updateUser: (userId: string, userData: any, token: string) => 
      apiRequest(`/api/users/${userId}`, 'PUT', userData, token),
    
    deleteUser: (userId: string, token: string) => 
      apiRequest(`/api/users/${userId}`, 'DELETE', undefined, token),
    
    assignRole: (userId: string, role: string, token: string) => 
      apiRequest(`/api/users/${userId}/role`, 'PUT', { role }, token),
      
    assignDepartment: (userId: string, departmentId: string, token: string) => 
      apiRequest(`/api/users/${userId}/department`, 'PUT', { departmentId }, token),
      
    getAllDepartments: (token: string) => 
      apiRequest('/api/users/departments', 'GET', undefined, token),
  },

  // Project endpoints
  projects: {
    getAllProjects: (token: string) => 
      apiRequest('/api/projects', 'GET', undefined, token),
    
    getProjectById: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}`, 'GET', undefined, token),
    
    createProject: (projectData: any, token: string) => 
      apiRequest('/api/projects', 'POST', projectData, token),
    
    updateProject: (projectId: string, projectData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}`, 'PUT', projectData, token),
    
    deleteProject: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}`, 'DELETE', undefined, token),
      
    uploadAttachment: (projectId: string, formData: FormData, token: string) => 
      apiRequest(`/api/projects/${projectId}/attachments`, 'POST', formData, token, true),
      
    getAttachments: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/attachments`, 'GET', undefined, token),
      
    deleteAttachment: (projectId: string, attachmentId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/attachments/${attachmentId}`, 'DELETE', undefined, token),

    getProject: async (projectId: string, token: string) => {
      try {
        // In a real implementation, this would call the API
        // const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return response;
        
        // For now, return mock data
        return {
          data: {
            id: projectId,
            name: "Mock Project",
            description: "This is a mock project returned by the API",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            budget: 100000,
            progress: 50,
            department: {
              id: "dept-1",
              name: "IT Department"
            },
            projectManager: {
              id: "user-1",
              firstName: "John",
              lastName: "Doe"
            },
            approvalStatus: "SUBMITTED",
            comments: "This is a sample comment on the project",
            reviewHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error fetching project:', error);
        throw error;
      }
    },
  },

  // Task endpoints
  tasks: {
    getAllTasks: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/tasks`, 'GET', undefined, token),
    
    getAllIndependentTasks: (token: string) => 
      apiRequest('/api/tasks/independent', 'GET', undefined, token),
    
    getTaskById: (projectId: string, taskId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, 'GET', undefined, token),
    
    getIndependentTaskById: (taskId: string, token: string) => 
      apiRequest(`/api/tasks/independent/${taskId}`, 'GET', undefined, token),
    
    createTask: (projectId: string, taskData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/tasks`, 'POST', taskData, token),
    
    createIndependentTask: (taskData: any, token: string) => 
      apiRequest('/api/tasks/independent', 'POST', taskData, token),
    
    updateTask: (projectId: string, taskId: string, taskData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, 'PUT', taskData, token),
    
    updateIndependentTask: (taskId: string, taskData: any, token: string) => 
      apiRequest(`/api/tasks/independent/${taskId}`, 'PUT', taskData, token),
    
    deleteTask: (projectId: string, taskId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, 'DELETE', undefined, token),
    
    deleteIndependentTask: (taskId: string, token: string) => 
      apiRequest(`/api/tasks/independent/${taskId}`, 'DELETE', undefined, token),

    // Add task comment
    addComment: async (projectId: string, taskId: string, commentData: any, token: string) => {
      if (FEATURES.OFFLINE_MODE) {
        // In offline mode, simulate API response
        await simulateDelay();
        
        // Get existing tasks from localStorage
        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Find the specific task to add the comment to
        const taskIndex = allTasks.findIndex((t: any) => t.id === taskId && t.projectId === projectId);
        
        if (taskIndex !== -1) {
          // Create a new comment
          const newComment = {
            id: `comment-${Date.now()}`,
            taskId,
            text: commentData.text,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: {
              id: commentData.authorId,
              firstName: commentData.authorFirstName || 'User',
              lastName: commentData.authorLastName || commentData.authorId,
            }
          };
          
          // Add comment to the task
          if (!allTasks[taskIndex].comments) {
            allTasks[taskIndex].comments = [];
          }
          
          allTasks[taskIndex].comments.push(newComment);
          
          // Save back to localStorage
          localStorage.setItem('tasks', JSON.stringify(allTasks));
          
          return {
            success: true,
            data: newComment,
            message: 'Comment added successfully'
          };
        } else {
          throw new Error('Task not found');
        }
      } else {
        // In online mode, make actual API call
        const response = await axios.post(
          `${API_BASE_URL}/projects/${projectId}/tasks/${taskId}/comments`,
          commentData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        return response.data;
      }
    },
  },

  // Risk endpoints
  risks: {
    getAllRisks: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/risks`, 'GET', undefined, token),
    
    getRiskById: (projectId: string, riskId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/risks/${riskId}`, 'GET', undefined, token),
    
    createRisk: (projectId: string, riskData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/risks`, 'POST', riskData, token),
    
    updateRisk: (projectId: string, riskId: string, riskData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/risks/${riskId}`, 'PUT', riskData, token),
    
    deleteRisk: (projectId: string, riskId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/risks/${riskId}`, 'DELETE', undefined, token),
  },

  // Issue endpoints
  issues: {
    getAllIssues: (projectId: string, token: string) => 
      apiRequest(`/projects/${projectId}/issues`, 'GET', null, token),
    getIssueById: (projectId: string, issueId: string, token: string) => 
      apiRequest(`/projects/${projectId}/issues/${issueId}`, 'GET', null, token),
    createIssue: (projectId: string, issueData: Partial<Issue>, token: string) => 
      apiRequest(`/projects/${projectId}/issues`, 'POST', issueData, token),
    updateIssue: (projectId: string, issueId: string, issueData: Partial<Issue>, token: string) => 
      apiRequest(`/projects/${projectId}/issues/${issueId}`, 'PUT', issueData, token),
    deleteIssue: (projectId: string, issueId: string, token: string) => 
      apiRequest(`/projects/${projectId}/issues/${issueId}`, 'DELETE', null, token)
  },

  // Task Request endpoints
  taskRequests: {
    createTaskRequest: (requestData: any, token: string) =>
      apiRequest('/api/task-requests', 'POST', requestData, token),
      
    getTaskRequestsByProject: (projectId: string, token: string) =>
      apiRequest(`/api/task-requests?projectId=${projectId}`, 'GET', undefined, token),
      
    getTaskRequestById: (requestId: string, token: string) =>
      apiRequest(`/api/task-requests/${requestId}`, 'GET', undefined, token),
      
    updateTaskRequestStatus: (requestId: string, status: any, reviewNotes: string | undefined, token: string) =>
      apiRequest(`/api/task-requests/${requestId}/status`, 'PATCH', { status, reviewNotes }, token),
      
    approveTaskRequest: (requestId: string, reviewNotes: string | undefined, token: string) =>
      apiRequest(`/api/task-requests/${requestId}/approve`, 'POST', { reviewNotes }, token),
      
    rejectTaskRequest: (requestId: string, reviewNotes: string, token: string) =>
      apiRequest(`/api/task-requests/${requestId}/reject`, 'POST', { reviewNotes }, token)
  },

  // Assignment endpoints
  assignments,

  auditLogs: {
    getAuditLogs: (token: string) => 
      apiRequest('/audit-logs', 'GET', null, token),
    getAuditLogById: (logId: string, token: string) => 
      apiRequest(`/audit-logs/${logId}`, 'GET', null, token)
  },

  // Department endpoints
  departments: {
    getAllDepartments: async (token: string) => {
      try {
        // In a real implementation, this would call the API
        // const response = await axios.get(`${API_BASE_URL}/departments`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return response;
        
        // For now, return mock data
        return {
          data: [
            {
              id: "dept-1",
              name: "IT Department",
              description: "Information Technology Department",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: "dept-2",
              name: "HR Department",
              description: "Human Resources Department",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: "dept-3",
              name: "Finance Department",
              description: "Finance and Accounting Department",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        };
      } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }
    },
    
    getDepartmentById: async (departmentId: string, token: string) => {
      try {
        // In a real implementation, this would call the API
        // const response = await axios.get(`${API_BASE_URL}/departments/${departmentId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return response;
        
        // For now, return mock data
        return {
          data: {
            id: departmentId,
            name: "Mock Department",
            description: "This is a mock department",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error fetching department:', error);
        throw error;
      }
    },
    
    createDepartment: async (departmentData: any, token: string) => {
      try {
        // In a real implementation, this would call the API
        // const response = await axios.post(`${API_BASE_URL}/departments`, departmentData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return response;
        
        // For now, return mock data
        return {
          data: {
            id: Date.now().toString(),
            ...departmentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error creating department:', error);
        throw error;
      }
    },
    
    updateDepartment: async (departmentId: string, departmentData: any, token: string) => {
      try {
        // In a real implementation, this would call the API
        // const response = await axios.put(`${API_BASE_URL}/departments/${departmentId}`, departmentData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return response;
        
        // For now, return mock data
        return {
          data: {
            id: departmentId,
            ...departmentData,
            updatedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error updating department:', error);
        throw error;
      }
    },
    
    deleteDepartment: async (departmentId: string, token: string) => {
      try {
        // In a real implementation, this would call the API
        // const response = await axios.delete(`${API_BASE_URL}/departments/${departmentId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return response;
        
        // For now, return mock success
        return {
          data: {
            success: true,
            message: "Department deleted successfully"
          }
        };
      } catch (error) {
        console.error('Error deleting department:', error);
        throw error;
      }
    }
  },
};

export default apiRoutes;