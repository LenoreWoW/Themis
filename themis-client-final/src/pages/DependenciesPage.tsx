import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowForward as DependsOnIcon,
  ArrowBack as BlockedByIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project } from '../types';
import { formatDate } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

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
      id={`dependency-tabpanel-${index}`}
      aria-labelledby={`dependency-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for dependencies
interface Dependency {
  id: string;
  projectId: string;
  projectName: string;
  dependsOnProjectId: string;
  dependsOnProjectName: string;
  type: 'blockedBy' | 'blocks' | 'relatedTo';
  status: 'active' | 'resolved' | 'planned';
  description: string;
  createdAt: string;
  updatedAt: string;
  impact: 'high' | 'medium' | 'low';
}

const DependenciesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tab from URL query parameter or from location state
  const getInitialTabValue = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam !== null) {
      const tabValue = parseInt(tabParam);
      return isNaN(tabValue) ? 0 : tabValue;
    }
    
    return location.state?.activeTab ?? 0;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [incomingDependencies, setIncomingDependencies] = useState<Dependency[]>([]);
  const [outgoingDependencies, setOutgoingDependencies] = useState<Dependency[]>([]);
  const [resolvedDependencies, setResolvedDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the initial tab value from URL or location state
  const [tabValue, setTabValue] = useState(getInitialTabValue());

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<Dependency | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDependencyData, setNewDependencyData] = useState({
    projectId: '',
    dependsOnProjectId: '',
    type: 'blockedBy',
    description: '',
    impact: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.projects.getAllProjects('');
      if (response.data) {
        const allProjects = response.data;
        setProjects(allProjects);

        // Create mock dependency data
        const dependencyData: Dependency[] = [];
        
        // Create random dependencies between projects
        for (let i = 0; i < allProjects.length; i++) {
          const project = allProjects[i];
          
          // For each project, create between 0-3 dependencies
          const numDependencies = Math.floor(Math.random() * 4);
          
          for (let j = 0; j < numDependencies; j++) {
            // Find a random project to depend on (not itself)
            let dependsOnIdx = Math.floor(Math.random() * allProjects.length);
            while (dependsOnIdx === i) {
              dependsOnIdx = Math.floor(Math.random() * allProjects.length);
            }
            
            const dependsOnProject = allProjects[dependsOnIdx];
            const now = new Date();
            const createdDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            
            dependencyData.push({
              id: `dep-${project.id}-${dependsOnProject.id}-${j}`,
              projectId: project.id,
              projectName: project.name,
              dependsOnProjectId: dependsOnProject.id,
              dependsOnProjectName: dependsOnProject.name,
              type: ['blockedBy', 'blocks', 'relatedTo'][Math.floor(Math.random() * 3)] as 'blockedBy' | 'blocks' | 'relatedTo',
              status: ['active', 'resolved', 'planned'][Math.floor(Math.random() * 3)] as 'active' | 'resolved' | 'planned',
              description: `This is a dependency between projects. One project requires or is affected by the other.`,
              createdAt: createdDate.toISOString(),
              updatedAt: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
            });
          }
        }
        
        // Filter dependencies by type and status
        setIncomingDependencies(dependencyData.filter(dep => dep.type === 'blockedBy' && dep.status !== 'resolved'));
        setOutgoingDependencies(dependencyData.filter(dep => dep.type === 'blocks' && dep.status !== 'resolved'));
        setResolvedDependencies(dependencyData.filter(dep => dep.status === 'resolved'));
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Update URL when tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    navigate(`/dependencies${newValue > 0 ? `?tab=${newValue}` : ''}`, { replace: true });
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleOpenDetailsDialog = (dependency: Dependency) => {
    setSelectedDependency(dependency);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedDependency(null);
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
    if (projects.length > 1) {
      setNewDependencyData({
        ...newDependencyData,
        projectId: projects[0].id,
        dependsOnProjectId: projects[1].id
      });
    }
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewDependencyData({
      projectId: '',
      dependsOnProjectId: '',
      type: 'blockedBy',
      description: '',
      impact: 'medium'
    });
  };

  const handleCreateDependency = () => {
    // In a real application, this would call an API to create the dependency
    // For now, we'll simulate it by adding to our local state
    
    const { projectId, dependsOnProjectId, type, description, impact } = newDependencyData;
    
    if (!projectId || !dependsOnProjectId || !description) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (projectId === dependsOnProjectId) {
      setError('A project cannot depend on itself');
      return;
    }
    
    const sourceProject = projects.find(p => p.id === projectId);
    const targetProject = projects.find(p => p.id === dependsOnProjectId);
    
    if (!sourceProject || !targetProject) {
      setError('Invalid project selected');
      return;
    }
    
    const now = new Date();
    const newDependency: Dependency = {
      id: `dep-new-${Date.now()}`,
      projectId,
      projectName: sourceProject.name,
      dependsOnProjectId,
      dependsOnProjectName: targetProject.name,
      type: type as 'blockedBy' | 'blocks' | 'relatedTo',
      status: 'active',
      description,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      impact: impact as 'high' | 'medium' | 'low'
    };
    
    // Add to appropriate list
    if (type === 'blockedBy') {
      setIncomingDependencies(prev => [newDependency, ...prev]);
    } else if (type === 'blocks') {
      setOutgoingDependencies(prev => [newDependency, ...prev]);
    } else {
      // For 'relatedTo' type, add to both lists since it's bidirectional
      setIncomingDependencies(prev => [newDependency, ...prev]);
    }
    
    // Close dialog
    handleCloseCreateDialog();
  };

  const handleResolveDependency = (dependency: Dependency) => {
    // Update the dependency's status to 'resolved'
    const updatedDependency = { ...dependency, status: 'resolved' as const, updatedAt: new Date().toISOString() };
    
    // Remove from current list and add to resolved list
    if (dependency.type === 'blockedBy') {
      setIncomingDependencies(prev => prev.filter(d => d.id !== dependency.id));
    } else if (dependency.type === 'blocks') {
      setOutgoingDependencies(prev => prev.filter(d => d.id !== dependency.id));
    }
    
    setResolvedDependencies(prev => [updatedDependency, ...prev]);
    
    // Close dialog if open
    if (detailsDialogOpen) {
      handleCloseDetailsDialog();
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blockedBy':
        return t('dependencies.blockedBy', 'Blocked By');
      case 'blocks':
        return t('dependencies.blocks', 'Blocks');
      case 'relatedTo':
        return t('dependencies.relatedTo', 'Related To');
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blockedBy':
        return <BlockedByIcon fontSize="small" />;
      case 'blocks':
        return <DependsOnIcon fontSize="small" />;
      case 'relatedTo':
        return <LinkIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('dependencies.active', 'Active');
      case 'resolved':
        return t('dependencies.resolved', 'Resolved');
      case 'planned':
        return t('dependencies.planned', 'Planned');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'resolved':
        return 'success';
      case 'planned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high':
        return t('dependencies.highImpact', 'High');
      case 'medium':
        return t('dependencies.mediumImpact', 'Medium');
      case 'low':
        return t('dependencies.lowImpact', 'Low');
      default:
        return impact;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderDependenciesTable = (items: Dependency[]) => {
    if (items.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('dependencies.noItemsFound', 'No dependencies found in this category.')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('dependencies.projectName')}</TableCell>
              <TableCell>{t('dependencies.type')}</TableCell>
              <TableCell>{t('dependencies.dependentProject')}</TableCell>
              <TableCell>{t('dependencies.impact')}</TableCell>
              <TableCell>{t('dependencies.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.projectName}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(item.type)}
                    <Typography variant="body2">
                      {getTypeLabel(item.type)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{item.dependsOnProjectName}</TableCell>
                <TableCell>
                  <Chip 
                    label={getImpactLabel(item.impact)} 
                    color={getImpactColor(item.impact) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(item.status)} 
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleOpenDetailsDialog(item)}
                    sx={{ mr: 1 }}
                  >
                    {t('common.details')}
                  </Button>
                  
                  {item.status !== 'resolved' && (
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleResolveDependency(item)}
                    >
                      {t('dependencies.resolve')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('dependencies.title', 'Project Dependencies')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              {t('dependencies.createNew', 'Add Dependency')}
            </Button>
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('dependencies.blockedBy', 'Blocked By')} />
            <Tab label={t('dependencies.blocks', 'Blocks')} />
            <Tab label={t('dependencies.resolved', 'Resolved')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderDependenciesTable(incomingDependencies)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderDependenciesTable(outgoingDependencies)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderDependenciesTable(resolvedDependencies)
          )}
        </TabPanel>
      </Box>
      
      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('dependencies.details', 'Dependency Details')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDependency && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dependencies.relationship', 'Relationship')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedDependency.projectName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                      {getTypeIcon(selectedDependency.type)}
                      <Typography variant="body2" sx={{ mx: 1 }}>
                        {getTypeLabel(selectedDependency.type)}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedDependency.dependsOnProjectName}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dependencies.status')}
                  </Typography>
                  <Chip 
                    label={getStatusLabel(selectedDependency.status)} 
                    color={getStatusColor(selectedDependency.status) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dependencies.impact')}
                  </Typography>
                  <Chip 
                    label={getImpactLabel(selectedDependency.impact)} 
                    color={getImpactColor(selectedDependency.impact) as any}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dependencies.description')}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                    {selectedDependency.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dependencies.created')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(selectedDependency.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dependencies.updated')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(selectedDependency.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedDependency.status !== 'resolved' && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  {t('dependencies.resolveInfo', 'When this dependency is no longer active, you can mark it as resolved.')}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>
            {t('common.close')}
          </Button>
          
          {selectedDependency && selectedDependency.status !== 'resolved' && (
            <Button 
              onClick={() => handleResolveDependency(selectedDependency)}
              variant="contained"
              color="success"
            >
              {t('dependencies.resolve')}
            </Button>
          )}
          
          {selectedDependency && (
            <Button 
              onClick={() => {
                handleCloseDetailsDialog();
                handleViewProject(selectedDependency.projectId);
              }}
              variant="contained"
            >
              {t('common.viewProject')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Create Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('dependencies.createNew', 'Add New Dependency')}
          <IconButton
            aria-label="close"
            onClick={handleCloseCreateDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('dependencies.sourceProject')}</InputLabel>
              <Select
                value={newDependencyData.projectId}
                label={t('dependencies.sourceProject')}
                onChange={(e) => setNewDependencyData({...newDependencyData, projectId: e.target.value})}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('dependencies.relationshipType')}</InputLabel>
              <Select
                value={newDependencyData.type}
                label={t('dependencies.relationshipType')}
                onChange={(e) => setNewDependencyData({...newDependencyData, type: e.target.value})}
              >
                <MenuItem value="blockedBy">{t('dependencies.blockedBy', 'Blocked By')}</MenuItem>
                <MenuItem value="blocks">{t('dependencies.blocks', 'Blocks')}</MenuItem>
                <MenuItem value="relatedTo">{t('dependencies.relatedTo', 'Related To')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('dependencies.targetProject')}</InputLabel>
              <Select
                value={newDependencyData.dependsOnProjectId}
                label={t('dependencies.targetProject')}
                onChange={(e) => setNewDependencyData({...newDependencyData, dependsOnProjectId: e.target.value})}
              >
                {projects
                  .filter(project => project.id !== newDependencyData.projectId)
                  .map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('dependencies.impact')}</InputLabel>
              <Select
                value={newDependencyData.impact}
                label={t('dependencies.impact')}
                onChange={(e) => setNewDependencyData({...newDependencyData, impact: e.target.value})}
              >
                <MenuItem value="high">{t('dependencies.highImpact', 'High')}</MenuItem>
                <MenuItem value="medium">{t('dependencies.mediumImpact', 'Medium')}</MenuItem>
                <MenuItem value="low">{t('dependencies.lowImpact', 'Low')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label={t('dependencies.description')}
              value={newDependencyData.description}
              onChange={(e) => setNewDependencyData({...newDependencyData, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCreateDependency}
            variant="contained"
            disabled={!newDependencyData.projectId || !newDependencyData.dependsOnProjectId || !newDependencyData.description}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DependenciesPage; 