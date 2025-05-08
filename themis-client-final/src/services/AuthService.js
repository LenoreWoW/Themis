import axios from 'axios';
import { PASSPORT_CONFIG, AUTH_CONFIG } from '../config';

const API_URL = PASSPORT_CONFIG.AUTH_SERVER_URL;

/**
 * Authentication service for handling login, logout, and token management
 */
class AuthService {
  /**
   * Login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} User data and tokens
   */
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}${PASSPORT_CONFIG.LOGIN_ENDPOINT}`, {
        email,
        password
      });
      
      if (response.data.token) {
        // Store tokens
        localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, response.data.token);
        
        if (response.data.refreshToken) {
          localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, response.data.refreshToken);
        }
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
  
  /**
   * Logout the current user
   */
  logout() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem('user');
  }
  
  /**
   * Change password
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put(
        `${API_URL}${PASSPORT_CONFIG.PROFILE_ENDPOINT}/change-password`,
        { currentPassword, newPassword },
        { headers: this.authHeader() }
      );
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
  
  /**
   * Get the current user from local storage
   * @returns {Object|null} User object
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      this.logout();
      return null;
    }
  }
  
  /**
   * Get authentication header with JWT token
   * @returns {Object} Headers object
   */
  authHeader() {
    const token = this.getToken();
    if (!token) return {};
    
    return { Authorization: `Bearer ${token}` };
  }
  
  /**
   * Get the current JWT token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
  }
  
  /**
   * Get the refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  }
  
  /**
   * Refresh the access token using the refresh token
   * @returns {Promise} New access token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${API_URL}${PASSPORT_CONFIG.REFRESH_TOKEN_ENDPOINT}`, {
        refreshToken
      });
      
      if (response.data.token) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, response.data.token);
      }
      
      return response.data;
    } catch (error) {
      this.logout();
      throw error.response?.data || error;
    }
  }
  
  /**
   * Check if the user has the required roles
   * @param {Array} requiredRoles - Array of roles
   * @returns {boolean} True if user has at least one of the required roles
   */
  hasRole(requiredRoles) {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const user = this.getCurrentUser();
    if (!user || !user.roles) {
      return false;
    }
    
    return user.roles.some(role => requiredRoles.includes(role));
  }
  
  /**
   * Get user profile
   * @returns {Promise} User profile data
   */
  async getProfile() {
    try {
      const response = await axios.get(
        `${API_URL}${PASSPORT_CONFIG.PROFILE_ENDPOINT}`,
        { headers: this.authHeader() }
      );
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        try {
          await this.refreshToken();
          // Retry the original request
          return await this.getProfile();
        } catch (refreshError) {
          // Refresh failed, logout user
          this.logout();
          throw refreshError;
        }
      }
      
      throw error.response?.data || error;
    }
  }
}

const authService = new AuthService();

// Add axios interceptor for token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await authService.refreshToken();
        
        // Update the authorization header
        originalRequest.headers['Authorization'] = `Bearer ${authService.getToken()}`;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authService.logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default authService; 