import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider, Direction } from '@mui/material';
import theme, { createAppTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { TaskRequestProvider } from './context/TaskRequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
// We no longer need these specialized project detail pages
// import ERPProjectDetailPage from './pages/projects/ERPProjectDetailPage';
// import MarketingProjectDetailPage from './pages/projects/MarketingProjectDetailPage';
// import FinanceProjectDetailPage from './pages/projects/FinanceProjectDetailPage';
// import SupplyChainProjectDetailPage from './pages/projects/SupplyChainProjectDetailPage';
// import WebsiteProjectDetailPage from './pages/projects/WebsiteProjectDetailPage';
// import InfrastructureProjectDetailPage from './pages/projects/InfrastructureProjectDetailPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RiskIssuesPage from './pages/RiskIssuesPage';
import MeetingsPage from './pages/MeetingsPage';
import UserManagementPage from './pages/UserManagementPage';
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

// Import i18n configuration
import './i18n';

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

// AppContent component separated to use theme context
const AppContent: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { themeMode: mode } = useTheme();
  
  // Get saved language from localStorage
  const savedLanguage = localStorage.getItem('themisLanguage') || 'en';
  const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [currentTheme, setCurrentTheme] = useState(createAppTheme(initialDirection, mode));
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
    }
  }, []);

  // Update direction and theme when language changes or theme mode changes
  useEffect(() => {
    const currentLang = i18n.language;
    const newDirection = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    console.log('Language changed to:', currentLang, 'Direction:', newDirection);
    
    setDirection(newDirection);
    setCurrentTheme(createAppTheme(newDirection, mode));
    
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
  }, [i18n.language, mode]);

  // Choose the right cache based on direction
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  // Clean up mock data on application startup
  useEffect(() => {
    // Remove mock data from localStorage
    cleanupMockData();
  }, []);

  if (!isAppReady) {
    return null; // Don't render until app is cleaned
  }

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <ProjectProvider>
              <TaskProvider key="global-task-provider">
                <TaskRequestProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<PrivateRoute><Layout direction={direction} /></PrivateRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<PrivateRoute roleRequired={['ADMIN']}><DashboardPage /></PrivateRoute>} />
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
                      <Route path="projects/new" element={<PrivateRoute roleRequired={['ADMIN', 'PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO']}><ProjectApprovalPage /></PrivateRoute>} />
                      <Route path="project-approvals" element={<PrivateRoute roleRequired={['ADMIN', 'SUB_PMO', 'MAIN_PMO']}><ApprovalsPage /></PrivateRoute>} />
                      <Route path="legacy-projects" element={<PrivateRoute roleRequired={['ADMIN']}><LegacyProjectPage /></PrivateRoute>} />
                      <Route path="audit" element={<PrivateRoute roleRequired={['ADMIN']}><AuditPage /></PrivateRoute>} />
                      <Route path="audit-logs" element={<PrivateRoute roleRequired={['ADMIN']}><AuditLogPage /></PrivateRoute>} />
                      <Route path="supabase-test" element={<SupabaseConnectionTest />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
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

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
