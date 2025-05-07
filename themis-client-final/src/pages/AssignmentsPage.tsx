import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { User, TaskPriority, Assignment, AssignmentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import AssignmentCard from '../components/Assignment/AssignmentCard';
import AssignmentDetailDialog from '../components/Assignment/AssignmentDetailDialog';
import AssignmentEditDialog from '../components/Assignment/AssignmentEditDialog';
import { mockUsers } from '../services/mockData';

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
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    assignedTo: '',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignmentData, setEditingAssignmentData] = useState<Assignment | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchAssignments = async () => {
    try {
      // Try to get assignments from API first
      const response = await api.assignments.getAllAssignments('');
      
      // If API returns data successfully, use it
      if (response.success && response.data && response.data.length > 0) {
        setAssignments(response.data);
      } else {
        // If API fails or returns empty, use an empty array
        console.log('No assignments found. Using empty array.');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Use empty array on error
      setAssignments([]);
    }
  };

  const fetchUsers = async () => {
    try {
      // First try to get from API
      const response = await api.users.getAllUsers('');
      if (response.success && response.data && response.data.length > 0) {
        setUsers(response.data);
      } else {
        // If API fails or returns empty, use mock users
        console.log('Using mock users for assignments page');
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock users as fallback
      setUsers(mockUsers);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  
  const handleAssignmentClick = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedAssignmentId(null);
  };
  
  const handleEditFromDetailDialog = (assignment: any) => {
    // The assignment object from the detail dialog might need conversion
    // Find the original assignment from our assignments array
    const assignmentToEdit = assignments.find(a => a.id === assignment.id);
    if (assignmentToEdit) {
      handleOpenEditDialog(assignmentToEdit);
    }
    // Close the detail dialog
    setIsDetailDialogOpen(false);
  };
  
  const handleAddComment = async (assignmentId: string, content: string) => {
    // In a real app, this would call an API to add a comment
    console.log('Add comment to assignment', assignmentId, content);
    return Promise.resolve();
  };

  const handleOpenEditDialog = (assignment: Assignment) => {
    setEditingAssignmentData(assignment);
    setIsEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAssignmentData(null);
  };
  
  const handleSaveEditedAssignment = (editedAssignment: Assignment) => {
    // Update the assignment in the local state
    setAssignments(prevAssignments => 
      prevAssignments.map(a => 
        a.id === editedAssignment.id ? editedAssignment : a
      )
    );
    
    // Close the dialog
    handleCloseEditDialog();
    
    // In a real app, you would also call the API to update the assignment
    console.log('Saving edited assignment:', editedAssignment);
  };
  
  const handleUpdateProgress = (assignmentId: string, progress: number, newStatus: string) => {
    // Update the assignment status in local state
    setAssignments(prevAssignments => 
      prevAssignments.map(a => {
        if (a.id === assignmentId) {
          return {
            ...a,
            status: newStatus as AssignmentStatus
          };
        }
        return a;
      })
    );
    
    // In a real app, you would also call the API to update the assignment
    console.log(`Updating assignment ${assignmentId} progress to ${progress}%, status: ${newStatus}`);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter assignments based on selected tab
  const filteredAssignments = React.useMemo(() => {
    if (!assignments || !user) return [];
    
    if (tabValue === 0) {
      // "My Assignments" tab - show assignments assigned to the current user
      return assignments.filter(assignment => 
        assignment.assignedTo.id === user.id
      );
    } else {
      // "Assignments I've Assigned" tab - show assignments assigned by the current user to others
      return assignments.filter(assignment => 
        assignment.assignedBy?.id === user.id && 
        assignment.assignedTo.id !== user.id
      );
    }
  }, [assignments, tabValue, user]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <div>
          <Typography variant="h4">{t('assignments.title', 'Assignments')}</Typography>
          <Typography variant="body1" color="text.secondary">
            {t('assignments.description', 'View and manage your assignments')}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Assignment
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="assignment tabs"
        >
          <Tab label={t('assignments.myAssignments', 'My Assignments')} />
          <Tab label={t('assignments.assignedByMe', 'Assignments I\'ve Assigned')} />
        </Tabs>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {filteredAssignments.length === 0 ? (
          <Box sx={{ p: 3, width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {tabValue === 0 
                ? 'No assignments assigned to you'
                : 'No assignments assigned by you'}
            </Typography>
          </Box>
        ) : (
          filteredAssignments.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} key={assignment.id}>
              <AssignmentCard
                assignment={{
                  id: assignment.id,
                  title: assignment.title,
                  description: assignment.description,
                  status: (assignment.status === AssignmentStatus.COMPLETED 
                    ? 'COMPLETED' 
                    : assignment.status === AssignmentStatus.IN_PROGRESS 
                    ? 'IN_PROGRESS' 
                    : 'PENDING') as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE',
                  dueDate: assignment.dueDate,
                  assignedBy: assignment.assignedBy || {
                    id: '1',
                    firstName: 'Default',
                    lastName: 'Manager'
                  },
                  assignedTo: assignment.assignedTo,
                  createdAt: assignment.createdAt || new Date().toISOString(),
                  updatedAt: assignment.updatedAt || new Date().toISOString()
                }}
                onClick={() => handleAssignmentClick(assignment.id)}
                onAddComment={handleAddComment}
                onUpdateProgress={handleUpdateProgress}
              />
            </Grid>
          ))
        )}
      </Grid>

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
      
      {/* Assignment Detail Dialog */}
      <AssignmentDetailDialog
        open={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        assignmentId={selectedAssignmentId}
        onEdit={handleEditFromDetailDialog}
      />
      
      {/* Assignment Edit Dialog */}
      <AssignmentEditDialog
        open={isEditDialogOpen}
        assignment={editingAssignmentData}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEditedAssignment}
        users={users}
      />
    </Box>
  );
};

export default AssignmentsPage; 