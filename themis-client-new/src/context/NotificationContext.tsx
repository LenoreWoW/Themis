import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'approval_needed' | 'approval_granted' | 'approval_rejected' | 'task_overdue' | 'update_needed' | 'system';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  projectId?: string;
  taskId?: string;
  approvalId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: AlertColor}>({
    open: false,
    message: '',
    severity: 'info'
  });
  const { token, user } = useAuth();
  
  // This would fetch notifications from the API in a real implementation
  useEffect(() => {
    if (!token || !user) return;
    
    // Mock notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'approval_needed',
        title: 'Approval Needed',
        message: 'Project "Digital Transformation" requires your approval',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        read: false,
        projectId: '1',
      },
      {
        id: '2',
        type: 'task_overdue',
        title: 'Task Overdue',
        message: 'Task "Update Database Schema" is overdue',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        read: true,
        projectId: '1',
        taskId: '5',
      },
      {
        id: '3',
        type: 'update_needed',
        title: 'Weekly Update Required',
        message: 'Weekly update for "Infrastructure Upgrade" is due',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        read: false,
        projectId: '2',
      },
    ];
    
    setNotifications(mockNotifications);
  }, [token, user]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show snackbar for new notification
    setSnackbar({
      open: true,
      message: notification.message,
      severity: getSeverity(notification.type),
    });
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  const getSeverity = (type: Notification['type']): AlertColor => {
    switch (type) {
      case 'approval_needed':
      case 'update_needed':
        return 'info';
      case 'approval_granted':
        return 'success';
      case 'approval_rejected':
      case 'task_overdue':
        return 'error';
      default:
        return 'info';
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      
      {/* Snackbar for new notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 