import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// Import will be re-enabled after fixing context issues
// import { AuthProvider } from './context/AuthContext';
// import { NotificationProvider } from './context/NotificationContext';

// Main Layout
import MainLayout from './components/Layout/MainLayout';

// Import pages
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound/index';
import ProjectRelationshipMapPage from './pages/ProjectRelationshipMapPage';
// Will be enabled when UserManagement is available
// import UserManagement from './pages/UserManagement';

function App() {
  return (
    // <AuthProvider>
    //   <NotificationProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="board" element={<KanbanBoard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="project-relationships" element={<ProjectRelationshipMapPage />} />
              <Route path="project-relationships/:projectId" element={<ProjectRelationshipMapPage />} />
              {/* <Route path="users" element={<UserManagement />} /> */}
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
    //   </NotificationProvider>
    // </AuthProvider>
  );
}

export default App; 