import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, AUTH_CONFIG } from '../config';
import { User, UserRole, AuthResponse } from '../types';
import { jwtDecode } from 'jwt-decode';

// Use the token storage key from config
const TOKEN_STORAGE_KEY = AUTH_CONFIG.TOKEN_STORAGE_KEY;
const AUTH_PRESERVE_KEY = 'themis_preserve_auth';

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

interface PreservedAuthState {
  isPreserved: boolean;
  userId: string;
  username: string;
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
      // No token found in localStorage
      // Check if we need to restore auth state after language change
      const preservedAuthJson = sessionStorage.getItem(AUTH_PRESERVE_KEY);
      if (preservedAuthJson) {
        try {
          const preservedAuth = JSON.parse(preservedAuthJson) as PreservedAuthState;
          if (preservedAuth && preservedAuth.isPreserved) {
            console.log('Found preserved auth state, restoring login...');
            // Restore the user's login
            login(preservedAuth.username);
            // Remove the preserved state to prevent reuse
            sessionStorage.removeItem(AUTH_PRESERVE_KEY);
            return;
          }
        } catch (error) {
          console.error('Error parsing preserved auth state:', error);
        }
      }
      
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
      // For presentation mode: Try to find the user in the mock data
      const mockUsersStr = localStorage.getItem('mockUsers');
      if (mockUsersStr) {
        const mockUsers = JSON.parse(mockUsersStr);
        
        // Find a matching user by username or email
        const mockUser = mockUsers.find((u: any) => 
          u.username === adIdentifier || 
          u.email === adIdentifier
        );
        
        if (mockUser) {
          console.log('Found mock user for presentation:', mockUser);
          
          // Create response from mock user
          const mockResponse: AuthResponse = {
            userId: mockUser.id,
            username: mockUser.username,
            role: mockUser.role, 
            token: 'mock-jwt-token-' + Date.now(),
            success: true,
            message: 'Login successful',
            user: {
              id: mockUser.id,
              username: mockUser.username,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              email: mockUser.email,
              role: mockUser.role,
              department: {
                id: '1',
                name: mockUser.department,
                description: `${mockUser.department} Department`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              isActive: mockUser.isActive,
              createdAt: mockUser.createdAt,
              updatedAt: new Date().toISOString()
            }
          };
          
          console.log('Setting user:', mockResponse.user);
          setUser(mockResponse.user);
          console.log('Setting token:', mockResponse.token);
          setToken(mockResponse.token);
          
          // Store token in localStorage
          localStorage.setItem(TOKEN_STORAGE_KEY, mockResponse.token);
          
          // Navigate to dashboard
          navigate('/');
          return;
        }
      }
      
      // Fallback to mock login if user not found
      console.log('Using fallback mock authentication');
      const mockResponse: AuthResponse = {
        userId: '1',
        username: adIdentifier,
        role: UserRole.ADMIN, // Default to admin for testing
        token: 'mock-jwt-token-' + Date.now(), // Add timestamp to make it unique
        success: true,
        message: 'Login successful',
        // Create a minimal user object to satisfy the interface requirement
        user: {
          id: '1',
          username: adIdentifier,
          firstName: adIdentifier,
          lastName: 'User',
          email: `${adIdentifier}@example.com`,
          role: UserRole.ADMIN,
          department: {
            id: '',
            name: 'Default Department',
            description: 'Default Department Description',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      console.log('Setting user:', mockResponse.user);
      setUser(mockResponse.user);
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
    sessionStorage.removeItem(AUTH_PRESERVE_KEY);
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

// Define roles hierarchy for ApprovalStatus
export enum ApprovalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  SUB_PMO_REVIEW = 'SUB_PMO_REVIEW',
  SUB_PMO_APPROVED = 'SUB_PMO_APPROVED',
  MAIN_PMO_REVIEW = 'MAIN_PMO_REVIEW',
  MAIN_PMO_APPROVED = 'MAIN_PMO_APPROVED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED'
}

// Define permission functions
export const canCreateProjects = (userRole: UserRole | string | undefined): boolean => {
  if (!userRole) return false;
  
  return [
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO
  ].includes(userRole as UserRole);
};

export const canEditProjects = (userRole: UserRole | string | undefined, isOwnProject: boolean): boolean => {
  if (!userRole) return false;
  
  if (userRole === UserRole.ADMIN || userRole === UserRole.MAIN_PMO) {
    return true; // Can edit all projects
  }
  
  if (userRole === UserRole.SUB_PMO) {
    return true; // Can edit projects in their department
  }
  
  if (userRole === UserRole.PROJECT_MANAGER && isOwnProject) {
    return true; // Project managers can only edit their own projects
  }
  
  return false;
};

export const canApproveProjects = (userRole: UserRole | string | undefined, isOwnProject: boolean): boolean => {
  if (!userRole) return false;
  
  if (userRole === UserRole.ADMIN || userRole === UserRole.MAIN_PMO) {
    return true; // Final approval
  }
  
  if (userRole === UserRole.SUB_PMO && !isOwnProject) {
    return true; // Sub PMOs can approve projects they don't own
  }
  
  return false;
};

export const canRequestChanges = (userRole: UserRole | string | undefined): boolean => {
  if (!userRole) return false;
  
  return [
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.TEAM_LEAD
  ].includes(userRole as UserRole);
};

export const canViewAllProjects = (userRole: UserRole | string | undefined): boolean => {
  if (!userRole) return false;
  
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.EXECUTIVE
  ].includes(userRole as UserRole);
};

export const canViewDepartmentProjects = (userRole: UserRole | string | undefined): boolean => {
  if (!userRole) return false;
  
  return [
    UserRole.ADMIN,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.DEPARTMENT_DIRECTOR,
    UserRole.EXECUTIVE
  ].includes(userRole as UserRole);
};

// Define the workflow for approvals
export const getNextApprovalStatus = (
  currentStatus: ApprovalStatus, 
  userRole: UserRole | string | undefined, 
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'
): ApprovalStatus | null => {
  if (!userRole) return null;
  
  switch (currentStatus) {
    case ApprovalStatus.DRAFT:
      return ApprovalStatus.SUBMITTED;
      
    case ApprovalStatus.SUBMITTED:
      if (userRole === UserRole.SUB_PMO || userRole === UserRole.MAIN_PMO || userRole === UserRole.ADMIN) {
        if (action === 'APPROVE') {
          return ApprovalStatus.SUB_PMO_APPROVED;
        } else if (action === 'REJECT') {
          return ApprovalStatus.REJECTED;
        } else if (action === 'REQUEST_CHANGES') {
          return ApprovalStatus.CHANGES_REQUESTED;
        }
      }
      return null;
      
    case ApprovalStatus.SUB_PMO_APPROVED:
      if (userRole === UserRole.MAIN_PMO || userRole === UserRole.ADMIN) {
        if (action === 'APPROVE') {
          return ApprovalStatus.APPROVED;
        } else if (action === 'REJECT') {
          return ApprovalStatus.REJECTED;
        } else if (action === 'REQUEST_CHANGES') {
          return ApprovalStatus.CHANGES_REQUESTED;
        }
      }
      return null;
      
    case ApprovalStatus.CHANGES_REQUESTED:
      return ApprovalStatus.SUBMITTED;
      
    default:
      return null;
  }
}; 