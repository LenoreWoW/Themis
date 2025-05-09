import DailyBriefService from './DailyBriefService';
import ChatService from './ChatService';
import { ChannelType } from '../types/ChatTypes';

// Simple logger implementation
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
};

/**
 * Service for scheduling tasks to run at specific times
 */
class SchedulerService {
  private static instance: SchedulerService | null = null;
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();
  private dailyBriefTime: string = '08:00'; // Default to 8:00 AM
  private dailyBriefService = DailyBriefService.getInstance();
  private chatService: any; // Using any type until proper ChatService type is available
  private initialized: boolean = false;

  /**
   * Private constructor
   */
  private constructor() {
    // Initialize chatService safely
    this.chatService = ChatService;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Initialize the scheduler service
   */
  public initialize(): void {
    if (this.initialized) return;
    
    // Load settings
    this.loadSettings();
    
    // Schedule the daily brief
    this.scheduleDailyBrief();
    
    this.initialized = true;
    logger.info('SchedulerService initialized');
  }

  /**
   * Load settings from storage or API
   */
  private loadSettings(): void {
    // In a real implementation, this would load from user settings or app configuration
    const storedTime = localStorage.getItem('dailyBriefTime');
    if (storedTime) {
      this.dailyBriefTime = storedTime;
    }
  }

  /**
   * Schedule the daily brief to run at the configured time
   */
  private scheduleDailyBrief(): void {
    // Clear any existing scheduled task
    if (this.scheduledTasks.has('dailyBrief')) {
      clearTimeout(this.scheduledTasks.get('dailyBrief')!);
      this.scheduledTasks.delete('dailyBrief');
    }

    // Calculate the time until the next brief should be sent
    const delay = this.calculateTimeUntilNextRun(this.dailyBriefTime);
    
    // Schedule the task
    const taskId = setTimeout(() => {
      this.sendDailyBrief();
      
      // Reschedule for the next day
      this.scheduleDailyBrief();
    }, delay);
    
    this.scheduledTasks.set('dailyBrief', taskId);
    logger.info(`Daily brief scheduled for ${this.dailyBriefTime}, running in ${Math.round(delay / 1000 / 60)} minutes`);
  }

  /**
   * Calculate milliseconds until the next run time
   * @param timeString Time in format "HH:MM"
   */
  private calculateTimeUntilNextRun(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
    
    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime.getTime() - now.getTime();
  }

  /**
   * Send the daily brief to all active users
   */
  private async sendDailyBrief(): Promise<void> {
    try {
      logger.info('Sending daily brief');
      
      // Find the system announcements channel (or create it if it doesn't exist)
      const channels = await this.chatService.getUserChannels();
      let systemChannel = channels.data.find(c => c.type === ChannelType.System);
      
      if (!systemChannel) {
        // Create a system channel if it doesn't exist
        const newChannel = await this.chatService.createChannel(
          'Announcements',
          ChannelType.System
        );
        systemChannel = newChannel;
      }
      
      // Generate and post the daily brief
      const dailyBrief = await this.dailyBriefService.generateDailyBrief();
      await this.dailyBriefService.postDailyBrief(systemChannel.id, dailyBrief);
      
      logger.info('Daily brief sent successfully');
    } catch (error) {
      logger.error('Error sending daily brief:', error);
    }
  }

  /**
   * Force send a daily brief immediately (for testing)
   */
  public forceSendDailyBrief(): Promise<void> {
    return this.sendDailyBrief();
  }

  /**
   * Update the daily brief time
   * @param timeString Time in format "HH:MM"
   */
  public updateDailyBriefTime(timeString: string): void {
    this.dailyBriefTime = timeString;
    localStorage.setItem('dailyBriefTime', timeString);
    
    // Reschedule with the new time
    this.scheduleDailyBrief();
    
    logger.info(`Daily brief time updated to ${timeString}`);
  }
}

export default SchedulerService; 