import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Tabs, Tab } from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import './App.css';
import { Project } from './types';

// Import components
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Navigation from './components/Navigation';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleAddProject = (newProject: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
    };
    setProjects([...projects, project]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <main className="container">
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Project Management
                </Typography>
                <Tabs value={selectedTab} onChange={handleTabChange}>
                  <Tab label="Projects" component={Link} to="/projects" />
                  <Tab label="New Project" component={Link} to="/new" />
                </Tabs>
              </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
              <Routes>
                <Route
                  path="/projects"
                  element={
                    <ProjectList
                      projects={projects}
                      onViewProject={(id) => window.location.href = `/projects/${id}`}
                    />
                  }
                />
                <Route
                  path="/new"
                  element={<ProjectForm onSubmit={handleAddProject} />}
                />
                <Route
                  path="/projects/:id"
                  element={
                    <ProjectDetails
                      project={projects.find(p => p.id === window.location.pathname.split('/').pop())!}
                    />
                  }
                />
                <Route path="/" element={<ProjectList projects={projects} onViewProject={(id) => window.location.href = `/projects/${id}`} />} />
              </Routes>
            </Container>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 