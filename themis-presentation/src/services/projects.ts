import { Project, ApiResponse } from '../types';
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
 * Fetches all projects
 * @param token - JWT token for authentication
 * @returns Promise<ApiResponse<Project[]>>
 */
const getAllProjects = async (token?: string): Promise<ApiResponse<Project[]>> => {
  return makeRequest<Project[]>('/projects', 'GET', null, token);
};

/**
 * Fetches a project by ID
 * @param id - Project ID
 * @param token - JWT token for authentication
 * @returns Promise<ApiResponse<Project>>
 */
const getProjectById = async (id: string, token?: string): Promise<ApiResponse<Project>> => {
  return makeRequest<Project>(`/projects/${id}`, 'GET', null, token);
};

/**
 * Creates a new project
 * @param project - Project data
 * @param token - JWT token for authentication
 * @returns Promise<ApiResponse<Project>>
 */
const createProject = async (project: Partial<Project>, token?: string): Promise<ApiResponse<Project>> => {
  return makeRequest<Project>('/projects', 'POST', project, token);
};

/**
 * Updates an existing project
 * @param id - Project ID
 * @param project - Project data to update
 * @param token - JWT token for authentication
 * @returns Promise<ApiResponse<Project>>
 */
const updateProject = async (id: string, project: Partial<Project>, token?: string): Promise<ApiResponse<Project>> => {
  return makeRequest<Project>(`/projects/${id}`, 'PUT', project, token);
};

/**
 * Deletes a project
 * @param id - Project ID
 * @param token - JWT token for authentication
 * @returns Promise<ApiResponse<void>>
 */
const deleteProject = async (id: string, token?: string): Promise<ApiResponse<void>> => {
  return makeRequest<void>(`/projects/${id}`, 'DELETE', null, token);
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
}; 