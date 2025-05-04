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