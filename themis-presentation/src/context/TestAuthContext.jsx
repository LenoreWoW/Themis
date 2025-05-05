import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define test user roles with specific workflow permissions
export const TEST_USER_ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_LEAD: 'team_lead',
  DEVELOPER: 'developer',
  STAKEHOLDER: 'stakeholder',
  GUEST: 'guest'
};

// Workflow permissions for each role
export const ROLE_PERMISSIONS = {
  [TEST_USER_ROLES.ADMIN]: {
    name: 'Administrator',
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canApproveProjects: true,
    canViewAllProjects: true,
    canCreateTasks: true,
    canAssignTasks: true,
    canReviewTasks: true,
    canManageUsers: true,
    canViewReports: true,
    canManageSettings: true,
    canAccessAdminPanel: true
  },
  [TEST_USER_ROLES.PROJECT_MANAGER]: {
    name: 'Project Manager',
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canApproveProjects: true,
    canViewAllProjects: true,
    canCreateTasks: true,
    canAssignTasks: true,
    canReviewTasks: true,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
    canAccessAdminPanel: false
  },
  [TEST_USER_ROLES.TEAM_LEAD]: {
    name: 'Team Lead',
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canApproveProjects: false,
    canViewAllProjects: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canReviewTasks: true,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
    canAccessAdminPanel: false
  },
  [TEST_USER_ROLES.DEVELOPER]: {
    name: 'Developer',
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canApproveProjects: false,
    canViewAllProjects: false,
    canCreateTasks: false,
    canAssignTasks: false,
    canReviewTasks: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
    canAccessAdminPanel: false
  },
  [TEST_USER_ROLES.STAKEHOLDER]: {
    name: 'Stakeholder',
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canApproveProjects: true,
    canViewAllProjects: true,
    canCreateTasks: false,
    canAssignTasks: false,
    canReviewTasks: false,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
    canAccessAdminPanel: false
  },
  [TEST_USER_ROLES.GUEST]: {
    name: 'Guest',
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canApproveProjects: false,
    canViewAllProjects: false,
    canCreateTasks: false,
    canAssignTasks: false,
    canReviewTasks: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
    canAccessAdminPanel: false
  }
};

// Create context for test authentication
const TestAuthContext = createContext();

export const useTestAuth = () => {
  const context = useContext(TestAuthContext);
  if (!context) {
    throw new Error('useTestAuth must be used within a TestAuthProvider');
  }
  return context;
};

export const TestAuthProvider = ({ children }) => {
  const [testUser, setTestUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for saved test user on mount
  useEffect(() => {
    const checkForTestUser = () => {
      try {
        const savedUserData = localStorage.getItem('themisUser');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          if (userData.isTestUser) {
            setTestUser(userData);
          }
        }
      } catch (error) {
        console.error('Error loading test user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForTestUser();
  }, []);

  // Login with test user
  const loginWithTestUser = (userRole, email = '') => {
    if (!ROLE_PERMISSIONS[userRole]) {
      throw new Error(`Invalid user role: ${userRole}`);
    }

    const rolePermissions = ROLE_PERMISSIONS[userRole];
    const testUserData = {
      id: `test_${userRole}`,
      email: email || `test_${userRole}@themis.app`,
      name: `Test ${rolePermissions.name}`,
      role: userRole,
      permissions: rolePermissions,
      isTestUser: true
    };

    // Save to state and localStorage
    setTestUser(testUserData);
    localStorage.setItem('themisUser', JSON.stringify(testUserData));
    
    // Navigate to dashboard
    navigate('/dashboard');
    return testUserData;
  };

  // Logout test user
  const logoutTestUser = () => {
    setTestUser(null);
    localStorage.removeItem('themisUser');
    navigate('/login');
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!testUser || !testUser.permissions) return false;
    return testUser.permissions[permission] === true;
  };

  // Common permission checks
  const canCreateProjects = () => hasPermission('canCreateProjects');
  const canEditProjects = () => hasPermission('canEditProjects');
  const canDeleteProjects = () => hasPermission('canDeleteProjects');
  const canApproveProjects = () => hasPermission('canApproveProjects');
  const canViewAllProjects = () => hasPermission('canViewAllProjects');
  const canCreateTasks = () => hasPermission('canCreateTasks');
  const canAssignTasks = () => hasPermission('canAssignTasks');
  const canReviewTasks = () => hasPermission('canReviewTasks');
  const canManageUsers = () => hasPermission('canManageUsers');
  const canViewReports = () => hasPermission('canViewReports');
  const canManageSettings = () => hasPermission('canManageSettings');
  const canAccessAdminPanel = () => hasPermission('canAccessAdminPanel');

  // Get user role name
  const getUserRoleName = () => {
    if (!testUser || !testUser.role) return 'Unknown';
    return ROLE_PERMISSIONS[testUser.role]?.name || 'Unknown Role';
  };

  const value = {
    testUser,
    isTestUser: !!testUser,
    isAuthenticated: !!testUser,
    isLoading,
    loginWithTestUser,
    logoutTestUser,
    hasPermission,
    getUserRoleName,
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canApproveProjects,
    canViewAllProjects,
    canCreateTasks,
    canAssignTasks,
    canReviewTasks,
    canManageUsers,
    canViewReports,
    canManageSettings,
    canAccessAdminPanel
  };

  return (
    <TestAuthContext.Provider value={value}>
      {children}
    </TestAuthContext.Provider>
  );
};

export default TestAuthContext; 