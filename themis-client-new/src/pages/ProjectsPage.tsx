import React, { useState, ReactNode } from 'react';
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
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectStatus } from '../types';

// Mock data
const mockProjects = [
  { 
    id: '1', 
    name: 'Digital Transformation', 
    status: 'InProgress', 
    startDate: '2023-01-15', 
    endDate: '2023-12-31', 
    department: 'IT', 
    manager: 'John Doe',
    progress: 65
  },
  { 
    id: '2', 
    name: 'Infrastructure Upgrade', 
    status: 'InProgress', 
    startDate: '2023-03-01', 
    endDate: '2023-08-30', 
    department: 'Operations', 
    manager: 'Jane Smith',
    progress: 30
  },
  { 
    id: '3', 
    name: 'Mobile App Development', 
    status: 'MainPMOApproval', 
    startDate: '2023-06-01', 
    endDate: '2024-02-28', 
    department: 'Product', 
    manager: 'Mike Johnson',
    progress: 0
  },
  { 
    id: '4', 
    name: 'Security Enhancement', 
    status: 'Completed', 
    startDate: '2023-02-15', 
    endDate: '2023-04-30', 
    department: 'IT', 
    manager: 'Sarah Williams',
    progress: 100
  },
  { 
    id: '5', 
    name: 'CRM Implementation', 
    status: 'OnHold', 
    startDate: '2023-05-15', 
    endDate: '2023-11-30', 
    department: 'Sales', 
    manager: 'Robert Brown',
    progress: 45
  },
  { 
    id: '6', 
    name: 'Data Center Migration', 
    status: 'SubPMOReview', 
    startDate: '2023-08-01', 
    endDate: '2024-01-31', 
    department: 'IT', 
    manager: 'John Doe',
    progress: 0
  },
  { 
    id: '7', 
    name: 'HR System Upgrade', 
    status: 'Draft', 
    startDate: '2023-09-01', 
    endDate: '2024-03-31', 
    department: 'HR', 
    manager: 'Emily Davis',
    progress: 0
  },
];

const departments = [
  'All',
  'IT',
  'Operations',
  'Product',
  'Sales',
  'HR'
];

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch(status) {
    case 'InProgress': return 'primary';
    case 'Completed': return 'success';
    case 'OnHold': return 'warning';
    case 'Cancelled': return 'error';
    case 'Draft': return 'default';
    case 'SubPMOReview': return 'info';
    case 'MainPMOApproval': return 'secondary';
    default: return 'default';
  }
};

// Helper function to get status label
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'InProgress': return 'In Progress';
    case 'Completed': return 'Completed';
    case 'OnHold': return 'On Hold';
    case 'Cancelled': return 'Cancelled';
    case 'Draft': return 'Draft';
    case 'SubPMOReview': return 'Sub PMO Review';
    case 'MainPMOApproval': return 'Main PMO Approval';
    default: return status;
  }
};

const ProjectsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  const navigate = useNavigate();
  const { isProjectManager, isAdmin, isDirector, isExecutive } = useAuth();
  
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
    navigate('/projects/new');
  };
  
  const handleProjectClick = (id: string) => {
    navigate(`/projects/${id}`);
  };
  
  // Filter projects based on search query and filters
  const filteredProjects = mockProjects.filter((project) => {
    // Search query filter
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.manager.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    
    // Department filter
    const matchesDepartment = departmentFilter === 'All' || project.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });
  
  // Calculate pagination
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        {(isProjectManager || isAdmin || isDirector) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            New Project
          </Button>
        )}
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SearchIcon sx={{ mr: 1 }} />
            <TextField
              size="small"
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: 300, mr: 2 }}
            />
            
            <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="SubPMOReview">Sub PMO Review</MenuItem>
                <MenuItem value="MainPMOApproval">Main PMO Approval</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="OnHold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="department-filter-label">Department</InputLabel>
              <Select
                labelId="department-filter-label"
                id="department-filter"
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Tooltip title="Filter list">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="projects table">
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProjects.map((project) => (
                <TableRow 
                  key={project.id} 
                  hover
                  onClick={() => handleProjectClick(project.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row">
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{project.department}</TableCell>
                  <TableCell>{project.manager}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{`${project.progress}%`}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show menu/actions
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No projects found
                  </TableCell>
                </TableRow>
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
    </Box>
  );
};

export default ProjectsPage; 