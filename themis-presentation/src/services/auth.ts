import { AuthResponse, ApiResponse, User } from '../types';
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
 * Log in a user
 * @param email - User email
 * @param password - User password
 * @returns Promise<ApiResponse<AuthResponse>>
 */
const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
  return makeRequest<AuthResponse>('/auth/login', 'POST', { email, password });
};

/**
 * Register a new user
 * @param userData - User registration data
 * @returns Promise<ApiResponse<User>>
 */
const register = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
  return makeRequest<User>('/auth/register', 'POST', userData);
};

/**
 * Log out the current user
 * @returns Promise<ApiResponse<void>>
 */
const logout = async (token?: string): Promise<ApiResponse<void>> => {
  return makeRequest<void>('/auth/logout', 'POST', null, token);
};

/**
 * Refresh the authentication token
 * @param refreshToken - The refresh token
 * @returns Promise<ApiResponse<{ token: string }>>
 */
const refreshToken = async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
  return makeRequest<{ token: string }>('/auth/refresh', 'POST', { refreshToken });
};

/**
 * Reset a user's password
 * @param email - User email
 * @returns Promise<ApiResponse<{ message: string }>>
 */
const resetPassword = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  return makeRequest<{ message: string }>('/auth/reset-password', 'POST', { email });
};

export default {
  login,
  register,
  logout,
  refreshToken,
  resetPassword
}; 