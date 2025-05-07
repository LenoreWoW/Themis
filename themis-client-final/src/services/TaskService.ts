import api from './api';
import { Task, TaskStatus, TaskPriority, User, UserRole } from '../types';
import { mapToBackendStatus, mapToFrontendStatus } from '../utils/taskStatusMapper';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'app_tasks';

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
    assignee: {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      username: 'janesmith',
      role: UserRole.DEVELOPER,
      department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    assignedBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      role: UserRole.PROJECT_MANAGER,
      department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2023-09-05T15:30:00Z'
  },
  {
    id: '2',
    title: 'Implement API integration',
    description: 'Connect frontend with backend APIs for data retrieval',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    startDate: '2023-09-10',
    dueDate: '2023-09-25',
    projectId: '1',
    assignee: {
      id: '3',
      firstName: 'Mark',
      lastName: 'Johnson',
      email: 'mark.johnson@example.com',
      username: 'markjohnson',
      role: UserRole.DEVELOPER,
      department: { id: '2', name: 'Engineering', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    assignedBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      role: UserRole.PROJECT_MANAGER,
      department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    createdAt: '2023-09-03T11:20:00Z',
    updatedAt: '2023-09-03T11:20:00Z'
  },
  {
    id: '3',
    title: 'Unit testing for login module',
    description: 'Write comprehensive unit tests for the user authentication system',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.HIGH,
    startDate: '2023-09-05',
    dueDate: '2023-09-12',
    projectId: '2',
    assignee: {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      username: 'sarahwilliams',
      role: UserRole.DEVELOPER,
      department: { id: '2', name: 'Engineering', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    assignedBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      role: UserRole.PROJECT_MANAGER,
      department: { id: '1', name: 'Design', description: '', createdAt: '', updatedAt: '' },
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    createdAt: '2023-09-02T09:15:00Z',
    updatedAt: '2023-09-08T14:40:00Z'
  }
];

// Initialize tasks in localStorage if not present
const initializeTasks = () => {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (!storedTasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoTasks));
  }
};

// Get all tasks
const getAllTasks = (): Task[] => {
  initializeTasks();
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  return storedTasks ? JSON.parse(storedTasks) : [];
};

// Get a single task by ID
const getTaskById = (id: string): Task | null => {
  const tasks = getAllTasks();
  return tasks.find(task => task.id === id) || null;
};

// Create a new task
const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
  const tasks = getAllTasks();
  
  const newTask: Task = {
    ...taskData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  
  return newTask;
};

// Update an existing task
const updateTask = (id: string, taskData: Partial<Task>): Task | null => {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) return null;
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...taskData,
    updatedAt: new Date().toISOString()
  };
  
  tasks[taskIndex] = updatedTask;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  
  return updatedTask;
};

// Delete a task
const deleteTask = (id: string): boolean => {
  const tasks = getAllTasks();
  const filteredTasks = tasks.filter(task => task.id !== id);
  
  if (filteredTasks.length === tasks.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTasks));
  return true;
};

// Get tasks assigned by a specific user
const getTasksAssignedByUser = (userId: string): Task[] => {
  const tasks = getAllTasks();
  return tasks.filter(task => task.assignedBy?.id === userId);
};

// Get tasks assigned to a specific user
const getTasksAssignedToUser = (userId: string): Task[] => {
  const tasks = getAllTasks();
  return tasks.filter(task => task.assignee?.id === userId);
};

export const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksAssignedByUser,
  getTasksAssignedToUser
};

export default taskService;

// Define response interfaces
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Service to handle task API calls with status mapping between client and server
 */
export const TaskService = {
  /**
   * Get all tasks for a project
   */
  getAllTasks: async (projectId: string, token: string): Promise<Task[]> => {
    try {
      const response = await api.tasks.getAllTasks(projectId, token) as ApiResponse<any[]>;
      
      // Map the backend status to frontend status
      return response.data.map((task: any) => ({
        ...task,
        status: mapToFrontendStatus(task.status)
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Add a comment to a task
   */
  addTaskComment: async (projectId: string, taskId: string, commentText: string, userId: string, token: string): Promise<any> => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate it
      const newComment = {
        id: `comment-${Date.now()}`,
        taskId,
        text: commentText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: userId,
          firstName: 'Current',  // This would be populated from the API response
          lastName: 'User'       // Same as above
        }
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Added comment to task ${taskId}:`, newComment);
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Get a specific task by ID
   */
  getTaskById: async (projectId: string, taskId: string, token: string): Promise<Task> => {
    try {
      const response = await api.tasks.getTaskById(projectId, taskId, token) as ApiResponse<any>;
      
      // Map the backend status to frontend status
      return {
        ...response.data,
        status: mapToFrontendStatus(response.data.status)
      };
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  /**
   * Create a new task in a project
   */
  createTask: async (projectId: string, taskData: Partial<Task>, token: string): Promise<Task> => {
    try {
      // Map the frontend status to backend status before sending
      const backendTaskData = {
        ...taskData,
        status: mapToBackendStatus(taskData.status as TaskStatus)
      };
      
      const response = await api.tasks.createTask(projectId, backendTaskData, token) as ApiResponse<any>;
      
      // Map the backend status back to frontend status in the response
      return {
        ...response.data,
        status: mapToFrontendStatus(response.data.status)
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Create a new independent task (not associated with a project)
   */
  createIndependentTask: async (taskData: Partial<Task>, token: string): Promise<Task> => {
    try {
      // Map the frontend status to backend status before sending
      const backendTaskData = {
        ...taskData,
        status: mapToBackendStatus(taskData.status as TaskStatus)
      };
      
      const response = await api.tasks.createIndependentTask(backendTaskData, token) as ApiResponse<any>;
      
      // Map the backend status back to frontend status in the response
      return {
        ...response.data,
        status: mapToFrontendStatus(response.data.status)
      };
    } catch (error) {
      console.error('Error creating independent task:', error);
      throw error;
    }
  },

  /**
   * Update an existing task
   */
  updateTask: async (projectId: string, taskId: string, taskData: Partial<Task>, token: string): Promise<Task> => {
    try {
      // Map the frontend status to backend status before sending
      const backendTaskData = {
        ...taskData,
        status: taskData.status !== undefined ? mapToBackendStatus(taskData.status as TaskStatus) : undefined
      };
      
      const response = await api.tasks.updateTask(projectId, taskId, backendTaskData, token) as ApiResponse<any>;
      
      // If the API returns the updated task, map the status back
      if (response.data) {
        return {
          ...response.data,
          status: mapToFrontendStatus(response.data.status)
        };
      }
      
      // If the API doesn't return the updated task, return the original with the updated fields
      return {
        ...taskData,
        id: taskId,
        projectId
      } as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  /**
   * Delete a task
   */
  deleteTask: async (projectId: string, taskId: string, token: string): Promise<void> => {
    try {
      await api.tasks.deleteTask(projectId, taskId, token);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}; 