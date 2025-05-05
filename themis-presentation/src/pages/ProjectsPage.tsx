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
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon
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

// Map API status to component status type
const mapStatusToType = (status: string): 'planning' | 'inProgress' | 'onHold' | 'completed' | 'cancelled' | 'todo' | 'review' | 'overdue' => {
  if (status === 'PLANNING') return 'planning';
  if (status === 'IN_PROGRESS') return 'inProgress';
  if (status === 'ON_HOLD') return 'onHold';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'todo';
};

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [goals, setGoals] = useState<Goal[]>([]);
  
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
            <EnhancedCard
              title={project.name}
              subtitle={project.department.name}
              onClick={() => handleProjectClick(project.id)}
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                },
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative'
              }}
              headerProps={{
                sx: {
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }
              }}
              footer={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        mr: 1,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight="medium">
                    {project.projectManager
                      ? `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim()
                      : t('project.unassigned')}
                  </Typography>
                </Box>
              }
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 2
                }}
              >
                <StatusBadge 
                  status={statusType}
                  label={getTranslatedStatusLabel(typeof project.status === 'string' ? project.status : ProjectStatus[project.status])}
                  size="small"
                />
              </Box>
            
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  height: 40, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {project.description}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box>
                  {findProjectGoals(project.id).length > 0 && (
                    <Tooltip title={t('goals.linkedGoals', 'Linked Goals')}>
                      <Chip
                        size="small"
                        label={`${findProjectGoals(project.id).length} ${t('goals.linked', 'Goals')}`}
                        sx={{ mr: 1, fontSize: '0.7rem' }}
                      />
                    </Tooltip>
                  )}
                </Box>
                <CircularProgressWithLabel 
                  value={project.progress} 
                  size={40} 
                  thickness={4}
                  sx={{
                    color: project.progress < 30 ? theme.palette.error.main :
                           project.progress < 70 ? theme.palette.warning.main :
                           theme.palette.success.main
                  }}
                />
              </Box>
            </EnhancedCard>
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
                hover
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body1" fontWeight="medium">
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                    {project.description}
                  </Typography>
                </TableCell>
                <TableCell>{project.department.name}</TableCell>
                <TableCell>
                  <StatusBadge 
                    status={statusType}
                    label={getTranslatedStatusLabel(typeof project.status === 'string' ? project.status : ProjectStatus[project.status])}
                  />
                </TableCell>
                <TableCell>
                  {project.projectManager
                    ? `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim()
                    : t('project.unassigned')}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <CircularProgressWithLabel value={project.progress} size={46} thickness={4} />
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

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'url(https://www.transparenttextures.com/patterns/cubes.png)',
          zIndex: 0
        }} />
        
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>{t('navigation.projects')}</Typography>
          <Typography variant="subtitle1">{t('project.subtitle', 'Manage and monitor all your organizational projects')}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, zIndex: 1 }}>
          {(isAdmin || isProjectManager) && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
              sx={{
                borderRadius: 8,
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)'
                }
              }}
            >
              {t('project.add')}
            </Button>
          )}
        </Box>
      </Paper>
      
      <Paper sx={{ width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Toolbar 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  transition: 'all 0.2s',
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(0,0,0,0.05)'
                  }
                }
              }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('project.status')}</InputLabel>
              <Select
                label={t('project.status')}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                input={<OutlinedInput label={t('project.status')} />}
                sx={{ borderRadius: 8 }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === 'All' ? t('common.all') : getTranslatedStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('project.department')}</InputLabel>
              <Select
                label={t('project.department')}
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                input={<OutlinedInput label={t('project.department')} />}
                sx={{ borderRadius: 8 }}
              >
                {departmentOptions.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department === 'All' ? t('common.all') : department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={viewMode === 'grid' ? t('common.listView') : t('common.gridView')}>
              <IconButton 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                color="primary"
                sx={{
                  bgcolor: theme.palette.action.hover,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert 
              severity="error" 
              sx={{ 
                maxWidth: 500, 
                mx: 'auto',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211,47,47,0.1)'
              }}
            >
              {error}
            </Alert>
          </Box>
        ) : paginatedProjects.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Box sx={{ mb: 3, opacity: 0.7 }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
              {t('common.noData')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {searchQuery || statusFilter !== 'All' || departmentFilter !== 'All'
                ? t('common.adjustSearchCriteria')
                : t('project.createNewToStart')}
            </Typography>
            
            {(isAdmin || isProjectManager) && (searchQuery === '' && statusFilter === 'All' && departmentFilter === 'All') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ 
                  borderRadius: 8,
                  px: 3,
                  py: 1
                }}
              >
                {t('project.add')}
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </Box>
        )}
        
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={filteredProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('common.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} ${t('common.of')} ${count}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectIcon': {
              color: theme.palette.action.active
            }
          }}
        />
      </Paper>
      
      {/* Add Project Dialog */}
      <AddProjectDialog
        open={isAddProjectDialogOpen}
        onClose={() => setIsAddProjectDialogOpen(false)}
        onProjectAdded={handleProjectAdded}
        departments={departments}
        users={users}
      />
    </Box>
  );
};

export default ProjectsPage; 