import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
  Grid,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Edit as EditIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Assignment as TaskIcon,
  PriorityHigh as PriorityIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface TaskDetailDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onAddComment: (taskId: string, comment: string) => Promise<void>;
}

// Define local interface for comments to avoid TypeScript errors
interface TaskComment {
  id: string;
  taskId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  task,
  onClose,
  onEdit,
  onAddComment
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setNewComment('');
    }
  }, [open]);

  if (!task) {
    return null;
  }

  // Calculate days until deadline
  const calculateDaysUntilDeadline = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status chip color
  const getStatusColor = (status: TaskStatus) => {
    // Check if task is overdue first
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0 && status !== TaskStatus.DONE) return 'error';
    
    // Default status colors
    switch (status) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.IN_PROGRESS: return 'primary';
      case TaskStatus.REVIEW: return 'warning';
      case TaskStatus.DONE: return 'success';
      default: return 'default';
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'success';
      case TaskPriority.MEDIUM: return 'warning';
      case TaskPriority.HIGH: return 'error';
      default: return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for comments
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Determine deadline message
  const getDeadlineMessage = () => {
    if (task.status === TaskStatus.DONE) return 'Completed';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} days`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    return `${daysLeft} days left`;
  };

  // Calculate progress
  const getProgress = () => {
    switch (task.status) {
      case TaskStatus.TODO: return 0;
      case TaskStatus.IN_PROGRESS: return 50;
      case TaskStatus.REVIEW: return 80;
      case TaskStatus.DONE: return 100;
      default: return 0;
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || submitting) return;
    
    try {
      setSubmitting(true);
      await onAddComment(task.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user can add comments
  const canAddComments = () => {
    if (!user) return false;
    
    // Allow task creator (if we have that info), assignee, and admin to add comments
    // For now, we'll just allow any logged-in user to comment
    return true;
  };

  // Get comments (with type safety)
  const getComments = (): TaskComment[] => {
    // Handle case where comments are not defined in the Task interface
    // Safe fallback to an empty array
    return ((task as any).comments || []) as TaskComment[];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Task Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          sx={{ position: 'absolute', right: 50, top: 8 }}
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" gutterBottom>
            {task.title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={task.status} 
                  color={getStatusColor(task.status)}
                />
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Chip 
                  label={task.priority} 
                  color={getPriorityColor(task.priority)}
                />
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Assignee</Typography>
                <Typography>
                  {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Deadline Status</Typography>
                <Typography 
                  color={calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE ? 'error' : 'text.primary'}
                  fontWeight={calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE ? 'bold' : 'normal'}
                >
                  {getDeadlineMessage()}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Description</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1">
                {task.description || 'No description provided.'}
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Start: {formatDate(task.startDate)} - Due: {formatDate(task.dueDate)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={getProgress()} 
              color={task.status === TaskStatus.DONE ? 'success' : 
                    calculateDaysUntilDeadline() < 0 ? 'error' : 
                    calculateDaysUntilDeadline() <= 2 ? 'warning' : 'primary'}
              sx={{ height: 8, borderRadius: 4, mt: 1 }}
            />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          
          {canAddComments() && (
            <Box sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
              <Avatar 
                sx={{ mr: 2, bgcolor: 'primary.main' }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      color="primary" 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submitting}
                      edge="end"
                    >
                      <SendIcon />
                    </IconButton>
                  )
                }}
              />
            </Box>
          )}
          
          <List>
            {getComments().length > 0 ? (
              getComments().map((comment: TaskComment) => (
                <ListItem 
                  key={comment.id}
                  alignItems="flex-start"
                  sx={{ 
                    mb: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {comment.author.firstName.charAt(0)}
                      {comment.author.lastName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">
                          {comment.author.firstName} {comment.author.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(comment.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'inline', whiteSpace: 'pre-wrap' }}
                      >
                        {comment.text}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography color="text.secondary">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailDialog; 