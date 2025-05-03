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
import { TaskPriority, TaskStatus, User, UserRole, Department } from '../../types';
import { TaskService } from '../../services/TaskService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId?: string; // Optional - if not provided, it's an independent task
  projectUsers?: User[];
  allUsers?: User[]; // For independent tasks
  onTaskAdded: (success: boolean) => void;
  isIndependentTask?: boolean;
  initialStatus?: TaskStatus; // Add initialStatus prop
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ 
  open, 
  onClose, 
  projectId, 
  projectUsers = [],
  allUsers = [],
  onTaskAdded,
  isIndependentTask = false,
  initialStatus = TaskStatus.TODO // Default to TODO if not provided
}) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [availableUsers, setAvailableUsers] = useState<User[]>(projectUsers);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: TaskPriority.MEDIUM,
    startDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    assigneeId: '',
    isMilestone: false,
    parentTaskId: ''
  });

  // Update status when initialStatus changes
  useEffect(() => {
    setTaskData(prev => ({
      ...prev,
      status: initialStatus
    }));
  }, [initialStatus]);

  // Fetch project users if needed
  useEffect(() => {
    const fetchProjectUsers = async () => {
      if (!projectId || !token || projectUsers.length > 0) return;
      
      try {
        // In a real app, you would fetch project users from your API
        // For now, we'll simulate it with mock data
        const mockDepartments: Department[] = [
          {
            id: '1',
            name: 'IT',
            description: 'Information Technology Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Engineering',
            description: 'Engineering Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'alice',
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@example.com',
            role: UserRole.PROJECT_MANAGER,
            department: mockDepartments[0],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            username: 'bob',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@example.com',
            role: UserRole.ADMIN,
            department: mockDepartments[1],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setAvailableUsers(mockUsers);
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
      
      onTaskAdded(true);
      onClose();
      
      // Reset form data
      setTaskData({
        title: '',
        description: '',
        status: initialStatus,
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
      onTaskAdded(false);
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
      <DialogTitle>{t('task.add')}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="title"
              label={t('task.title')}
              value={taskData.title}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
            
            <TextField
              name="description"
              label={t('task.description')}
              value={taskData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('task.status')}</InputLabel>
                <Select
                  name="status"
                  value={taskData.status}
                  label={t('task.status')}
                  onChange={handleSelectChange}
                >
                  <MenuItem value={TaskStatus.TODO}>{t('taskStatus.TODO')}</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>{t('taskStatus.IN_PROGRESS')}</MenuItem>
                  <MenuItem value={TaskStatus.REVIEW}>{t('taskStatus.REVIEW')}</MenuItem>
                  <MenuItem value={TaskStatus.DONE}>{t('taskStatus.DONE')}</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>{t('task.priority')}</InputLabel>
                <Select
                  name="priority"
                  value={taskData.priority}
                  label={t('task.priority')}
                  onChange={handleSelectChange}
                >
                  <MenuItem value={TaskPriority.LOW}>{t('taskPriority.LOW')}</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>{t('taskPriority.MEDIUM')}</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>{t('taskPriority.HIGH')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label={t('task.startDate')}
                value={taskData.startDate}
                onChange={handleStartDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
              
              <DatePicker
                label={t('task.dueDate')}
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
              <InputLabel>{t('task.assignee')}</InputLabel>
              <Select
                name="assigneeId"
                value={taskData.assigneeId}
                label={t('task.assignee')}
                onChange={handleSelectChange}
                required={isIndependentTask}
              >
                {!isIndependentTask && <MenuItem value="">{t('project.unassigned')}</MenuItem>}
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
                label={t('task.milestone')}
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
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.creating') : t('task.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog; 