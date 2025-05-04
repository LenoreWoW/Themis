import { Task, ApiResponse } from '../types';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Helper function to make api requests without importing from api.ts
const makeRequest = async <T>(endpoint: string, method = 'GET', data?: any, token?: string): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' && data ? data : undefined
    };
    
    const response = await axios(config);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Fetches all tasks
 * @returns Promise<ApiResponse<Task[]>>
 */
const getAllTasks = async (token?: string): Promise<ApiResponse<Task[]>> => {
  return makeRequest<Task[]>('/tasks', 'GET', null, token);
};

/**
 * Fetches all tasks for a specific project
 * @param projectId - Project ID
 * @returns Promise<ApiResponse<Task[]>>
 */
const getTasksByProject = async (projectId: string, token?: string): Promise<ApiResponse<Task[]>> => {
  return makeRequest<Task[]>(`/projects/${projectId}/tasks`, 'GET', null, token);
};

/**
 * Fetches a task by ID
 * @param id - Task ID
 * @returns Promise<ApiResponse<Task>>
 */
const getTaskById = async (id: string, token?: string): Promise<ApiResponse<Task>> => {
  return makeRequest<Task>(`/tasks/${id}`, 'GET', null, token);
};

/**
 * Creates a new task
 * @param task - Task data
 * @returns Promise<ApiResponse<Task>>
 */
const createTask = async (task: Partial<Task>, token?: string): Promise<ApiResponse<Task>> => {
  return makeRequest<Task>('/tasks', 'POST', task, token);
};

/**
 * Updates an existing task
 * @param id - Task ID
 * @param task - Task data to update
 * @returns Promise<ApiResponse<Task>>
 */
const updateTask = async (id: string, task: Partial<Task>, token?: string): Promise<ApiResponse<Task>> => {
  return makeRequest<Task>(`/tasks/${id}`, 'PUT', task, token);
};

/**
 * Deletes a task
 * @param id - Task ID
 * @returns Promise<ApiResponse<void>>
 */
const deleteTask = async (id: string, token?: string): Promise<ApiResponse<void>> => {
  return makeRequest<void>(`/tasks/${id}`, 'DELETE', null, token);
};

export default {
  getAllTasks,
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
}; 