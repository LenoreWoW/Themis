import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  LinearProgress, 
  Collapse, 
  Divider, 
  TextField, 
  Button, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  IconButton,
  Paper,
  Slider,
  Tooltip as MuiTooltip
} from '@mui/material';
import { 
  CalendarToday, 
  Person, 
  Comment as CommentIcon, 
  ExpandMore, 
  ExpandLess,
  Send as SendIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, TaskComment } from '../../types';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onAddComment?: (taskId: string, comment: string) => Promise<void>;
  onUpdateProgress?: (taskId: string, progress: number, newStatus: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onAddComment, onUpdateProgress }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<TaskComment[]>(task.comments || []);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || submitting) return;
    
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

  // Calculate days until deadline
  const calculateDaysUntilDeadline = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine card border color based on deadline
  const getBorderColor = () => {
    if (task.status === TaskStatus.DONE) return 'success.main';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return 'error.main'; // Overdue
    if (daysLeft <= 2) return 'warning.main'; // Close to deadline
    if (daysLeft <= 5) return 'info.main'; // Approaching deadline
    return 'primary.main'; // Plenty of time
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

  // Calculate progress based on task status
  const calculateProgress = () => {
    switch (task.status) {
      case TaskStatus.TODO: return 0;
      case TaskStatus.IN_PROGRESS: return 50;
      case TaskStatus.REVIEW: return 80;
      case TaskStatus.DONE: return 100;
      default: return 0;
    }
  };

  const [progressValue, setProgressValue] = useState<number>(calculateProgress());

  useEffect(() => {
    setProgressValue(calculateProgress());
  }, [task.status]);

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    event.stopPropagation(); // Prevent card click when changing progress
    
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setProgressValue(value);
    
    if (!onUpdateProgress) return;
    
    // Determine the new task status based on progress value
    let newStatus = task.status;
    if (value === 0) {
      newStatus = TaskStatus.TODO;
    } else if (value > 0 && value < 50) {
      newStatus = TaskStatus.IN_PROGRESS;
    } else if (value >= 50 && value < 100) {
      newStatus = TaskStatus.REVIEW;
    } else if (value === 100) {
      newStatus = TaskStatus.DONE;
    }
    
    onUpdateProgress(task.id, value, newStatus);
  };

  return (
    <Card 
      sx={{ 
        borderLeft: 5, 
        borderColor: getBorderColor(),
        cursor: onClick && !expanded ? 'pointer' : 'default',
        '&:hover': !expanded && onClick ? { 
          transform: 'translateY(-4px)',
          boxShadow: 3,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
        } : {},
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={expanded ? undefined : onClick}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip 
            label={task.status} 
            size="small" 
            color={getStatusColor(task.status)}
          />
          <Chip 
            label={task.priority} 
            size="small" 
            color={getPriorityColor(task.priority)}
            variant="outlined"
          />
        </Box>

        {calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE && (
          <Chip 
            label="OVERDUE" 
            size="small" 
            color="error"
            sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}
          />
        )}

        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {task.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {!expanded && task.description?.length > 100 
            ? `${task.description.substring(0, 100)}...` 
            : task.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatDate(task.startDate)} - {formatDate(task.dueDate)}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <Typography 
              variant="body2" 
              color={calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE ? 'error.main' : 'text.secondary'}
              fontWeight={calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE ? 'bold' : 'normal'}
            >
              {getDeadlineMessage()}
            </Typography>
          </Box>
          
          {/* Replace the LinearProgress with a Slider when onUpdateProgress is provided */}
          {onUpdateProgress ? (
            <MuiTooltip title={`${progressValue}% complete`}>
              <Slider
                value={progressValue}
                onChange={handleProgressChange}
                aria-labelledby="task-progress-slider"
                size="small"
                step={10}
                marks
                min={0}
                max={100}
                sx={{ height: 8, pt: 1, pb: 1 }}
                color={task.status === TaskStatus.DONE ? 'success' : 
                      calculateDaysUntilDeadline() < 0 ? 'error' : 
                      calculateDaysUntilDeadline() <= 2 ? 'warning' : 'primary'}
                onClick={(e) => e.stopPropagation()}
              />
            </MuiTooltip>
          ) : (
            <LinearProgress 
              variant="determinate" 
              value={getProgress()} 
              color={task.status === TaskStatus.DONE ? 'success' : 
                    calculateDaysUntilDeadline() < 0 ? 'error' : 
                    calculateDaysUntilDeadline() <= 2 ? 'warning' : 'primary'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          )}
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 2, 
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 1
          }}
        >
          <IconButton 
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
            sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </CardContent>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" display="flex" alignItems="center" gutterBottom>
            <CommentIcon sx={{ mr: 1, fontSize: 'small' }} />
            Comments ({localComments.length})
          </Typography>
          
          <List sx={{ maxHeight: '300px', overflow: 'auto', mb: 2 }}>
            {localComments.length > 0 ? (
              localComments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" fontWeight="bold">
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
                          p: 1, 
                          mt: 0.5, 
                          bgcolor: 'background.default',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.875rem'
                        }}
                      >
                        {comment.text}
                      </Paper>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            )}
          </List>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar 
              sx={{ mr: 1, width: 32, height: 32, fontSize: '0.875rem' }}
              alt={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={handleCommentChange}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.875rem' }}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || !user || submitting}
                    startIcon={<SendIcon />}
                    sx={{ ml: 1, mt: 0.5 }}
                  >
                    Send
                  </Button>
                )
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};

export default TaskCard; 