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
  Box,
  FormHelperText,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Task, TaskPriority, TaskStatus, User } from '../../types';

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskUpdated: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  task: Task;
  projectUsers: User[];
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  onClose,
  onTaskUpdated,
  task,
  projectUsers
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(
    task.assignee ? (typeof task.assignee === 'string' ? task.assignee : task.assignee.id) : undefined
  );
  const [startDate, setStartDate] = useState<Date | null>(task.startDate ? new Date(task.startDate) : null);
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
  }>({});
  
  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee ? (typeof task.assignee === 'string' ? task.assignee : task.assignee.id) : undefined);
      setStartDate(task.startDate ? new Date(task.startDate) : null);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
      startDate?: string;
      dueDate?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (startDate && dueDate && startDate > dueDate) {
      newErrors.dueDate = 'Due date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    const updatedTaskData: Partial<Task> = {
      title,
      description,
      status,
      priority,
      startDate: startDate ? startDate.toISOString() : undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined
    };
    
    if (assigneeId) {
      updatedTaskData.assignee = { id: assigneeId } as User;
    } else {
      updatedTaskData.assignee = undefined;
    }
    
    try {
      await onTaskUpdated(task.id, updatedTaskData);
      handleClose();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getStatusColor = (taskStatus: TaskStatus) => {
    switch (taskStatus) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.IN_PROGRESS: return 'primary';
      case TaskStatus.REVIEW: return 'warning';
      case TaskStatus.DONE: return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (taskPriority: TaskPriority) => {
    switch (taskPriority) {
      case TaskPriority.LOW: return 'success';
      case TaskPriority.MEDIUM: return 'warning';
      case TaskPriority.HIGH: return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { overflow: 'visible' } }}
    >
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  disabled={submitting}
                  renderValue={(selected) => (
                    <Chip 
                      label={selected} 
                      size="small" 
                      color={getStatusColor(selected as TaskStatus)}
                    />
                  )}
                >
                  {Object.values(TaskStatus).map((statusOption) => (
                    <MenuItem key={statusOption} value={statusOption}>
                      <Chip 
                        label={statusOption} 
                        size="small" 
                        color={getStatusColor(statusOption)}
                        sx={{ mr: 1 }}
                      />
                      {statusOption.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  disabled={submitting}
                  renderValue={(selected) => (
                    <Chip 
                      label={selected} 
                      size="small" 
                      color={getPriorityColor(selected as TaskPriority)}
                    />
                  )}
                >
                  {Object.values(TaskPriority).map((priorityOption) => (
                    <MenuItem key={priorityOption} value={priorityOption}>
                      <Chip 
                        label={priorityOption} 
                        size="small" 
                        color={getPriorityColor(priorityOption)}
                        sx={{ mr: 1 }}
                      />
                      {priorityOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="assignee-label">Assignee</InputLabel>
                <Select
                  labelId="assignee-label"
                  value={assigneeId || ''}
                  label="Assignee"
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {projectUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Assign this task to a team member</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                      disabled: submitting,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={(newValue) => setDueDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dueDate,
                      helperText: errors.dueDate,
                      disabled: submitting,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Updating...' : 'Update Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog; 