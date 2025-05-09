import React, { useState, ReactNode, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Toolbar,
  Stack,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Menu,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  InputAdornment,
  Avatar,
  LinearProgress,
  Container,
  Tabs,
  Tab
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ListViewIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  AccountTree as RelationshipMapIcon,
  MoreVert as MoreIcon,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project, ProjectStatus, User, ProjectTemplateType } from '../types';
import api from '../services/api';
import AddProjectDialog from '../components/Project/AddProjectDialog';
import { useTranslation } from 'react-i18next';
import EnhancedCard from '../components/common/EnhancedCard';
import StatusBadge from '../components/common/StatusBadge';
import SkeletonLoader from '../components/common/SkeletonLoader';
import CircularProgressWithLabel from '../components/common/CircularProgressWithLabel';
import { GridItem, GridContainer } from '../components/common/MuiGridWrapper';
import { mockUsers, mockDepartments } from '../services/mockData';
import { canManageProjects } from '../utils/permissions';
import { alpha } from '@mui/material/styles';
import { getDeadlineColor } from '../utils/helpers';
import ProjectGanttChart from '../components/Gantt/ProjectGanttChart';

// Define Department type for the dialog
interface Department {
  id: string;
  name: string;
}

// Define our own Goal interface for project linking
interface Goal {
  id: string;
  name?: string;
  title?: string;
  description: string;
  type: string;
  category: string;
  status: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  linkedProjects: { projectId: string; weight: number }[];
  isProgressAutoCalculated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define status options
const statusOptions = [
  'All',
  'PLANNING',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
];

// Helper function to get status color
const getStatusColor = (status: string, endDate?: string) => {
  // Check if the project is overdue (end date is before current date)
  if (endDate && new Date(endDate) < new Date()) {
    return 'error'; // Red color for overdue projects
  }
  
  switch(status) {
    case 'PLANNING': return 'info';
    case 'IN_PROGRESS': return 'primary';
    case 'ON_HOLD': return 'warning';
    case 'COMPLETED': return 'success';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
};

// Helper function to get status label
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'PLANNING': return 'Planning';
    case 'IN_PROGRESS': return 'In Progress';
    case 'ON_HOLD': return 'On Hold';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

// Use deadline progress to determine status background color
const getStatusWithDeadlineColor = (project: Project) => {
  const status = typeof project.status === 'string' ? project.status as ProjectStatus : project.status;
  
  // For completed projects, check if it was completed on time
  let completedOnTime = true;
  if (status === ProjectStatus.COMPLETED && project.endDate) {
    // Check if project was completed before the deadline
    // Since we don't have the actual completion date, we'll use updatedAt as an approximation
    completedOnTime = new Date(project.updatedAt) <= new Date(project.endDate);
  }
  
  // Get the deadline-based color
  return getDeadlineColor(status, project.startDate, project.endDate, completedOnTime);
};

// Helper function to display status chip with appropriate color
const getStatusChip = (status: string) => {
  const statusLabel = getStatusLabel(status);
  const color = getStatusColor(status);
  return (
    <Chip
      label={statusLabel}
      color={color as any}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 'medium' }}
    />
  );
};

// Map API status to component status type
const mapStatusToType = (status: string): 'planning' | 'inProgress' | 'onHold' | 'completed' | 'cancelled' | 'todo' | 'review' | 'overdue' => {
  if (status === 'PLANNING') return 'planning';
  if (status === 'IN_PROGRESS') return 'inProgress';
  if (status === 'ON_HOLD') return 'onHold';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'todo';
};

// Enum for view modes
enum ViewMode {
  LIST = 'list',
  GANTT = 'gantt'
}

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [departments, setDepartments] = useState(mockDepartments);
  const [users, setUsers] = useState(mockUsers);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  const navigate = useNavigate();
  const { isProjectManager, isAdmin, token, user } = useAuth();
  
  // Fetch projects when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects from API
        if (token) {
          const projectsResponse = await api.projects.getAllProjects(token);
          if (projectsResponse.success && projectsResponse.data) {
            setProjects(projectsResponse.data);
          }
        }
        
        // Get unique departments
        const departmentSet = new Set<string>(
          mockDepartments.map(dept => dept.name)
        );
        
        // Convert Set to Array and add 'All' at the beginning
        const deptOptions = ['All', ...Array.from(departmentSet)];
        setDepartmentOptions(deptOptions);
        setDepartments(mockDepartments);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        setLoading(false);
        setError('Failed to load projects. Please try again later.');
      }
    };

    fetchData();
  }, [token]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  const handleDepartmentFilterChange = (event: SelectChangeEvent) => {
    setDepartmentFilter(event.target.value);
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleCreateProject = () => {
    setIsAddProjectDialogOpen(true);
  };
  
  const handleProjectAdded = (newProject: Project) => {
    // Add the new project to the existing projects list
    setProjects([...projects, newProject]);
  };
  
  const handleProjectClick = (id: string) => {
    // No longer navigate to specialized template pages - always go to the main ProjectDetailPage
    navigate(`/projects/${id}`);
  };
  
  // Filter projects based on search query and filters
  const filteredProjects = Array.isArray(projects) 
    ? projects.filter((project) => {
        // Search query filter
        const projectManagerName = project.projectManager 
          ? `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim().toLowerCase()
          : '';
          
        const matchesSearch = 
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          projectManagerName.includes(searchQuery.toLowerCase());
        
        // Status filter (handle both string and enum values)
        const matchesStatus = statusFilter === 'All' || 
          project.status === statusFilter || 
          (typeof project.status === 'string' && project.status.replace(/([A-Z])/g, '_$1').toUpperCase() === statusFilter);
        
        // Department filter
        const matchesDepartment = departmentFilter === 'All' || 
          (project as Project).department.name === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
      })
    : [];
  
  // Calculate pagination
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Helper function to get translated status label
  const getTranslatedStatusLabel = (status: string): string => {
    // Try to use the projectStatus namespace first for more granular control
    const projectStatusKey = `projectStatus.${status}`;
    const translatedStatus = t(projectStatusKey);

    // If the translation key exists and returns a valid translation (not the key itself)
    if (translatedStatus !== projectStatusKey) {
      return translatedStatus;
    }

    // Fall back to the older status namespace if needed
    switch(status) {
      case 'PLANNING': return t('status.planning');
      case 'IN_PROGRESS': return t('status.inProgress');
      case 'ON_HOLD': return t('status.onHold');
      case 'COMPLETED': return t('status.completed');
      case 'CANCELLED': return t('status.cancelled');
      default: return status;
    }
  };

  // Check if a project is overdue
  const isOverdue = (endDate?: string): boolean => {
    return endDate ? new Date(endDate) < new Date() : false;
  };

  // Find goals associated with a project
  const findProjectGoals = (projectId: string) => {
    return goals.filter(goal => 
      goal.linkedProjects.some(projectLink => projectLink.projectId === projectId)
    );
  };

  // Get project weight for a specific goal
  const getProjectWeight = (goal: Goal, projectId: string) => {
    const projectLink = goal.linkedProjects.find(projectLink => projectLink.projectId === projectId);
    return projectLink ? projectLink.weight : 0;
  };

  // Render grid view
  const renderGridView = () => (
    <GridContainer spacing={3}>
      {paginatedProjects.map((project) => {
        const statusType = isOverdue(project.endDate) ? 'overdue' : mapStatusToType(
          typeof project.status === 'string' ? project.status : ProjectStatus[project.status]
        );
        
        return (
          <GridItem xs={12} sm={6} md={4} key={project.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 2
                },
                borderRadius: 1
              }}
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {project.name.charAt(0)}
                  </Avatar>
                }
                action={
                  <StatusBadge 
                    status={statusType}
                    label={getStatusLabel(
                      typeof project.status === 'string' ? project.status : ProjectStatus[project.status]
                    )}
                    size="small"
                  />
                }
                title={project.name}
                subheader={`${project.department?.name || t('common.noDepartment')}`}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description?.length > 120 
                    ? `${project.description.substring(0, 120)}...` 
                    : project.description}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('project.progress')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress || 0} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {`${Math.round(project.progress || 0)}%`}
                    </Typography>
                  </Box>
                </Box>
            
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('project.deadline')}: {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                  {project.projectManager && (
                    <Typography variant="body2" color="text.secondary">
                      {`${project.projectManager.firstName} ${project.projectManager.lastName}`}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </GridItem>
        );
      })}
    </GridContainer>
  );

  // Render list view
  const renderListView = () => (
    <TableContainer>
      <Table sx={{ minWidth: 750 }} aria-label="projects table">
        <TableHead>
          <TableRow>
            <TableCell>{t('project.name')}</TableCell>
            <TableCell>{t('project.department')}</TableCell>
            <TableCell>{t('project.status')}</TableCell>
            <TableCell>{t('project.projectManager')}</TableCell>
            <TableCell>{t('common.timeline')}</TableCell>
            <TableCell>{t('project.progress')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProjects.map((project) => {
            const statusType = isOverdue(project.endDate) ? 'overdue' : mapStatusToType(
              typeof project.status === 'string' ? project.status : ProjectStatus[project.status]
            );
            
            return (
              <TableRow
                key={project.id}
                hover
                onClick={() => handleProjectClick(project.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.department?.name || t('common.noDepartment')}</TableCell>
                <TableCell>
                  <StatusBadge 
                    status={statusType}
                    label={getStatusLabel(
                      typeof project.status === 'string' ? project.status : ProjectStatus[project.status]
                    )}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {project.projectManager
                    ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                    : t('common.unassigned')}
                </TableCell>
                <TableCell>
                  {`${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress || 0} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(project.progress || 0)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  const isPMO = (userRole?: string) => {
    // Update to include Admin users
    return userRole === 'SUB_PMO' || userRole === 'MAIN_PMO' || userRole === 'ADMIN';
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle view mode toggle
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };
  
  // Project menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProjectId(null);
  };
  
  const handleEditProject = () => {
    if (selectedProjectId) {
      navigate(`/projects/${selectedProjectId}/edit`);
    }
    handleMenuClose();
  };
  
  const handleDeleteProject = () => {
    // Implementation for delete project
    console.log('Delete project:', selectedProjectId);
    handleMenuClose();
  };
  
  const handleViewProject = () => {
    if (selectedProjectId) {
      navigate(`/projects/${selectedProjectId}`);
    }
    handleMenuClose();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
        >
          New Project
        </Button>
      </Box>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="Planning" />
          <Tab label="Completed" />
        </Tabs>
        
        <Box display="flex" alignItems="center">
          <TextField
            placeholder="Search projects..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="List View">
              <IconButton 
                color={viewMode === ViewMode.LIST ? "primary" : "default"}
                onClick={() => handleViewModeChange(ViewMode.LIST)}
              >
                <ListViewIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Gantt Chart">
              <IconButton 
                color={viewMode === ViewMode.GANTT ? "primary" : "default"}
                onClick={() => handleViewModeChange(ViewMode.GANTT)}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
      
      {viewMode === ViewMode.GANTT ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          <ProjectGanttChart />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No projects found matching your criteria.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredProjects.map(project => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Typography variant="h6" component="h2" gutterBottom>
                        {project.name}
                      </Typography>
                      
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuOpen(e, project.id)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography color="textSecondary" gutterBottom>
                      {project.description}
                    </Typography>
                    
                    <Box mt={2} mb={1}>
                      {getStatusChip(project.status)}
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary">
                      <strong>Department:</strong> {project.department?.name || t('common.noDepartment')}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      <strong>Owner:</strong> {project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : t('common.unassigned')}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      <strong>Timeline:</strong> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleProjectClick(project.id)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
      
      {/* Project Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProject}>
          <ListViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditProject}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={handleDeleteProject}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          <Typography color="error">Delete Project</Typography>
        </MenuItem>
      </Menu>
      
      {/* Add Project Dialog */}
      <AddProjectDialog
        open={isAddProjectDialogOpen}
        onClose={() => setIsAddProjectDialogOpen(false)}
        onProjectAdded={handleProjectAdded}
        departments={departments}
        users={users}
      />
    </Container>
  );
};

export default ProjectsPage; 