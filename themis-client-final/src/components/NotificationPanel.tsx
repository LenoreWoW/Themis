import React from 'react';
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
  Update as UpdateIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  HowToReg as ApprovalNeededIcon
} from '@mui/icons-material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

// Define a local notification type since we don't have access to the old one
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
      return <ApproveIcon fontSize="small" />;
    case 'UPDATE_REJECTED':
    case 'CHANGE_REQUEST_REJECTED':
      return <RejectIcon fontSize="small" />;
    case 'CHANGE_REQUEST_APPROVED':
      return <ApproveIcon fontSize="small" />;
    case 'APPROVAL_NEEDED':
      return <ApprovalNeededIcon fontSize="small" />;
    default:
      return <WarningIcon fontSize="small" />;
  }
};

const NotificationPanel: React.FC = () => {
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
  
  const { showAlert } = useNotifications();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  
  const notifications = mockNotifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    // Navigate to related item if applicable
    if (notification.relatedItemId && notification.relatedItemType) {
      if (notification.relatedItemType === 'task') {
        navigate(`/tasks/${notification.relatedItemId}`);
      } else if (notification.relatedItemType === 'project') {
        navigate(`/projects/${notification.relatedItemId}`);
      }
    }
    
    handleMenuClose();
    showAlert('Notification marked as read', 'success');
  };
  
  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    handleMenuClose();
    showAlert('All notifications marked as read', 'success');
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
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
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
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            No notifications
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

export default NotificationPanel; 