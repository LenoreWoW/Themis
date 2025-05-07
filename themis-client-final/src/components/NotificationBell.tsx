import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover
} from '@mui/material';
import {
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import NotificationPanel from './NotificationPanel';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleOpen}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <NotificationPanel onClose={handleClose} />
      </Popover>
    </>
  );
};

export default NotificationBell; 