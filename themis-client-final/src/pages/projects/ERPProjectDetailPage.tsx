import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Assessment as AssessmentIcon,
  Storage as DatabaseIcon,
  Code as APIIcon,
  Sync as IntegrationIcon,
  Security as SecurityIcon,
  School as TrainingIcon,
  DateRange as MilestoneIcon
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

// Mock ERP-specific data
const defaultErpModules = [
  { name: 'Finance', status: 'Completed', progress: 100 },
  { name: 'Human Resources', status: 'In Progress', progress: 75 },
  { name: 'Supply Chain', status: 'In Progress', progress: 60 },
  { name: 'Customer Relationship', status: 'Not Started', progress: 0 },
  { name: 'Manufacturing', status: 'In Progress', progress: 30 }
];

const defaultIntegrations = [
  { name: 'Active Directory', status: 'Completed', description: 'User authentication and authorization' },
  { name: 'Legacy Accounting System', status: 'In Progress', description: 'Data migration and parallel operations' },
  { name: 'CRM System', status: 'Planned', description: 'Customer data synchronization' },
  { name: 'Data Warehouse', status: 'Planned', description: 'Business intelligence and reporting' }
];

const defaultDeploymentStages = [
  { name: 'Requirements Analysis', status: 'Completed', date: '2023-03-01' },
  { name: 'System Design', status: 'Completed', date: '2023-04-15' },
  { name: 'Development', status: 'In Progress', date: '2023-05-01 - 2023-08-30' },
  { name: 'Testing', status: 'Not Started', date: '2023-09-01 - 2023-10-15' },
  { name: 'User Training', status: 'Not Started', date: '2023-10-16 - 2023-11-15' },
  { name: 'Go-Live', status: 'Not Started', date: '2023-11-30' }
];

const ERPProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State for ERP-specific data
  const [erpModules, setErpModules] = useState(defaultErpModules);
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [deploymentStages, setDeploymentStages] = useState(defaultDeploymentStages);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Find the project in the context
        const foundProject = projects.find(p => p.id === id);
        
        if (foundProject) {
          setProject(foundProject);
          
          // This would be where you'd fetch ERP-specific data from the API
          // For now, we'll just use the default data or create some based on the project
          
          // Example of customizing the default data based on project properties:
          // Adjust modules progress based on the overall project progress
          if (foundProject.progress) {
            const progressFactor = foundProject.progress / 100;
            const adjustedModules = defaultErpModules.map(module => {
              // Adjust progress based on overall project progress
              const adjustedProgress = Math.min(100, Math.round(module.progress * progressFactor * 1.5));
              
              // Determine status based on adjusted progress
              let status = 'Not Started';
              if (adjustedProgress >= 100) status = 'Completed';
              else if (adjustedProgress > 0) status = 'In Progress';
              
              return { ...module, progress: adjustedProgress, status };
            });
            
            setErpModules(adjustedModules);
          }
          
          // Update deployment stages based on project timeline
          if (foundProject.startDate && foundProject.endDate) {
            const startDate = new Date(foundProject.startDate);
            const endDate = new Date(foundProject.endDate);
            const duration = endDate.getTime() - startDate.getTime();
            
            // Create timeline milestones based on project start/end dates
            const updatedStages = defaultDeploymentStages.map((stage, index) => {
              const stageProgress = index / (defaultDeploymentStages.length - 1);
              const stageDate = new Date(startDate.getTime() + duration * stageProgress);
              
              // Format date for display
              const formattedDate = stageDate.toISOString().split('T')[0];
              
              // Determine status based on current date and stage position
              const now = new Date();
              let status = 'Not Started';
              if (stageDate < now) {
                status = index < defaultDeploymentStages.length / 2 ? 'Completed' : 'In Progress';
              }
              
              return { ...stage, date: formattedDate, status };
            });
            
            setDeploymentStages(updatedStages);
          }
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
        <Typography variant="h6" sx={{ mt: 2 }}>Loading ERP project details...</Typography>
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

  // Calculate project progress
  const progress = project.progress || 0;
  const isOverdue = new Date() > new Date(project.endDate) && project.status !== ProjectStatus.COMPLETED;

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              {project.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              ERP Implementation Project
            </Typography>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Project Overview</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={project.status} 
                    color={isOverdue ? 'error' : 'primary'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{project.department?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Project Manager</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {project.projectManager ? 
                        `${project.projectManager.firstName?.charAt(0)}${project.projectManager.lastName?.charAt(0)}` : 
                        '?'}
                    </Avatar>
                    <Typography variant="body1">
                      {project.projectManager ? 
                        `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                        'Unassigned'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Timeline</Typography>
                  <Typography variant="body2">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Progress</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1
                    }} 
                  />
                  <Typography variant="body2" align="right">{progress}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
          <Tab label="ERP Modules" icon={<DatabaseIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Integrations" icon={<IntegrationIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Timeline" icon={<MilestoneIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Training" icon={<TrainingIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Technical" icon={<APIIcon />} iconPosition="start" {...a11yProps(4)} />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" {...a11yProps(5)} />
          <Tab label="Reports" icon={<AssessmentIcon />} iconPosition="start" {...a11yProps(6)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>ERP Modules Implementation Status</Typography>
          <Grid container spacing={3}>
            {erpModules.map((module, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{module.name}</Typography>
                    <Chip 
                      label={module.status} 
                      color={
                        module.status === 'Completed' ? 'success' : 
                        module.status === 'In Progress' ? 'primary' : 
                        'default'
                      }
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={module.progress} 
                      sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                    />
                    <Typography variant="body2" align="right">{module.progress}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>System Integrations</Typography>
          <List>
            {integrations.map((integration, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <IntegrationIcon color={
                      integration.status === 'Completed' ? 'success' : 
                      integration.status === 'In Progress' ? 'primary' : 
                      'disabled'
                    } />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {integration.name}
                        </Typography>
                        <Chip 
                          label={integration.status} 
                          size="small"
                          color={
                            integration.status === 'Completed' ? 'success' : 
                            integration.status === 'In Progress' ? 'primary' : 
                            'default'
                          }
                        />
                      </Box>
                    }
                    secondary={integration.description}
                  />
                </ListItem>
                {index < integrations.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Implementation Timeline</Typography>
          <List>
            {deploymentStages.map((stage, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <MilestoneIcon color={
                      stage.status === 'Completed' ? 'success' : 
                      stage.status === 'In Progress' ? 'primary' : 
                      'disabled'
                    } />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {stage.name}
                        </Typography>
                        <Chip 
                          label={stage.status} 
                          size="small"
                          color={
                            stage.status === 'Completed' ? 'success' : 
                            stage.status === 'In Progress' ? 'primary' : 
                            'default'
                          }
                        />
                      </Box>
                    }
                    secondary={stage.date}
                  />
                </ListItem>
                {index < deploymentStages.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>User Training Plan</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Training materials and schedule will be available as the project progresses.
          </Alert>
          <Typography>Training details for the ERP implementation will be added here.</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Technical Documentation</Typography>
          <Alert severity="info">
            Technical documentation for developers and system administrators will be available here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>Security & Compliance</Typography>
          <Alert severity="info">
            Security documentation, including access control policies and compliance requirements.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>Reports & Analytics</Typography>
          <Alert severity="info">
            Custom reports and analytics dashboards will be available here.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ERPProjectDetailPage; 