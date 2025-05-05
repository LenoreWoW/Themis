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
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { Assignment, AssignmentStatus, TaskPriority, User } from '../../types';

// Define the local Assignment interface that matches the component's needs
interface LocalAssignment {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: TaskPriority;
  dueDate: string;
  assignedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AssignmentEditDialogProps {
  open: boolean;
  assignment: Assignment | null;
  onClose: () => void;
  onSave: (editedAssignment: Assignment) => void;
  users?: User[];
}

const AssignmentEditDialog: React.FC<AssignmentEditDialogProps> = ({
  open,
  assignment,
  onClose,
  onSave,
  users = []
}) => {
  const { user } = useAuth();
  const [editedAssignment, setEditedAssignment] = useState<LocalAssignment | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (assignment) {
      // Convert the assignment from the props to our local format
      const localAssignment: LocalAssignment = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        status: assignment.status === AssignmentStatus.COMPLETED 
          ? 'COMPLETED' 
          : assignment.status === AssignmentStatus.IN_PROGRESS 
          ? 'IN_PROGRESS' 
          : 'PENDING',
        priority: assignment.priority,
        dueDate: assignment.dueDate,
        assignedBy: assignment.assignedBy,
        assignedTo: assignment.assignedTo,
        createdAt: assignment.createdAt || new Date().toISOString(),
        updatedAt: assignment.updatedAt || new Date().toISOString()
      };
      
      setEditedAssignment(localAssignment);
      
      // Calculate progress based on assignment status
      let assignmentProgress = 0;
      switch (assignment.status) {
        case AssignmentStatus.PENDING:
          assignmentProgress = 0;
          break;
        case AssignmentStatus.IN_PROGRESS:
          assignmentProgress = 50;
          break;
        case AssignmentStatus.COMPLETED:
          assignmentProgress = 100;
          break;
        default:
          assignmentProgress = 25; // Default for other statuses
          break;
      }
      setProgress(assignmentProgress);
    }
  }, [assignment]);

  if (!editedAssignment) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedAssignment(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditedAssignment(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setProgress(value);
    
    // Update assignment status based on the progress
    let newStatus = editedAssignment.status;
    if (value === 0) {
      newStatus = 'PENDING';
    } else if (value > 0 && value < 100) {
      newStatus = 'IN_PROGRESS';
    } else if (value === 100) {
      newStatus = 'COMPLETED';
    }
    
    setEditedAssignment(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleSave = () => {
    if (editedAssignment) {
      // Create a proper Assignment object with only the fields that Assignment expects
      const statusValue = editedAssignment.status === 'COMPLETED' 
        ? AssignmentStatus.COMPLETED 
        : editedAssignment.status === 'IN_PROGRESS' 
        ? AssignmentStatus.IN_PROGRESS 
        : AssignmentStatus.PENDING;
      
      // In a real implementation, you would need to update the user references properly
      // For now, just pass the existing objects
      const updatedAssignment = {
        id: editedAssignment.id,
        title: editedAssignment.title,
        description: editedAssignment.description,
        status: statusValue,
        priority: editedAssignment.priority,
        dueDate: editedAssignment.dueDate,
        assignedBy: editedAssignment.assignedBy,
        assignedTo: editedAssignment.assignedTo,
        createdAt: editedAssignment.createdAt,
        updatedAt: editedAssignment.updatedAt
      };
      
      onSave(updatedAssignment as Assignment);
    }
  };

  const getProgressColor = (value: number) => {
    if (value === 0) return 'primary';
    if (value > 0 && value < 100) return 'primary';
    return 'success';
  };

  // Function to get slider color 
  const getSliderColor = (value: number): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (value < 50) return 'primary';
    if (value < 100) return 'warning';
    return 'success';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Assignment
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
            value={editedAssignment.title}
            onChange={handleInputChange}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={editedAssignment.description}
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
                value={editedAssignment.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={editedAssignment.priority}
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
              label="Due Date"
              name="dueDate"
              type="date"
              value={editedAssignment.dueDate.split('T')[0]}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          {users.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assignedTo"
                value={editedAssignment.assignedTo?.id || ''}
                onChange={handleSelectChange}
                label="Assigned To"
              >
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
                label={editedAssignment.status}
                color={getProgressColor(progress) as any}
              />
            </Typography>
            <Slider
              value={progress}
              onChange={handleProgressChange}
              aria-labelledby="assignment-progress-slider"
              valueLabelDisplay="auto"
              step={10}
              marks
              min={0}
              max={100}
              color={getSliderColor(progress)}
            />
            <Typography variant="caption" color="text.secondary">
              Drag to update progress: 0% (Pending) → 50% (In Progress) → 100% (Completed)
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

export default AssignmentEditDialog; 