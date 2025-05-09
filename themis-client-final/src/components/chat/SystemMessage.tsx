import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Check as CheckIcon, 
  BugReport as BugReportIcon, 
  Visibility as ViewIcon,
  Clear as DismissIcon
} from '@mui/icons-material';
import { ChatMessage, SystemMessageType, SystemMessageAction, DailyBriefItem } from '../../types/ChatTypes';
import { useNavigate } from 'react-router-dom';
import DailyBriefService from '../../services/DailyBriefService';
import { useAuth } from '../../hooks/useAuth';
import ReactMarkdown from 'react-markdown';

const PREFIX = 'SystemMessage';
const classes = {
  root: `${PREFIX}-root`,
  systemMessage: `${PREFIX}-systemMessage`,
  header: `${PREFIX}-header`,
  title: `${PREFIX}-title`,
  summary: `${PREFIX}-summary`,
  itemsList: `${PREFIX}-itemsList`,
  item: `${PREFIX}-item`,
  itemContent: `${PREFIX}-itemContent`,
  itemTitle: `${PREFIX}-itemTitle`,
  itemDetails: `${PREFIX}-itemDetails`,
  actionButtons: `${PREFIX}-actionButtons`,
  completedItem: `${PREFIX}-completedItem`,
  completedInfo: `${PREFIX}-completedInfo`,
  alert: `${PREFIX}-alert`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.systemMessage}`]: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    border: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.header}`]: {
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.title}`]: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  [`& .${classes.summary}`]: {
    marginBottom: theme.spacing(1),
  },
  [`& .${classes.itemsList}`]: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  [`& .${classes.item}`]: {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`& .${classes.itemContent}`]: {
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.itemTitle}`]: {
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  [`& .${classes.itemDetails}`]: {
    marginTop: theme.spacing(0.5),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  [`& .${classes.actionButtons}`]: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  [`& .${classes.completedItem}`]: {
    backgroundColor: theme.palette.success.light,
    borderColor: theme.palette.success.light,
    textDecoration: 'line-through',
    color: theme.palette.text.secondary,
  },
  [`& .${classes.completedInfo}`]: {
    fontSize: '0.75rem',
    fontStyle: 'italic',
    color: theme.palette.success.main,
    marginTop: theme.spacing(0.5),
  },
  [`& .${classes.alert}`]: {
    backgroundColor: theme.palette.error.light,
    borderColor: theme.palette.error.light,
  },
}));

interface SystemMessageProps {
  message: ChatMessage;
  currentUser: any;
}

interface IssueFormData {
  title: string;
  description: string;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ message, currentUser }) => {
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [issueFormData, setIssueFormData] = useState<IssueFormData>({
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatedItems, setUpdatedItems] = useState<Map<string, DailyBriefItem>>(new Map());
  const navigate = useNavigate();
  const { user } = useAuth();

  // Make sure the message is a system message with a payload
  if (!message.isSystemMessage || !message.systemPayload) {
    // Render as regular markdown if it's not a proper system message
    return (
      <Root className={classes.root}>
        <Paper className={classes.systemMessage} elevation={0}>
          <ReactMarkdown>{message.body}</ReactMarkdown>
        </Paper>
      </Root>
    );
  }

  const { systemPayload } = message;

  // Handle Daily Brief messages specifically
  const handleDailyBrief = () => {
    if (systemPayload.type !== SystemMessageType.DailyBrief || !systemPayload.items) {
      return null;
    }

    const tasks = systemPayload.items.filter(item => item.type === 'task');
    const alerts = systemPayload.items.filter(item => item.type === 'alert');

    return (
      <>
        <Box className={classes.header}>
          <Typography variant="h6" className={classes.title}>
            {systemPayload.title}
          </Typography>
          <Typography variant="body1" className={classes.summary}>
            {systemPayload.summary}
          </Typography>
        </Box>

        {tasks.length === 0 && alerts.length === 0 && (
          <Typography variant="body1">
            You're all caught up! No tasks or alerts for today.
          </Typography>
        )}

        {tasks.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Tasks Due Today
            </Typography>
            <Box className={classes.itemsList}>
              {tasks.map(item => {
                // Check if this item has been updated (marked as done)
                const updatedItem = updatedItems.get(item.id);
                const isCompleted = updatedItem?.isCompleted || item.isCompleted;
                
                const itemClasses = `${classes.item} ${isCompleted ? classes.completedItem : ''}`;
                
                return (
                  <Box key={item.id} className={itemClasses}>
                    <Box className={classes.itemContent}>
                      <Typography className={classes.itemTitle}>
                        {getPriorityEmoji(item.priority)} {item.title}
                      </Typography>
                      <Typography className={classes.itemDetails}>
                        Due: {formatDueTime(item.dueTime)} | Project: {item.projectName || 'N/A'} | Assigned to: {item.assigneeName}
                      </Typography>
                      {isCompleted && (
                        <Typography className={classes.completedInfo}>
                          Completed by {updatedItem?.completedBy || item.completedBy} at {formatTime(updatedItem?.completedAt || item.completedAt)}
                        </Typography>
                      )}
                    </Box>
                    {!isCompleted && (
                      <Box className={classes.actionButtons}>
                        <Tooltip title="Mark as Done">
                          <Button
                            size="small"
                            startIcon={<CheckIcon />}
                            variant="outlined"
                            color="success"
                            onClick={() => handleAction(SystemMessageAction.MarkDone, item.id)}
                          >
                            Mark Done
                          </Button>
                        </Tooltip>
                        <Tooltip title="Report Issue">
                          <Button
                            size="small"
                            startIcon={<BugReportIcon />}
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenReportIssue(item.id)}
                          >
                            Report Issue
                          </Button>
                        </Tooltip>
                        {item.projectId && (
                          <Tooltip title="View Task">
                            <Button
                              size="small"
                              startIcon={<ViewIcon />}
                              variant="outlined"
                              onClick={() => handleAction(SystemMessageAction.ViewTask, item.id)}
                            >
                              View
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {alerts.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom sx={{ mt: 2 }}>
              Urgent Alerts
            </Typography>
            <Box className={classes.itemsList}>
              {alerts.map(item => (
                <Box key={item.id} className={`${classes.item} ${classes.alert}`}>
                  <Box className={classes.itemContent}>
                    <Typography className={classes.itemTitle}>
                      🚨 {item.title}
                    </Typography>
                    <Typography className={classes.itemDetails}>
                      Project: {item.projectName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box className={classes.actionButtons}>
                    <Button
                      size="small"
                      startIcon={<BugReportIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenReportIssue(item.id)}
                    >
                      Report Issue
                    </Button>
                    {item.projectId && (
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        variant="outlined"
                        onClick={() => handleViewProject(item.projectId!)}
                      >
                        View Project
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<DismissIcon />}
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleAction(SystemMessageAction.Dismiss, item.id)}
                    >
                      Dismiss
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </>
    );
  };

  const handleOpenReportIssue = (itemId: string) => {
    setSelectedItemId(itemId);
    
    // Find the item to pre-fill the form
    const item = findItemById(itemId);
    if (item) {
      setIssueFormData({
        title: `Issue with: ${item.title}`,
        description: `Issue reported from Daily Brief task: ${item.title}\n\n`,
      });
    }
    
    setReportIssueOpen(true);
  };

  const handleCloseReportIssue = () => {
    setReportIssueOpen(false);
    setSelectedItemId('');
    setError(null);
  };

  const handleSubmitIssue = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const dailyBriefService = DailyBriefService.getInstance();
      const result = await DailyBriefService.createIssueFromItem(selectedItemId, issueFormData);
      
      if (result.success) {
        handleCloseReportIssue();
        setSuccessMessage('Issue created successfully!');
      } else {
        setError(result.error || 'Failed to create issue');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error creating issue:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueFormChange = (field: keyof IssueFormData, value: string) => {
    setIssueFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAction = async (action: SystemMessageAction, itemId: string) => {
    try {
      const dailyBriefService = DailyBriefService.getInstance();
      
      if (action === SystemMessageAction.ViewTask) {
        const item = findItemById(itemId);
        if (item && item.projectId) {
          navigate(`/projects/${item.projectId}`);
          return;
        }
      }
      
      const result = await DailyBriefService.handleAction(action, itemId, message.id, message.channelId);
      
      if (result.success) {
        // If the action was successful, update the local state
        if (action === SystemMessageAction.MarkDone) {
          // Mark the item as completed in the local state
          const updatedMap = new Map(updatedItems);
          const currentItem = message.systemPayload?.items.find(item => item.id === itemId);
          
          if (currentItem) {
            updatedMap.set(itemId, {
              ...currentItem,
              isCompleted: true,
              completedBy: `${user?.firstName} ${user?.lastName}`,
              completedAt: new Date().toISOString()
            });
            
            setUpdatedItems(updatedMap);
            
            // Show success message if available
            if (result.message) {
              setSuccessMessage(result.message);
              setTimeout(() => setSuccessMessage(null), 3000);
            }
          }
        }
      } else {
        setError(result.message || 'Action failed');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error handling action:', error);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const findItemById = (itemId: string): DailyBriefItem | undefined => {
    if (!systemPayload.items) {
      return undefined;
    }
    
    // Check first in updated items
    const updatedItem = updatedItems.get(itemId);
    if (updatedItem) {
      return updatedItem;
    }
    
    // Then check in original items
    return systemPayload.items.find(item => item.id === itemId);
  };

  const formatDueTime = (dueTime?: string): string => {
    if (!dueTime) {
      return 'End of day';
    }
    
    try {
      return new Date(dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return dueTime;
    }
  };

  const formatTime = (time?: string): string => {
    if (!time) {
      return '';
    }
    
    try {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return time;
    }
  };

  const getPriorityEmoji = (priority?: string): string => {
    if (!priority) return '';
    
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟠';
      case 'LOW':
        return '🟢';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (systemPayload.type) {
      case SystemMessageType.DailyBrief:
        return handleDailyBrief();
      case SystemMessageType.Alert:
        // Could handle alerts differently if needed
        return (
          <Box className={`${classes.item} ${classes.alert}`}>
            <Typography variant="h6" className={classes.title}>
              {systemPayload.title}
            </Typography>
            <Typography variant="body1">{systemPayload.summary}</Typography>
          </Box>
        );
      case SystemMessageType.Notification:
      default:
        // Fallback to simple display for other system message types
        return (
          <Box>
            <Typography variant="h6" className={classes.title}>
              {systemPayload.title}
            </Typography>
            <Typography variant="body1">{systemPayload.summary}</Typography>
          </Box>
        );
    }
  };

  return (
    <Root className={classes.root}>
      <Paper className={classes.systemMessage} elevation={0}>
        {renderContent()}
      </Paper>

      {/* Report Issue Dialog */}
      <Dialog open={reportIssueOpen} onClose={handleCloseReportIssue} maxWidth="sm" fullWidth>
        <DialogTitle>Report an Issue</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TextField
              label="Issue Title"
              fullWidth
              value={issueFormData.title}
              onChange={(e) => handleIssueFormChange('title', e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={issueFormData.description}
              onChange={(e) => handleIssueFormChange('description', e.target.value)}
              margin="normal"
              variant="outlined"
              helperText="Please provide details about this issue"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportIssue} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitIssue} 
            color="primary" 
            variant="contained"
            disabled={submitting || !issueFormData.title || !issueFormData.description}
          >
            {submitting ? 'Submitting...' : 'Submit Issue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default SystemMessage; 