import { Meeting, Assignment, Project, User } from '../types';
import NotificationRulesService from './NotificationRulesService';
import api from './api';

/**
 * Service to handle calendar notification scheduling and processing
 */
const calendarNotificationService = {
  checkInterval: null as number | null,
  intervalTime: 60000, // Check every minute
  
  /**
   * Start the notification checking service
   */
  startNotificationService(): void {
    // Clear any existing interval
    this.stopNotificationService();
    
    // Set up interval to check for notifications
    this.checkInterval = window.setInterval(() => {
      this.checkForNotifications();
    }, this.intervalTime);
    
    console.log('Calendar notification service started');
  },
  
  /**
   * Stop the notification checking service
   */
  stopNotificationService(): void {
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Calendar notification service stopped');
    }
  },
  
  /**
   * Check for notifications that need to be sent
   */
  async checkForNotifications(): Promise<void> {
    try {
      const token = localStorage.getItem('token') || '';
      
      // Get current user for authentication
      const currentUserResponse = await api.auth.getProfile(token);
      if (!currentUserResponse.success || !currentUserResponse.data) {
        console.error('Failed to get current user for notifications');
        return;
      }
      
      // Fetch necessary data for notifications
      const [meetings, assignments, projects, users] = await Promise.all([
        this.fetchMeetings(token),
        this.fetchAssignments(token),
        this.fetchProjects(token),
        this.fetchUsers(token)
      ]);
      
      // Generate notifications using NotificationRulesService
      const notifications = NotificationRulesService.checkCalendarEvents(
        meetings,
        assignments,
        projects,
        users
      );
      
      // If there are notifications, send them to the server
      if (notifications.length > 0) {
        await this.sendNotifications(notifications, token);
      }
    } catch (error) {
      console.error('Error checking for calendar notifications:', error);
    }
  },
  
  /**
   * Fetch meetings from the API
   */
  async fetchMeetings(token: string): Promise<Meeting[]> {
    try {
      const response = await api.meetings.getAllMeetings(token);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching meetings for notifications:', error);
      return [];
    }
  },
  
  /**
   * Fetch assignments from the API
   */
  async fetchAssignments(token: string): Promise<Assignment[]> {
    try {
      const response = await api.assignments.getAllAssignments(token);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching assignments for notifications:', error);
      return [];
    }
  },
  
  /**
   * Fetch projects from the API
   */
  async fetchProjects(token: string): Promise<Project[]> {
    try {
      const response = await api.projects.getAllProjects(token);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching projects for notifications:', error);
      return [];
    }
  },
  
  /**
   * Fetch users from the API
   */
  async fetchUsers(token: string): Promise<User[]> {
    try {
      const response = await api.users.getAllUsers(token);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users for notifications:', error);
      return [];
    }
  },
  
  /**
   * Send notifications to the server
   */
  async sendNotifications(notifications: any[], token: string): Promise<void> {
    try {
      // In a real implementation, this would use an API endpoint to send notifications
      // For now, we'll just log them
      console.log('Sending calendar notifications:', notifications);
      
      // Here's where you would call your notifications API
      // await api.notifications.sendNotifications(notifications, token);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
};

export default calendarNotificationService;