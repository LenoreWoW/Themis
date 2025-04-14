import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import RiskIssuesPage from './pages/RiskIssuesPage';
import TaskBoardPage from './pages/TaskBoardPage';
import MeetingsPage from './pages/MeetingsPage';
import UserManagementPage from './pages/UserManagementPage';

// Layout component
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes with Layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              } 
            >
              {/* Root path redirects to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard route */}
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Projects routes */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="projects/:projectId/tasks" element={<TaskBoardPage />} />
              
              {/* Tasks route */}
              <Route path="tasks" element={<TasksPage />} />
              
              {/* Risks & Issues route */}
              <Route path="risks-issues" element={<RiskIssuesPage />} />
              
              {/* Meetings route */}
              <Route path="meetings" element={<MeetingsPage />} />
              
              {/* User Management route */}
              <Route path="users" element={<UserManagementPage />} />
              
              {/* Redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
