import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Button,
  Box
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  TaskAlt as TaskIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  HowToReg as ApprovalNeededIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Define a notification interface for mock data
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedItemId?: string;
  relatedItemType?: string;
  createdAt: string;
}

const getNotificationIcon = (notificationType: string) => {
  switch (notificationType) {
    case 'TASK_ASSIGNED':
    case 'TASK_DUE_SOON':
    case 'TASK_OVERDUE':
      return <TaskIcon fontSize="small" />;
    case 'UPDATE_DUE':
      return <TimeIcon fontSize="small" />;
    case 'UPDATE_APPROVED':
    case 'CHANGE_REQUEST_APPROVED':
      return <ApproveIcon fontSize="small" />;
    case 'UPDATE_REJECTED':
    case 'CHANGE_REQUEST_REJECTED':
      return <RejectIcon fontSize="small" />;
    case 'APPROVAL_NEEDED':
      return <ApprovalNeededIcon fontSize="small" />;
    default:
      return <WarningIcon fontSize="small" />;
  }
};

const NotificationBell: React.FC = () => {
  // Mock data for notifications
  const mockNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Complete project documentation"',
      isRead: false,
      relatedItemId: 'task-123',
      relatedItemType: 'task',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'UPDATE_DUE',
      title: 'Weekly Update Due',
      message: 'Your weekly project update is due tomorrow',
      isRead: false,
      relatedItemId: 'project-456',
      relatedItemType: 'project',
      createdAt: new Date().toISOString()
    }
  ];
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const navigate = useNavigate();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    
    // Navigate to related item if applicable
    if (notification.relatedItemId && notification.relatedItemType) {
      if (notification.relatedItemType === 'task') {
        navigate(`/tasks/${notification.relatedItemId}`);
      } else if (notification.relatedItemType === 'project') {
        navigate(`/projects/${notification.relatedItemId}`);
      }
    }
    
    handleMenuClose();
  };
  
  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    handleMenuClose();
  };
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  };
  
  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleMenuOpen}
        aria-label="notifications"
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            width: 350,
            maxHeight: 500
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification)}
              sx={{ 
                py: 1.5,
                px: 2,
                borderLeft: notification.isRead ? 'none' : '4px solid',
                borderLeftColor: 'primary.main',
                backgroundColor: notification.isRead ? 'inherit' : 'action.hover'
              }}
            >
              <Box sx={{ mr: 1.5, color: 'text.secondary' }}>
                {getNotificationIcon(notification.type)}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" component="div">
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {formatTimeAgo(notification.createdAt)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 