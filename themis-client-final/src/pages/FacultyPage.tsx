import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Avatar
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { UserRole, UserRequest, UserRequestStatus } from '../types';
import { createUserRequest, getUserRequests } from '../services/auth';

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
      id={`faculty-tabpanel-${index}`}
      aria-labelledby={`faculty-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock department data
const mockDepartments = [
  { id: 'dept-1', name: 'IT Department' },
  { id: 'dept-2', name: 'Digital Transformation' },
  { id: 'dept-3', name: 'Finance Department' },
  { id: 'dept-4', name: 'HR Department' }
];

// Mock user requests data
const mockUserRequests: UserRequest[] = [
  {
    id: 'req-1',
    fullName: 'John Smith',
    employeeId: 'EMP001',
    departmentId: 'dept-1',
    departmentName: 'IT Department',
    role: UserRole.PROJECT_MANAGER,
    username: 'john.smith',
    tempPassword: 'Temp123!',
    profilePhotoUrl: '',
    notes: 'New project manager for the CRM project',
    status: UserRequestStatus.SUBMITTED,
    createdBy: 'user-1',
    createdByName: 'David Wilson',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalHistory: []
  },
  {
    id: 'req-2',
    fullName: 'Sarah Johnson',
    employeeId: 'EMP002',
    departmentId: 'dept-2',
    departmentName: 'Digital Transformation',
    role: UserRole.SUB_PMO,
    username: 'sarah.johnson',
    tempPassword: 'Temp456!',
    profilePhotoUrl: '',
    notes: 'Sub PMO for digital initiatives',
    status: UserRequestStatus.DEPARTMENT_APPROVED,
    createdBy: 'user-1',
    createdByName: 'David Wilson',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalHistory: [
      {
        id: 'apr-1',
        userRequestId: 'req-2',
        approverUserId: 'user-3',
        approverName: 'Emma Garcia',
        approverRole: UserRole.DEPARTMENT_DIRECTOR,
        status: 'APPROVED',
        comments: 'Approved for Digital Transformation department',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// Mock users data
const mockUsers = [
  {
    id: 'user-1',
    fullName: 'John Doe',
    email: 'john.doe@acme.com',
    role: UserRole.PROJECT_MANAGER,
    department: 'IT Department',
    status: 'Active'
  },
  {
    id: 'user-2',
    fullName: 'Jane Smith',
    email: 'jane.smith@acme.com',
    role: UserRole.SUB_PMO,
    department: 'Digital Transformation',
    status: 'Active'
  }
];

const FacultyPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token, hasRole } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRequests, setUserRequests] = useState<UserRequest[]>(mockUserRequests);
  const [users, setUsers] = useState(mockUsers);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for new user request
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    departmentId: user?.department?.id || '',
    role: UserRole.PROJECT_MANAGER,
    username: '',
    tempPassword: '',
    profilePhotoUrl: '',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    employeeId: '',
    departmentId: '',
    role: '',
    username: '',
    tempPassword: ''
  });

  useEffect(() => {
    // Fetch user requests - in real implementation
    // const fetchUserRequests = async () => {
    //   try {
    //     setLoading(true);
    //     if (token) {
    //       const data = await getUserRequests(token);
    //       setUserRequests(data);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching user requests:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchUserRequests();
    setLoading(false);
  }, [token]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenNewUserDialog = () => {
    setNewUserDialogOpen(true);
  };

  const handleCloseNewUserDialog = () => {
    setNewUserDialogOpen(false);
    // Reset form
    setFormData({
      fullName: '',
      employeeId: '',
      departmentId: user?.department?.id || '',
      role: UserRole.PROJECT_MANAGER,
      username: '',
      tempPassword: '',
      profilePhotoUrl: '',
      notes: ''
    });
    setFormErrors({
      fullName: '',
      employeeId: '',
      departmentId: '',
      role: '',
      username: '',
      tempPassword: ''
    });
  };

  const validateForm = () => {
    const errors = {
      fullName: '',
      employeeId: '',
      departmentId: '',
      role: '',
      username: '',
      tempPassword: ''
    };
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = t('common.required');
      isValid = false;
    }

    if (!formData.employeeId.trim()) {
      errors.employeeId = t('common.required');
      isValid = false;
    }

    if (!formData.departmentId) {
      errors.departmentId = t('common.required');
      isValid = false;
    }

    if (!formData.username.trim()) {
      errors.username = t('common.required');
      isValid = false;
    } else if (!/^[a-zA-Z0-9.]+$/.test(formData.username)) {
      errors.username = t('faculty.usernameFormat', 'Username can only contain letters, numbers, and dots');
      isValid = false;
    }

    if (!formData.tempPassword.trim()) {
      errors.tempPassword = t('common.required');
      isValid = false;
    } else if (formData.tempPassword.length < 8) {
      errors.tempPassword = t('faculty.passwordTooShort', 'Password must be at least 8 characters');
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmitUserRequest = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, we would call the API
      // const newRequest = await createUserRequest({
      //   ...formData,
      //   createdBy: user?.id || '',
      //   createdByName: `${user?.firstName} ${user?.lastName}` || '',
      //   status: UserRequestStatus.DRAFT
      // }, token || '');
      
      // Mock implementation
      const newRequest: UserRequest = {
        id: `req-${Date.now()}`,
        ...formData,
        departmentName: mockDepartments.find(d => d.id === formData.departmentId)?.name || '',
        status: UserRequestStatus.SUBMITTED,
        createdBy: user?.id || '',
        createdByName: `${user?.firstName} ${user?.lastName}` || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvalHistory: []
      };
      
      setUserRequests([newRequest, ...userRequests]);
      handleCloseNewUserDialog();
    } catch (error) {
      console.error('Error creating user request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

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

  const filterUsers = (users: any[]) => {
    return users.filter(user => 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredUsers = filterUsers(users);
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const filterUserRequests = (requests: UserRequest[]) => {
    return requests.filter(request => 
      request.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredRequests = filterUserRequests(userRequests);
  const paginatedRequests = filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case UserRequestStatus.DRAFT:
        return 'default';
      case UserRequestStatus.SUBMITTED:
        return 'info';
      case UserRequestStatus.DEPARTMENT_APPROVED:
        return 'secondary';
      case UserRequestStatus.SUB_PMO_APPROVED:
        return 'warning';
      case UserRequestStatus.MAIN_PMO_APPROVED:
        return 'success';
      case UserRequestStatus.APPROVED:
        return 'success';
      case UserRequestStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case UserRequestStatus.DRAFT:
        return t('faculty.statusDraft');
      case UserRequestStatus.SUBMITTED:
        return t('faculty.statusSubmitted');
      case UserRequestStatus.DEPARTMENT_APPROVED:
        return t('faculty.statusDepartmentApproved');
      case UserRequestStatus.SUB_PMO_APPROVED:
        return t('faculty.statusSubPmoApproved');
      case UserRequestStatus.MAIN_PMO_APPROVED:
        return t('faculty.statusMainPmoApproved');
      case UserRequestStatus.APPROVED:
        return t('faculty.statusApproved');
      case UserRequestStatus.REJECTED:
        return t('faculty.statusRejected');
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('faculty.title')}
        </Typography>
        
        {hasRole(['ADMIN', 'DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE']) && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenNewUserDialog}
          >
            {t('faculty.newUserRequest')}
          </Button>
        )}
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="faculty tabs">
            <Tab label={t('faculty.departmentMembers')} />
            <Tab label={t('faculty.requestsInProgress')} />
            {hasRole(['ADMIN', 'MAIN_PMO']) && (
              <Tab label={t('faculty.allMembers')} />
            )}
          </Tabs>
        </Box>

        {/* Department Members Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ py: 2, px: 2 }}>
            <TextField
              placeholder={t('common.search')}
              variant="outlined"
              size="small"
              sx={{ mb: 2, width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchChange}
            />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('faculty.fullName')}</TableCell>
                    <TableCell>{t('faculty.department')}</TableCell>
                    <TableCell>{t('faculty.role')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={user.status === 'Active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {t('faculty.noUsersFound')}
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
          </Box>
        </TabPanel>

        {/* User Requests Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ py: 2, px: 2 }}>
            <TextField
              placeholder={t('common.search')}
              variant="outlined"
              size="small"
              sx={{ mb: 2, width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchChange}
            />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('faculty.fullName')}</TableCell>
                    <TableCell>{t('faculty.department')}</TableCell>
                    <TableCell>{t('faculty.role')}</TableCell>
                    <TableCell>{t('faculty.requester')}</TableCell>
                    <TableCell>{t('faculty.approvalStatus')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.fullName}</TableCell>
                        <TableCell>{request.departmentName}</TableCell>
                        <TableCell>{request.role}</TableCell>
                        <TableCell>{request.createdByName}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(request.status)}
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {hasRole(['ADMIN', 'DEPARTMENT_DIRECTOR', 'MAIN_PMO', 'SUB_PMO']) && (
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {t('faculty.noUsersFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </TabPanel>

        {/* All Members Tab (Admin Only) */}
        {hasRole(['ADMIN', 'MAIN_PMO']) && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ py: 2, px: 2 }}>
              <TextField
                placeholder={t('common.search')}
                variant="outlined"
                size="small"
                sx={{ mb: 2, width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={handleSearchChange}
              />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('faculty.fullName')}</TableCell>
                      <TableCell>{t('faculty.department')}</TableCell>
                      <TableCell>{t('faculty.role')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                      <TableCell>{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress size={40} />
                        </TableCell>
                      </TableRow>
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.status}
                              color={user.status === 'Active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {t('faculty.noUsersFound')}
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
            </Box>
          </TabPanel>
        )}
      </Paper>

      {/* New User Request Dialog */}
      <Dialog 
        open={newUserDialogOpen} 
        onClose={handleCloseNewUserDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t('faculty.requestFormTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="fullName"
                label={t('faculty.fullName')}
                fullWidth
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="employeeId"
                label={t('faculty.employeeId')}
                fullWidth
                value={formData.employeeId}
                onChange={handleInputChange}
                error={!!formErrors.employeeId}
                helperText={formErrors.employeeId}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.departmentId} required>
                <InputLabel>{t('faculty.department')}</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  label={t('faculty.department')}
                  onChange={handleInputChange}
                >
                  {mockDepartments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
                {formErrors.departmentId && <FormHelperText>{formErrors.departmentId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.role} required>
                <InputLabel>{t('faculty.role')}</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label={t('faculty.role')}
                  onChange={handleInputChange}
                >
                  <MenuItem value={UserRole.PROJECT_MANAGER}>{UserRole.PROJECT_MANAGER}</MenuItem>
                  <MenuItem value={UserRole.SUB_PMO}>{UserRole.SUB_PMO}</MenuItem>
                  <MenuItem value={UserRole.DEPARTMENT_DIRECTOR}>{UserRole.DEPARTMENT_DIRECTOR}</MenuItem>
                  <MenuItem value={UserRole.MAIN_PMO}>{UserRole.MAIN_PMO}</MenuItem>
                  <MenuItem value={UserRole.EXECUTIVE}>{UserRole.EXECUTIVE}</MenuItem>
                  <MenuItem value={UserRole.DEVELOPER}>{UserRole.DEVELOPER}</MenuItem>
                  <MenuItem value={UserRole.QA}>{UserRole.QA}</MenuItem>
                </Select>
                {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="username"
                label={t('faculty.username')}
                fullWidth
                value={formData.username}
                onChange={handleInputChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="tempPassword"
                label={t('faculty.tempPassword')}
                type="password"
                fullWidth
                value={formData.tempPassword}
                onChange={handleInputChange}
                error={!!formErrors.tempPassword}
                helperText={formErrors.tempPassword || t('faculty.passwordHelp')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Button variant="outlined">
                  {t('faculty.uploadImage')}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label={t('faculty.notes')}
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewUserDialog}>{t('common.cancel')}</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitUserRequest} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : t('faculty.submitRequest')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyPage; 