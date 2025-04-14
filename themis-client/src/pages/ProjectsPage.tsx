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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project, ProjectStatus, User } from '../types';
import api from '../services/api';
import AddProjectDialog from '../components/Project/AddProjectDialog';

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
const getStatusColor = (status: string) => {
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

const ProjectsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(['All']);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const navigate = useNavigate();
  const { isProjectManager, isAdmin, token, user } = useAuth();
  
  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await api.projects.getAllProjects(token);
        console.log('API Response:', response);
        
        let projects: Project[] = [];
        
        // Check if response is an array, if not handle accordingly
        if (!Array.isArray(response)) {
          console.error('Expected array response from API but got:', typeof response);
          // If response is an object with a data property that's an array, use that
          const responseObj = response as any;
          projects = Array.isArray(responseObj.data) ? responseObj.data : [];
        } else {
          projects = response as Project[];
        }
        
        setProjects(projects);
        
        // Only try to extract departments if projects is an array and has items
        if (projects.length > 0) {
          // Create a Set from department names, filtering out any null/undefined values
          const departmentSet = new Set(
            projects
              .map(project => project.department)
              .filter(dept => dept !== null && dept !== undefined && dept !== '')
          );
          
          // Convert Set to Array and add 'All' at the beginning
          const deptOptions = ['All', ...Array.from(departmentSet)];
          setDepartmentOptions(deptOptions);
          
          // Create department objects for the dialog
          const deptObjects = Array.from(departmentSet).map((dept, index) => ({
            id: `dept-${index}`,
            name: dept as string
          }));
          setDepartments(deptObjects);
        }
        
        // Mock users for the dialog
        setUsers([
          { 
            id: '1', 
            username: 'john.doe', 
            firstName: 'John', 
            lastName: 'Doe', 
            role: 'PROJECT_MANAGER',
            email: 'john.doe@example.com',
            department: 'IT',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User,
          { 
            id: '2', 
            username: 'jane.smith', 
            firstName: 'Jane', 
            lastName: 'Smith', 
            role: 'SUB_PMO',
            email: 'jane.smith@example.com',
            department: 'PMO',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
  
  const handleProjectAdded = () => {
    // Refresh projects after a new project is added
    // In a real application, you would fetch the updated project list
    // For this example, we'll just reuse the existing fetch method
    if (token) {
      const fetchProjects = async () => {
        setLoading(true);
        try {
          const response = await api.projects.getAllProjects(token);
          
          let projects: Project[] = [];
          if (!Array.isArray(response)) {
            const responseObj = response as any;
            projects = Array.isArray(responseObj.data) ? responseObj.data : [];
          } else {
            projects = response as Project[];
          }
          
          setProjects(projects);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch projects:', err);
          setError('Failed to refresh projects. New project may have been created.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProjects();
    }
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
        const matchesDepartment = departmentFilter === 'All' || project.department === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
      })
    : [];
  
  // Calculate pagination
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Projects</Typography>
        {(isAdmin || isProjectManager) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            Create Project
          </Button>
        )}
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <TextField
              placeholder="Search projects..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl sx={{ minWidth: 150, ml: 2 }} size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === 'All' ? 'All' : getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel id="department-filter-label">Department</InputLabel>
              <Select
                labelId="department-filter-label"
                id="department-filter"
                value={departmentFilter}
                label="Department"
                onChange={handleDepartmentFilterChange}
              >
                {departmentOptions.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Toolbar>
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-label="projects table">
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project Manager</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading projects...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto' }}>
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : paginatedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      No projects found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery || statusFilter !== 'All' || departmentFilter !== 'All'
                        ? 'Try adjusting your search criteria'
                        : 'Create a new project to get started'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjects.map((project) => (
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
                    <TableCell>{project.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(typeof project.status === 'string' ? project.status : ProjectStatus[project.status])}
                        color={getStatusColor(typeof project.status === 'string' ? project.status : ProjectStatus[project.status]) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {project.projectManager
                        ? `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim()
                        : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <Box
                            sx={{
                              width: `${project.progress}%`,
                              height: 8,
                              borderRadius: 1,
                              bgcolor: project.progress < 30
                                ? 'error.light'
                                : project.progress < 70
                                ? 'warning.light'
                                : 'success.light',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {project.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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