import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import NotificationRulesService from '../services/NotificationRulesService';
import NotificationHandlerService from '../services/NotificationHandlerService';
import CalendarNotificationService from '../services/CalendarNotificationService';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  User
} from '../types';

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

/**
 * Component that initializes notification-related functions on application start.
 * This is a functional component that doesn't render anything visible.
 */
const NotificationInitializer: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Clear all notifications on application startup
    NotificationHandlerService.clearAllNotifications();
    
    // Start calendar notification service (if user is logged in)
    if (user) {
      try {
        CalendarNotificationService.startNotificationService();
      } catch (error) {
        console.error('Failed to start calendar notification service:', error);
      }
    }
    
    if (!user) return;
    
    // Only initialize notifications once
    const hasInitialized = localStorage.getItem('notifications_initialized');
    if (hasInitialized || !user) return;
    
    // Create some demo notifications
    const initializeNotifications = () => {
      // Create notifications for task assignments
      const demoTask = {
        id: 'task-demo-1',
        title: 'Complete weekly report',
        description: 'Finish the weekly progress report for the ERP implementation project',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        projectId: 'project-1',
        assignee: user,
        assignedBy: {
          id: 'user-manager',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          role: user.role,
          department: user.department,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          username: 'sarahjohnson'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as Task; // Double cast to avoid TypeScript error
      
      // Create task assignment notification
      const taskAssignedNotifications = NotificationRulesService.handleNewAssignment(demoTask);
      
      // Create upcoming deadline notification
      const deadlineNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        type: NotificationType.TASK_DUE_SOON,
        title: 'Task due soon',
        message: 'You have a task that is due in 2 days: "Complete weekly report"',
        relatedItemId: demoTask.id,
        relatedItemType: 'task',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      // Create approval needed notification
      const approvalNotification = {
        id: `notification-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        type: NotificationType.APPROVAL_NEEDED,
        title: 'Approval required: Project charter',
        message: 'Your approval is required for the project charter for "ERP Implementation Phase 2"',
        relatedItemId: 'project-charter-1',
        relatedItemType: 'project-charter',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      // Create weekly update due notification
      const updateNotification = {
        id: `notification-${Date.now() + 2}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        type: NotificationType.UPDATE_DUE,
        title: 'Weekly update due',
        message: 'Your weekly project update for "Mobile App Development" is due today',
        relatedItemId: 'project-2',
        relatedItemType: 'project',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      // Add all notifications
      NotificationHandlerService.addNotifications([
        ...taskAssignedNotifications,
        deadlineNotification,
        approvalNotification,
        updateNotification
      ]);
      
      // Mark as initialized
      localStorage.setItem('notifications_initialized', 'true');
    };
    
    // Initialize with a slight delay to ensure auth is fully loaded
    const timeoutId = setTimeout(initializeNotifications, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      
      // Stop calendar notification service when component unmounts
      CalendarNotificationService.stopNotificationService();
    };
  }, [user]);
  
  // This component doesn't render anything visible
  return null;
};

export default NotificationInitializer; 