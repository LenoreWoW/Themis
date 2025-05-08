import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/AuthService';

// Create auth context
const AuthContext = createContext();

/**
 * Auth Provider component for managing authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Try to get user from localStorage on app initialization
    const initAuth = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        
        if (storedUser) {
          // Verify token is still valid by getting user profile
          try {
            const { user: updatedUser } = await authService.getProfile();
            setUser(updatedUser);
          } catch (error) {
            // Token is invalid, clear auth state
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  /**
   * Login function
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout function
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  /**
   * Change password function
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<Object>} Change password result
   */
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      
      // If user had forcePasswordChange flag, update the user object
      if (user && user.forcePasswordChange) {
        setUser({
          ...user,
          forcePasswordChange: false
        });
      }
      
      return response;
    } catch (error) {
      setError(error.message || 'Password change failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Check if user has required roles
   * @param {Array} roles - Required roles
   * @returns {boolean} True if user has required role
   */
  const hasRole = (roles) => {
    return authService.hasRole(roles);
  };
  
  /**
   * Get auth header for API requests
   * @returns {Object} Auth header
   */
  const getAuthHeader = () => {
    return authService.authHeader();
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    hasRole,
    getAuthHeader,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 