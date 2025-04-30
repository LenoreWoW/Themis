import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
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

// Project Details Wrapper Component
const ProjectDetailsWrapper: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return <Typography>Project not found</Typography>;
  }
  
  return <ProjectDetails project={project} />;
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleAddProject = (newProject: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
    };
    setProjects([...projects, project]);
    navigate('/projects');
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                <Tab label="Add Project" component={Link} to="/new" />
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
                    onViewProject={handleViewProject}
                    onDeleteProject={handleDeleteProject}
                  />
                }
              />
              <Route
                path="/new"
                element={<ProjectForm onSubmit={handleAddProject} />}
              />
              <Route
                path="/projects/:id"
                element={<ProjectDetailsWrapper projects={projects} />}
              />
              <Route 
                path="/" 
                element={
                  <ProjectList 
                    projects={projects} 
                    onViewProject={handleViewProject}
                    onDeleteProject={handleDeleteProject}
                  />
                } 
              />
            </Routes>
          </Container>
        </main>
      </div>
    </ThemeProvider>
  );
}

// Wrap App with Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter; 