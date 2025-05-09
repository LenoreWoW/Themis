import { SystemMessageType, SystemMessageAction, DailyBriefItem, SystemMessagePayload } from '../types/ChatTypes';
import { IssueStatus, RiskImpact, Task, TaskStatus } from '../types';
import api from './api';
import ChatService from './ChatService';
import logger from '../utils/logger';
import { formatDistanceToNow } from 'date-fns';

/**
 * Service for managing the Daily Brief functionality
 */
class DailyBriefService {
  private static instance: DailyBriefService | null = null;
  private static readonly STORAGE_KEY = 'dailyBriefSettings';
  private chatService: any;

  constructor() {
    this.chatService = ChatService;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DailyBriefService {
    if (!DailyBriefService.instance) {
      DailyBriefService.instance = new DailyBriefService();
    }
    return DailyBriefService.instance;
  }

  /**
   * Get user settings for the Daily Brief
   */
  public getUserSettings(): { 
    enabled: boolean, 
    deliveryTime: string, 
    showAllProjects: boolean 
  } {
    const defaultSettings = {
      enabled: true,
      deliveryTime: '08:00',
      showAllProjects: false
    };
    
    try {
      const storedSettings = localStorage.getItem(DailyBriefService.STORAGE_KEY);
      return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    } catch (error) {
      logger.error('Error getting Daily Brief settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save user settings for the Daily Brief
   */
  public saveUserSettings(settings: { 
    enabled: boolean, 
    deliveryTime: string, 
    showAllProjects: boolean 
  }): void {
    try {
      localStorage.setItem(DailyBriefService.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      logger.error('Error saving Daily Brief settings:', error);
    }
  }

  /**
   * Generate a Daily Brief with tasks due today and urgent alerts
   */
  public async generateDailyBrief(): Promise<SystemMessagePayload> {
    try {
      // Get tasks due today and urgent alerts
      const tasks = await this.getTasksDueToday();
      const alerts = await this.getUrgentAlerts();
      
      // Combine items
      const items: DailyBriefItem[] = [
        ...tasks.map(task => this.formatTaskItem(task)),
        ...alerts.map(alert => this.formatAlertItem(alert))
      ];
      
      // Create the payload
      const payload: SystemMessagePayload = {
        type: SystemMessageType.DailyBrief,
        title: 'Your Daily Brief',
        summary: `You have ${tasks.length} task(s) due today and ${alerts.length} urgent alert(s).`,
        items,
        availableActions: [
          SystemMessageAction.MarkDone,
          SystemMessageAction.ReportIssue,
          SystemMessageAction.ViewTask,
          SystemMessageAction.Dismiss
        ],
        metadata: {
          date: new Date().toISOString()
        }
      };
      
      return payload;
    } catch (error) {
      logger.error('Error generating Daily Brief:', error);
      // Return a fallback payload on error
      return {
        type: SystemMessageType.DailyBrief,
        title: 'Your Daily Brief',
        summary: 'Unable to load tasks and alerts at this time.',
        items: [],
        availableActions: [],
        metadata: {
          date: new Date().toISOString(),
          error: 'Failed to generate daily brief'
        }
      };
    }
  }

  /**
   * Post a Daily Brief message to a channel
   */
  public async postDailyBrief(channelId: string, payload: SystemMessagePayload): Promise<void> {
    try {
      // Create a user-friendly message body as a fallback
      const messageBody = this.formatDailyBriefMessage(payload);
      
      // Send the message with the structured payload
      await this.chatService.sendSystemMessage(channelId, messageBody, payload);
      
      logger.info('Daily Brief posted successfully');
    } catch (error) {
      logger.error('Error posting Daily Brief:', error);
      throw error;
    }
  }

  /**
   * Handle actions on Daily Brief items
   */
  public static async handleAction(
    action: SystemMessageAction, 
    itemId: string, 
    messageId: string,
    channelId: string
  ): Promise<{ success: boolean, message?: string }> {
    try {
      const token = localStorage.getItem('token') || '';
      
      switch (action) {
        case SystemMessageAction.MarkDone:
          // Mock updating task status for now
          return { 
            success: true, 
            message: 'Task marked as done successfully'
          };
          
        case SystemMessageAction.ViewTask:
          // This would typically navigate to the task in the UI
          // Return success to allow the UI to handle navigation
          return { 
            success: true
          };
          
        case SystemMessageAction.Dismiss:
          // Logic to dismiss the item from the brief
          return { 
            success: true, 
            message: 'Item dismissed from Daily Brief'
          };
          
        default:
          return { 
            success: false, 
            message: 'Unsupported action'
          };
      }
    } catch (error) {
      logger.error(`Error handling action ${action} on item ${itemId}:`, error);
      return {
        success: false,
        message: `Failed to perform ${action}: ${(error as Error).message}`
      };
    }
  }

  /**
   * Create an issue from a Daily Brief item
   */
  public static async createIssueFromItem(
    itemId: string, 
    issueData: { title: string, description: string }
  ): Promise<{ success: boolean, issueId?: string, error?: string }> {
    try {
      // Mock issue creation for now
      return {
        success: true,
        issueId: 'mocked-issue-id-' + Date.now()
      };
    } catch (error) {
      logger.error('Error creating issue from Daily Brief item:', error);
      return {
        success: false,
        error: (error as Error).message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Format a task for display in the Daily Brief
   */
  private formatTaskItem(task: Task): DailyBriefItem {
    const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
    const dueTime = dueDate ? dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
    
    return {
      id: task.id,
      title: task.title,
      type: 'task',
      dueTime,
      priority: task.priority,
      projectId: task.projectId,
      projectName: task.project?.name || 'Unknown Project',
      assigneeId: task.assignee?.id,
      assigneeName: `${task.assignee?.firstName || ''} ${task.assignee?.lastName || ''}`.trim() || 'Unassigned',
      status: task.status,
      isCompleted: task.status === TaskStatus.DONE
    };
  }

  /**
   * Format an alert for display in the Daily Brief
   */
  private formatAlertItem(alert: any): DailyBriefItem {
    return {
      id: alert.id,
      title: alert.title,
      type: 'alert',
      priority: alert.priority || 'HIGH',
      projectId: alert.projectId,
      projectName: alert.projectName,
      status: alert.status,
      isCompleted: false
    };
  }

  /**
   * Format a Daily Brief message as a fallback text
   */
  private formatDailyBriefMessage(payload: SystemMessagePayload): string {
    const { title, summary, items } = payload;
    let message = `# ${title}\n\n${summary}\n\n`;
    
    // Group items by type
    const tasks = items.filter(item => item.type === 'task');
    const alerts = items.filter(item => item.type === 'alert');
    
    if (tasks.length > 0) {
      message += '## Tasks Due Today\n\n';
      tasks.forEach(task => {
        message += `* **${task.title}** - Due: ${task.dueTime || 'Today'} - Project: ${task.projectName || 'N/A'}\n`;
      });
      message += '\n';
    }
    
    if (alerts.length > 0) {
      message += '## Urgent Alerts\n\n';
      alerts.forEach(alert => {
        message += `* ⚠️ **${alert.title}** - Project: ${alert.projectName || 'N/A'}\n`;
      });
      message += '\n';
    }
    
    message += '---\n';
    message += 'Open the Daily Brief to interact with these items.';
    
    return message;
  }

  /**
   * Get tasks due today from the API
   */
  private async getTasksDueToday(): Promise<Task[]> {
    try {
      const settings = this.getUserSettings();
      
      // For testing/mock, return empty array for now
      return [];
    } catch (error) {
      logger.error('Error getting tasks due today:', error);
      return [];
    }
  }

  /**
   * Get urgent alerts (high priority risks and issues)
   */
  private async getUrgentAlerts(): Promise<any[]> {
    try {
      // For testing/mock, return empty arrays for now
      return [];
    } catch (error) {
      logger.error('Error getting urgent alerts:', error);
      return [];
    }
  }
}

export default DailyBriefService; 