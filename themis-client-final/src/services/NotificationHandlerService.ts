import { User } from '../types';
import { NotificationType } from './NotificationRulesService';

// Define the Notification interface locally
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedItemId?: string;
  relatedItemType?: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Service to manage the application's notification storage and delivery
 * This is a mock implementation that would be replaced with a real backend service
 */
export class NotificationHandlerService {
  private static readonly NOTIFICATIONS_STORAGE_KEY = 'app_notifications';
  private static readonly MAX_NOTIFICATIONS = 50; // Maximum number of notifications to store per user

  /**
   * Clear all notifications from storage
   */
  public static clearAllNotifications(): void {
    try {
      localStorage.removeItem(this.NOTIFICATIONS_STORAGE_KEY);
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get all notifications for a specific user
   */
  public static getUserNotifications(userId: string): Notification[] {
    if (!userId) return [];
    
    const allNotifications = this.getAllNotifications();
    return allNotifications.filter(notification => notification.userId === userId);
  }
  
  /**
   * Get unread notifications count for a specific user
   */
  public static getUnreadCount(userId: string): number {
    const userNotifications = this.getUserNotifications(userId);
    return userNotifications.filter(notification => !notification.isRead).length;
  }

  /**
   * Mark a specific notification as read
   */
  public static markAsRead(notificationId: string): boolean {
    if (!notificationId) return false;
    
    const allNotifications = this.getAllNotifications();
    const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) return false;
    
    allNotifications[notificationIndex] = {
      ...allNotifications[notificationIndex],
      isRead: true
    };
    
    this.saveAllNotifications(allNotifications);
    return true;
  }

  /**
   * Mark all notifications as read for a specific user
   */
  public static markAllAsRead(userId: string): boolean {
    if (!userId) return false;
    
    const allNotifications = this.getAllNotifications();
    let changed = false;
    
    const updatedNotifications = allNotifications.map(notification => {
      if (notification.userId === userId && !notification.isRead) {
        changed = true;
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    if (changed) {
      this.saveAllNotifications(updatedNotifications);
    }
    
    return changed;
  }

  /**
   * Add a single notification
   */
  public static addNotification(notification: Notification): boolean {
    if (!notification || !notification.userId) return false;
    
    const allNotifications = this.getAllNotifications();
    
    // Add the new notification
    allNotifications.push(notification);
    
    // Limit the number of notifications per user
    const userNotifications = allNotifications.filter(n => n.userId === notification.userId);
    
    if (userNotifications.length > this.MAX_NOTIFICATIONS) {
      // If we have too many notifications for this user, remove the oldest read ones first
      const readNotifications = userNotifications.filter(n => n.isRead);
      
      if (readNotifications.length > 0) {
        // Sort by date (oldest first)
        readNotifications.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        // Determine how many to remove
        const toRemoveCount = userNotifications.length - this.MAX_NOTIFICATIONS;
        const toRemoveIds = readNotifications.slice(0, toRemoveCount).map(n => n.id);
        
        // Filter out the notifications to remove
        const filteredNotifications = allNotifications.filter(n => !toRemoveIds.includes(n.id));
        this.saveAllNotifications(filteredNotifications);
      }
    } else {
      // Save all notifications
      this.saveAllNotifications(allNotifications);
    }
    
    return true;
  }

  /**
   * Add multiple notifications
   */
  public static addNotifications(notifications: Notification[]): boolean {
    if (!notifications || notifications.length === 0) return false;
    
    let success = true;
    for (const notification of notifications) {
      if (!this.addNotification(notification)) {
        success = false;
      }
    }
    
    return success;
  }

  /**
   * Process notifications for scheduled events
   * This should be called on a schedule (e.g., every hour)
   */
  public static processScheduledNotifications(projects: any[], users: User[], updates: any[]): void {
    // Implementation would go here, calling NotificationRulesService methods
    // This would typically be a server-side processing routine
    console.log('Processing scheduled notifications');
  }

  /**
   * Get all notifications from storage
   */
  private static getAllNotifications(): Notification[] {
    try {
      const storedNotifications = localStorage.getItem(this.NOTIFICATIONS_STORAGE_KEY);
      return storedNotifications ? JSON.parse(storedNotifications) : [];
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return [];
    }
  }

  /**
   * Save all notifications to storage
   */
  private static saveAllNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(this.NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }
}

export default NotificationHandlerService; 