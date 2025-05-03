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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Campaign as CampaignIcon,
  BarChart as AnalyticsIcon,
  Groups as AudienceIcon,
  MonetizationOn as BudgetIcon,
  Collections as CreativeIcon,
  DateRange as CalendarIcon,
  ViewQuilt as ChannelsIcon
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

// Mock marketing-specific data
const defaultCampaignChannels = [
  { name: 'Social Media', budget: 25000, spent: 15000, status: 'Active' },
  { name: 'Email Marketing', budget: 10000, spent: 7500, status: 'Active' },
  { name: 'Content Marketing', budget: 15000, spent: 5000, status: 'Active' },
  { name: 'Search Ads', budget: 20000, spent: 4000, status: 'Planned' },
  { name: 'Display Ads', budget: 5000, spent: 500, status: 'Active' }
];

const defaultKpis = [
  { name: 'Leads Generated', target: 1000, current: 650, unit: 'leads' },
  { name: 'Social Engagement', target: 50000, current: 32500, unit: 'interactions' },
  { name: 'Website Traffic', target: 75000, current: 45000, unit: 'visits' },
  { name: 'Email Open Rate', target: 25, current: 22, unit: '%' },
  { name: 'Conversion Rate', target: 3, current: 2.7, unit: '%' }
];

const defaultTargetAudiences = [
  { name: 'Young Professionals', description: '25-35 years old, urban areas, tech-savvy' },
  { name: 'Small Business Owners', description: '30-50 years old, decision makers, growth-focused' },
  { name: 'Enterprise Clients', description: 'Fortune 500 companies, IT departments' }
];

const defaultCampaignAssets = [
  { name: 'Product Brochure', type: 'PDF', status: 'Approved' },
  { name: 'Email Templates', type: 'HTML', status: 'In Review' },
  { name: 'Social Media Visuals', type: 'Images', status: 'Approved' },
  { name: 'Campaign Video', type: 'Video', status: 'In Production' }
];

const MarketingProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State for marketing-specific data
  const [campaignChannels, setCampaignChannels] = useState(defaultCampaignChannels);
  const [kpis, setKpis] = useState(defaultKpis);
  const [targetAudiences, setTargetAudiences] = useState(defaultTargetAudiences);
  const [campaignAssets, setCampaignAssets] = useState(defaultCampaignAssets);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Find the project in the projects context
        const foundProject = projects.find(p => p.id === id);
        
        if (foundProject) {
          setProject(foundProject);
          
          // Customize marketing data based on the project details
          
          // Adjust campaign channels based on project budget
          if (foundProject.budget) {
            // Calculate proportional budget allocation for channels
            const totalBudget = foundProject.budget;
            const defaultTotalBudget = defaultCampaignChannels.reduce((sum, channel) => sum + channel.budget, 0);
            const budgetRatio = totalBudget / defaultTotalBudget;
            
            const updatedChannels = defaultCampaignChannels.map(channel => {
              const adjustedBudget = Math.round(channel.budget * budgetRatio);
              const adjustedSpent = foundProject.actualCost 
                ? Math.round(channel.spent * (foundProject.actualCost / totalBudget) * budgetRatio) 
                : Math.round(channel.spent * (foundProject.progress || 0) / 100);
              
              return {
                ...channel,
                budget: adjustedBudget,
                spent: adjustedSpent,
              };
            });
            
            setCampaignChannels(updatedChannels);
          }
          
          // Adjust KPIs based on project progress
          if (foundProject.progress !== undefined) {
            const progressFactor = foundProject.progress / 100;
            const updatedKpis = defaultKpis.map(kpi => {
              const adjustedCurrent = Math.round(kpi.target * progressFactor);
              return { ...kpi, current: adjustedCurrent };
            });
            
            setKpis(updatedKpis);
          }
          
          // Adjust assets based on project timeline and progress
          if (foundProject.startDate && foundProject.endDate) {
            const now = new Date();
            const startDate = new Date(foundProject.startDate);
            const endDate = new Date(foundProject.endDate);
            const projectProgress = (now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());
            
            const updatedAssets = defaultCampaignAssets.map((asset, index) => {
              // Determine asset status based on relative position in project timeline
              let status = 'In Production';
              if (projectProgress > 0.8 || index < defaultCampaignAssets.length * projectProgress) {
                status = 'Approved';
              } else if (projectProgress > 0.5 || index < defaultCampaignAssets.length * (projectProgress + 0.3)) {
                status = 'In Review';
              }
              
              return { ...asset, status };
            });
            
            setCampaignAssets(updatedAssets);
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
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading marketing campaign details...</Typography>
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

      <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2, background: 'linear-gradient(to right, #673ab7, #9c27b0)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
              {project.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }} gutterBottom>
              Marketing Campaign
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {project.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Campaign Overview</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</Typography>
                  <Chip 
                    label={project.status} 
                    color={isOverdue ? 'error' : 'primary'}
                    size="small"
                    sx={{ mt: 0.5, bgcolor: isOverdue ? 'error.main' : '#673ab7' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Department</Typography>
                  <Typography variant="body1">{project.department?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Campaign Manager</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', bgcolor: '#673ab7' }}>
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
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Timeline</Typography>
                  <Typography variant="body2">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }} gutterBottom>Progress</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#fff'
                      }
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
          aria-label="marketing campaign tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<CampaignIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Channels" icon={<ChannelsIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="KPIs" icon={<AnalyticsIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Audience" icon={<AudienceIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Budget" icon={<BudgetIcon />} iconPosition="start" {...a11yProps(4)} />
          <Tab label="Creative" icon={<CreativeIcon />} iconPosition="start" {...a11yProps(5)} />
          <Tab label="Schedule" icon={<CalendarIcon />} iconPosition="start" {...a11yProps(6)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Campaign Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AudienceIcon sx={{ mr: 1 }} /> Target Audience
                  </Typography>
                  <List>
                    {targetAudiences.map((audience, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemText 
                          primary={audience.name}
                          secondary={audience.description}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BudgetIcon sx={{ mr: 1 }} /> Budget Summary
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Total Budget: ${project.budget?.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Spent to Date: ${project.actualCost?.toLocaleString()} ({Math.round((project.actualCost || 0) / (project.budget || 1) * 100)}%)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round((project.actualCost || 0) / (project.budget || 1) * 100)} 
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChannelsIcon sx={{ mr: 1 }} /> Channel Distribution
                  </Typography>
                  <Grid container spacing={2}>
                    {campaignChannels.map((channel, index) => (
                      <Grid item xs={6} sm={4} md={2.4} key={index}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="subtitle2">{channel.name}</Typography>
                          <Box sx={{ position: 'relative', display: 'inline-flex', my: 1 }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={Math.round((channel.spent / channel.budget) * 100)} 
                              size={60}
                              thickness={5}
                              sx={{ color: channel.status === 'Active' ? 'primary.main' : 'text.secondary' }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary">
                                {Math.round((channel.spent / channel.budget) * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={channel.status} 
                            size="small"
                            color={channel.status === 'Active' ? 'success' : 'default'}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Marketing Channels</Typography>
          <Grid container spacing={3}>
            {campaignChannels.map((channel, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{channel.name}</Typography>
                      <Chip 
                        label={channel.status} 
                        color={channel.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Budget</Typography>
                    <Typography variant="body1">${channel.budget.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} gutterBottom>Spent</Typography>
                    <Typography variant="body1">${channel.spent.toLocaleString()} ({Math.round((channel.spent / channel.budget) * 100)}%)</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.round((channel.spent / channel.budget) * 100)} 
                      sx={{ height: 8, borderRadius: 4, mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Key Performance Indicators</Typography>
          <Grid container spacing={3}>
            {kpis.map((kpi, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{kpi.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Target</Typography>
                      <Typography variant="body2" fontWeight="medium">{kpi.target.toLocaleString()} {kpi.unit}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Current</Typography>
                      <Typography variant="body2" fontWeight="medium">{kpi.current.toLocaleString()} {kpi.unit}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, Math.round((kpi.current / kpi.target) * 100))} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        mb: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: kpi.current / kpi.target >= 0.9 ? 'success.main' : 
                                        kpi.current / kpi.target >= 0.7 ? 'primary.main' : 
                                        kpi.current / kpi.target >= 0.5 ? 'warning.main' : 'error.main',
                        }
                      }} 
                    />
                    <Typography variant="body2" align="right">{Math.round((kpi.current / kpi.target) * 100)}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Target Audience</Typography>
          <Grid container spacing={3}>
            {targetAudiences.map((audience, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{audience.name}</Typography>
                    <Typography variant="body1">{audience.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Campaign Budget</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            This section shows the budget allocation and spending for the marketing campaign.
          </Alert>
          <Typography variant="body1" paragraph>
            Detailed budget reporting and forecasting will be added here.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>Creative Assets</Typography>
          <Grid container spacing={3}>
            {campaignAssets.map((asset, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{asset.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Chip label={asset.type} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={asset.status} 
                        size="small"
                        color={
                          asset.status === 'Approved' ? 'success' : 
                          asset.status === 'In Review' ? 'primary' : 
                          'default'
                        }
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>Campaign Schedule</Typography>
          <Alert severity="info">
            Detailed campaign schedule and timeline view will be available here.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default MarketingProjectDetailPage; 