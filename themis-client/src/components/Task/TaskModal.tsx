import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Task, TaskStatus, TaskPriority, User, UserRole } from '../../types';
import { mapToBackendStatus, mapToFrontendStatus } from '../../utils/taskStatusMapper';
import MuiGridWrapper from '../common/MuiGridWrapper';

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  projectUsers: User[];
  projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  task,
  onClose,
  onSave,
  projectUsers,
  projectId
}) => {
  const isNewTask = !task;
  
  // Use the existing task or create a default one
  const [formValues, setFormValues] = useState<Task>({
    id: '',
    projectId: projectId,
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    startDate: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    assignee: undefined,
    createdBy: { 
      id: '', 
      username: '', 
      email: '', 
      firstName: '', 
      lastName: '', 
      role: UserRole.PENDING, 
      department: '', 
      isActive: true, 
      createdAt: '', 
      updatedAt: '' 
    },
    createdAt: '',
    updatedAt: '',
    dependencies: [],
    isMilestone: false
  });

  useEffect(() => {
    if (task) {
      setFormValues({
        ...task,
        // Ensure the status is properly mapped if coming from backend
        status: task.status
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e: SelectChangeEvent<TaskStatus>) => {
    setFormValues(prev => ({
      ...prev,
      status: e.target.value as TaskStatus
    }));
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    if (date) {
      setFormValues(prev => ({
        ...prev,
        [name]: date.toISOString()
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = () => {
    // When saving, ensure the proper status mapping is applied
    onSave(formValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isNewTask ? 'Create New Task' : 'Edit Task'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <MuiGridWrapper container spacing={2}>
            <MuiGridWrapper item xs={12}>
              <TextField
                name="title"
                label="Task Title"
                value={formValues.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formValues.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formValues.status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={TaskStatus.REVIEW}>Review</MenuItem>
                  <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
                </Select>
              </FormControl>
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formValues.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                </Select>
              </FormControl>
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={new Date(formValues.startDate)}
                  onChange={handleDateChange('startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={new Date(formValues.dueDate)}
                  onChange={handleDateChange('dueDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignee"
                  value={formValues.assignee?.id || ''}
                  onChange={(e) => {
                    const userId = e.target.value as string;
                    const user = projectUsers.find(u => u.id === userId);
                    setFormValues(prev => ({
                      ...prev,
                      assignee: user
                    }));
                  }}
                  label="Assignee"
                >
                  <MenuItem value="">None</MenuItem>
                  {projectUsers.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MuiGridWrapper>
            <MuiGridWrapper item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.isMilestone}
                    onChange={handleCheckboxChange}
                    name="isMilestone"
                  />
                }
                label="This task is a milestone"
              />
            </MuiGridWrapper>
          </MuiGridWrapper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isNewTask ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal; 