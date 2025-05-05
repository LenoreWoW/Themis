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
import projects from './projects';
import tasks from './tasks';
import users from './users';
import auth from './auth';
import changeRequests from './changeRequests';

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
            const tasks = createDefaultTasks(projectId);
            return resolve(tasks);
          }
          return resolve([]);
        }
        
        if (projectId) {
          // Return a specific project
          return resolve(null);
        }
        
        // Return empty projects array
        return resolve([]);
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
          id: `p${Date.now()}`,
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
        
        // Return the new project without adding it to mockProjects
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
    
    // Get assignments from localStorage
    const storedAssignments = localStorage.getItem('themis_assignments');
    const assignments = storedAssignments ? JSON.parse(storedAssignments) : [];
    
    return {
      data: assignments,
      success: true
    };
  },
  
  getAssignmentById: async (id: string, token: string): Promise<Assignment | null> => {
    await delay();
    
    // Get assignments from localStorage
    const storedAssignments = localStorage.getItem('themis_assignments');
    const assignments = storedAssignments ? JSON.parse(storedAssignments) : [];
    
    // Find the assignment by ID
    const assignment = assignments.find((a: Assignment) => a.id === id);
    
    if (assignment) {
      return assignment;
    }
    
    return null;
  },

  createAssignment: async (data: Partial<Assignment>, token: string) => {
    await delay();
    const assignmentId = uuidv4();
    const newAssignment: Assignment = {
      id: assignmentId,
      title: data.title || '',
      description: data.description || '',
      status: AssignmentStatus.IN_PROGRESS,
      priority: data.priority || TaskPriority.MEDIUM,
      dueDate: data.dueDate || new Date().toISOString(),
      assignedBy: data.assignedBy || {} as User,
      assignedTo: data.assignedTo || {} as User,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Assignment;
    
    // Store in localStorage
    try {
      // Get existing assignments
      const storedAssignments = localStorage.getItem('themis_assignments');
      const assignments = storedAssignments ? JSON.parse(storedAssignments) : [];
      
      // Add the new assignment
      assignments.push(newAssignment);
      
      // Save back to localStorage
      localStorage.setItem('themis_assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Error storing assignment:', error);
    }
    
    return {
      success: true,
      data: newAssignment,
    };
  },

  updateAssignment: async (id: string, data: Partial<Assignment>, token: string) => {
    await delay();
    
    try {
      // Get assignments from localStorage
      const storedAssignments = localStorage.getItem('themis_assignments');
      const assignments = storedAssignments ? JSON.parse(storedAssignments) : [];
      
      // Find the assignment by ID
      const index = assignments.findIndex((a: Assignment) => a.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: 'Assignment not found',
        };
      }
      
      // Update the assignment
      const updatedAssignment = {
        ...assignments[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // Replace the assignment in the array
      assignments[index] = updatedAssignment;
      
      // Save back to localStorage
      localStorage.setItem('themis_assignments', JSON.stringify(assignments));
      
      return {
        success: true,
        data: updatedAssignment,
      };
    } catch (error) {
      console.error('Error updating assignment:', error);
      return {
        success: false,
        error: 'Error updating assignment',
      };
    }
  },

  deleteAssignment: async (id: string, token: string) => {
    await delay();
    
    try {
      // Get assignments from localStorage
      const storedAssignments = localStorage.getItem('themis_assignments');
      const assignments = storedAssignments ? JSON.parse(storedAssignments) : [];
      
      // Filter out the assignment to delete
      const updatedAssignments = assignments.filter((a: Assignment) => a.id !== id);
      
      // Save back to localStorage
      localStorage.setItem('themis_assignments', JSON.stringify(updatedAssignments));
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return {
        success: false,
        error: 'Error deleting assignment',
      };
    }
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
      
      // Get projects from localStorage
      const storedProjects = localStorage.getItem('themis_projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      return {
        data: projects,
        success: true
      };
    },
    
    getProjectById: async (id: string, token: string) => {
      await simulateDelay();
      
      // Get projects from localStorage
      const storedProjects = localStorage.getItem('themis_projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      // Find the project by ID
      const project = projects.find((p: Project) => p.id === id);
      
      if (project) {
        return {
          data: project,
          success: true
        };
      }
      
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
      
      // Get existing projects from localStorage
      const storedProjects = localStorage.getItem('themis_projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      // Add the new project
      projects.push(newProject);
      
      // Save back to localStorage
      localStorage.setItem('themis_projects', JSON.stringify(projects));
      
      return {
        data: newProject,
        success: true
      };
    },
    
    updateProject: async (projectId: string, updatedData: Partial<Project>, token: string) => {
      try {
        await simulateDelay();
        
        // Get projects from localStorage
        const storedProjects = localStorage.getItem('themis_projects');
        const projects = storedProjects ? JSON.parse(storedProjects) : [];
        
        // Find the project index
        const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
        
        if (projectIndex !== -1) {
          // Update the project
          projects[projectIndex] = {
            ...projects[projectIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
          };
          
          // Save back to localStorage
          localStorage.setItem('themis_projects', JSON.stringify(projects));
          
          return {
            data: projects[projectIndex],
            success: true
          };
        }
        
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
      
      // Get projects from localStorage
      const storedProjects = localStorage.getItem('themis_projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      // Filter out the deleted project
      const updatedProjects = projects.filter((p: Project) => p.id !== projectId);
      
      // Save back to localStorage
      localStorage.setItem('themis_projects', JSON.stringify(updatedProjects));
      
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

    getProjectsByManagerId: async (managerId: string, token: string) => {
      await delay();
      
      try {
        // Get projects from localStorage
        const projectsJson = localStorage.getItem('projects') || '[]';
        let projects = [];
        
        try {
          projects = JSON.parse(projectsJson);
          if (!Array.isArray(projects)) {
            console.warn('API: projects was not an array, resetting to empty array');
            projects = [];
          }
          
          // Filter projects by manager ID
          projects = projects.filter(project => {
            // Check if the project has a projectManager object
            if (project.projectManager && project.projectManager.id === managerId) {
              return true;
            }
            
            // Also check if the project has a managerId field
            if (project.managerId === managerId) {
              return true;
            }
            
            // Also check if the project has a projectManagerId field
            if (project.projectManagerId === managerId) {
              return true;
            }
            
            return false;
          });
        } catch (parseError) {
          console.error('API: Error parsing projects from localStorage:', parseError);
          projects = [];
        }
        
        return {
          data: projects,
          success: true
        };
      } catch (err) {
        console.error('API: Error retrieving projects by manager ID:', err);
        return {
          data: [],
          success: false,
          error: 'Failed to retrieve projects by manager ID'
        };
      }
    },
    
    getProjectsByDepartment: async (departmentId: string, token: string) => {
      await delay();
      
      try {
        // Get projects from localStorage
        const projectsJson = localStorage.getItem('projects') || '[]';
        let projects = [];
        
        try {
          projects = JSON.parse(projectsJson);
          if (!Array.isArray(projects)) {
            console.warn('API: projects was not an array, resetting to empty array');
            projects = [];
          }
          
          // Filter projects by department ID
          projects = projects.filter(project => {
            // Check if the project has a department field
            if (project.department === departmentId) {
              return true;
            }
            
            // Also check if the project has a departmentId field
            if (project.departmentId === departmentId) {
              return true;
            }
            
            return false;
          });
        } catch (parseError) {
          console.error('API: Error parsing projects from localStorage:', parseError);
          projects = [];
        }
        
        return {
          data: projects,
          success: true
        };
      } catch (err) {
        console.error('API: Error retrieving projects by department:', err);
        return {
          data: [],
          success: false,
          error: 'Failed to retrieve projects by department'
        };
      }
    },
  },

  // Task endpoints
  tasks: {
    getAllTasks: async (projectId: string, token: string) => {
      await delay();
      console.log('API: Getting all tasks for project:', projectId);
      
      try {
        // Get tasks from sessionStorage and localStorage for persistence
        const tasksJson = sessionStorage.getItem('mockTasks') || localStorage.getItem('mockTasks') || '[]';
        let allTasks = [];
        
        try {
          allTasks = JSON.parse(tasksJson);
          // Ensure tasks is an array
          if (!Array.isArray(allTasks)) {
            console.warn('API: mockTasks was not an array, resetting to empty array');
            allTasks = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing mockTasks from storage:', parseError);
          allTasks = [];
        }

        // Ensure all tasks have string projectId for consistent comparison
        allTasks = allTasks.map((task: any) => ({
          ...task,
          projectId: String(task.projectId || '')
        }));
        
        // Filter tasks for this project - if projectId is truthy
        let projectTasks = allTasks;
        if (projectId && projectId !== 'default') {
          projectTasks = allTasks.filter((task: any) => String(task.projectId) === String(projectId));
          console.log(`API: Filtered tasks for project ${projectId}: found ${projectTasks.length} tasks out of ${allTasks.length} total`);
        }
        
        console.log('API: Retrieved tasks from storage:', projectTasks.length, 'tasks for project:', projectId);
        
        return {
          data: projectTasks,
          success: true
        };
      } catch (err) {
        console.error('API: Error retrieving tasks:', err);
        return {
          data: [],
          success: true
        };
      }
    },
    
    getTaskById: async (projectId: string, taskId: string, token: string) => {
      await delay();
      try {
        // Get tasks from sessionStorage
        const tasksJson = sessionStorage.getItem('mockTasks') || '[]';
        let allTasks = [];
        
        try {
          allTasks = JSON.parse(tasksJson);
        } catch (parseError) {
          console.error('API: Error parsing mockTasks from sessionStorage:', parseError);
          return {
            data: null,
            success: false,
            error: 'Task not found'
          };
        }
        
        // Find the specific task
        const task = allTasks.find((t: any) => t.id === taskId);
        
        if (task) {
          return {
            data: task,
            success: true
          };
        }
        
        return {
          data: null,
          success: false,
          error: 'Task not found'
        };
      } catch (err) {
        console.error('API: Error retrieving task:', err);
        return {
          data: null,
          success: false,
          error: 'Task not found'
        };
      }
    },
    
    createTask: async (projectId: string, taskData: any, token: string) => {
      await delay();
      console.log('API: Creating task for project:', projectId, taskData);
      
      // Create a unique ID for the task if not provided
      const taskId = taskData.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Store the task in sessionStorage AND localStorage to persist it during the session and between sessions
      try {
        // Get existing tasks or initialize empty array
        const tasksJson = sessionStorage.getItem('mockTasks') || localStorage.getItem('mockTasks') || '[]';
        let tasks = [];
        try {
          tasks = JSON.parse(tasksJson);
          // Ensure tasks is an array
          if (!Array.isArray(tasks)) {
            console.warn('API: mockTasks was not an array, resetting to empty array');
            tasks = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing mockTasks from storage, resetting to empty array:', parseError);
          tasks = [];
        }
        
        // Check if task already exists (by ID)
        const existingTaskIndex = tasks.findIndex((t: any) => t.id === taskId);
        
        // Ensure projectId is stored as a string for consistent comparison
        const stringProjectId = String(projectId || 'default');
        
        // Prepare the complete task object with all required fields
        const newTask = {
          ...taskData,
          id: taskId,
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          startDate: taskData.startDate || new Date().toISOString(),
          dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          projectId: stringProjectId,
          assignee: taskData.assignee || null,
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMilestone: !!taskData.isMilestone
        };
        
        // Add or update the task
        if (existingTaskIndex >= 0) {
          console.log('API: Updating existing task:', taskId);
          tasks[existingTaskIndex] = newTask;
        } else {
          console.log('API: Adding new task:', taskId);
          tasks.push(newTask);
        }
        
        // Save back to both sessionStorage and localStorage for persistence
        const tasksString = JSON.stringify(tasks);
        sessionStorage.setItem('mockTasks', tasksString);
        localStorage.setItem('mockTasks', tasksString);
        
        console.log('API: Task created/updated successfully and saved to storage:', newTask);
        
        return {
          data: newTask,
          success: true
        };
      } catch (err) {
        console.error('API: Error storing task:', err);
        // Even if there's an error storing in storage, return a success
        // so the UI can still show the task (but it won't persist on page refresh)
        const newTask = {
          ...taskData, 
          id: taskId, 
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          startDate: taskData.startDate || new Date().toISOString(),
          dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          projectId: String(projectId || 'default'),
          assignee: taskData.assignee || null,
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMilestone: !!taskData.isMilestone
        };
        return {
          data: newTask,
          success: true
        };
      }
    },
    
    createIndependentTask: async (taskData: any, token: string) => {
      await delay();
      console.log('API: Creating independent task:', taskData);
      
      // Create a unique ID for the task if not provided
      const taskId = taskData.id || `task-${Date.now()}`;
      
      // Store the task in sessionStorage AND localStorage to persist it during the session and between sessions
      try {
        // Get existing tasks or initialize empty array
        const tasksJson = sessionStorage.getItem('mockTasks') || localStorage.getItem('mockTasks') || '[]';
        let tasks = [];
        try {
          tasks = JSON.parse(tasksJson);
          // Ensure tasks is an array
          if (!Array.isArray(tasks)) {
            console.warn('API: mockTasks was not an array, resetting to empty array');
            tasks = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing mockTasks from storage, resetting to empty array:', parseError);
          tasks = [];
        }
        
        // Check if task already exists (by ID)
        const existingTaskIndex = tasks.findIndex((t: any) => t.id === taskId);
        
        // Prepare the complete task object with all required fields
        const newTask = {
          ...taskData,
          id: taskId,
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          startDate: taskData.startDate || new Date().toISOString(),
          dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          projectId: taskData.projectId || 'independent',
          assignee: taskData.assignee || null,
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMilestone: !!taskData.isMilestone
        };
        
        // Add or update the task
        if (existingTaskIndex >= 0) {
          console.log('API: Updating existing independent task:', taskId);
          tasks[existingTaskIndex] = newTask;
        } else {
          console.log('API: Adding new independent task:', taskId);
          tasks.push(newTask);
        }
        
        // Save back to both sessionStorage and localStorage for persistence
        const tasksString = JSON.stringify(tasks);
        sessionStorage.setItem('mockTasks', tasksString);
        localStorage.setItem('mockTasks', tasksString);
        
        console.log('API: Independent task created/updated successfully and saved to storage:', newTask);
        
        return {
          data: newTask,
          success: true
        };
      } catch (err) {
        console.error('API: Error storing independent task:', err);
        // Even if there's an error storing in storage, return a success
        // so the UI can still show the task (but it won't persist on page refresh)
        const newTask = {
          ...taskData, 
          id: taskId, 
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          startDate: taskData.startDate || new Date().toISOString(),
          dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          projectId: taskData.projectId || 'independent',
          assignee: taskData.assignee || null,
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMilestone: !!taskData.isMilestone
        };
        return {
          data: newTask,
          success: true
        };
      }
    },
    
    updateTask: async (projectId: string, taskId: string, taskData: any, token: string) => {
      await delay();
      try {
        // Get existing tasks
        const tasksJson = sessionStorage.getItem('mockTasks') || localStorage.getItem('mockTasks') || '[]';
        let tasks = [];
        
        try {
          tasks = JSON.parse(tasksJson);
          // Ensure tasks is an array
          if (!Array.isArray(tasks)) {
            console.warn('API: mockTasks was not an array, resetting to empty array');
            tasks = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing mockTasks from storage:', parseError);
          return {
            data: null,
            success: false,
            error: 'Error parsing tasks data'
          };
        }
        
        // Find the task
        const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
        
        if (taskIndex === -1) {
          return {
            data: null,
            success: false,
            error: 'Task not found'
          };
        }
        
        // Update the task
        const updatedTask = {
          ...tasks[taskIndex],
          ...taskData,
          updatedAt: new Date().toISOString()
        };
        
        tasks[taskIndex] = updatedTask;
        
        // Save back to storage
        const tasksString = JSON.stringify(tasks);
        sessionStorage.setItem('mockTasks', tasksString);
        localStorage.setItem('mockTasks', tasksString);
        
        console.log('API: Task updated successfully:', updatedTask);
        
        return {
          data: updatedTask,
          success: true
        };
      } catch (err) {
        console.error('API: Error updating task:', err);
        return {
          data: null,
          success: false,
          error: 'Error updating task'
        };
      }
    },
    
    deleteTask: async (projectId: string, taskId: string, token: string) => {
      await delay();
      try {
        // Get existing tasks
        const tasksJson = sessionStorage.getItem('mockTasks') || localStorage.getItem('mockTasks') || '[]';
        let tasks = [];
        
        try {
          tasks = JSON.parse(tasksJson);
          // Ensure tasks is an array
          if (!Array.isArray(tasks)) {
            console.warn('API: mockTasks was not an array, resetting to empty array');
            tasks = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing mockTasks from storage:', parseError);
          return {
            success: false,
            error: 'Error parsing tasks data'
          };
        }
        
        // Find the task
        const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
        
        if (taskIndex === -1) {
          return {
            success: false,
            error: 'Task not found'
          };
        }
        
        // Remove the task
        tasks.splice(taskIndex, 1);
        
        // Save back to storage
        const tasksString = JSON.stringify(tasks);
        sessionStorage.setItem('mockTasks', tasksString);
        localStorage.setItem('mockTasks', tasksString);
        
        console.log('API: Task deleted successfully:', taskId);
        
        return {
          success: true
        };
      } catch (err) {
        console.error('API: Error deleting task:', err);
        return {
          success: false,
          error: 'Error deleting task'
        };
      }
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

  // Audit Logs endpoints
  auditLogs: {
    getAuditLogs: async (token: string) => {
      await delay();
      
      try {
        // Get audit logs from localStorage
        const logsJson = localStorage.getItem('auditLogs') || '[]';
        let logs = [];
        
        try {
          logs = JSON.parse(logsJson);
          if (!Array.isArray(logs)) {
            console.warn('API: auditLogs was not an array, resetting to empty array');
            logs = [];
          }
          
          // Ensure all logs have the necessary fields for filtering
          logs = logs.map(log => ({
            id: log.id || `log-${Date.now()}`,
            action: log.action,
            details: log.details || log.description || '',
            entityType: log.entityType || '',
            entityId: log.entityId || '',
            projectId: log.projectId || '',
            department: log.department || '',
            timestamp: log.timestamp || new Date().toISOString(),
            userId: log.userId || (log.user && log.user.id) || '',
            username: log.username || (log.user && `${log.user.firstName} ${log.user.lastName}`.trim()) || '',
            metadata: log.metadata || {}
          }));
        } catch (parseError) {
          console.error('API: Error parsing auditLogs from localStorage:', parseError);
          logs = [];
        }
        
        return {
          data: logs,
          success: true
        };
      } catch (err) {
        console.error('API: Error retrieving audit logs:', err);
        return {
          data: [],
          success: false,
          error: 'Failed to retrieve audit logs'
        };
      }
    },
    
    getAuditLogsByProject: async (projectId: string, token: string) => {
      await delay();
      
      try {
        // Get audit logs from localStorage
        const logsJson = localStorage.getItem('auditLogs') || '[]';
        let logs = [];
        
        try {
          logs = JSON.parse(logsJson);
          if (!Array.isArray(logs)) {
            console.warn('API: auditLogs was not an array, resetting to empty array');
            logs = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing auditLogs from localStorage:', parseError);
          logs = [];
        }
        
        // Filter logs for this project
        const projectLogs = logs.filter(log => log.projectId === projectId);
        
        return {
          data: projectLogs,
          success: true
        };
      } catch (err) {
        console.error('API: Error retrieving project audit logs:', err);
        return {
          data: [],
          success: false,
          error: 'Failed to retrieve project audit logs'
        };
      }
    },
    
    getAuditLogById: async (logId: string, token: string) => {
      await delay();
      
      try {
        // Get audit logs from localStorage
        const logsJson = localStorage.getItem('auditLogs') || '[]';
        let logs = [];
        
        try {
          logs = JSON.parse(logsJson);
        } catch (parseError) {
          console.error('API: Error parsing auditLogs from localStorage:', parseError);
          return {
            data: null,
            success: false,
            error: 'Audit log not found'
          };
        }
        
        // Find the specific log
        const log = logs.find(l => l.id === logId);
        
        if (log) {
          return {
            data: log,
            success: true
          };
        }
        
        return {
          data: null,
          success: false,
          error: 'Audit log not found'
        };
      } catch (err) {
        console.error('API: Error retrieving audit log:', err);
        return {
          data: null,
          success: false,
          error: 'Audit log not found'
        };
      }
    },
    
    createAuditLog: async (logData: any, token: string) => {
      await delay();
      
      if (!logData.action) {
        return {
          data: null,
          success: false,
          error: 'Audit log action is required'
        };
      }
      
      try {
        // Create a new log entry
        const newLog = {
          id: logData.id || `log-${Date.now()}`,
          action: logData.action,
          details: logData.details || '',
          entityType: logData.entityType || 'GENERAL',
          entityId: logData.entityId || null,
          projectId: logData.projectId || null,
          department: logData.department || null,
          user: logData.user || {
            id: 'system',
            firstName: 'System',
            lastName: 'User'
          },
          timestamp: logData.timestamp || new Date().toISOString(),
          // Store additional metadata for filtering
          metadata: logData.metadata || {}
        };
        
        // Get existing logs or initialize empty array
        const logsJson = localStorage.getItem('auditLogs') || '[]';
        let logs = [];
        
        try {
          logs = JSON.parse(logsJson);
          if (!Array.isArray(logs)) {
            logs = [];
          }
        } catch (parseError) {
          logs = [];
        }
        
        // Add the new log
        logs.push(newLog);
        
        // Save back to localStorage
        localStorage.setItem('auditLogs', JSON.stringify(logs));
        
        return {
          data: newLog,
          success: true
        };
      } catch (err) {
        console.error('API: Error creating audit log:', err);
        return {
          data: null,
          success: false,
          error: 'Failed to create audit log'
        };
      }
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
      
      // Log the received data for debugging
      console.log('Creating change request with data:', requestData);
      
      // Ensure dates are properly formatted
      let formattedRequestData = { ...requestData };
      
      // Handle schedule change request date format
      if (requestData.type === 'SCHEDULE') {
        // Extract newEndDate from various possible sources
        let newEndDate = null;
        
        if (requestData.newEndDate) {
          // Direct field
          newEndDate = requestData.newEndDate;
        } else if (requestData.details?.newEndDate) {
          // In details object
          newEndDate = requestData.details.newEndDate;
        }
        
        // Ensure it's a valid date string
        if (newEndDate) {
          // Convert to ISO string if it's a Date object
          if (newEndDate instanceof Date) {
            newEndDate = newEndDate.toISOString();
          } else if (typeof newEndDate === 'string') {
            // Try to format if it's already a string but not ISO
            try {
              const dateObj = new Date(newEndDate);
              if (!isNaN(dateObj.getTime())) {
                newEndDate = dateObj.toISOString();
              }
            } catch (e) {
              console.error('Failed to parse date string:', newEndDate);
            }
          }
          
          // Apply formatted date to both locations
          formattedRequestData.newEndDate = newEndDate;
          formattedRequestData.details = {
            ...formattedRequestData.details,
            newEndDate
          };
        }
      }
      
      // Validate the request data based on type
      let error = null;
      
      // Always require these common fields
      if (!requestData.title) {
        error = 'Change request is missing a title';
      } else if (!requestData.description) {
        error = 'Change request is missing a description';
      } else if (!requestData.projectId) {
        error = 'Change request is missing a project ID';
      } else {
        // Validate type-specific fields
        switch(requestData.type) {
          case 'SCHEDULE':
            // Check both top-level newEndDate and details.newEndDate
            const hasEndDate = 
              (requestData.newEndDate !== undefined && requestData.newEndDate !== null) || 
              (requestData.details?.newEndDate !== undefined && requestData.details?.newEndDate !== null);
            
            if (!hasEndDate) {
              error = 'Schedule change request is missing a new end date';
              console.log('Missing newEndDate field:', requestData);
            }
            break;
          case 'BUDGET':
            // Check for newCost, newBudget, and their details equivalents
            const hasBudget = 
              (requestData.newCost !== undefined && requestData.newCost !== null) || 
              (requestData.newBudget !== undefined && requestData.newBudget !== null) ||
              (requestData.details?.newCost !== undefined && requestData.details?.newCost !== null) || 
              (requestData.details?.newBudget !== undefined && requestData.details?.newBudget !== null);
            
            if (!hasBudget) {
              error = 'Budget change request is missing a new cost value';
              console.log('Missing budget field:', requestData);
            }
            break;
          case 'SCOPE':
            // Check for newScopeDescription and details.newScopeDescription
            const hasScope = 
              requestData.newScopeDescription || 
              requestData.details?.newScopeDescription;
            
            if (!hasScope) {
              error = 'Scope change request is missing scope description';
              console.log('Missing newScopeDescription field:', requestData);
            }
            break;
          case 'RESOURCE':
            // Check for newProjectManagerId, newManager and their details equivalents
            const hasManager = 
              requestData.newProjectManagerId || 
              requestData.newManager || 
              requestData.details?.newProjectManagerId || 
              requestData.details?.newManager;
            
            if (!hasManager) {
              error = 'Resource change request is missing required resources';
              console.log('Missing manager field:', requestData);
            }
            break;
          case 'CLOSURE':
            // Check for closureReason and details.closureReason
            const hasReason = 
              requestData.closureReason || 
              requestData.details?.closureReason;
            
            if (!hasReason) {
              error = 'Closure request is missing sufficient closure reason';
              console.log('Missing closureReason field:', requestData);
            }
            break;
        }
      }
      
      if (error) {
        console.error('Change request validation failed:', error);
        return {
          data: null,
          success: false,
          error: error
        };
      }
      
      // Create a complete change request with guaranteed fields
      const changeRequestId = formattedRequestData.id || `cr-${Date.now()}`;
      const newChangeRequest = {
        id: changeRequestId,
        projectId: formattedRequestData.projectId,
        title: formattedRequestData.title,
        description: formattedRequestData.description,
        type: formattedRequestData.type,
        status: 'PENDING',
        requestedById: formattedRequestData.requestedById || 'unknown',
        requestedByName: formattedRequestData.requestedByName || 'Unknown User',
        requestedDate: formattedRequestData.requestedDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add specific fields based on type - ensure proper data types
        details: formattedRequestData.details || {},
        // Include the type-specific fields at the top level too for backward compatibility
        // with properly handled types
        ...(formattedRequestData.type === 'SCHEDULE' && { 
          newEndDate: formattedRequestData.newEndDate 
        }),
        ...(formattedRequestData.type === 'BUDGET' && { 
          newCost: typeof formattedRequestData.newCost === 'number' ? formattedRequestData.newCost : 
                 (typeof formattedRequestData.newCost === 'string' ? Number(formattedRequestData.newCost) : undefined),
          newBudget: typeof formattedRequestData.newBudget === 'number' ? formattedRequestData.newBudget : 
                   (typeof formattedRequestData.newBudget === 'string' ? Number(formattedRequestData.newBudget) : undefined)
        }),
        ...(formattedRequestData.type === 'SCOPE' && { 
          newScopeDescription: formattedRequestData.newScopeDescription || formattedRequestData.details?.newScopeDescription || '' 
        }),
        ...(formattedRequestData.type === 'RESOURCE' && { 
          newProjectManagerId: formattedRequestData.newProjectManagerId || formattedRequestData.details?.newProjectManagerId || '',
          newManager: formattedRequestData.newManager || formattedRequestData.details?.newManager || formattedRequestData.newProjectManagerId || ''
        }),
        ...(formattedRequestData.type === 'CLOSURE' && { 
          closureReason: formattedRequestData.closureReason || formattedRequestData.details?.closureReason || ''
        }),
        attachments: formattedRequestData.attachments || []
      };
      
      // Store in localStorage for persistence
      try {
        // Get existing change requests or initialize empty array
        const requestsJson = localStorage.getItem('changeRequests') || '[]';
        let requests = [];
        try {
          requests = JSON.parse(requestsJson);
          if (!Array.isArray(requests)) {
            console.warn('API: changeRequests was not an array, resetting to empty array');
            requests = [];
          }
        } catch (parseError) {
          console.error('API: Error parsing changeRequests from localStorage, resetting to empty array:', parseError);
          requests = [];
        }
        
        // Check if change request already exists (by ID)
        const existingIndex = requests.findIndex((r: any) => r.id === changeRequestId);
        
        // Add or update the change request
        if (existingIndex >= 0) {
          console.log('API: Updating existing change request:', changeRequestId);
          requests[existingIndex] = newChangeRequest;
        } else {
          console.log('API: Adding new change request:', changeRequestId);
          requests.push(newChangeRequest);
        }
        
        // Save back to localStorage
        localStorage.setItem('changeRequests', JSON.stringify(requests));
        
        console.log('Change request created successfully:', newChangeRequest);
      } catch (err) {
        console.error('Error storing change request in localStorage:', err);
      }
      
      return {
        data: newChangeRequest,
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