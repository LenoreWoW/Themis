import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { UserRole } from '../types';

// Mock user data
const mockUsers = [
  { id: '1', username: 'john.doe', adIdentifier: 'CORP\\johndoe', role: UserRole.ADMIN, department: 'IT' },
  { id: '2', username: 'jane.smith', adIdentifier: 'CORP\\janesmith', role: UserRole.PROJECT_MANAGER, department: 'Marketing' },
  { id: '3', username: 'bob.johnson', adIdentifier: 'CORP\\bobjohnson', role: UserRole.DEPARTMENT_DIRECTOR, department: 'Finance' },
  { id: '4', username: 'sarah.williams', adIdentifier: 'CORP\\sarahwilliams', role: UserRole.MAIN_PMO, department: 'PMO' },
  { id: '5', username: 'mike.brown', adIdentifier: 'CORP\\mikebrown', role: UserRole.PENDING, department: 'HR' },
];

// Department options
const departments = ['IT', 'Marketing', 'Finance', 'PMO', 'HR', 'Operations'];

// Get role color based on the role
const getRoleColor = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'error';
    case UserRole.MAIN_PMO:
    case UserRole.SUB_PMO:
      return 'primary';
    case UserRole.EXECUTIVE:
    case UserRole.DEPARTMENT_DIRECTOR:
      return 'success';
    case UserRole.PROJECT_MANAGER:
      return 'info';
    case UserRole.PENDING:
    default:
      return 'default';
  }
};

interface EditUserFormData {
  id: string;
  username: string;
  adIdentifier: string;
  role: UserRole;
  department: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState<EditUserFormData | null>(null);

  const handleOpenEditDialog = (user: EditUserFormData | null = null) => {
    setEditUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    if (editUser) {
      setEditUser({
        ...editUser,
        role: event.target.value as UserRole,
      });
    }
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    if (editUser) {
      setEditUser({
        ...editUser,
        department: event.target.value,
      });
    }
  };

  const handleSaveUser = () => {
    if (!editUser) return;

    if (editUser.id) {
      // Update existing user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editUser.id ? editUser : user
        )
      );
    } else {
      // Add new user
      const newUser = {
        ...editUser,
        id: Date.now().toString(),
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
    }

    handleCloseDialog();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenEditDialog({
            id: '',
            username: '',
            adIdentifier: '',
            role: UserRole.PENDING,
            department: '',
          })}
        >
          Add User
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>AD Identifier</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.adIdentifier}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role.replace('_', ' ').toLowerCase()} 
                      color={getRoleColor(user.role)}
                    />
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit/Add User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editUser?.id ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={editUser?.username || ''}
              onChange={e => editUser && setEditUser({ ...editUser, username: e.target.value })}
            />
            <TextField
              label="AD Identifier"
              fullWidth
              margin="normal"
              value={editUser?.adIdentifier || ''}
              onChange={e => editUser && setEditUser({ ...editUser, adIdentifier: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={editUser?.role || ''}
                label="Role"
                onChange={handleRoleChange}
              >
                {Object.values(UserRole).map(role => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                value={editUser?.department || ''}
                label="Department"
                onChange={handleDepartmentChange}
              >
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
