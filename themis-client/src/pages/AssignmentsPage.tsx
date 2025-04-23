import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { User, TaskPriority, Assignment, AssignmentStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

interface AssignmentFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string;
}

const AssignmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    assignedTo: '',
  });

  const fetchAssignments = async () => {
    try {
      const response = await api.assignments.getAllAssignments('');
      if (response.success && response.data) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.users.getAllUsers('');
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchUsers();
  }, []);

  const handleOpenDialog = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        priority: assignment.priority,
        dueDate: assignment.dueDate.split('T')[0],
        assignedTo: assignment.assignedTo.id,
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        dueDate: '',
        assignedTo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
  };

  const handleSaveAssignment = async () => {
    try {
      const selectedUser = users.find(u => u.id === formData.assignedTo);
      if (!selectedUser) {
        console.error('Selected user not found');
        return;
      }

      const assignmentData = {
        ...formData,
        assignedBy: user || undefined,
        assignedTo: selectedUser
      };

      const response = editingAssignment
        ? await api.assignments.updateAssignment(editingAssignment.id, assignmentData, '')
        : await api.assignments.createAssignment(assignmentData, '');

      if (response.success) {
        fetchAssignments();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const response = await api.assignments.deleteAssignment(assignmentId, '');
      if (response.success) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const handleStatusChange = async (assignment: Assignment, newStatus: AssignmentStatus) => {
    try {
      const response = await api.assignments.updateAssignment(
        assignment.id,
        { ...assignment, status: newStatus },
        ''
      );
      if (response.success) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'error';
      case TaskPriority.MEDIUM:
        return 'warning';
      case TaskPriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.COMPLETED:
        return <CheckCircleIcon color="success" />;
      case AssignmentStatus.IN_PROGRESS:
        return <ScheduleIcon color="primary" />;
      case AssignmentStatus.CANCELLED:
        return <WarningIcon color="error" />;
      default:
        return null;
    }
  };

  const getFormattedStatus = (status: AssignmentStatus): string => {
    switch (status) {
      case AssignmentStatus.COMPLETED:
        return 'Completed';
      case AssignmentStatus.IN_PROGRESS:
        return 'In Progress';
      case AssignmentStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('assignments.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Assignment
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
        {assignments.map((assignment) => (
          <Box key={assignment.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {assignment.title}
                  </Typography>
                  <Chip
                    label={assignment.priority}
                    color={getPriorityColor(assignment.priority)}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Assigned to: {assignment.assignedTo.firstName} {assignment.assignedTo.lastName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {assignment.description}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(assignment)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteAssignment(assignment.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getStatusIcon(assignment.status)}
                  <Chip
                    label={getFormattedStatus(assignment.status)}
                    color={assignment.status === AssignmentStatus.COMPLETED ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              select
              label={t('priority.title')}
              fullWidth
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            >
              {Object.values(TaskPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Assign To"
              fullWidth
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAssignment} variant="contained" color="primary">
            {editingAssignment ? 'Save Changes' : 'Create Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentsPage; 