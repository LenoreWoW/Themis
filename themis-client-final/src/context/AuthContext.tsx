import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, AUTH_CONFIG } from '../config';
import { User, UserRole, AuthResponse } from '../types';
import { jwtDecode } from 'jwt-decode';
import { login as loginService } from '../services/auth';

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
  login: (username: string, password: string) => Promise<void>;
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
            login(preservedAuth.username, '');
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

  const login = async (username: string, password: string = '') => {
    setIsLoading(true);
    console.log('Login attempt with username:', username);
    
    try {
      // Special case for "admin" user - no password required
      if (username.toLowerCase() === 'admin') {
        // Admin user bypasses password validation
        console.log('Admin login - bypassing password validation');
        // Create admin mock response
        const mockResponse: AuthResponse = {
          userId: 'admin-1',
          username: 'admin',
          role: UserRole.ADMIN,
          token: 'mock-jwt-token-admin-' + Date.now(),
          success: true,
          message: 'Login successful',
          user: {
            id: 'admin-1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@acme.com',
            role: UserRole.ADMIN,
            department: {
              id: 'dept-1',
              name: 'IT Department',
              description: 'Information Technology Department',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        
        console.log('Setting admin user');
        setUser(mockResponse.user);
        setToken(mockResponse.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, mockResponse.token);
        setIsLoading(false);
        return;
      }
      
      // Check for test users - no need for API calls
      const isTestUser = username === 'john.smith@acme.com' ||
                        username === 'sarah.johnson@acme.com' ||
                        username === 'emma.garcia@acme.com' ||
                        username === 'robert.taylor@acme.com' ||
                        username === 'david.wilson@acme.com' ||
                        username === 'jessica.brown@acme.com' ||
                        username === 'michael.chen@acme.com';
                        
      if (isTestUser) {
        console.log('Using test user authentication for:', username);
        // For development mode or test accounts
        // Map the email address to the appropriate role
        let userRole = UserRole.ADMIN; // Default
        
        // Map test accounts to their respective roles
        if (username === 'sarah.johnson@acme.com') {
          userRole = UserRole.PROJECT_MANAGER;
        } else if (username === 'emma.garcia@acme.com') {
          userRole = UserRole.DEPARTMENT_DIRECTOR;
        } else if (username === 'robert.taylor@acme.com') {
          userRole = UserRole.EXECUTIVE;
        } else if (username === 'david.wilson@acme.com') {
          userRole = UserRole.MAIN_PMO;
        } else if (username === 'jessica.brown@acme.com') {
          userRole = UserRole.SUB_PMO;
        } else if (username === 'michael.chen@acme.com') {
          userRole = UserRole.DEVELOPER;
        }
        // john.smith@acme.com will remain as ADMIN (default)
        
        // Set department details based on user
        let departmentId = 'dept-1';
        let departmentName = 'IT Department';
        let departmentDescription = 'Information Technology Department';
        
        // Assign departments to users
        if (username === 'sarah.johnson@acme.com' || username === 'jessica.brown@acme.com') {
          // Project Manager and Sub PMO belong to the same department
          departmentId = 'dept-2';
          departmentName = 'Digital Transformation';
          departmentDescription = 'Digital Transformation and Innovation Department';
        } else if (username === 'emma.garcia@acme.com') {
          departmentId = 'dept-3';
          departmentName = 'Finance Department';
          departmentDescription = 'Finance and Accounting Department';
        } else if (username === 'michael.chen@acme.com') {
          departmentId = 'dept-4';
          departmentName = 'Development Department';
          departmentDescription = 'Software Development Department';
        }
        
        // For pre-AD integration: create a mock successful login response
        const mockResponse: AuthResponse = {
          userId: '1',
          username: username,
          role: userRole,
          token: 'mock-jwt-token-' + Date.now(), // Add timestamp to make it unique
          success: true,
          message: 'Login successful',
          // Create a minimal user object to satisfy the interface requirement
          user: {
            id: '1',
            username: username,
            firstName: username.split('@')[0].split('.').join(' '),
            lastName: '',
            email: username,
            role: userRole,
            department: {
              id: departmentId,
              name: departmentName,
              description: departmentDescription,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        
        console.log('Setting test user:', mockResponse.user);
        setUser(mockResponse.user);
        console.log('Setting token:', mockResponse.token);
        setToken(mockResponse.token);
        
        // Store token in localStorage
        localStorage.setItem(TOKEN_STORAGE_KEY, mockResponse.token);
        setIsLoading(false);
        return;
      }
      
      // For regular production authentication with non-empty password
      if (password) {
        // Production environment: Use the login service to authenticate
        try {
          console.log('Attempting production login with service');
          const response = await loginService(username, password);
          
          console.log('Setting user:', response.user);
          setUser(response.user);
          console.log('Setting token:', response.token);
          setToken(response.token);
          
          // Store token in localStorage
          localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
          
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Authentication error:', error);
          setIsLoading(false);
          throw error;
        }
      } else {
        // If we got here, it means we have a non-test user with no password
        console.error('Non-test user without password');
        setIsLoading(false);
        throw new Error('Password is required');
      }
    } catch (error) {
      console.error('Login error details:', error);
      setIsLoading(false);
      throw error;
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
  PLANNING = 'PLANNING',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  PENDING_SUB_PMO = 'PENDING_SUB_PMO',
  APPROVED_BY_SUB_PMO = 'APPROVED_BY_SUB_PMO',
  REJECTED_BY_SUB_PMO = 'REJECTED_BY_SUB_PMO',
  PENDING_MAIN_PMO = 'PENDING_MAIN_PMO'
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

export const canApproveProjects = (userRole: UserRole | string | undefined, isOwnProject: boolean = false): boolean => {
  if (!userRole) return false;
  
  if (userRole === UserRole.ADMIN || userRole === UserRole.MAIN_PMO) {
    return true; // Final approval
  }
  
  if (userRole === UserRole.SUB_PMO && !isOwnProject) {
    return true; // Sub PMOs can approve projects they don't own
  }
  
  // Executives can view but not approve
  if (userRole === UserRole.EXECUTIVE) {
    return false;
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
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUBMIT',
  isSameDepartment: boolean = false,
  entityType: 'PROJECT' | 'CHANGE_REQUEST' = 'PROJECT'
): ApprovalStatus | null => {
  if (!userRole) return null;
  
  // Executives can only view, not take actions
  if (userRole === UserRole.EXECUTIVE) {
    return null;
  }
  
  switch (currentStatus) {
    case ApprovalStatus.DRAFT:
      // When a PM submits a draft project or change request
      return ApprovalStatus.PENDING_SUB_PMO;
      
    case ApprovalStatus.PENDING_SUB_PMO:
      // Only Sub PMO, Main PMO, or Admin can take action on PENDING_SUB_PMO
      if (userRole === UserRole.SUB_PMO && isSameDepartment) {
        if (action === 'APPROVE') {
          return ApprovalStatus.APPROVED_BY_SUB_PMO;
        } else if (action === 'REJECT') {
          return ApprovalStatus.REJECTED_BY_SUB_PMO;
        } else if (action === 'REQUEST_CHANGES') {
          return ApprovalStatus.CHANGES_REQUESTED;
        }
      } else if (userRole === UserRole.MAIN_PMO || userRole === UserRole.ADMIN) {
        if (action === 'APPROVE') {
          return ApprovalStatus.APPROVED_BY_SUB_PMO;
        } else if (action === 'REJECT') {
          return ApprovalStatus.REJECTED_BY_SUB_PMO;
        } else if (action === 'REQUEST_CHANGES') {
          return ApprovalStatus.CHANGES_REQUESTED;
        }
      }
      return null;
      
    case ApprovalStatus.APPROVED_BY_SUB_PMO:
      // Once approved by Sub PMO, it goes to Main PMO
      return ApprovalStatus.PENDING_MAIN_PMO;
      
    case ApprovalStatus.PENDING_MAIN_PMO:
      // Only Main PMO or Admin can take action on PENDING_MAIN_PMO (removed Executive)
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
      // When a PM resubmits after changes were requested
      if (action === 'SUBMIT') {
        return ApprovalStatus.PENDING_SUB_PMO;
      }
      return null;
      
    default:
      return null;
  }
};

// Check if a user is from the same department as a project or another user
export const isFromSameDepartment = (user: User | null, departmentId: string | undefined): boolean => {
  if (!user || !departmentId) return false;
  return user.department.id === departmentId;
};

export enum ApprovalAction {
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_CHANGES = 'REQUEST_CHANGES'
} 