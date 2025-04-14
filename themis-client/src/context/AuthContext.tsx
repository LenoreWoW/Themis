import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, AUTH_CONFIG } from '../config';
import { User, UserRole, AuthResponse } from '../types';
import { jwtDecode } from 'jwt-decode';

// Use the token storage key from config
const TOKEN_STORAGE_KEY = AUTH_CONFIG.TOKEN_STORAGE_KEY;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isPending: boolean;
  isProjectManager: boolean;
  isSubPmo: boolean;
  isMainPmo: boolean;
  isDepartmentDirector: boolean;
  isHigherManagement: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isPM: boolean;
  isQA: boolean;
  isDirector: boolean;
  isExecutive: boolean;
  isMainPMO: boolean;
  isSubPMO: boolean;
  hasAccess: (roles: UserRole[]) => boolean;
  login: (adIdentifier: string, password?: string) => Promise<void>;
  logout: () => void;
}

interface JwtPayload {
  exp: number;
  userId: string;
  username: string;
  role: UserRole;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkToken = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          setIsLoading(false);
          
          // Fetch user details using token
          axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            setUser(response.data);
          })
          .catch(error => {
            console.error('Error fetching user details:', error);
            logout();
          });
        } else {
          // Token expired
          logout();
        }
      } catch (error) {
        // Invalid token
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTokenAndSetUser = async () => {
      checkToken();
    };
    
    checkTokenAndSetUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (adIdentifier: string, password: string = '') => {
    setIsLoading(true);
    console.log('Login attempt with username:', adIdentifier);
    
    try {
      // For pre-AD integration: create a mock successful login response
      const mockResponse: AuthResponse = {
        userId: '1',
        username: adIdentifier,
        role: UserRole.ADMIN, // Default to admin for testing
        token: 'mock-jwt-token-' + Date.now(), // Add timestamp to make it unique
        success: true,
        message: 'Login successful'
      };
      
      // Create a user object from the mock response
      const user: User = {
        id: mockResponse.userId,
        username: mockResponse.username,
        role: mockResponse.role,
        // Set default values for other required User properties
        email: `${adIdentifier}@example.com`,
        firstName: adIdentifier,
        lastName: 'User',
        department: mockResponse.departmentId || '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Setting user:', user);
      setUser(user);
      console.log('Setting token:', mockResponse.token);
      setToken(mockResponse.token);
      
      // Store token in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, mockResponse.token);
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    navigate('/login');
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  // Role-specific helper properties
  const isPending = hasRole(UserRole.PENDING);
  const isProjectManager = hasRole(UserRole.PROJECT_MANAGER);
  const isSubPmo = hasRole(UserRole.SUB_PMO);
  const isMainPmo = hasRole(UserRole.MAIN_PMO);
  const isDepartmentDirector = hasRole(UserRole.DEPARTMENT_DIRECTOR);
  const isHigherManagement = hasRole(UserRole.EXECUTIVE);
  const isAdmin = hasRole(UserRole.ADMIN);
  const isMember = user !== null && user.role !== UserRole.PENDING;
  
  const isAuthenticated = !!user && !!token;
  
  // Role checking helpers
  const isPM = user?.role === UserRole.PROJECT_MANAGER;
  const isQA = false;
  
  // Adding aliases for roles that components are trying to access
  const isDirector = isDepartmentDirector;
  const isExecutive = isHigherManagement;
  const isMainPMO = isMainPmo;
  const isSubPMO = isSubPmo;

  // Check if user has one of the specified roles
  const hasAccess = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    hasRole,
    isPending,
    isProjectManager,
    isSubPmo,
    isMainPmo,
    isDepartmentDirector,
    isHigherManagement,
    isAdmin,
    isMember,
    isPM,
    isQA,
    isDirector,
    isExecutive,
    isMainPMO,
    isSubPMO,
    hasAccess,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 