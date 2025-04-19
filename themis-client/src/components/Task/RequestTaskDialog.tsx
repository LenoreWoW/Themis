import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  SelectChangeEvent,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { useTaskRequests } from '../../context/TaskRequestContext';
import { TaskPriority, TaskStatus } from '../../types/index';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface RequestTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const RequestTaskDialog: React.FC<RequestTaskDialogProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const { createTaskRequest, loading, error: contextError } = useTaskRequests();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: new Date()
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  }>({});
  
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePriorityChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }));
    
    // Clear error
    if (errors.priority) {
      setErrors(prev => ({ ...prev, priority: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, dueDate: date }));
      
      // Clear error
      if (errors.dueDate) {
        setErrors(prev => ({ ...prev, dueDate: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
      dueDate?: string;
    } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(formData.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitError(null);
    
    try {
      await createTaskRequest({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: TaskStatus.IN_PROGRESS,
        dueDate: formData.dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        projectId: projectId
      });
      
      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        dueDate: new Date()
      });
      
      onClose();
    } catch (err) {
      console.error('Error requesting task:', err);
      setSubmitError('Failed to submit task request. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request a New Task</DialogTitle>
      <DialogContent>
        {submitError && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            {submitError}
          </div>
        )}
        {contextError && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            {contextError}
          </div>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          id="title"
          name="title"
          label="Title"
          type="text"
          fullWidth
          value={formData.title}
          onChange={handleInputChange}
          error={!!errors.title}
          helperText={errors.title}
          disabled={loading}
        />
        
        <TextField
          margin="dense"
          id="description"
          name="description"
          label="Description"
          multiline
          rows={4}
          fullWidth
          value={formData.description}
          onChange={handleInputChange}
          error={!!errors.description}
          helperText={errors.description}
          disabled={loading}
        />
        
        <FormControl 
          fullWidth 
          margin="dense"
          error={!!errors.priority}
          disabled={loading}
        >
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            id="priority"
            value={formData.priority}
            onChange={handlePriorityChange}
            label="Priority"
          >
            <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
            <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
            <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
          </Select>
          {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
        </FormControl>
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Due Date"
            value={formData.dueDate}
            onChange={handleDateChange}
            disabled={loading}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'dense',
                error: !!errors.dueDate,
                helperText: errors.dueDate
              }
            }}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestTaskDialog; 