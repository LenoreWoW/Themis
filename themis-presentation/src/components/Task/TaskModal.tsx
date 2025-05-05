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
  SelectChangeEvent,
  Grid
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Task, TaskStatus, TaskPriority, User, UserRole, Project } from '../../types';
import { mapToBackendStatus, mapToFrontendStatus } from '../../utils/taskStatusMapper';
import { useTranslation } from 'react-i18next';
import { mockUsers } from '../../services/mockData';

// Simple Grid wrapper components to maintain existing code structure
const GridContainer = (props: any) => (
  <Grid container spacing={props.spacing || 2} {...props}>
    {props.children}
  </Grid>
);

const GridItem = (props: any) => (
  <Grid item xs={props.xs} md={props.md} {...props}>
    {props.children}
  </Grid>
);

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
  const { t } = useTranslation();
  const isNewTask = !task;
  
  // Create a minimal project object for the form
  const defaultProject: Project = {
    id: projectId,
    name: '',
    description: '',
    status: 'IN_PROGRESS' as any, // ProjectStatus is imported from another file
    priority: 'MEDIUM' as any, // ProjectPriority is imported from another file
    startDate: '',
    endDate: '',
    projectManager: {} as User,
    department: {} as any,
    progress: 0,
    budget: 0,
    actualCost: 0,
    templateType: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Use the existing task or create a default one
  const [formValues, setFormValues] = useState<Task>({
    id: '',
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    startDate: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    projectId: defaultProject.id,
    project: defaultProject,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormValues(prev => ({
        ...prev,
        dueDate: date.toISOString()
      }));
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setFormValues(prev => ({
        ...prev,
        startDate: date.toISOString()
      }));
    }
  };

  const handleSubmit = () => {
    // When saving, ensure the proper status mapping is applied
    onSave(formValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isNewTask ? t('task.add') : t('task.edit')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <GridContainer spacing={2}>
            <GridItem xs={12}>
              <TextField
                name="title"
                label={t('task.title')}
                value={formValues.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </GridItem>
            <GridItem xs={12}>
              <TextField
                name="description"
                label={t('task.description')}
                value={formValues.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </GridItem>
            <GridItem xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('task.status')}</InputLabel>
                <Select
                  name="status"
                  value={formValues.status}
                  onChange={handleStatusChange}
                  label={t('task.status')}
                >
                  <MenuItem value={TaskStatus.TODO}>{t('taskStatus.TODO')}</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>{t('taskStatus.IN_PROGRESS')}</MenuItem>
                  <MenuItem value={TaskStatus.REVIEW}>{t('taskStatus.REVIEW')}</MenuItem>
                  <MenuItem value={TaskStatus.DONE}>{t('taskStatus.DONE')}</MenuItem>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('task.priority')}</InputLabel>
                <Select
                  name="priority"
                  value={formValues.priority}
                  onChange={handleChange}
                  label={t('task.priority')}
                >
                  <MenuItem value={TaskPriority.LOW}>{t('taskPriority.LOW')}</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>{t('taskPriority.MEDIUM')}</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>{t('taskPriority.HIGH')}</MenuItem>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('task.startDate')}
                  value={new Date(formValues.startDate)}
                  onChange={handleStartDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </GridItem>
            <GridItem xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('task.dueDate')}
                  value={new Date(formValues.dueDate)}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </GridItem>
            <GridItem xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('task.assignee')}</InputLabel>
                <Select
                  name="assignee"
                  value={formValues.assignee?.id || ''}
                  onChange={(e) => {
                    const selectedUserId = e.target.value as string;
                    // Use projectUsers first, then fallback to mockUsers if no project users available
                    const availableUsers = projectUsers.length > 0 ? projectUsers : mockUsers;
                    const selectedUser = availableUsers.find(user => user.id === selectedUserId);
                    
                    if (selectedUser) {
                      setFormValues(prev => ({
                        ...prev,
                        assignee: selectedUser
                      }));
                    }
                  }}
                  label={t('task.assignee')}
                >
                  <MenuItem value="">
                    <em>{t('project.unassigned')}</em>
                  </MenuItem>
                  {/* Use projectUsers first, then fallback to mockUsers if no project users available */}
                  {(projectUsers.length > 0 ? projectUsers : mockUsers).map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
          </GridContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isNewTask ? t('common.create') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal; 