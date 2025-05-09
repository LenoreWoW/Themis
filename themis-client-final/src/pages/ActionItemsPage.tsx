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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Rating,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  CheckCircle as CompletedIcon,
  AccessTime as PendingIcon,
  Error as OverdueIcon,
  Add as AddIcon,
  Close as CloseIcon,
  PriorityHigh as HighPriorityIcon,
  Flag as MediumPriorityIcon,
  LowPriority as LowPriorityIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project, User } from '../types';
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
      id={`action-item-tabpanel-${index}`}
      aria-labelledby={`action-item-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for action items - in a real application, this would come from an API
interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo: User | null;
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
}

const ActionItemsPage: React.FC = () => {
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
  const [pendingItems, setPendingItems] = useState<ActionItem[]>([]);
  const [completedItems, setCompletedItems] = useState<ActionItem[]>([]);
  const [overdueItems, setOverdueItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the initial tab value from URL or location state
  const [tabValue, setTabValue] = useState(getInitialTabValue());

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

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

        // Create mock action items data based on projects
        const mockUsers = [
          { id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          { id: 'user2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          { id: 'user3', firstName: 'Michael', lastName: 'Johnson', email: 'michael@example.com' },
          null
        ] as (User | null)[];
        
        const now = new Date();
        const actionItems = allProjects.flatMap((project: Project, idx: number) => {
          return Array(Math.floor(Math.random() * 3) + 1).fill(0).map((_, itemIdx) => {
            const daysOffset = Math.floor(Math.random() * 30) - 10; // Some will be in the past (overdue)
            const dueDate = new Date(now);
            dueDate.setDate(dueDate.getDate() + daysOffset);
            
            const status = daysOffset < 0 && Math.random() > 0.3 ? 'overdue' : 
                          Math.random() > 0.6 ? 'completed' : 'pending';
            
            return {
              id: `action-${project.id}-${itemIdx}`,
              title: `Action item ${itemIdx + 1} for ${project.name}`,
              description: `This is a sample action item for the project. It requires attention and follow-up.`,
              status: status as 'pending' | 'completed' | 'overdue',
              priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
              dueDate: dueDate.toISOString(),
              assignedTo: mockUsers[Math.floor(Math.random() * mockUsers.length)],
              projectId: project.id,
              projectName: project.name,
              createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            };
          });
        });

        // Filter items by status
        setPendingItems(actionItems.filter(item => item.status === 'pending'));
        setCompletedItems(actionItems.filter(item => item.status === 'completed'));
        setOverdueItems(actionItems.filter(item => item.status === 'overdue'));
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
    navigate(`/action-items${newValue > 0 ? `?tab=${newValue}` : ''}`, { replace: true });
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleOpenDetailsDialog = (item: ActionItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
    if (projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewActionTitle('');
    setNewActionDescription('');
    setNewActionPriority('medium');
    setNewActionDueDate('');
    setSelectedProjectId('');
  };

  const handleCreateActionItem = () => {
    // In a real application, this would call an API to create the action item
    // For now, we'll simulate it by adding to our local state
    
    if (!newActionTitle || !selectedProjectId || !newActionDueDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    const now = new Date();
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    
    if (!selectedProject) {
      setError('Invalid project selected');
      return;
    }
    
    const newItem: ActionItem = {
      id: `action-new-${Date.now()}`,
      title: newActionTitle,
      description: newActionDescription,
      status: 'pending',
      priority: newActionPriority,
      dueDate: new Date(newActionDueDate).toISOString(),
      assignedTo: user as User,
      projectId: selectedProjectId,
      projectName: selectedProject.name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    // Add to pending items
    setPendingItems(prev => [newItem, ...prev]);
    
    // Close dialog
    handleCloseCreateDialog();
  };

  const handleMarkComplete = (item: ActionItem) => {
    // Update the item's status to 'completed'
    const updatedItem = { ...item, status: 'completed' as const, updatedAt: new Date().toISOString() };
    
    // Remove from current list and add to completed list
    if (item.status === 'pending') {
      setPendingItems(prev => prev.filter(i => i.id !== item.id));
    } else if (item.status === 'overdue') {
      setOverdueItems(prev => prev.filter(i => i.id !== item.id));
    }
    
    setCompletedItems(prev => [updatedItem, ...prev]);
    
    // Close dialog if open
    if (detailsDialogOpen) {
      handleCloseDetailsDialog();
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('actionItems.pending', 'Pending');
      case 'completed':
        return t('actionItems.completed', 'Completed');
      case 'overdue':
        return t('actionItems.overdue', 'Overdue');
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'completed':
        return <CompletedIcon fontSize="small" />;
      case 'overdue':
        return <OverdueIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'primary';
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <HighPriorityIcon fontSize="small" color="error" />;
      case 'medium':
        return <MediumPriorityIcon fontSize="small" color="warning" />;
      case 'low':
        return <LowPriorityIcon fontSize="small" color="info" />;
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return t('actionItems.highPriority', 'High');
      case 'medium':
        return t('actionItems.mediumPriority', 'Medium');
      case 'low':
        return t('actionItems.lowPriority', 'Low');
      default:
        return priority;
    }
  };

  const renderActionItemsTable = (items: ActionItem[]) => {
    if (items.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('actionItems.noItemsFound', 'No action items found in this category.')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('actionItems.title')}</TableCell>
              <TableCell>{t('actionItems.priority')}</TableCell>
              <TableCell>{t('actionItems.dueDate')}</TableCell>
              <TableCell>{t('actionItems.assignedTo')}</TableCell>
              <TableCell>{t('common.project')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getPriorityIcon(item.priority)}
                    <Typography variant="body2">
                      {getPriorityLabel(item.priority)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{formatDate(item.dueDate)}</TableCell>
                <TableCell>
                  {item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : t('common.unassigned', 'Unassigned')}
                </TableCell>
                <TableCell>{item.projectName}</TableCell>
                <TableCell>
                  <Chip 
                    icon={getStatusIcon(item.status)}
                    label={getStatusLabel(item.status)} 
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t('common.view')} arrow>
                    <Button
                      size="small"
                      onClick={() => handleOpenDetailsDialog(item)}
                      sx={{ mr: 1 }}
                    >
                      {t('common.view')}
                    </Button>
                  </Tooltip>
                  
                  {item.status !== 'completed' && (
                    <Tooltip title={t('actionItems.markCompleteHint', 'Mark this action item as completed')} arrow>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleMarkComplete(item)}
                      >
                        {t('actionItems.complete')}
                      </Button>
                    </Tooltip>
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
            {t('actionItems.title', 'Action Items')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('actionItems.createNewHint', 'Create a new action item')} arrow>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                {t('actionItems.createNew')}
              </Button>
            </Tooltip>
            <Tooltip title={t('common.refreshHint', 'Refresh the list')} arrow>
              <IconButton onClick={handleRefresh} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('actionItems.pending', 'Pending')} />
            <Tab label={t('actionItems.overdue', 'Overdue')} />
            <Tab label={t('actionItems.completed', 'Completed')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderActionItemsTable(pendingItems)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderActionItemsTable(overdueItems)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderActionItemsTable(completedItems)
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
          {t('actionItems.details', 'Action Item Details')}
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
              <Typography variant="h6">{selectedItem.title}</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                <Chip 
                  icon={getStatusIcon(selectedItem.status)}
                  label={getStatusLabel(selectedItem.status)} 
                  color={getStatusColor(selectedItem.status) as any}
                  size="small"
                  sx={{ mr: 1 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  {getPriorityIcon(selectedItem.priority)}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {getPriorityLabel(selectedItem.priority)} {t('actionItems.priority')}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                {t('actionItems.description')}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.description}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                {t('actionItems.dueDate')}
              </Typography>
              <Typography variant="body1" paragraph>
                {formatDate(selectedItem.dueDate)}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                {t('actionItems.assignedTo')}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.assignedTo ? 
                  `${selectedItem.assignedTo.firstName} ${selectedItem.assignedTo.lastName}` : 
                  t('common.unassigned', 'Unassigned')}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.project')}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.projectName}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                {t('actionItems.createdAt')}
              </Typography>
              <Typography variant="body1" paragraph>
                {formatDate(selectedItem.createdAt)}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                {t('actionItems.lastUpdated')}
              </Typography>
              <Typography variant="body1">
                {formatDate(selectedItem.updatedAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Tooltip title={t('common.closeHint', 'Close without saving changes')}>
            <Button onClick={handleCloseDetailsDialog}>
              {t('common.close')}
            </Button>
          </Tooltip>
          
          {selectedItem && selectedItem.status !== 'completed' && (
            <Tooltip title={t('actionItems.markCompleteHint', 'Complete this action item')}>
              <Button 
                onClick={() => handleMarkComplete(selectedItem)}
                variant="contained"
                color="success"
              >
                {t('actionItems.markComplete')}
              </Button>
            </Tooltip>
          )}
          
          {selectedItem && (
            <Tooltip title={t('common.viewProjectHint', 'Go to the associated project')}>
              <Button 
                onClick={() => {
                  handleCloseDetailsDialog();
                  handleViewProject(selectedItem.projectId);
                }}
                variant="contained"
              >
                {t('common.viewProject')}
              </Button>
            </Tooltip>
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
          {t('actionItems.createNew', 'Create New Action Item')}
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
            <TextField
              label={t('actionItems.title')}
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label={t('actionItems.description')}
              value={newActionDescription}
              onChange={(e) => setNewActionDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('common.project')}</InputLabel>
              <Select
                value={selectedProjectId}
                label={t('common.project')}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('actionItems.priority')}</InputLabel>
              <Select
                value={newActionPriority}
                label={t('actionItems.priority')}
                onChange={(e) => setNewActionPriority(e.target.value as 'high' | 'medium' | 'low')}
              >
                <MenuItem value="high">{t('actionItems.highPriority', 'High')}</MenuItem>
                <MenuItem value="medium">{t('actionItems.mediumPriority', 'Medium')}</MenuItem>
                <MenuItem value="low">{t('actionItems.lowPriority', 'Low')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label={t('actionItems.dueDate')}
              type="date"
              value={newActionDueDate}
              onChange={(e) => setNewActionDueDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Tooltip title={t('actionItems.cancelHint', 'Cancel creating this action item')} arrow>
            <Button onClick={handleCloseCreateDialog}>
              {t('common.cancel')}
            </Button>
          </Tooltip>
          <Tooltip title={t('actionItems.createHint', 'Create this action item')} arrow>
            <Button 
              onClick={handleCreateActionItem}
              variant="contained"
              disabled={!newActionTitle || !selectedProjectId || !newActionDueDate}
            >
              {t('common.create')}
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActionItemsPage; 