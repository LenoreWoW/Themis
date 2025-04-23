import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider, Direction } from '@mui/material';
import theme, { createAppTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { TaskRequestProvider } from './context/TaskRequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
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
import AssignmentsPage from './pages/AssignmentsPage';
import GoalsPage from './pages/GoalsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ProjectApprovalPage from './pages/ProjectApprovalPage';
import LegacyProjectPage from './pages/LegacyProjectPage';
import AuditPage from './pages/AuditPage';
import AuditLogPage from './pages/AuditLogPage';
import { useTranslation } from 'react-i18next';

// Import i18n configuration
import './i18n';

// RTL support
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

// Clear localStorage projects data on init to force using mockProjects
localStorage.removeItem('themis_projects');

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
  const { i18n } = useTranslation();
  const { mode } = useThemeMode();
  const [direction, setDirection] = useState<Direction>('ltr');
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Update direction and theme when language changes or theme mode changes
  useEffect(() => {
    const currentLang = i18n.language;
    const newDirection = currentLang === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    setCurrentTheme(createAppTheme(newDirection, mode));
    
    // Set document dir attribute
    document.dir = newDirection;
    
    // Add appropriate font for Arabic
    if (newDirection === 'rtl') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, [i18n.language, mode]);

  // Choose the right cache based on direction
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <ProjectProvider>
              <TaskProvider projectId="default">
                <TaskRequestProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<PrivateRoute><Layout direction={direction} /></PrivateRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<PrivateRoute roleRequired={['ADMIN']}><DashboardPage /></PrivateRoute>} />
                      <Route path="projects" element={<ProjectsPage />} />
                      <Route path="projects/:id" element={<ProjectDetailPage />} />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="assignments" element={<AssignmentsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="risks-issues" element={<RiskIssuesPage />} />
                      <Route path="meetings" element={<MeetingsPage />} />
                      <Route path="goals" element={<GoalsPage />} />
                      <Route path="departments" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR']}><DepartmentsPage /></PrivateRoute>} />
                      <Route path="users" element={<PrivateRoute roleRequired={['ADMIN', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE']}><UserManagementPage /></PrivateRoute>} />
                      <Route path="projects/new" element={<PrivateRoute roleRequired={['ADMIN', 'PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO']}><ProjectApprovalPage /></PrivateRoute>} />
                      <Route path="projects/:projectId/edit" element={<PrivateRoute roleRequired={['ADMIN', 'PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO']}><ProjectApprovalPage /></PrivateRoute>} />
                      <Route path="projects/legacy/new" element={<PrivateRoute roleRequired={['SUB_PMO', 'MAIN_PMO', 'ADMIN']}><LegacyProjectPage /></PrivateRoute>} />
                      <Route path="audit" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO']}><AuditPage /></PrivateRoute>} />
                      <Route path="audit-logs" element={<PrivateRoute roleRequired={['ADMIN', 'MAIN_PMO', 'SUB_PMO']}><AuditLogPage /></PrivateRoute>} />
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
