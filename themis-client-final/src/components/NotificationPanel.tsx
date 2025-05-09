import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import FeatureFlagService, { FeatureFlag } from '../services/FeatureFlagService';
import '../styles/notification-highlight.css';

// Local definition since imports are having issues
enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  APPROVAL_NEEDED = 'APPROVAL_NEEDED',
  CHANGE_REQUEST_APPROVED = 'CHANGE_REQUEST_APPROVED',
  CHANGE_REQUEST_REJECTED = 'CHANGE_REQUEST_REJECTED',
  UPDATE_DUE = 'UPDATE_DUE',
  GENERAL = 'GENERAL'
}

interface NotificationPanelProps {
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.TASK_ASSIGNED:
      return '📋';
    case NotificationType.TASK_DUE_SOON:
      return '⏰';
    case NotificationType.TASK_OVERDUE:
      return '⚠️';
    case NotificationType.APPROVAL_NEEDED:
      return '✅';
    case NotificationType.CHANGE_REQUEST_APPROVED:
      return '✅';
    case NotificationType.CHANGE_REQUEST_REJECTED:
      return '❌';
    case NotificationType.UPDATE_DUE:
      return '📅';
    default:
      return '📌';
  }
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { notifications, markAllAsRead, markAsRead, refetchNotifications } = useNotifications(user?.id);
  const navigate = useNavigate();
  const [localNotifications, setLocalNotifications] = useState([...notifications]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [isEnhancedNotifications, setIsEnhancedNotifications] = useState(false);
  
  // Check if enhanced notifications are enabled
  useEffect(() => {
    const featureFlagService = FeatureFlagService.getInstance();
    const isEnabled = featureFlagService.isEnabled(FeatureFlag.ENHANCED_NOTIFICATIONS, user?.id);
    setIsEnhancedNotifications(isEnabled);
    
    // Track view for analytics
    if (isEnabled) {
      featureFlagService.trackView(FeatureFlag.ENHANCED_NOTIFICATIONS);
    }
  }, [user?.id]);
  
  // Update local notifications when the original list changes
  useEffect(() => {
    setLocalNotifications([...notifications]);
  }, [notifications]);

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Format the notification timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return timestamp;
    }
  };

  // Trigger navigation based on notification data
  const navigateToTarget = (notification: any) => {
    // Close the notification panel
    onClose();
    
    // Navigate to the appropriate page based on notification type and related item
    if (notification.relatedItemId && notification.relatedItemType) {
      switch (notification.relatedItemType.toLowerCase()) {
        case 'task':
          navigate(`/tasks?id=${notification.relatedItemId}`);
          // Highlight the target task on the page
          setTimeout(() => {
            const element = document.getElementById(`task-${notification.relatedItemId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlight-item');
              setTimeout(() => element.classList.remove('highlight-item'), 3000);
            }
          }, 500);
          break;
        case 'assignment':
          navigate(`/assignments?id=${notification.relatedItemId}`);
          break;
        case 'project':
          navigate(`/projects/${notification.relatedItemId}`);
          break;
        case 'request':
        case 'changerequest':
          navigate(`/requests?id=${notification.relatedItemId}`);
          break;
        case 'approval':
          navigate(`/approvals?id=${notification.relatedItemId}`);
          break;
        case 'update':
          navigate(`/projects/${notification.relatedItemId}?tab=updates`);
          break;
        default:
          // If we don't have a specific mapping, try a generic approach
          navigate(`/${notification.relatedItemType.toLowerCase()}s?id=${notification.relatedItemId}`);
      }
    } else {
      // For notifications without a specific related item, navigate based on type
      switch (notification.type) {
        case NotificationType.TASK_ASSIGNED:
        case NotificationType.TASK_DUE_SOON:
        case NotificationType.TASK_OVERDUE:
          navigate('/tasks');
          break;
        case NotificationType.APPROVAL_NEEDED:
        case NotificationType.CHANGE_REQUEST_APPROVED:
        case NotificationType.CHANGE_REQUEST_REJECTED:
          navigate('/approvals');
          break;
        case NotificationType.UPDATE_DUE:
          navigate('/projects');
          break;
        default:
          // For general notifications, just close the panel
          break;
      }
    }
  };

  // Legacy notification click handler (when enhanced notifications are disabled)
  const handleLegacyNotificationClick = (notification: any) => {
    // Mark the notification as read when clicked
    markAsRead(notification.id);
    
    // Navigate to the target page
    navigateToTarget(notification);
  };

  // Enhanced notification click handler - marks as read and navigates in one action
  const handleEnhancedNotificationClick = (notification: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent any parent click handlers

    // Optimistically update UI by removing from local state
    setLocalNotifications(prev => prev.filter(n => n.id !== notification.id));
    
    // Mark notification as read
    try {
      markAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Show error toast but don't prevent navigation
      setSnackbarMessage("Couldn't update notification—but you can still continue.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      // Refetch to ensure state is consistent
      setTimeout(() => refetchNotifications(), 2000);
    }
    
    // Navigate to the target page
    navigateToTarget(notification);
  };

  // Handle dismiss button click - marks as read without navigation
  const handleDismiss = (notification: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent parent click handlers
    
    // Track dismiss for analytics
    const featureFlagService = FeatureFlagService.getInstance();
    featureFlagService.trackDismiss(FeatureFlag.ENHANCED_NOTIFICATIONS);
    
    // Optimistically update UI
    setLocalNotifications(prev => prev.filter(n => n.id !== notification.id));
    
    // Try to mark as read
    try {
      markAsRead(notification.id);
      
      // Show success toast
      setSnackbarMessage("Notification dismissed");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error dismissing notification:', error);
      
      // Show error toast
      setSnackbarMessage("Couldn't dismiss notification. Please try again.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      // Revert the optimistic update
      setTimeout(() => refetchNotifications(), 1000);
    }
  };

  // Close the snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Use local notifications state that updates optimistically
  const displayNotifications = localNotifications.length > 0 ? localNotifications : notifications;

  // Determine the click handler based on feature flag
  const handleNotificationClick = isEnhancedNotifications
    ? handleEnhancedNotificationClick
    : handleLegacyNotificationClick;

  return (
    <Paper elevation={3} sx={{ width: 400, maxHeight: '80vh', overflowY: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        {displayNotifications.length > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />
      
      {displayNotifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No notifications
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {displayNotifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  backgroundColor: notification.isRead ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'background-color 0.3s',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  },
                  paddingRight: isEnhancedNotifications ? '48px' : '16px', // Room for dismiss button if enhanced
                  position: 'relative'
                }}
                button
                onClick={isEnhancedNotifications 
                  ? (e) => handleEnhancedNotificationClick(notification, e)
                  : () => handleLegacyNotificationClick(notification)
                }
                role="button"
                aria-label={`View ${notification.title}`}
                className="notification-item"
              >
                <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'block' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatTimestamp(notification.createdAt)}
                      </Typography>
                    </React.Fragment>
                  }
                />
                {isEnhancedNotifications && (
                  <Tooltip title="Dismiss notification">
                    <IconButton
                      size="small"
                      aria-label="Dismiss notification"
                      onClick={(e) => handleDismiss(notification, e)}
                      className="notification-dismiss-button"
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 'calc(50% - 12px)',
                      }}
                    >
                      <CloseIcon fontSize="small" />
                      <span className="sr-only">Dismiss {notification.title}</span>
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Close</Button>
      </Box>

      {/* Toast notification for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default NotificationPanel; 