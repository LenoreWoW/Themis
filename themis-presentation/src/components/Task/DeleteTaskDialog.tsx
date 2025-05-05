import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Task } from '../../types';

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
  task: Task;
}

const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  open,
  onClose,
  onConfirm,
  task
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    
    try {
      await onConfirm(task.id);
      onClose();
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Task</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete the following task?
        </Typography>
        
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, my: 2 }}>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="error" fontWeight="medium">
          This action cannot be undone.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={20} /> : null}
        >
          {deleting ? 'Deleting...' : 'Delete Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTaskDialog; 