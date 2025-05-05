import { User, ApiResponse } from '../types';
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
 * Fetches all users
 * @returns Promise<ApiResponse<User[]>>
 */
const getAllUsers = async (token?: string): Promise<ApiResponse<User[]>> => {
  return makeRequest<User[]>('/users', 'GET', null, token);
};

/**
 * Fetches a user by ID
 * @param id - User ID
 * @returns Promise<ApiResponse<User>>
 */
const getUserById = async (id: string, token?: string): Promise<ApiResponse<User>> => {
  return makeRequest<User>(`/users/${id}`, 'GET', null, token);
};

/**
 * Creates a new user
 * @param user - User data
 * @returns Promise<ApiResponse<User>>
 */
const createUser = async (user: Partial<User>, token?: string): Promise<ApiResponse<User>> => {
  return makeRequest<User>('/users', 'POST', user, token);
};

/**
 * Updates an existing user
 * @param id - User ID
 * @param user - User data to update
 * @returns Promise<ApiResponse<User>>
 */
const updateUser = async (id: string, user: Partial<User>, token?: string): Promise<ApiResponse<User>> => {
  return makeRequest<User>(`/users/${id}`, 'PUT', user, token);
};

/**
 * Deletes a user
 * @param id - User ID
 * @returns Promise<ApiResponse<void>>
 */
const deleteUser = async (id: string, token?: string): Promise<ApiResponse<void>> => {
  return makeRequest<void>(`/users/${id}`, 'DELETE', null, token);
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 