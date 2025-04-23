import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Department, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { canManageDepartments } from '../utils/permissions';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const DepartmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const { user, token } = useAuth();
  const hasManagePermission = user && canManageDepartments(user.role);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.departments.getAllDepartments(token || '');
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(t('departments.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setCurrentDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || ''
      });
    } else {
      setCurrentDepartment(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDepartment(null);
  };

  const handleOpenDeleteDialog = (department: Department) => {
    setCurrentDepartment(department);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentDepartment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError(t('departments.nameRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (currentDepartment) {
        // Update existing department
        const response = await api.departments.updateDepartment(currentDepartment.id || '', formData, token || '');
        setDepartments(departments.map(dep => dep.id === currentDepartment.id ? response.data : dep));
        setSnackbar({
          open: true,
          message: t('departments.updateSuccess'),
          severity: 'success'
        });
      } else {
        // Create new department
        const response = await api.departments.createDepartment(formData, token || '');
        setDepartments([...departments, response.data]);
        setSnackbar({
          open: true,
          message: t('departments.createSuccess'),
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting department:', err);
      setError(t('departments.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentDepartment) return;
    
    setLoading(true);
    setError(null);

    try {
      await api.departments.deleteDepartment(currentDepartment.id || '', token || '');
      setDepartments(departments.filter(dep => dep.id !== currentDepartment.id));
      setSnackbar({
        open: true,
        message: t('departments.deleteSuccess'),
        severity: 'success'
      });
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(t('departments.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('departments.title')}
        </Typography>
        {hasManagePermission && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('departments.add')}
          </Button>
        )}
      </Box>

      {loading && !departments.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : departments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">{t('departments.noDepartments')}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('departments.name')}</TableCell>
                <TableCell>{t('departments.description')}</TableCell>
                <TableCell>{t('departments.created')}</TableCell>
                <TableCell>{t('departments.lastUpdated')}</TableCell>
                {hasManagePermission && <TableCell align="right">{t('departments.actions')}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  <TableCell>{formatDate(department.createdAt)}</TableCell>
                  <TableCell>{formatDate(department.updatedAt)}</TableCell>
                  {hasManagePermission && (
                    <TableCell align="right">
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(department)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(department)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Department Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentDepartment ? t('departments.edit') : t('departments.add')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label={t('departments.departmentName')}
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label={t('departments.description')}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading || !formData.name}
          >
            {loading ? <CircularProgress size={24} /> : currentDepartment ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('departments.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('departments.deleteConfirmation', { name: currentDepartment?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentsPage; 