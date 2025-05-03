import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, FEATURES } from '../config';
import LocalStorageService from './LocalStorageService';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus, TaskStatus, UserRole, TaskPriority, RiskStatus, RiskImpact, IssueStatus, Project, Task, User, Department, Meeting, Risk, Issue, Assignment, AssignmentStatus, ApiResponse, MeetingStatus, ProjectPriority, ProjectTemplateType, TaskRequestStatus } from '../types';
import { 
  mockProjects, 
  mockUsers, 
  mockRisks, 
  mockMeetings, 
  mockIssues,
  mockDepartments as importedMockDepartments,
  createDefaultTasks
} from './mockData';
import AuthService from './AuthService';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Standard delay duration
const simulateDelay = () => sleep(Math.random() * 300 + 200); // 200-500ms

// Create empty mock objects for all data types
const mockITDepartment: Department = {
  id: '',
  name: '',
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Empty arrays for all mock data
const defaultProjectId = '';
const mockTasks: Task[] = [];
const defaultProjects: Project[] = [];
const defaultMeetings: Meeting[] = [];

// Empty test users
const testUsers = {
  admin: {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.ADMIN,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  manager1: {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.MANAGER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  manager2: {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.MANAGER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  developer: {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.DEVELOPER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  designer: {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.DESIGNER,
    department: mockITDepartment,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

function getMockData(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      console.log(`[MOCK] GET request to ${endpoint}`);
      
      // Handle departments
      if (endpoint.startsWith('/departments')) {
        const departmentId = endpoint.match(/\/departments\/([^\/]+)/)?.[1];
        if (departmentId) {
          const department = importedMockDepartments.find(d => d.id === departmentId);
          return resolve(department || null);
        }
        return resolve(importedMockDepartments);
      }
      
      // Handle users
      if (endpoint.startsWith('/users')) {
        const userId = endpoint.match(/\/users\/([^\/]+)/)?.[1];
        if (userId) {
          const user = mockUsers.find(u => u.id === userId);
          return resolve(user || null);
        }
        return resolve(mockUsers);
      }
      
      // Handle projects
      if (endpoint.startsWith('/projects')) {
        const projectId = endpoint.match(/\/projects\/([^\/]+)/)?.[1];
        
        if (endpoint.includes('/tasks')) {
          // Handle tasks for a specific project
          if (projectId) {
            const project = mockProjects.find(p => p.id === projectId);
            if (project) {
              const tasks = createDefaultTasks(project.id);
              return resolve(tasks);
            }
          }
          return resolve([]);
        }
        
        if (projectId) {
          // Return a specific project
          const project = mockProjects.find(p => p.id === projectId);
          return resolve(project || null);
        }
        
        // Return all projects, possibly filtered
        let filteredProjects = [...mockProjects];
        
        // Handle query parameters for filtering
        if (config?.params) {
          const { departmentId, status, priority, search } = config.params;
          
          if (departmentId) {
            filteredProjects = filteredProjects.filter(p => p.departmentId === departmentId);
          }
          
          if (status) {
            filteredProjects = filteredProjects.filter(p => p.status === status);
          }
          
          if (priority) {
            filteredProjects = filteredProjects.filter(p => p.priority === priority);
          }
          
          if (search) {
            const searchLower = search.toLowerCase();
            filteredProjects = filteredProjects.filter(p => 
              p.name.toLowerCase().includes(searchLower) || 
              p.description.toLowerCase().includes(searchLower)
            );
          }
        }
        
        return resolve(filteredProjects);
      }
      
      // If no handler for this endpoint
      console.log(`[MOCK] No handler for endpoint: ${endpoint}`);
      resolve([]);
    }, 600); // Simulate network delay
  });
}

// Handle POST requests for mock data
function postMockData(endpoint: string, data: any): Promise<any> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      console.log(`[MOCK] POST request to ${endpoint}`, data);
      
      // Handle project creation
      if (endpoint === '/projects') {
        const newProject = {
          ...data,
          id: `p${mockProjects.length + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0,
        };
        
        // Link department
        if (data.departmentId) {
          const department = importedMockDepartments.find(d => d.id === data.departmentId);
          if (department) {
            newProject.department = department;
          }
        }
        
        // Link project manager
        if (data.projectManagerId) {
          const manager = mockUsers.find(u => u.id === data.projectManagerId);
          if (manager) {
            newProject.projectManager = manager;
          }
        }
        
        // Link team members
        if (data.teamMemberIds && Array.isArray(data.teamMemberIds)) {
          newProject.teamMembers = data.teamMemberIds
            .map(id => mockUsers.find(u => u.id === id))
            .filter(Boolean);
        }
        
        mockProjects.push(newProject);
        return resolve(newProject);
      }
      
      // If no handler for this endpoint
      console.log(`[MOCK] No POST handler for endpoint: ${endpoint}`);
      resolve(data);
    }, 800);
  });
}

/**
 * Handles the API response
 */
function handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
  if (response.status >= 200 && response.status < 300) {
    return {
      data: response.data,
      success: true
    };
  } else {
    return {
      data: response.data,
      success: false,
      message: `Request failed with status ${response.status}`
    };
  }
}

/**
 * Main API request function that handles authentication and error handling
 */
export const apiRequest = async (endpoint: string, method: string = 'GET', data?: any): Promise<ApiResponse<any>> => {
  const USE_MOCK_DATA = true; // Set to true for development without backend
  
  try {
    const token = AuthService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (USE_MOCK_DATA) {
      // Return mock data (with persistence)
      console.log(`Using mock data for endpoint: ${endpoint}, method: ${method}`);
      if (method === 'GET') {
        const responseData = await getMockData(endpoint, { params: data });
        return {
          data: responseData,
          success: true
        };
      } else if (method === 'POST') {
        const responseData = await postMockData(endpoint, data);
        return {
          data: responseData,
          success: true
        };
      } else {
        // For other methods, just return success
        return {
          data: data || {},
          success: true
        };
      }
    }

    // Real API request
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      headers,
      ...(method === 'GET' ? { params: data } : { data }),
    };

    const response = await axios(config);
    return handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    if (USE_MOCK_DATA) {
      console.log(`Falling back to mock data for endpoint: ${endpoint}`);
      if (method === 'GET') {
        const responseData = await getMockData(endpoint, { params: data });
        return {
          data: responseData,
          success: true
        };
      } else if (method === 'POST') {
        const responseData = await postMockData(endpoint, data);
        return {
          data: responseData,
          success: true
        };
      }
    }
    throw error;
  }
};

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

// Helper function to simulate login
export const login = async (email: string, password: string) => {
  // Return a minimal user object
  return {
    success: true,
    data: {
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      email: email || '',
      role: UserRole.ADMIN, // Still need admin role for access
      department: {
        id: '',
        name: '',
        description: ''
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Login successful'
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
    department: importedMockDepartments[0],
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
    department: importedMockDepartments[0],
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
    department: importedMockDepartments[1],
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
    department: importedMockDepartments[0],
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
    department: importedMockDepartments[2],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const assignments = {
  getAllAssignments: async (token: string) => {
    await delay();
    return {
      data: [],
      success: true
    };
  },
  
  getAssignmentById: async (id: string, token: string): Promise<Assignment | null> => {
    await delay();
    return null;
  },

  createAssignment: async (data: Partial<Assignment>, token: string) => {
    await delay();
    const newAssignment: Assignment = {
      id: '',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Assignment;
    return {
      success: true,
      data: newAssignment,
    };
  },

  updateAssignment: async (id: string, data: Partial<Assignment>, token: string) => {
    await delay();
    return {
      success: false,
      error: 'Assignment not found',
    };
  },

  deleteAssignment: async (id: string, token: string) => {
    await delay();
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
      apiRequest('/api/auth/logout', 'POST', {}),
  },

  // User endpoints
  users: {
    getCurrentUser: async (token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'User not found'
      };
    },
    
    getAllUsers: async (token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getUserById: async (userId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'User not found'
      };
    },
    
    createUser: async (userData: Partial<User>, token: string) => {
      await delay();
      const newUser: User = {
        id: '',
        username: userData.username || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        role: userData.role || UserRole.DEVELOPER,
        isActive: true,
        department: {} as Department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User;
      
      return {
        data: newUser,
        success: true
      };
    },
    
    updateUser: async (userId: string, userData: Partial<User>, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'User not found'
      };
    },
    
    deleteUser: async (userId: string, token: string) => {
      await delay();
      return {
        success: true
      };
    },
    
    assignRole: (userId: string, role: string, token: string) => 
      apiRequest(`/api/users/${userId}/role`, 'PUT', { role }),
      
    assignDepartment: (userId: string, departmentId: string, token: string) => 
      apiRequest(`/api/users/${userId}/department`, 'PUT', { departmentId }),
      
    getAllDepartments: (token: string) => 
      apiRequest('/api/users/departments', 'GET'),
  },

  // Project endpoints
  projects: {
    getAllProjects: async (token: string) => {
      await simulateDelay();
      return {
        data: [],
        success: true
      };
    },
    
    getProjectById: async (id: string, token: string) => {
      await simulateDelay();
      return {
        data: null,
        success: false,
        error: 'Project not found'
      };
    },
    
    createProject: async (projectData: any, token: string) => {
      await simulateDelay();
      const newProject = {
        id: projectData.id || uuidv4(),
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        data: newProject,
        success: true
      };
    },
    
    updateProject: async (projectId: string, updatedData: Partial<Project>, token: string) => {
      try {
        await simulateDelay();
        return {
          data: null,
          success: false,
          error: 'Project not found'
        };
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },
    
    deleteProject: async (projectId: string, token: string) => {
      await simulateDelay();
      return {
        data: { message: 'Project deleted successfully' },
        success: true
      };
    },
      
    uploadAttachment: (projectId: string, formData: FormData, token: string) => 
      apiRequest(`/api/projects/${projectId}/attachments`, 'POST', formData),
      
    getAttachments: (projectId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/attachments`, 'GET'),
      
    deleteAttachment: (projectId: string, attachmentId: string, token: string) => 
      apiRequest(`/api/projects/${projectId}/attachments/${attachmentId}`, 'DELETE'),

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
    getAllTasks: async (projectId: string, token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getTaskById: async (projectId: string, taskId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Task not found'
      };
    },
    
    createTask: async (projectId: string, taskData: any, token: string) => {
      await delay();
      return {
        data: { ...taskData, id: '' },
        success: true
      };
    },
    
    updateTask: async (projectId: string, taskId: string, taskData: any, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Task not found'
      };
    },
    
    deleteTask: async (projectId: string, taskId: string, token: string) => {
      await delay();
      return {
        success: true
      };
    },

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
        return {
          data: [],
          success: true
        };
      }
    },
  },

  // Risk endpoints
  risks: {
    getAllRisks: async (projectId: string, token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getRiskById: async (projectId: string, riskId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Risk not found'
      };
    },
    
    createRisk: async (projectId: string, riskData: any, token: string) => {
      await delay();
      return {
        data: { ...riskData, id: '' },
        success: true
      };
    },
    
    updateRisk: async (projectId: string, riskId: string, riskData: any, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Risk not found'
      };
    },
    
    deleteRisk: async (projectId: string, riskId: string, token: string) => {
      await delay();
      return {
        success: true
      };
    },
  },

  // Issue endpoints
  issues: {
    getAllIssues: async (projectId: string, token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getIssueById: async (projectId: string, issueId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Issue not found'
      };
    },
    
    createIssue: async (projectId: string, issueData: Partial<Issue>, token: string) => {
      await delay();
      return {
        data: { ...issueData, id: '' } as Issue,
        success: true
      };
    },
    
    updateIssue: async (projectId: string, issueId: string, issueData: Partial<Issue>, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Issue not found'
      };
    },
    
    deleteIssue: async (projectId: string, issueId: string, token: string) => {
      await delay();
      return {
        success: true
      };
    }
  },

  // Task Request endpoints
  taskRequests: {
    createTaskRequest: async (requestData: any, token: string) => {
      await delay();
      // Create a minimal TaskRequest object to satisfy type requirements
      const defaultTaskRequest = {
        id: uuidv4(),
        title: requestData.title || '',
        description: requestData.description || '',
        priority: requestData.priority || TaskPriority.MEDIUM,
        status: TaskRequestStatus.PENDING,
        requestedBy: requestData.requestedBy || {},
        projectId: requestData.projectId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...requestData
      };
      
      return {
        data: defaultTaskRequest,
        success: true
      };
    },
      
    getTaskRequestsByProject: async (projectId: string, token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
      
    getTaskRequestById: async (requestId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Task request not found'
      };
    },
      
    updateTaskRequestStatus: async (requestId: string, status: any, reviewNotes: string | undefined, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Task request not found'
      };
    },
      
    approveTaskRequest: async (requestId: string, reviewNotes: string | undefined, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Task request not found'
      };
    },
      
    rejectTaskRequest: async (requestId: string, reviewNotes: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Task request not found'
      };
    }
  },

  // Assignment endpoints
  assignments,

  auditLogs: {
    getAuditLogs: async (token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getAuditLogById: async (logId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Audit log not found'
      };
    }
  },

  // Department endpoints
  departments: {
    getAllDepartments: async (token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getDepartmentById: async (departmentId: string, token: string): Promise<Department | null> => {
      await delay();
      return null;
    },
    
    createDepartment: async (departmentData: Partial<Department>, token: string) => {
      await delay();
      const newDepartment: Department = {
        id: '',
        name: departmentData.name || '',
        description: departmentData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Department;
      
      return {
        data: newDepartment,
        success: true
      };
    },
    
    updateDepartment: async (departmentId: string, departmentData: Partial<Department>, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Department not found'
      };
    },
    
    deleteDepartment: async (departmentId: string, token: string) => {
      await delay();
      return {
        data: {
          success: true,
          message: "Department deleted successfully"
        }
      };
    }
  },
  
  // Change Request endpoints
  changeRequests: {
    getChangeRequestsByProject: async (projectId: string, token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
      
    getChangeRequestById: async (requestId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Change request not found'
      };
    },
      
    createChangeRequest: async (requestData: any, token: string) => {
      await delay();
      return {
        data: { id: '', ...requestData },
        success: true
      };
    },
      
    updateChangeRequestStatus: async (requestId: string, status: any, reviewNotes: string | undefined, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Change request not found'
      };
    },
      
    approveChangeRequest: async (requestId: string, reviewNotes: string | undefined, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Change request not found'
      };
    },
      
    rejectChangeRequest: async (requestId: string, reviewNotes: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Change request not found'
      };
    },
      
    getAllChangeRequests: async (token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    }
  },

  // Add meetings API with correct types
  meetings: {
    getAllMeetings: async (token: string) => {
      await delay();
      return {
        data: [],
        success: true
      };
    },
    
    getMeetingById: async (meetingId: string, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Meeting not found'
      };
    },
    
    createMeeting: async (meetingData: Partial<Meeting>, token: string) => {
      await delay();
      const newMeeting: Meeting = {
        id: '',
        title: meetingData.title || '',
        description: meetingData.description || '',
        startTime: meetingData.startTime || new Date().toISOString(),
        endTime: meetingData.endTime || new Date().toISOString(),
        organizer: {} as User,
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Meeting;
      
      return {
        data: newMeeting,
        success: true
      };
    },
    
    updateMeeting: async (meetingId: string, meetingData: Partial<Meeting>, token: string) => {
      await delay();
      return {
        data: null,
        success: false,
        error: 'Meeting not found'
      };
    },
    
    deleteMeeting: async (meetingId: string, token: string) => {
      await delay();
      return {
        success: true
      };
    }
  },
};

export default apiRoutes;