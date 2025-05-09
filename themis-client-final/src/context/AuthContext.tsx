import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, AUTH_CONFIG } from '../config';
import { User, UserRole, AuthResponse } from '../types';
import { jwtDecode } from 'jwt-decode';
import { login as loginService } from '../services/auth';
import logger from '../utils/logger';
import api from '../services/api';

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

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Use the login service directly
      const response = await loginService(username, password);
      
      if (response.success && response.user) {
        const { token, user } = response;
        
        // Store token and user
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
        console.error('Authentication failed');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
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