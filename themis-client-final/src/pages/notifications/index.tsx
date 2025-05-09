import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import NotificationHandlerService from '../../services/NotificationHandlerService';

// Setup dayjs for relative time
dayjs.extend(relativeTime);

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications, markAsRead, unreadCount, refetchNotifications } = useNotifications(user?.id);
  
  // Handle notification deletion manually
  const handleDeleteNotification = (id: string) => {
    // In a production app, you would call a service method here
    // For now, we'll just refresh notifications after manual deletion
    console.log(`Deleting notification ${id}`);
    refetchNotifications();
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
            <NotificationsIcon fontSize="large" color="primary" />
          </Badge>
          <Typography variant="h5" component="h1">
            {t('notifications.title', 'Notifications')}
          </Typography>
        </Box>
        
        {notifications.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 6
          }}>
            <NotificationsActiveIcon color="disabled" sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              {t('notifications.noNotifications', 'No notifications yet')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  secondaryAction={
                    <Box>
                      <Tooltip title={t('common.markAsRead', 'Mark as read')}>
                        <IconButton 
                          edge="end" 
                          onClick={() => markAsRead(notification.id)}
                          disabled={notification.isRead}
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon color={notification.isRead ? 'disabled' : 'primary'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete', 'Delete')}>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemAvatar>
                    <Avatar alt="System">
                      S
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {dayjs(notification.createdAt).fromNow()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationsPage; 