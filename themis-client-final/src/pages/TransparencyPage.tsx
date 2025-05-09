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
  Tab
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  VisibilityOff as PrivateIcon,
  Visibility as PublicIcon,
  Info as InfoIcon,
  Close as CloseIcon
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
      id={`transparency-tabpanel-${index}`}
      aria-labelledby={`transparency-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for transparency information - in a real application, this would come from an API
interface TransparencyItem {
  id: string;
  projectId: string;
  projectName: string;
  visibility: 'public' | 'private' | 'department';
  lastUpdated: string;
  status: string;
  sharedWith: string[];
}

const TransparencyPage: React.FC = () => {
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
  const [publicProjects, setPublicProjects] = useState<TransparencyItem[]>([]);
  const [privateProjects, setPrivateProjects] = useState<TransparencyItem[]>([]);
  const [departmentProjects, setDepartmentProjects] = useState<TransparencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the initial tab value from URL or location state
  const [tabValue, setTabValue] = useState(getInitialTabValue());

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransparencyItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.projects.getAllProjects('');
      if (response.data) {
        const allProjects = response.data;
        setProjects(allProjects);

        // Create mock transparency data based on projects
        const transparencyData = allProjects.map((project: Project) => ({
          id: `tr-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          visibility: ['public', 'private', 'department'][Math.floor(Math.random() * 3)] as 'public' | 'private' | 'department',
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: String(project.status),
          sharedWith: ['Executive Team', 'PMO Office', 'Department Heads', 'All Staff'].slice(0, Math.floor(Math.random() * 4) + 1)
        }));

        // Filter into visibility categories
        setPublicProjects(transparencyData.filter(item => item.visibility === 'public'));
        setPrivateProjects(transparencyData.filter(item => item.visibility === 'private'));
        setDepartmentProjects(transparencyData.filter(item => item.visibility === 'department'));
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('An error occurred while fetching projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProjects();
  };

  // Update URL when tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    navigate(`/transparency${newValue > 0 ? `?tab=${newValue}` : ''}`, { replace: true });
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleOpenDetailsDialog = (item: TransparencyItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedItem(null);
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return t('transparency.public', 'Public');
      case 'private':
        return t('transparency.private', 'Private');
      case 'department':
        return t('transparency.department', 'Department Only');
      default:
        return visibility;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <PublicIcon fontSize="small" />;
      case 'private':
        return <PrivateIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'success';
      case 'private':
        return 'error';
      case 'department':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderTransparencyTable = (items: TransparencyItem[]) => {
    if (items.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('transparency.noItemsFound', 'No projects found with this visibility setting.')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('transparency.visibility')}</TableCell>
              <TableCell>{t('transparency.lastUpdated')}</TableCell>
              <TableCell>{t('transparency.sharedWith')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.projectName}</TableCell>
                <TableCell>
                  <Chip 
                    icon={getVisibilityIcon(item.visibility)}
                    label={getVisibilityLabel(item.visibility)} 
                    color={getVisibilityColor(item.visibility) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                <TableCell>{item.sharedWith.join(', ')}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.status} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleViewProject(item.projectId)}
                    sx={{ mr: 1 }}
                  >
                    {t('common.view')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenDetailsDialog(item)}
                  >
                    {t('transparency.details', 'Details')}
                  </Button>
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
            {t('transparency.title', 'Transparency Dashboard')}
          </Typography>
          
          <Box>
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
            <Tab label={t('transparency.publicProjects', 'Public Projects')} />
            <Tab label={t('transparency.privateProjects', 'Private Projects')} />
            <Tab label={t('transparency.departmentProjects', 'Department-Only Projects')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTransparencyTable(publicProjects)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTransparencyTable(privateProjects)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTransparencyTable(departmentProjects)
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
          {t('transparency.projectDetails', 'Project Visibility Details')}
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
          {selectedItem && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6">{selectedItem.projectName}</Typography>
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('transparency.currentVisibility', 'Current Visibility')}
                </Typography>
                <Chip 
                  icon={getVisibilityIcon(selectedItem.visibility)}
                  label={getVisibilityLabel(selectedItem.visibility)} 
                  color={getVisibilityColor(selectedItem.visibility) as any}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary">
                {t('transparency.sharedWith', 'Shared With')}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedItem.sharedWith.map((group, index) => (
                  <Chip key={index} label={group} size="small" variant="outlined" />
                ))}
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
                {t('transparency.lastModified', 'Last Modified')}
              </Typography>
              <Typography>{formatDate(selectedItem.lastUpdated)}</Typography>
              
              <Alert severity="info" sx={{ mt: 3 }}>
                {t('transparency.changeVisibilityInfo', 'You can change the visibility settings of this project from the project details page.')}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>
            {t('common.close')}
          </Button>
          {selectedItem && (
            <Button 
              onClick={() => {
                handleCloseDetailsDialog();
                handleViewProject(selectedItem.projectId);
              }}
              variant="contained"
            >
              {t('common.view')} {t('common.project')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransparencyPage; 