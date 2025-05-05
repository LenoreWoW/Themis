import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  SelectChangeEvent,
  Slider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { format } from 'date-fns';

interface TaskEditDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (editedTask: Task) => void;
  users?: User[];
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  task,
  onClose,
  onSave,
  users = []
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      // Calculate progress based on task status
      let taskProgress = 0;
      switch (task.status) {
        case TaskStatus.TODO:
          taskProgress = 0;
          break;
        case TaskStatus.IN_PROGRESS:
          taskProgress = 50;
          break;
        case TaskStatus.REVIEW:
          taskProgress = 80;
          break;
        case TaskStatus.DONE:
          taskProgress = 100;
          break;
      }
      setProgress(taskProgress);
    }
  }, [task]);

  if (!editedTask) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditedTask(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setProgress(value);
    
    // Update task status based on the progress
    let newStatus = editedTask.status;
    if (value === 0) {
      newStatus = TaskStatus.TODO;
    } else if (value > 0 && value < 50) {
      newStatus = TaskStatus.IN_PROGRESS;
    } else if (value >= 50 && value < 100) {
      newStatus = TaskStatus.REVIEW;
    } else if (value === 100) {
      newStatus = TaskStatus.DONE;
    }
    
    setEditedTask(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
    }
  };

  const getProgressColor = (value: number) => {
    if (value === 0) return 'default';
    if (value > 0 && value < 50) return 'primary';
    if (value >= 50 && value < 100) return 'warning';
    return 'success';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Task
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={editedTask.title}
            onChange={handleInputChange}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={editedTask.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            margin="normal"
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editedTask.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={TaskStatus.REVIEW}>In Review</MenuItem>
                <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={editedTask.priority}
                onChange={handleSelectChange}
                label="Priority"
              >
                <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={editedTask.startDate.split('T')[0]}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Due Date"
              name="dueDate"
              type="date"
              value={editedTask.dueDate.split('T')[0]}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          {users.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Assignee</InputLabel>
              <Select
                name="assigneeId"
                value={editedTask.assignee?.id || ''}
                onChange={handleSelectChange}
                label="Assignee"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Progress: {progress}%
              <Chip 
                sx={{ ml: 1 }}
                size="small"
                label={editedTask.status}
                color={getProgressColor(progress) as any}
              />
            </Typography>
            <Slider
              value={progress}
              onChange={handleProgressChange}
              aria-labelledby="task-progress-slider"
              valueLabelDisplay="auto"
              step={10}
              marks
              min={0}
              max={100}
              color={getProgressColor(progress) as any}
            />
            <Typography variant="caption" color="text.secondary">
              Drag to update progress: 0% (To Do) → 50% (In Progress) → 80% (Review) → 100% (Done)
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />} 
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog; 