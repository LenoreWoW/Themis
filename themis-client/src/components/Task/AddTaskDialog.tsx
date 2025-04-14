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
  Stack,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { TaskPriority, TaskStatus, User, UserRole } from '../../types';
import { TaskService } from '../../services/TaskService';
import { useAuth } from '../../context/AuthContext';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId?: string; // Optional - if not provided, it's an independent task
  projectUsers?: User[];
  allUsers?: User[]; // For independent tasks
  onTaskAdded: () => void;
  isIndependentTask?: boolean;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ 
  open, 
  onClose, 
  projectId, 
  projectUsers = [],
  allUsers = [],
  onTaskAdded,
  isIndependentTask = false
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [availableUsers, setAvailableUsers] = useState<User[]>(projectUsers);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    startDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    assigneeId: '',
    isMilestone: false,
    parentTaskId: ''
  });

  // Fetch project users if needed
  useEffect(() => {
    const fetchProjectUsers = async () => {
      if (!projectId || !token || projectUsers.length > 0) return;
      
      try {
        // In a real app, you would fetch project users from your API
        // For now, we'll simulate it with mock data
        const mockProjectUsers: User[] = [
          {
            id: '101',
            username: 'alice.johnson',
            firstName: 'Alice',
            lastName: 'Johnson',
            role: UserRole.PROJECT_MANAGER,
            email: 'alice@example.com',
            department: 'IT',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '102',
            username: 'bob.smith',
            firstName: 'Bob',
            lastName: 'Smith',
            role: UserRole.ADMIN,
            email: 'bob@example.com',
            department: 'Engineering',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setAvailableUsers(mockProjectUsers);
      } catch (error) {
        console.error("Error fetching project users:", error);
      }
    };
    
    fetchProjectUsers();
  }, [projectId, token, projectUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTaskData(prev => ({ ...prev, [name]: checked }));
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setTaskData(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleDueDateChange = (date: Date | null) => {
    if (date) {
      setTaskData(prev => ({ ...prev, dueDate: date }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!taskData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (taskData.startDate > taskData.dueDate) {
      errors.dueDate = 'Due date must be after start date';
    }
    
    if (isIndependentTask && !taskData.assigneeId) {
      errors.assigneeId = 'Assignee is required for independent tasks';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (isIndependentTask) {
        // Create independent task
        await TaskService.createIndependentTask({
          ...taskData,
          startDate: taskData.startDate.toISOString(),
          dueDate: taskData.dueDate.toISOString()
        }, token || '');
      } else if (projectId) {
        // Create project task
        await TaskService.createTask(projectId, {
          ...taskData,
          startDate: taskData.startDate.toISOString(),
          dueDate: taskData.dueDate.toISOString()
        }, token || '');
      } else {
        throw new Error('Missing project ID for project task');
      }
      
      onTaskAdded();
      onClose();
      
      // Reset form data
      setTaskData({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assigneeId: '',
        isMilestone: false,
        parentTaskId: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setFormErrors(prev => ({ 
        ...prev, 
        submit: 'Failed to create task. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update getAvailableUsers to use our availableUsers state
  const getAvailableUsers = () => {
    return isIndependentTask ? allUsers : availableUsers;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isIndependentTask ? 'Create Independent Task' : 'Add New Task'}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Task Title"
              name="title"
              value={taskData.title}
              onChange={handleInputChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={taskData.status}
                  label="Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={TaskStatus.REVIEW}>Review</MenuItem>
                  <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={taskData.priority}
                  label="Priority"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={taskData.startDate}
                onChange={handleStartDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
              
              <DatePicker
                label="Due Date"
                value={taskData.dueDate}
                onChange={handleDueDateChange}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: !!formErrors.dueDate,
                    helperText: formErrors.dueDate
                  } 
                }}
              />
            </Box>
            
            <FormControl fullWidth error={!!formErrors.assigneeId}>
              <InputLabel>Assignee</InputLabel>
              <Select
                name="assigneeId"
                value={taskData.assigneeId}
                label="Assignee"
                onChange={handleSelectChange}
                required={isIndependentTask}
              >
                {!isIndependentTask && <MenuItem value="">Unassigned</MenuItem>}
                {getAvailableUsers().map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.username})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.assigneeId && <FormHelperText>{formErrors.assigneeId}</FormHelperText>}
            </FormControl>
            
            {!isIndependentTask && (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={taskData.isMilestone}
                    onChange={handleCheckboxChange}
                    name="isMilestone"
                  />
                }
                label="This is a milestone"
              />
            )}
            
            {formErrors.submit && (
              <Typography color="error" variant="body2">
                {formErrors.submit}
              </Typography>
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog; 