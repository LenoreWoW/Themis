import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider, Direction, Stack, CircularProgress, Box } from '@mui/material';
// Make sure React is available from window when importing Emotion
if (typeof window !== 'undefined' && window.React === undefined) {
  window.React = React;
}
import createAppTheme from './theme';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { TaskRequestProvider } from './context/TaskRequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
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
import ApprovalsDirectPage from './pages/ApprovalsDirectPage';
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
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/notifications';
import ActionItemsPage from './pages/ActionItemsPage';
import DependenciesPage from './pages/DependenciesPage';
import CentralRepositoryPage from './pages/CentralRepositoryPage';
import HelpPage from './pages/HelpPage';
import BookingPage from './pages/Booking/BookingPage';
import AvailabilityPage from './pages/Booking/AvailabilityPage';
import BookingSettings from './pages/Settings/Booking';
import OnboardingPage from './pages/OnboardingPage';
import TutorialSettingsPage from './pages/Settings/TutorialSettingsPage';
import TaskBoardPage from './pages/TaskBoardPage';
import useOnboardingSystem from './hooks/useOnboardingSystem';
import { TourProvider } from './context/TourContext';
import TourManager from './components/Tour/TourManager';
import WelcomeModal from './components/Onboarding/WelcomeModal';

// Import i18n configuration
import './i18n/index';

// Import global styles
import './styles/bidi.css';

// RTL support
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

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

// AppContent component with simplified provider nesting
const AppContent: React.FC = () => {
  const { i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { checkFirstTimeUser } = useOnboardingSystem();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for welcome modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Get saved language from localStorage
  const savedLanguage = localStorage.getItem('pmsLanguage') || 'en';
  const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [isAppReady, setIsAppReady] = useState(false);

  // Create theme based on current mode
  const theme = isDarkMode 
    ? createAppTheme(direction, 'dark') 
    : createAppTheme(direction, 'light');

  // Ensure app is cleaned before rendering
  useEffect(() => {
    if (!isAppClean()) {
      initializeCleanApplication();
    }
    setIsAppReady(true);
  }, []);

  // Check for first-time users when logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      // Check if the tutorial has been completed
      const tutorialComplete = localStorage.getItem('tutorial_complete') === 'true';
      if (!tutorialComplete) {
        setShowWelcomeModal(true);
      }
    }
  }, [user, isAuthenticated]);

  // Handle closing the welcome modal
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

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
    
    // Set document dir attribute
    document.documentElement.dir = newDirection;
    
    // Add appropriate font for Arabic
    if (newDirection === 'rtl' && !document.getElementById('arabic-font')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'arabic-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  };

  // Clean up mock data on application startup
  useEffect(() => {
    // Remove mock data from localStorage
    cleanupMockData();
    
    // Try to initialize scheduler service
    try {
      const SchedulerService = require('./services/SchedulerService').default;
      const schedulerService = SchedulerService.getInstance();
      schedulerService.initialize();
    } catch (error) {
      console.log('Scheduler service not initialized yet, will retry after auth');
    }
  }, []);

  if (!isAppReady) {
    return null;
  }

  // Choose the right cache based on direction
  const cache = direction === 'rtl' ? rtlCache : ltrCache;
  
  // Ensure cache is valid
  if (!cache) {
    console.error('Cache is not properly initialized');
    return <FullScreenSpinner />;
  }

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <ProjectProvider>
            <TaskProvider key="global-task-provider">
              <TaskRequestProvider>
                <TourProvider>
                  <TourManager />
                  <NotificationInitializer />
                  
                  {/* Welcome Modal for first-time users */}
                  {user && showWelcomeModal && (
                    <WelcomeModal 
                      open={showWelcomeModal}
                      onClose={handleCloseWelcomeModal}
                    />
                  )}
                  
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<PrivateRoute><Layout direction={direction} onDirectionChange={handleDirectionChange} /></PrivateRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<PrivateRoute><ExecutiveDashboardPage /></PrivateRoute>} />
                      <Route path="calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
                      <Route path="calendar/availability" element={<PrivateRoute><AvailabilityPage /></PrivateRoute>} />
                      <Route path="projects" element={<ProjectsPage />} />
                      <Route path="projects/:id" element={
                        <TaskProvider key="project-task-provider">
                          <ProjectDetailPage />
                        </TaskProvider>
                      } />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="task-board" element={<PrivateRoute><TaskBoardPage /></PrivateRoute>} />
                      <Route path="assignments" element={<AssignmentsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="risks-issues" element={<RiskIssuesPage />} />
                      <Route path="meetings" element={<MeetingsPage />} />
                      <Route path="goals" element={<GoalsPage />} />
                      <Route path="booking/:userId" element={<BookingPage />} />
                      <Route path="settings/booking" element={<PrivateRoute><BookingSettings /></PrivateRoute>} />
                      <Route path="settings/tutorials" element={<PrivateRoute><TutorialSettingsPage /></PrivateRoute>} />
                      <Route path="onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
                      <Route path="departments" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR']}><DepartmentsPage /></PrivateRoute>} />
                      <Route path="users" element={<PrivateRoute roleRequired={['ADMIN', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE']}><UserManagementPage /></PrivateRoute>} />
                      <Route path="faculty" element={<PrivateRoute roleRequired={['ADMIN', 'DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE']}><FacultyPage /></PrivateRoute>} />
                      <Route path="projects/new" element={<PrivateRoute roleRequired={['ADMIN', 'PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO']}><ProjectApprovalPage /></PrivateRoute>} />
                      <Route path="approvals-direct" element={<ApprovalsDirectPage />} />
                      <Route path="approvals" element={<PrivateRoute><ApprovalsPage /></PrivateRoute>} />
                      <Route path="approvals/:tab" element={<PrivateRoute><ApprovalsPage /></PrivateRoute>} />
                      <Route path="project-approvals" element={<Navigate to="/approvals" replace />} />
                      <Route path="change-requests" element={<Navigate to="/approvals?tab=2" replace />} />
                      <Route path="ideation" element={<PrivateRoute><IdeationPage /></PrivateRoute>} />
                      <Route path="project-relationships" element={<PrivateRoute><ProjectRelationshipMapPage /></PrivateRoute>} />
                      <Route path="audit" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE']}><AuditPage /></PrivateRoute>} />
                      <Route path="audit-log" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE']}><AuditLogPage /></PrivateRoute>} />
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
                </TourProvider>
              </TaskRequestProvider>
            </TaskProvider>
          </ProjectProvider>
        </NotificationProvider>
      </MuiThemeProvider>
    </CacheProvider>
  );
};

// Root App component - simplified to reduce the nesting level
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <AuthProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </BrowserRouter>
  );
};

export default App;
