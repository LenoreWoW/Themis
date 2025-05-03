import React, { useState, useEffect } from 'react';
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
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  AssignmentInd as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

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

interface AssignmentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  assignmentId: string | null;
  onEdit?: (assignment: Assignment) => void;
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

const AssignmentDetailDialog: React.FC<AssignmentDetailDialogProps> = ({ open, onClose, assignmentId, onEdit }) => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<AssignmentComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // Fetch assignment details
  useEffect(() => {
    if (open && assignmentId) {
      setLoading(true);
      
      // In a real app, you would fetch the assignment from your API
      // For now, we're simulating an API call with a timeout
      setTimeout(() => {
        // Mock data for demonstration
        const mockAssignment: Assignment = {
          id: assignmentId,
          title: 'Quarterly Report Analysis',
          description: 'Review and analyze the quarterly financial report. Identify key trends and prepare a summary for the management team.',
          status: 'IN_PROGRESS',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignedBy: {
            id: '2',
            firstName: 'Project',
            lastName: 'Manager'
          },
          assignedTo: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setAssignment(mockAssignment);
        setComments(mockComments);
        setLoading(false);
      }, 1000);
    }
  }, [open, assignmentId]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !assignment) return;
    
    setSubmittingComment(true);
    
    try {
      // In a real app, you would send the comment to your API
      // For now, we're simulating an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      setComments(prevComments => [...prevComments, newCommentObj]);
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

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', pr: 6 }}>
        <Box display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {loading ? 'Loading Assignment Details...' : assignment?.title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
        
        {/* Edit button */}
        {assignment && onEdit && (
          <IconButton
            aria-label="edit"
            onClick={() => onEdit(assignment)}
            sx={{
              position: 'absolute',
              right: 48,
              top: 8,
              color: 'white'
            }}
          >
            <EditIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : assignment ? (
          <Box>
            {/* Assignment Details Section */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {assignment.description}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={4} my={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={assignment.status.replace('_', ' ')} 
                    color={getStatusColor(assignment.status)} 
                    size="small" 
                    sx={{ mt: 0.5 }} 
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }} />
                    <Typography>
                      {assignment.dueDate && format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assigned By</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'secondary.main' }}>
                      {assignment.assignedBy?.firstName.charAt(0)}{assignment.assignedBy?.lastName.charAt(0)}
                    </Avatar>
                    <Typography>
                      {assignment.assignedBy ? `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}` : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                      {assignment.assignedTo?.firstName.charAt(0)}{assignment.assignedTo?.lastName.charAt(0)}
                    </Avatar>
                    <Typography>
                      {assignment.assignedTo ? `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}` : 'Unassigned'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Divider />

            {/* Comments Section */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <CommentIcon sx={{ mr: 1 }} />
                Comments ({comments.length})
              </Typography>
              
              <List sx={{ width: '100%', pt: 0 }}>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {comment.user.firstName.charAt(0)}{comment.user.lastName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography fontWeight="bold">
                            {comment.user.firstName} {comment.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1.5, 
                            mt: 1, 
                            bgcolor: 'background.default',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {comment.content}
                        </Paper>
                      }
                    />
                  </ListItem>
                ))}
                {comments.length === 0 && (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <Typography color="error">Assignment not found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
          <Avatar 
            sx={{ mr: 2, mt: 0.5 }}
            alt={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
          >
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Add a comment..."
            value={newComment}
            onChange={handleCommentChange}
            onKeyPress={handleKeyPress}
            disabled={!user || submittingComment}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !user || submittingComment}
                  startIcon={submittingComment ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{ ml: 1 }}
                >
                  {submittingComment ? 'Sending...' : 'Send'}
                </Button>
              )
            }}
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDetailDialog; 