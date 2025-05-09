import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider, Direction, Stack, CircularProgress, Box } from '@mui/material';
import createAppTheme from './theme';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { TaskRequestProvider } from './context/TaskRequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ThemeContext from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RiskIssuesPage from './pages/RiskIssuesPage';
import MeetingsPage from './pages/MeetingsPage';
import UserManagementPage from './pages/UserManagementPage';
import FacultyPage from './pages/FacultyPage';
import AssignmentsPage from './pages/AssignmentsPage';
import GoalsPage from './pages/GoalsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ProjectApprovalPage from './pages/ProjectApprovalPage';
import ApprovalsPage from './pages/ApprovalsPage';
import LegacyProjectPage from './pages/LegacyProjectPage';
import AuditPage from './pages/AuditPage';
import AuditLogPage from './pages/AuditLogPage';
import SupabaseConnectionTest from './components/SupabaseConnectionTest';
import { useTranslation } from 'react-i18next';
import { initializeCleanApplication, isAppClean, cleanupMockData } from './utils/cleanupUtils';
import ChangeRequestApproval from './components/ChangeRequest/ChangeRequestApproval';
import ChangeRequestsPage from './pages/ChangeRequestsPage';
import NotificationInitializer from './components/NotificationInitializer';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ProjectRelationshipMapPage from './pages/ProjectRelationshipMapPage';
import IdeationPage from './pages/IdeationPage';
import Auth0CallbackPage from './pages/Auth0CallbackPage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/notifications';
import ActionItemsPage from './pages/ActionItemsPage';
import DependenciesPage from './pages/DependenciesPage';
import CentralRepositoryPage from './pages/CentralRepositoryPage';
import HelpPage from './pages/HelpPage';

// Import i18n configuration
import './i18n/index';

// Import global styles
import './styles/bidi.css';

// RTL support
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

// Clear all test data on application startup
// Force clean data on every app load
initializeCleanApplication();

// Create caches for RTL and LTR
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

// FullScreenSpinner component for loading states
const FullScreenSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// AppContent component separated to use theme context
const AppContent: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { themeMode, isDarkMode } = useTheme();
  const selectedTheme = useMemo(() => (isDarkMode ? createAppTheme('rtl', 'dark') : createAppTheme('rtl', 'light')), [isDarkMode]);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get saved language from localStorage
  const savedLanguage = localStorage.getItem('pmsLanguage') || 'en';
  const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [currentTheme, setCurrentTheme] = useState(selectedTheme);
  const [isAppReady, setIsAppReady] = useState(false);

  // Ensure app is cleaned before rendering
  useEffect(() => {
    if (!isAppClean()) {
      initializeCleanApplication();
    }
    setIsAppReady(true);
  }, []);

  // Force language initialization on first render
  useEffect(() => {
    if (i18n.language !== savedLanguage) {
      console.log('Forcing language change to:', savedLanguage);
      i18n.changeLanguage(savedLanguage);
      document.documentElement.dir = initialDirection;
      document.documentElement.lang = savedLanguage;
    }
  }, [i18n, savedLanguage, initialDirection]);

  // Handle direction change from language switcher
  const handleDirectionChange = (newDirection: Direction) => {
    console.log('Direction changed to:', newDirection);
    setDirection(newDirection);
    setCurrentTheme(selectedTheme);
    
    // Set document dir attribute
    document.documentElement.dir = newDirection;
    document.dir = newDirection;
    
    // Add appropriate font for Arabic
    if (newDirection === 'rtl' && !document.getElementById('arabic-font')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'arabic-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  };

  // Update theme when mode changes
  useEffect(() => {
    setCurrentTheme(selectedTheme);
  }, [selectedTheme]);

  // Clean up mock data on application startup
  useEffect(() => {
    // Remove mock data from localStorage
    cleanupMockData();
    
    // Try to initialize scheduler service (will only work when authenticated)
    try {
      const SchedulerService = require('./services/SchedulerService').default;
      const schedulerService = SchedulerService.getInstance();
      schedulerService.initialize();
    } catch (error) {
      console.log('Scheduler service not initialized yet, will retry after auth');
    }
  }, []);

  if (!isAppReady) {
    return null; // Don't render until app is cleaned
  }

  // Choose the right cache based on direction
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <ProjectProvider>
              <TaskProvider key="global-task-provider">
                <TaskRequestProvider>
                  <NotificationInitializer />
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/callback" element={<Auth0CallbackPage />} />
                    <Route path="/" element={<PrivateRoute><Layout direction={direction} onDirectionChange={handleDirectionChange} /></PrivateRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<PrivateRoute roleRequired={['ADMIN', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR']}><DashboardPage /></PrivateRoute>} />
                      <Route path="calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
                      <Route path="projects" element={<ProjectsPage />} />
                      <Route path="projects/:id" element={
                        <TaskProvider key="project-task-provider">
                          <ProjectDetailPage />
                        </TaskProvider>
                      } />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="assignments" element={<AssignmentsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="risks-issues" element={<RiskIssuesPage />} />
                      <Route path="meetings" element={<MeetingsPage />} />
                      <Route path="goals" element={<GoalsPage />} />
                      <Route path="departments" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR']}><DepartmentsPage /></PrivateRoute>} />
                      <Route path="users" element={<PrivateRoute roleRequired={['ADMIN', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE']}><UserManagementPage /></PrivateRoute>} />
                      <Route path="faculty" element={<PrivateRoute roleRequired={['ADMIN', 'DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE']}><FacultyPage /></PrivateRoute>} />
                      <Route path="projects/new" element={<PrivateRoute roleRequired={['ADMIN', 'PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO']}><ProjectApprovalPage /></PrivateRoute>} />
                      <Route path="approvals" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER', 'EXECUTIVE']}><ApprovalsPage /></PrivateRoute>} />
                      <Route path="project-approvals" element={<Navigate to="/approvals" replace />} />
                      <Route path="change-requests" element={<PrivateRoute><ChangeRequestsPage /></PrivateRoute>} />
                      <Route path="ideation" element={<PrivateRoute><IdeationPage /></PrivateRoute>} />
                      <Route path="project-relationships" element={<PrivateRoute><ProjectRelationshipMapPage /></PrivateRoute>} />
                      <Route path="audit" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE']}><AuditPage /></PrivateRoute>} />
                      <Route path="audit-log" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE']}><AuditLogPage /></PrivateRoute>} />
                      <Route path="legacy" element={<PrivateRoute><LegacyProjectPage /></PrivateRoute>} />
                      <Route path="test-connection" element={<PrivateRoute><SupabaseConnectionTest /></PrivateRoute>} />
                      <Route path="approve-change-request/:requestId" element={<PrivateRoute><ChangeRequestApproval /></PrivateRoute>} />
                      <Route path="notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
                      <Route path="chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                      <Route path="action-items" element={<PrivateRoute><ActionItemsPage /></PrivateRoute>} />
                      <Route path="dependencies" element={<PrivateRoute><DependenciesPage /></PrivateRoute>} />
                      <Route path="repository" element={<PrivateRoute><CentralRepositoryPage /></PrivateRoute>} />
                      <Route path="help" element={<PrivateRoute><HelpPage /></PrivateRoute>} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </TaskRequestProvider>
              </TaskProvider>
            </ProjectProvider>
          </AuthProvider>
        </NotificationProvider>
      </MuiThemeProvider>
    </CacheProvider>
  );
};

const ProtectedRoutes = () => {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <React.Fragment>{React.createElement('outlet')}</React.Fragment>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider>
          <AppContent />
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
