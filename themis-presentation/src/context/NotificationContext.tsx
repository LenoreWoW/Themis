import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import { useAuth } from './AuthContext';

// Define the interface for the context
interface NotificationContextType {
  showAlert: (message: string, severity: AlertColor) => void;
  clearAlerts: () => void;
}

// Create the context with a default undefined value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use the notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Define the props interface for the provider
interface NotificationProviderProps {
  children: ReactNode;
}

// Notification state interface
interface Notification {
  message: string;
  severity: AlertColor;
  key: number;
}

// Provider component
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | undefined>(undefined);
  
  // Show a notification
  const showAlert = (message: string, severity: AlertColor = 'info') => {
    const newNotification: Notification = {
      message,
      severity,
      key: new Date().getTime(),
    };
    
    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
  };
  
  // Clear all notifications
  const clearAlerts = () => {
    setNotifications([]);
  };
  
  // Handle notification queue
  useEffect(() => {
    if (notifications.length > 0 && !open) {
      // Show the oldest notification
      setCurrentNotification(notifications[0]);
      setOpen(true);
      // Remove this notification from the queue
      setNotifications(notifications.slice(1));
    }
  }, [notifications, open]);
  
  // Handle notification close
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  
  return (
    <NotificationContext.Provider value={{ showAlert, clearAlerts }}>
      {children}
      {currentNotification && (
        <Snackbar
          key={currentNotification.key}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity={currentNotification.severity}
            sx={{ width: '100%' }}
          >
            {currentNotification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}

export default NotificationContext; 