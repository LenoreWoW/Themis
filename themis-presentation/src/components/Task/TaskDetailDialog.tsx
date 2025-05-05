import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  TextField,
  IconButton
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Comment as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, TaskComment } from '../../types';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { formatEnumValue } from '../../utils/helpers';

interface TaskDetailDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAddComment?: (taskId: string, comment: string) => Promise<void>;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
  onAddComment
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<TaskComment[]>(
    task && task.comments ? task.comments : []
  );

  // Guard against null task
  if (!task) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Task Details</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Task not found or still loading...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || submitting || !task) return;
    
    try {
      setSubmitting(true);
      
      if (onAddComment) {
        await onAddComment(task.id, newComment);
      }
      
      // For demo purposes, add the comment locally
      const newCommentObj: TaskComment = {
        id: `comment-${Date.now()}`,
        taskId: task.id,
        text: newComment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
      
      setLocalComments([...localComments, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.IN_PROGRESS: return 'primary';
      case TaskStatus.REVIEW: return 'warning';
      case TaskStatus.DONE: return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'success';
      case TaskPriority.MEDIUM: return 'warning';
      case TaskPriority.HIGH: return 'error';
      default: return 'default';
    }
  };

  // Calculate days until deadline
  const calculateDaysUntilDeadline = () => {
    try {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  // Determine deadline message
  const getDeadlineMessage = () => {
    if (!task.dueDate) return 'No deadline set';
    if (task.status === TaskStatus.DONE) return 'Completed';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} days`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    return `${daysLeft} days left`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Task Details</Typography>
        <Box>
          {onEdit && (
            <IconButton onClick={() => onEdit(task.id)} color="primary" sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
          )}
          {onDelete && (
            <IconButton onClick={() => onDelete(task.id)} color="error">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Chip 
              label={formatEnumValue(String(task.status))} 
              color={getStatusColor(task.status)}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={formatEnumValue(String(task.priority || 'MEDIUM'))} 
              color={getPriorityColor(task.priority as any || 'MEDIUM' as any)}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {task.title}
          </Typography>
          
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {task.description}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                <Typography variant="body2" color="text.secondary" component="span">
                  Assignee:
                </Typography>{' '}
                {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                <Typography variant="body2" color="text.secondary" component="span">
                  Timeframe:
                </Typography>{' '}
                {task.startDate ? formatDate(task.startDate) : 'Not set'} - {task.dueDate ? formatDate(task.dueDate) : 'Not set'}
                {' '}
                <Chip 
                  label={getDeadlineMessage()} 
                  size="small" 
                  color={
                    task.status === TaskStatus.DONE ? 'success' : 
                    calculateDaysUntilDeadline() < 0 ? 'error' : 
                    calculateDaysUntilDeadline() <= 2 ? 'warning' : 'default'
                  }
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
          <CommentIcon sx={{ mr: 1 }} />
          Comments
        </Typography>
        
        <List sx={{ mb: 2 }}>
          {localComments && localComments.length > 0 ? (
            localComments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar>
                    {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle2">
                        {comment.author.firstName} {comment.author.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(comment.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        bgcolor: 'background.default',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {comment.text}
                    </Paper>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography color="text.secondary">
                No comments yet. Add the first comment!
              </Typography>
            </Paper>
          )}
        </List>
        
        {onAddComment && user && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ mr: 2, mt: 1 }}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Avatar>
            <TextField
              fullWidth
              label="Add a comment"
              multiline
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={submitting}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    endIcon={<SendIcon />}
                    sx={{ mt: 1 }}
                  >
                    Post
                  </Button>
                )
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailDialog; 