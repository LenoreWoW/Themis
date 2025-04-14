import { API_BASE_URL } from '../config';
import LocalStorageService from './LocalStorageService';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus, TaskStatus, UserRole, TaskPriority, RiskStatus, RiskImpact, IssueStatus } from '../types';

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
        // Set default values if not provided
        dependencies: data.dependencies || []
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
        // Set default values if not provided
        dependencies: data.dependencies || []
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
      const newMeeting = {
        id: newId,
        ...data,
        createdAt,
        updatedAt: createdAt,
        isActive: false,
        meetingLink: `https://meet.example.com/${newId}`
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
      const department = data.name as string;
      
      // Save to local storage
      LocalStorageService.addDepartment(department);
      
      return {
        data: department,
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
      
      // Default mock data if no stored projects
      const defaultProjects = [
        {
          id: '1',
          name: 'Digital Transformation',
          description: 'Enterprise digital transformation project',
          startDate: '2023-01-15',
          endDate: '2023-12-31',
          status: ProjectStatus.IN_PROGRESS,
          progress: 65,
          budget: 500000,
          actualCost: 325000,
          department: 'IT',
          projectManager: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Cloud Migration',
          description: 'Migration of on-premises infrastructure to cloud',
          startDate: '2023-02-01',
          endDate: '2023-08-31',
          status: ProjectStatus.IN_PROGRESS,
          progress: 40,
          budget: 300000,
          actualCost: 120000,
          department: 'IT',
          projectManager: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: '2023-01-15T00:00:00Z'
        }
      ];
      
      // Initialize localStorage with default data
      LocalStorageService.saveProjects(defaultProjects);
      
      return {
        data: defaultProjects,
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
      
      // Default mock data if no stored tasks
      const defaultTasks = [
        {
          id: '1',
          projectId,
          title: 'Requirements Gathering',
          description: 'Gather and document system requirements',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          startDate: '2023-01-15',
          dueDate: '2023-01-31',
          assignee: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          dependencies: [],
          isMilestone: false
        },
        {
          id: '2',
          projectId,
          title: 'Database Schema Design',
          description: 'Design the database schema for the new system',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          startDate: '2023-02-01',
          dueDate: '2023-02-15',
          assignee: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: '2023-01-15T00:00:00Z',
          dependencies: [],
          isMilestone: false
        },
        {
          id: '3',
          projectId,
          title: 'Frontend Implementation',
          description: 'Implement the user interface',
          status: TaskStatus.DONE,
          priority: TaskPriority.HIGH,
          startDate: '2023-02-15',
          dueDate: '2023-03-15',
          assignee: {
            id: '2',
            username: 'user2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: UserRole.ADMIN,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-02-01T00:00:00Z',
          updatedAt: '2023-02-01T00:00:00Z',
          dependencies: ['1'],
          isMilestone: false
        }
      ];
      
      // Save default tasks to local storage
      LocalStorageService.saveTasks(projectId, defaultTasks);
      
      return {
        data: defaultTasks,
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
      
      // Default mock meetings
      const defaultMeetings = [
        {
          id: '1',
          title: 'Sprint Planning',
          description: 'Plan tasks for the next sprint',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour duration
          organizer: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
            department: 'IT',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          participants: [],
          isActive: false,
          meetingLink: 'https://meet.example.com/sprint-planning',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Project Status Review',
          description: 'Review the current status of the Digital Transformation project',
          startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1 hour duration
          organizer: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
            department: 'IT',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          participants: [],
          isActive: false,
          meetingLink: 'https://meet.example.com/project-status',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Save default meetings to local storage
      LocalStorageService.saveMeetings(defaultMeetings);
      
      return {
        data: defaultMeetings,
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
      
      // Default mock data if no stored risks
      const defaultRisks = [
        {
          id: '1',
          projectId,
          title: 'Data Migration Risk',
          description: 'Risk of data loss during migration process',
          status: RiskStatus.IDENTIFIED,
          impact: RiskImpact.HIGH,
          probability: 70,
          mitigation: 'Create multiple backups before migration and perform test migrations on sample data',
          owner: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
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
          owner: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: '2023-01-15T00:00:00Z'
        },
        {
          id: '3',
          projectId,
          title: 'Vendor Delivery Delay Risk',
          description: 'Risk of third-party vendors not delivering components on time',
          status: RiskStatus.MITIGATED,
          impact: RiskImpact.MEDIUM,
          probability: 30,
          mitigation: 'Include buffer time in the schedule and identify alternative vendors',
          owner: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-02-01T00:00:00Z',
          updatedAt: '2023-02-15T00:00:00Z'
        }
      ];
      
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
      
      // Default mock data if no stored issues
      const defaultIssues = [
        {
          id: '1',
          projectId,
          title: 'Integration Failure with Legacy System',
          description: 'The new system cannot properly integrate with the existing legacy system',
          status: IssueStatus.OPEN,
          impact: RiskImpact.HIGH,
          owner: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
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
          owner: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
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
          owner: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdBy: {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: 'IT',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          createdAt: '2023-01-25T00:00:00Z',
          updatedAt: '2023-02-05T00:00:00Z'
        }
      ];
      
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

// Create a named API object to export instead of using anonymous default export
const api = {
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
    
    getAllUsers: (token: string) => 
      apiRequest('/api/users', 'GET', undefined, token),
    
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
      apiRequest(`/api/projects/${projectId}/issues`, 'GET', undefined, token),
    
    getIssueById: (projectId: string, issueId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/issues/${issueId}`, 'GET', undefined, token),
    
    createIssue: (projectId: string, issueData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/issues`, 'POST', issueData, token),
    
    updateIssue: (projectId: string, issueId: string, issueData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/issues/${issueId}`, 'PUT', issueData, token),
    
    deleteIssue: (projectId: string, issueId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/issues/${issueId}`, 'DELETE', undefined, token),
  },

  // Weekly Update endpoints
  weeklyUpdates: {
    getAllUpdates: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates`, 'GET', undefined, token),
    
    getUpdateById: (projectId: string, updateId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}`, 'GET', undefined, token),
    
    createUpdate: (projectId: string, updateData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates`, 'POST', updateData, token),
    
    updateUpdate: (projectId: string, updateId: string, updateData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}`, 'PUT', updateData, token),
    
    deleteUpdate: (projectId: string, updateId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}`, 'DELETE', undefined, token),
    
    submitUpdate: (projectId: string, updateId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}/submit`, 'POST', {}, token),
    
    approveUpdateSubPmo: (projectId: string, updateId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}/approve-sub-pmo`, 'POST', {}, token),
    
    approveUpdateMainPmo: (projectId: string, updateId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}/approve-main-pmo`, 'POST', {}, token),
    
    rejectUpdate: (projectId: string, updateId: string, reason: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/weekly-updates/${updateId}/reject`, 'POST', { reason }, token),
  },

  // Change Request endpoints
  changeRequests: {
    getAllChangeRequests: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests`, 'GET', undefined, token),
    
    getChangeRequestById: (projectId: string, requestId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}`, 'GET', undefined, token),
    
    createChangeRequest: (projectId: string, requestData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests`, 'POST', requestData, token),
    
    updateChangeRequest: (projectId: string, requestId: string, requestData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}`, 'PUT', requestData, token),
    
    deleteChangeRequest: (projectId: string, requestId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}`, 'DELETE', undefined, token),
    
    submitChangeRequest: (projectId: string, requestId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}/submit`, 'POST', {}, token),
    
    approveChangeRequestSubPmo: (projectId: string, requestId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}/approve-sub-pmo`, 'POST', {}, token),
    
    approveChangeRequestMainPmo: (projectId: string, requestId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}/approve-main-pmo`, 'POST', {}, token),
    
    approveChangeRequestDirector: (projectId: string, requestId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}/approve-director`, 'POST', {}, token),
    
    rejectChangeRequest: (projectId: string, requestId: string, reason: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/change-requests/${requestId}/reject`, 'POST', { reason }, token),
  },

  // Financial endpoints
  financials: {
    getAllFinancials: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/financials`, 'GET', undefined, token),
    
    createFinancialEntry: (projectId: string, entryData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/financials`, 'POST', entryData, token),
    
    updateFinancialEntry: (projectId: string, entryId: string, entryData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/financials/${entryId}`, 'PUT', entryData, token),
    
    deleteFinancialEntry: (projectId: string, entryId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/financials/${entryId}`, 'DELETE', undefined, token),
  },

  // KPI endpoints
  kpis: {
    getAllKpis: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/kpis`, 'GET', undefined, token),
    
    getKpiById: (projectId: string, kpiId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/kpis/${kpiId}`, 'GET', undefined, token),
    
    createKpi: (projectId: string, kpiData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/kpis`, 'POST', kpiData, token),
    
    updateKpi: (projectId: string, kpiId: string, kpiData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/kpis/${kpiId}`, 'PUT', kpiData, token),
    
    deleteKpi: (projectId: string, kpiId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/kpis/${kpiId}`, 'DELETE', undefined, token),
  },

  // Project Charter endpoints
  projectCharters: {
    getProjectCharter: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/charter`, 'GET', undefined, token),
    
    createProjectCharter: (projectId: string, charterData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/charter`, 'POST', charterData, token),
    
    updateProjectCharter: (projectId: string, charterData: any, token: string) => 
      apiRequest(`/api/projects/${projectId}/charter`, 'PUT', charterData, token),
    
    approveProjectCharter: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/charter/approve`, 'POST', {}, token),
  },

  // Notification endpoints
  notifications: {
    getNotifications: (token: string) => 
      apiRequest('/api/notifications', 'GET', undefined, token),
    
    markNotificationAsRead: (notificationId: string, token: string) => 
      apiRequest(`/api/notifications/${notificationId}/read`, 'PUT', {}, token),
    
    markAllNotificationsAsRead: (token: string) => 
      apiRequest('/api/notifications/read-all', 'PUT', {}, token),
  },

  // Audit Log endpoints
  auditLogs: {
    getAuditLogs: (token: string, filters?: any) => 
      apiRequest('/api/audit-logs', 'GET', filters, token),
  },

  // Dashboard endpoints
  dashboard: {
    getPortfolioSummary: (token: string) => 
      apiRequest('/api/dashboard/portfolio-summary', 'GET', undefined, token),
    
    getProjectsSummary: (token: string) => 
      apiRequest('/api/dashboard/projects-summary', 'GET', undefined, token),
    
    getFinancialsSummary: (token: string) => 
      apiRequest('/api/dashboard/financials-summary', 'GET', undefined, token),
    
    getRisksSummary: (token: string) => 
      apiRequest('/api/dashboard/risks-summary', 'GET', undefined, token),
  }
};

export default api; 