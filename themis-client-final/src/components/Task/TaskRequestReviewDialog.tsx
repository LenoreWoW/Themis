import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import { useTaskRequests } from '../../context/TaskRequestContext';
import { useAuth } from '../../context/AuthContext';
import { TaskRequest, TaskRequestStatus } from '../../types';
import { canApproveProjects } from '../../utils/permissions';

interface TaskRequestReviewDialogProps {
  open: boolean;
  onClose: () => void;
  request: TaskRequest;
}

const TaskRequestReviewDialog: React.FC<TaskRequestReviewDialogProps> = ({
  open,
  onClose,
  request
}) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const { approveTaskRequest, rejectTaskRequest } = useTaskRequests();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReview = user?.role ? canApproveProjects(user.role) : false;

  const handleApprove = async () => {
    if (!request.id) return;
    
    try {
      setIsSubmitting(true);
      await approveTaskRequest(request.id);
      onClose();
    } catch (err) {
      console.error('Error approving task request:', err);
      setError('Failed to approve the task request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!request.id || !reviewNotes) {
      setError('Please provide rejection notes');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await rejectTaskRequest(request.id, reviewNotes);
      onClose();
    } catch (err) {
      console.error('Error rejecting task request:', err);
      setError('Failed to reject the task request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: TaskRequestStatus): 'success' | 'error' | 'info' | 'warning' => {
    switch (status) {
      case TaskRequestStatus.APPROVED: return 'success';
      case TaskRequestStatus.REJECTED: return 'error';
      case TaskRequestStatus.IN_REVIEW: return 'info';
      case TaskRequestStatus.PENDING:
      default: return 'warning';
    }
  };

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Review Task Request
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">
              {request.title}
            </Typography>
            <Chip
              label={request.status}
              color={getStatusColor(request.status)}
              size="small"
            />
          </Stack>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {request.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Requested By
            </Typography>
            <Typography>
              {request.requestedBy?.firstName || 'Unknown'} {request.requestedBy?.lastName || ''}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Project
              </Typography>
              <Typography>
                {request.projectId || 'N/A'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Priority
              </Typography>
              <Typography>
                {request.priority || 'N/A'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Due Date
              </Typography>
              <Typography>
                {formatDate(request.dueDate)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Requested On
              </Typography>
              <Typography>
                {formatDate(request.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {canReview && request.status === TaskRequestStatus.PENDING && (
          <TextField
            label="Review Notes"
            multiline
            rows={4}
            fullWidth
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Enter your notes for approving or rejecting this request"
            variant="outlined"
            sx={{ mt: 2 }}
            error={!!error}
            helperText={error}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {canReview && request.status === TaskRequestStatus.PENDING && (
          <>
            <Button
              onClick={handleReject}
              color="error"
              disabled={!reviewNotes || isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Reject'}
            </Button>
            <Button
              onClick={handleApprove}
              color="primary"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Approve'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskRequestReviewDialog; 