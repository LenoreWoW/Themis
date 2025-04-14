import api from './api';
import { Task, TaskStatus } from '../types';
import { mapToBackendStatus, mapToFrontendStatus } from '../utils/taskStatusMapper';

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
   * Get all independent tasks (not associated with a project)
   */
  getAllIndependentTasks: async (token: string): Promise<Task[]> => {
    try {
      const response = await api.tasks.getAllIndependentTasks(token) as ApiResponse<any[]>;
      
      // Map the backend status to frontend status
      return response.data.map((task: any) => ({
        ...task,
        status: mapToFrontendStatus(task.status)
      }));
    } catch (error) {
      console.error('Error fetching independent tasks:', error);
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
   * Get a specific independent task by ID
   */
  getIndependentTaskById: async (taskId: string, token: string): Promise<Task> => {
    try {
      const response = await api.tasks.getIndependentTaskById(taskId, token) as ApiResponse<any>;
      
      // Map the backend status to frontend status
      return {
        ...response.data,
        status: mapToFrontendStatus(response.data.status)
      };
    } catch (error) {
      console.error('Error fetching independent task:', error);
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
   * Create a new independent task (not associated with any project)
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
   * Update an existing independent task
   */
  updateIndependentTask: async (taskId: string, taskData: Partial<Task>, token: string): Promise<Task> => {
    try {
      // Map the frontend status to backend status before sending
      const backendTaskData = {
        ...taskData,
        status: taskData.status !== undefined ? mapToBackendStatus(taskData.status as TaskStatus) : undefined
      };
      
      const response = await api.tasks.updateIndependentTask(taskId, backendTaskData, token) as ApiResponse<any>;
      
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
        id: taskId
      } as Task;
    } catch (error) {
      console.error('Error updating independent task:', error);
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
  },

  /**
   * Delete an independent task
   */
  deleteIndependentTask: async (taskId: string, token: string): Promise<void> => {
    try {
      await api.tasks.deleteIndependentTask(taskId, token);
    } catch (error) {
      console.error('Error deleting independent task:', error);
      throw error;
    }
  }
}; 