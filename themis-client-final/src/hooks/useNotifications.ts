import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../services/NotificationHandlerService';
import NotificationHandlerService from '../services/NotificationHandlerService';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refetchNotifications: () => void;
}

/**
 * Hook to handle notifications for the current user
 */
const useNotifications = (userId?: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch notifications
  const fetchNotifications = useCallback(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const userNotifications = NotificationHandlerService.getUserNotifications(userId);
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(notification => !notification.isRead).length);
  }, [userId]);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (!notificationId) return;
    
    const success = NotificationHandlerService.markAsRead(notificationId);
    if (success) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (!userId) return;
    
    const success = NotificationHandlerService.markAllAsRead(userId);
    if (success) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Initial load of notifications
  useEffect(() => {
    fetchNotifications();
  }, [userId, fetchNotifications]);

  // Poll for new notifications (in a real app this would be replaced with WebSockets or SSE)
  useEffect(() => {
    if (!userId) return;
    
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetchNotifications: fetchNotifications
  };
};

export default useNotifications; 