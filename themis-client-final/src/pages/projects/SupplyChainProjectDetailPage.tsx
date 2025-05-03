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
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Store as WarehouseIcon,
  Timeline as ForecastIcon,
  Assessment as ReportsIcon
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

const SupplyChainProjectDetailPage: React.FC = () => {
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
        <Typography variant="h6" sx={{ mt: 2 }}>Loading supply chain project details...</Typography>
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

      <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Supply Chain Optimization Project
        </Typography>
        <Typography variant="body1" paragraph>
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
          <Tab label="Overview" icon={<InventoryIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Logistics" icon={<ShippingIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Warehousing" icon={<WarehouseIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Forecasting" icon={<ForecastIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Reports" icon={<ReportsIcon />} iconPosition="start" {...a11yProps(4)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Supply Chain Project Overview</Typography>
          <Alert severity="info">
            This supply chain project detail page is under development. Additional features and detailed information will be available soon.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Logistics</Typography>
          <Alert severity="info">
            Logistics data and optimization information will be displayed here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Warehousing</Typography>
          <Alert severity="info">
            Warehouse management details will be displayed here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Forecasting</Typography>
          <Alert severity="info">
            Supply chain forecasting tools and data will be available here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Reports</Typography>
          <Alert severity="info">
            Supply chain reports and analytics will be generated here.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SupplyChainProjectDetailPage; 