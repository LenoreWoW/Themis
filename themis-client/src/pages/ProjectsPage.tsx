import React, { useState, ReactNode, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project, ProjectStatus, User } from '../types';
import api from '../services/api';
import AddProjectDialog from '../components/Project/AddProjectDialog';
import { useTranslation } from 'react-i18next';
import EnhancedCard from '../components/common/EnhancedCard';
import StatusBadge from '../components/common/StatusBadge';
import SkeletonLoader from '../components/common/SkeletonLoader';
import CircularProgressWithLabel from '../components/common/CircularProgressWithLabel';
import { GridItem, GridContainer } from '../components/common/MuiGridWrapper';
import { mockProjects, mockUsers, mockDepartments } from '../services/mockData';

// Define Department type for the dialog
interface Department {
  id: string;
  name: string;
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
  
  const navigate = useNavigate();
  const { isProjectManager, isAdmin, token, user } = useAuth();
  
  // Fetch projects when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get mock projects
        setTimeout(() => {
          setProjects(mockProjects);
          
          // Get unique departments
          const departmentSet = new Set<string>(
            mockDepartments.map(dept => dept.name)
          );
          
          // Convert Set to Array and add 'All' at the beginning
          const deptOptions = ['All', ...Array.from(departmentSet)];
          setDepartmentOptions(deptOptions);
          setDepartments(mockDepartments);
          setLoading(false);
        }, 1000); // Simulate loading delay
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
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
              sx={{ height: '100%' }}
              footer={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption">
                    {project.projectManager
                      ? `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim()
                      : t('project.unassigned')}
                  </Typography>
                </Box>
              }
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {project.description}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <StatusBadge 
                  status={statusType}
                  label={getTranslatedStatusLabel(typeof project.status === 'string' ? project.status : ProjectStatus[project.status])}
                  size="small"
                />
                <CircularProgressWithLabel value={project.progress} size={50} thickness={4} />
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
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">{t('navigation.projects')}</Typography>
        {(isAdmin || isProjectManager) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 3,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            {t('project.add')}
          </Button>
        )}
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', py: 1 }}>
            <TextField
              placeholder={t('common.search')}
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, flex: 1 }}>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }} size="small">
                <InputLabel id="status-filter-label">{t('project.status')}</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label={t('project.status')}
                  onChange={handleStatusFilterChange}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'All' ? t('common.all') : getTranslatedStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }} size="small">
                <InputLabel id="department-filter-label">{t('project.department')}</InputLabel>
                <Select
                  labelId="department-filter-label"
                  id="department-filter"
                  value={departmentFilter}
                  label={t('project.department')}
                  onChange={handleDepartmentFilterChange}
                >
                  {departmentOptions.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center' }}>
                <Tooltip title={t('common.listView')}>
                  <IconButton color={viewMode === 'list' ? 'primary' : 'default'} onClick={() => setViewMode('list')}>
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.gridView')}>
                  <IconButton color={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')}>
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Stack>
        </Toolbar>
        
        {loading ? (
          <Box sx={{ p: 2 }}>
            {viewMode === 'grid' ? (
              <GridContainer spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <GridItem xs={12} sm={6} md={4} key={i}>
                    <SkeletonLoader type="card" count={1} />
                  </GridItem>
                ))}
              </GridContainer>
            ) : (
              <SkeletonLoader type="table" count={6} />
            )}
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto' }}>
              {error}
            </Alert>
          </Box>
        ) : paginatedProjects.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
              {t('common.noData')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || statusFilter !== 'All' || departmentFilter !== 'All'
                ? t('common.adjustSearchCriteria')
                : t('project.createNewToStart')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
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