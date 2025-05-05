import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
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
  Collapse,
  Slider
} from '@mui/material';
import {
  Person,
  CalendarToday,
  Comment as CommentIcon,
  ExpandMore,
  ExpandLess,
  Send as SendIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// Define types for Assignment and Comment
interface AssignmentComment {
  id: string;
  assignmentId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
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

// For demo/mock purposes
const mockComments: AssignmentComment[] = [
  {
    id: '1',
    assignmentId: '1',
    content: 'I\'ve started working on this assignment and will provide an update by tomorrow.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  {
    id: '2',
    assignmentId: '1',
    content: 'Looking forward to your progress report. Let me know if you need any resources.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    user: {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith'
    }
  }
];

interface AssignmentCardProps {
  assignment: Assignment;
  onClick?: () => void;
  onAddComment?: (assignmentId: string, content: string) => Promise<void>;
  onUpdateProgress?: (assignmentId: string, progress: number, newStatus: Assignment['status']) => void;
}

const getStatusColor = (status: Assignment['status']) => {
  switch (status) {
    case 'PENDING':
      return 'default';
    case 'IN_PROGRESS':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'OVERDUE':
      return 'error';
    default:
      return 'default';
  }
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onClick, onAddComment, onUpdateProgress }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<AssignmentComment[]>(
    mockComments.filter(comment => comment.assignmentId === assignment.id)
  );
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [progress, setProgress] = useState<number>(() => {
    // Initialize progress based on status
    switch (assignment.status) {
      case 'COMPLETED':
        return 100;
      case 'IN_PROGRESS':
        return 50;
      case 'OVERDUE':
        return 25;
      case 'PENDING':
      default:
        return 0;
    }
  });

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || submittingComment) return;
    
    setSubmittingComment(true);
    
    try {
      // In a real app, you would call the API to add the comment
      if (onAddComment) {
        await onAddComment(assignment.id, newComment);
      }
      
      // For demo purposes, add the comment locally
      const newCommentObj: AssignmentComment = {
        id: `comment-${Date.now()}`,
        assignmentId: assignment.id,
        content: newComment,
        createdAt: new Date().toISOString(),
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setProgress(value);
    
    // Determine new status based on progress
    let newStatus: Assignment['status'] = assignment.status;
    if (value === 0) {
      newStatus = 'PENDING';
    } else if (value > 0 && value < 100) {
      newStatus = 'IN_PROGRESS';
    } else if (value === 100) {
      newStatus = 'COMPLETED';
    }
    
    // Call the onUpdateProgress handler if provided
    if (onUpdateProgress && newStatus !== assignment.status) {
      onUpdateProgress(assignment.id, value, newStatus);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Function to format comment date/time
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Function to get border color based on status
  const getBorderColor = (status: Assignment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'success.main';
      case 'OVERDUE':
        return 'error.main';
      case 'IN_PROGRESS':
        return 'primary.main';
      case 'PENDING':
        return 'warning.main';
      default:
        return 'grey.400';
    }
  };

  // Function to check if assignment is due soon (within 2 days)
  const isDueSoon = () => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  // Function to get progress color
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

  return (
    <Card
      sx={{
        borderLeft: 5,
        borderColor: getBorderColor(assignment.status),
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
            label={assignment.status.replace('_', ' ')}
            color={getStatusColor(assignment.status)}
            size="small"
          />
          {isDueSoon() && assignment.status !== 'COMPLETED' && (
            <Chip
              label="DUE SOON"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {assignment.status === 'OVERDUE' && (
          <Chip
            label="OVERDUE"
            size="small"
            color="error"
            sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}
          />
        )}

        <Typography variant="h6" component="div" sx={{ mb: 1, mt: 1 }}>
          {assignment.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {!expanded && assignment.description?.length > 100
            ? `${assignment.description.substring(0, 100)}...`
            : assignment.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            Assigned to: {`${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            Assigned by: {`${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            Due: {formatDate(assignment.dueDate)}
          </Typography>
        </Box>

        {/* Progress Slider */}
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" display="flex" justifyContent="space-between" alignItems="center">
            <span>Progress: {progress}%</span>
            <Chip 
              size="small"
              label={assignment.status.replace('_', ' ')}
              color={getProgressColor(progress)}
            />
          </Typography>
          <Slider
            value={progress}
            onChange={handleProgressChange}
            aria-labelledby="assignment-progress-slider"
            size="small"
            sx={{ mt: 1 }}
            color={getSliderColor(progress)}
          />
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
            Comments ({comments.length})
          </Typography>

          <List sx={{ maxHeight: '300px', overflow: 'auto', mb: 2 }}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {comment.user.firstName.charAt(0)}{comment.user.lastName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" fontWeight="bold">
                          {comment.user.firstName} {comment.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(comment.createdAt)}
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
                        {comment.content}
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
                    disabled={!newComment.trim() || !user || submittingComment}
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

export default AssignmentCard; 