import React, { useState, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Box,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { useTranslation } from 'react-i18next';

interface TaskEditDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  users: User[];
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  task,
  onClose,
  onSave,
  users
}) => {
  const { t } = useTranslation();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    } else {
      setEditedTask(null);
    }
    setErrors({});
  }, [task, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedTask) return;
    
    const { name, value } = e.target;
    setEditedTask({
      ...editedTask,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<unknown>, child: ReactNode) => {
    if (!editedTask) return;
    
    const { name, value } = e.target;
    if (name) {
      setEditedTask({
        ...editedTask,
        [name]: value
      });
      
      // Clear error when field is modified
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (!editedTask || !date) return;
    
    setEditedTask({
      ...editedTask,
      [name]: date.toISOString().split('T')[0]
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = () => {
    if (!editedTask) return;
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    
    if (!editedTask.title.trim()) {
      newErrors.title = t('validation.required');
    }
    
    if (!editedTask.dueDate) {
      newErrors.dueDate = t('validation.required');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(editedTask);
  };

  if (!editedTask) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('task.edit')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label={t('task.title')}
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label={t('task.description')}
              name="description"
              value={editedTask.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">{t('status.status')}</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={editedTask.status}
                onChange={handleSelectChange}
                label={t('status.status')}
              >
                {Object.values(TaskStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`status.${status.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">{t('priority.priority')}</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={editedTask.priority}
                onChange={handleSelectChange}
                label={t('priority.priority')}
              >
                {Object.values(TaskPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {t(`priority.${priority.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('task.startDate')}
                value={editedTask.startDate ? new Date(editedTask.startDate) : null}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    name: 'startDate'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box>
                <DatePicker
                  label={t('task.dueDate')}
                  value={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
                  onChange={(date) => handleDateChange('dueDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      name: 'dueDate',
                      error: !!errors.dueDate
                    }
                  }}
                />
                {errors.dueDate && (
                  <FormHelperText error>{errors.dueDate}</FormHelperText>
                )}
              </Box>
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="assignee-label">{t('task.assignee')}</InputLabel>
              <Select
                labelId="assignee-label"
                name="assignee"
                value={editedTask.assignee?.id || ''}
                onChange={(e) => {
                  const selectedUserId = e.target.value as string;
                  const selectedUser = users.find(user => user.id === selectedUserId);
                  
                  setEditedTask({
                    ...editedTask,
                    assignee: selectedUser || undefined
                  });
                }}
                label={t('task.assignee')}
              >
                <MenuItem value="">
                  <em>{t('common.none')}</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog; 