import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Web as WebIcon,
  Code as CodeIcon,
  Devices as DevicesIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Project, ProjectStatus } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

const WebsiteProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Find the project in the projects array
        const foundProject = projects.find(p => p.id === id);
        
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, projects]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading website project details...</Typography>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="outlined" 
        startIcon={<BackIcon />} 
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

      <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2, background: 'linear-gradient(to right, #1565c0, #42a5f5)' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
          {project.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }} gutterBottom>
          Website Redesign Project
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {project.description}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="project detail tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<WebIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Design" icon={<DevicesIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Development" icon={<CodeIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Performance" icon={<PerformanceIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" {...a11yProps(4)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Website Project Overview</Typography>
          <Alert severity="info">
            This website project detail page is under development. Additional features and detailed information will be available soon.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Design</Typography>
          <Alert severity="info">
            Website design mockups and user experience details will be displayed here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Development</Typography>
          <Alert severity="info">
            Development progress, front-end and back-end implementation details will be displayed here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Performance</Typography>
          <Alert severity="info">
            Website performance metrics and optimization details will be available here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Security</Typography>
          <Alert severity="info">
            Website security assessments and implementation details will be displayed here.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WebsiteProjectDetailPage; 