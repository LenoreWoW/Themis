import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

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
  const { notifications, markAllAsRead, markAsRead } = useNotifications(user?.id);
  const navigate = useNavigate();

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

  // Navigate to the appropriate detail view based on notification type and related item
  const handleNotificationClick = (notification: any) => {
    // Mark the notification as read when clicked
    markAsRead(notification.id);
    
    // Close the notification panel
    onClose();
    
    // Navigate to the appropriate page based on notification type and related item
    if (notification.relatedItemId && notification.relatedItemType) {
      switch (notification.relatedItemType.toLowerCase()) {
        case 'task':
          navigate(`/tasks?id=${notification.relatedItemId}`);
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

  return (
    <Paper elevation={3} sx={{ width: 400, maxHeight: '80vh', overflowY: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        {notifications.length > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />
      
      {notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No notifications
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  backgroundColor: notification.isRead ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'background-color 0.3s',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleNotificationClick(notification)}
                button
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
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Paper>
  );
};

export default NotificationPanel; 