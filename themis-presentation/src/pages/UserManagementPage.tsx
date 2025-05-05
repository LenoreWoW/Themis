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
  IconButton,
  MenuItem,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  CircularProgress,
  Toolbar,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

// Define a more flexible user type for our mock data
interface MockUser {
  id: string;
  username: string;
  adIdentifier: string;
  role: UserRole;
  departmentId: string | null;
  departmentName: string | null;
  approved: boolean;
}

// Mock users data
const mockUsers: MockUser[] = [
  {
    id: '1',
    username: 'john.doe',
    adIdentifier: 'jdoe',
    role: UserRole.PROJECT_MANAGER,
    departmentId: '1',
    departmentName: 'IT',
    approved: true
  },
  {
    id: '2',
    username: 'jane.smith',
    adIdentifier: 'jsmith',
    role: UserRole.DEPARTMENT_DIRECTOR,
    departmentId: '2',
    departmentName: 'Operations',
    approved: true
  },
  {
    id: '3',
    username: 'mike.johnson',
    adIdentifier: 'mjohnson',
    role: UserRole.SUB_PMO,
    departmentId: '1',
    departmentName: 'IT',
    approved: true
  },
  {
    id: '4',
    username: 'sarah.williams',
    adIdentifier: 'swilliams',
    role: UserRole.MAIN_PMO,
    departmentId: null,
    departmentName: null,
    approved: true
  },
  {
    id: '5',
    username: 'robert.brown',
    adIdentifier: 'rbrown',
    role: UserRole.EXECUTIVE,
    departmentId: null,
    departmentName: null,
    approved: true
  },
  {
    id: '6',
    username: 'emily.davis',
    adIdentifier: 'edavis',
    role: UserRole.PROJECT_MANAGER,
    departmentId: '3',
    departmentName: 'HR',
    approved: true
  },
  {
    id: '7',
    username: 'alex.wilson',
    adIdentifier: 'awilson',
    role: UserRole.PENDING,
    departmentId: null,
    departmentName: null,
    approved: false
  },
  {
    id: '8',
    username: 'lisa.taylor',
    adIdentifier: 'ltaylor',
    role: UserRole.PENDING,
    departmentId: null,
    departmentName: null,
    approved: false
  }
];

// Mock departments data
const mockDepartments = [
  { id: '1', name: 'IT' },
  { id: '2', name: 'Operations' },
  { id: '3', name: 'HR' },
  { id: '4', name: 'Sales' },
  { id: '5', name: 'Product' },
  { id: '6', name: 'Finance' },
];

const UserManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();
  
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PENDING);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleRoleFilterChange = (event: SelectChangeEvent<string>) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };
  
  const handleEditUser = (user: MockUser) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedDepartment(user.departmentId);
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };
  
  const handleRoleChange = (event: SelectChangeEvent<UserRole>) => {
    setSelectedRole(event.target.value as UserRole);
  };
  
  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setSelectedDepartment(event.target.value === '' ? null : event.target.value);
  };
  
  const handleSubmitEdit = () => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update user in the local state
      const updatedUsers = users.map(user => {
        if (user.id === editingUser.id) {
          // Get department name from selected department
          const departmentName = selectedDepartment 
            ? mockDepartments.find(d => d.id === selectedDepartment)?.name || null
            : null;
          
          return {
            ...user,
            role: selectedRole,
            departmentId: selectedDepartment,
            departmentName,
            // Auto-approve if changing from Pending to any other role
            approved: user.role === UserRole.PENDING && selectedRole !== UserRole.PENDING 
              ? true 
              : user.approved
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setIsSubmitting(false);
      setEditDialogOpen(false);
      setEditingUser(null);
    }, 1000);
  };
  
  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.adIdentifier.toLowerCase().includes(searchQuery.toLowerCase());
                         
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Calculate pagination
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Get color based on role
  const getRoleColor = (role: UserRole): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.EXECUTIVE:
        return 'secondary';
      case UserRole.DEPARTMENT_DIRECTOR:
        return 'primary';
      case UserRole.MAIN_PMO:
        return 'info';
      case UserRole.SUB_PMO:
        return 'success';
      case UserRole.PROJECT_MANAGER:
        return 'warning';
      case UserRole.PENDING:
      default:
        return 'default';
    }
  };
  
  if (!isAdmin) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          User Management
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography>
            You do not have permission to access this page. Only administrators can manage users.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
        >
          Invite User
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Toolbar sx={{ pl: 2, pr: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <SearchIcon sx={{ mr: 1 }} />
            <TextField
              size="small"
              label="Search users"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: 300, mr: 2 }}
            />
            
            <FormControl sx={{ minWidth: 200, mr: 1 }} size="small">
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter"
                value={roleFilter}
                label="Role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="All">All Roles</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                <MenuItem value={UserRole.EXECUTIVE}>Higher Management</MenuItem>
                <MenuItem value={UserRole.DEPARTMENT_DIRECTOR}>Department Director</MenuItem>
                <MenuItem value={UserRole.MAIN_PMO}>Main PMO</MenuItem>
                <MenuItem value={UserRole.SUB_PMO}>Sub PMO</MenuItem>
                <MenuItem value={UserRole.PROJECT_MANAGER}>Project Manager</MenuItem>
                <MenuItem value={UserRole.PENDING}>Pending</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Tooltip title="Filter list">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>AD Identifier</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell component="th" scope="row">
                    {user.username}
                  </TableCell>
                  <TableCell>{user.adIdentifier}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.departmentName || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.approved ? 'Active' : 'Pending'} 
                      color={user.approved ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User {editingUser?.username}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update user role and department assignment.
          </DialogContentText>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Role"
              onChange={handleRoleChange}
            >
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              <MenuItem value={UserRole.EXECUTIVE}>Higher Management</MenuItem>
              <MenuItem value={UserRole.DEPARTMENT_DIRECTOR}>Department Director</MenuItem>
              <MenuItem value={UserRole.MAIN_PMO}>Main PMO</MenuItem>
              <MenuItem value={UserRole.SUB_PMO}>Sub PMO</MenuItem>
              <MenuItem value={UserRole.PROJECT_MANAGER}>Project Manager</MenuItem>
              <MenuItem value={UserRole.PENDING}>Pending</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="department-select-label">Department</InputLabel>
            <Select
              labelId="department-select-label"
              id="department-select"
              value={selectedDepartment || ''}
              label="Department"
              onChange={handleDepartmentChange}
              disabled={selectedRole === UserRole.ADMIN || selectedRole === UserRole.EXECUTIVE || selectedRole === UserRole.MAIN_PMO}
            >
              <MenuItem value="">None</MenuItem>
              {mockDepartments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitEdit} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage; 