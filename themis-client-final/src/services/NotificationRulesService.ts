import { 
  Task, 
  User, 
  Project, 
  Assignment,
  AssignmentStatus,
  TaskStatus,
  UserRole,
  Meeting,
  MeetingStatus
} from '../types';
import { isThursday, isAfter, startOfDay, endOfDay, format } from 'date-fns';

// Define the enum locally since imports are having issues
export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  APPROVAL_NEEDED = 'APPROVAL_NEEDED',
  CHANGE_REQUEST_APPROVED = 'CHANGE_REQUEST_APPROVED',
  CHANGE_REQUEST_REJECTED = 'CHANGE_REQUEST_REJECTED',
  UPDATE_DUE = 'UPDATE_DUE',
  GENERAL = 'GENERAL'
}

// Define the Notification interface since it's not exported from types
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

// Define the WeeklyUpdate interface if not exported from types
export interface WeeklyUpdate {
  id: string;
  projectId: string;
  weekNumber: number;
  weekYear: number;
  submittedBy: User;
  submittedAt: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service to handle notification rules and workflow
 */
export class NotificationRulesService {
  
  /**
   * Creates a notification object
   */
  private static createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedItemId?: string,
    relatedItemType?: string
  ): Notification {
    return {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      relatedItemId: relatedItemId || '',
      relatedItemType: relatedItemType || '',
      isRead: false,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Task & Assignment Updates - New assignment
   * Notify the assignee immediately when a task or assignment is given to them
   */
  public static handleNewAssignment(item: Task | Assignment): Notification[] {
    const notifications: Notification[] = [];
    
    // Check if it's a Task with an assignee
    if ('projectId' in item && item.assignee) {
      const itemType = 'Task';
      
      // Create notification for the assignee
      notifications.push(
        this.createNotification(
          item.assignee.id,
          NotificationType.TASK_ASSIGNED,
          `New ${itemType} assigned to you`,
          `${item.title} has been assigned to you ${item.assignedBy ? 'by ' + item.assignedBy.firstName + ' ' + item.assignedBy.lastName : ''}`,
          item.id,  // Include the item ID
          itemType // Include the item type
        )
      );
    } 
    // Handle Assignment type (different structure)
    else if ('assignmentId' in item) {
      const itemType = 'Assignment';
      // Handle Assignment notification if needed
      // Add logic here based on the Assignment type structure
    }
    
    return notifications;
  }

  /**
   * Task & Assignment Updates - Completion
   * When the assignee marks it complete, automatically notify the person who created (assigned) the task
   */
  public static handleCompletionNotification(item: Task | Assignment, previousStatus: TaskStatus | AssignmentStatus): Notification[] {
    const notifications: Notification[] = [];
    
    // Only handle Task type for now (since we're missing Assignment type details)
    if ('projectId' in item && item.assignee && item.assignedBy) {
      const itemType = 'Task';
      
      // If the status changed to completed, notify the person who assigned it
      if (previousStatus !== TaskStatus.DONE && item.status === TaskStatus.DONE) {
        notifications.push(
          this.createNotification(
            item.assignedBy.id,
            NotificationType.TASK_ASSIGNED,
            `${itemType} completed`,
            `${item.title} has been completed by ${item.assignee.firstName} ${item.assignee.lastName}`,
            item.id,  // Include the item ID
            itemType  // Include the item type
          )
        );
      }
    }
    
    return notifications;
  }

  /**
   * Workflow Approvals - Approval required
   * Notify the designated approver as soon as an item enters their queue
   */
  public static handleApprovalRequired(
    itemId: string,
    itemType: string,
    itemTitle: string,
    approvers: User[]
  ): Notification[] {
    const notifications: Notification[] = [];
    
    // Notify all approvers
    for (const approver of approvers) {
      notifications.push(
        this.createNotification(
          approver.id, // Use approver.id instead of passing the User object
          NotificationType.APPROVAL_NEEDED,
          `Approval required: ${itemTitle}`,
          `Your approval is required for ${itemType}: "${itemTitle}"`,
          itemId,
          itemType
        )
      );
    }
    
    return notifications;
  }

  /**
   * Workflow Approvals - Approval granted / rejected
   * Once the approver acts, notify the user who initiated the request with the outcome
   */
  public static handleApprovalOutcome(
    itemId: string,
    itemType: string,
    itemTitle: string,
    approvalOutcome: 'approved' | 'rejected',
    approverName: string,
    requesterId: string
  ): Notification[] {
    const notifications: Notification[] = [];
    
    const notificationType = approvalOutcome === 'approved'
      ? NotificationType.CHANGE_REQUEST_APPROVED 
      : NotificationType.CHANGE_REQUEST_REJECTED;
    
    const title = `${itemType} ${approvalOutcome}`;
    const message = `Your ${itemType} "${itemTitle}" has been ${approvalOutcome} by ${approverName}`;
    
    notifications.push(
      this.createNotification(
        requesterId,
        notificationType,
        title,
        message,
        itemId,
        itemType
      )
    );
    
    return notifications;
  }

  /**
   * Weekly Project Manager Updates - Deadline
   * Every Thursday, each project manager must submit a weekly project update
   */
  public static handleWeeklyUpdateDeadlineReminder(projects: Project[]): Notification[] {
    const notifications: Notification[] = [];
    
    // Only trigger on Thursdays
    if (!isThursday(new Date())) {
      return notifications;
    }
    
    // Get all project managers and their projects
    const pmMap = new Map<string, string[]>();
    
    for (const project of projects) {
      if (!project.projectManager?.id) continue;
      
      const pmId = project.projectManager.id;
      if (!pmMap.has(pmId)) {
        pmMap.set(pmId, []);
      }
      
      const pmProjects = pmMap.get(pmId) || [];
      pmProjects.push(project.id);
      pmMap.set(pmId, pmProjects);
    }
    
    // Create notifications for each PM
    for (const [pmId, projectIds] of pmMap.entries()) {
      if (projectIds.length === 0) continue;
      
      const projectCount = projectIds.length;
      const title = `Weekly update due today`;
      const message = `You have ${projectCount} project${projectCount > 1 ? 's' : ''} that require weekly updates to be submitted by the end of today.`;
      
      notifications.push(
        this.createNotification(
          pmId,
          NotificationType.UPDATE_DUE,
          title,
          message
        )
      );
    }
    
    return notifications;
  }

  /**
   * Weekly Project Manager Updates - Missed update
   * If the update is not submitted by the end of Thursday, send a notification to:
   * The project manager's sub‑PMO (within the department)
   * The main PMO
   * The department director
   * The executive
   */
  public static handleMissedWeeklyUpdate(
    project: Project,
    weeklyUpdates: WeeklyUpdate[],
    users: User[]
  ): Notification[] {
    const notifications: Notification[] = [];
    
    // Only check this after end of Thursday
    const today = new Date();
    if (!isThursday(today) || !isAfter(today, endOfDay(today))) {
      return notifications;
    }
    
    // Check if there's a weekly update for this week
    const currentWeek = parseInt(format(today, 'w'));
    const currentYear = parseInt(format(today, 'yyyy'));
    
    const hasUpdate = weeklyUpdates.some(update => 
      update.projectId === project.id && 
      update.weekNumber === currentWeek && 
      update.weekYear === currentYear
    );
    
    if (hasUpdate) {
      return notifications; // Update was submitted, no notifications needed
    }
    
    // Get stakeholders to notify
    const projectManager = project.projectManager;
    const department = project.department;
    
    if (!projectManager || !department) {
      return notifications;
    }
    
    // Get users by role for escalation chain
    const subPMOs = users.filter(user => 
      user.role === UserRole.SUB_PMO && user.department?.id === department.id
    );
    
    const mainPMOs = users.filter(user => 
      user.role === UserRole.MAIN_PMO
    );
    
    const directors = users.filter(user => 
      user.role === UserRole.DEPARTMENT_DIRECTOR && user.department?.id === department.id
    );
    
    const executives = users.filter(user => 
      user.role === UserRole.EXECUTIVE
    );
    
    // Create the notification message
    const title = `Missed weekly update for ${project.name}`;
    const message = `Project Manager ${projectManager.firstName} ${projectManager.lastName} did not submit the required weekly update for project "${project.name}"`;
    
    // Notify all stakeholders in the escalation chain
    [...subPMOs, ...mainPMOs, ...directors, ...executives].forEach(user => {
      notifications.push(
        this.createNotification(
          user.id, // Use user.id instead of passing the User object
          NotificationType.UPDATE_DUE,
          title,
          message,
          project.id,
          'project'
        )
      );
    });
    
    return notifications;
  }

  /**
   * Project Overdue Alerts
   * When a project passes its due date without completion, trigger the same escalation chain 
   * (sub‑PMO → main PMO → department director → executive)
   */
  public static handleProjectOverdueAlert(
    project: Project,
    users: User[]
  ): Notification[] {
    const notifications: Notification[] = [];
    
    // Check if project is overdue and not completed
    const today = startOfDay(new Date());
    const endDate = startOfDay(new Date(project.endDate));
    
    if (!isAfter(today, endDate) || project.status === 'COMPLETED') {
      return notifications;
    }
    
    // Get stakeholders to notify
    const projectManager = project.projectManager;
    const department = project.department;
    
    if (!projectManager || !department) {
      return notifications;
    }
    
    // Get users by role for escalation chain
    const subPMOs = users.filter(user => 
      user.role === UserRole.SUB_PMO && user.department?.id === department.id
    );
    
    const mainPMOs = users.filter(user => 
      user.role === UserRole.MAIN_PMO
    );
    
    const directors = users.filter(user => 
      user.role === UserRole.DEPARTMENT_DIRECTOR && user.department?.id === department.id
    );
    
    const executives = users.filter(user => 
      user.role === UserRole.EXECUTIVE
    );
    
    // Create the notification message
    const title = `Project overdue: ${project.name}`;
    const message = `Project "${project.name}" is overdue. The due date was ${format(endDate, 'MMM do, yyyy')} and the project is still not completed.`;
    
    // Notify all stakeholders in the escalation chain
    [...subPMOs, ...mainPMOs, ...directors, ...executives].forEach(user => {
      notifications.push(
        this.createNotification(
          user.id, // Use user.id instead of passing the User object
          NotificationType.TASK_OVERDUE,
          title,
          message,
          project.id,
          'project'
        )
      );
    });
    
    return notifications;
  }

  /**
   * Calendar Notifications - Meeting Reminder
   * Notify attendees 15 minutes before a meeting starts
   */
  public static handleMeetingReminder(meeting: Meeting): Notification[] {
    const notifications: Notification[] = [];
    
    // Only generate notifications for upcoming meetings
    if (meeting.status !== MeetingStatus.SCHEDULED) {
      return notifications;
    }
    
    const now = new Date();
    const meetingStart = new Date(meeting.startTime);
    
    // Calculate time difference in minutes
    const timeDiffMinutes = (meetingStart.getTime() - now.getTime()) / (1000 * 60);
    
    // Check if meeting is within the 15-minute notification window (between 0-15 minutes)
    if (timeDiffMinutes > 0 && timeDiffMinutes <= 15) {
      // Notify all attendees
      const attendees = meeting.attendees || meeting.participants || [];
      
      attendees.forEach(attendee => {
        notifications.push(
          this.createNotification(
            attendee.id,
            NotificationType.GENERAL,
            `Meeting reminder: ${meeting.title}`,
            `You have a meeting "${meeting.title}" starting in ${Math.ceil(timeDiffMinutes)} minutes`,
            meeting.id,
            'meeting'
          )
        );
      });
      
      // Notify the organizer if not in attendees
      const organizerId = meeting.organizer?.id;
      const isOrganizerIncluded = attendees.some(a => a.id === organizerId);
      
      if (organizerId && !isOrganizerIncluded) {
        notifications.push(
          this.createNotification(
            organizerId,
            NotificationType.GENERAL,
            `Meeting reminder: ${meeting.title}`,
            `The meeting "${meeting.title}" that you organized is starting in ${Math.ceil(timeDiffMinutes)} minutes`,
            meeting.id,
            'meeting'
          )
        );
      }
    }
    
    return notifications;
  }

  /**
   * Calendar Notifications - Assignment Due Soon
   * Notify assignee 1 hour before an assignment is due
   */
  public static handleAssignmentDueReminder(assignment: Assignment): Notification[] {
    const notifications: Notification[] = [];
    
    // Only generate notifications for active assignments
    if (assignment.status !== AssignmentStatus.PENDING && 
        assignment.status !== AssignmentStatus.IN_PROGRESS && 
        assignment.status !== AssignmentStatus.ACCEPTED) {
      return notifications;
    }
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    // Calculate time difference in hours
    const timeDiffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Check if assignment is within the 1-hour notification window (between 0-1 hours)
    if (timeDiffHours > 0 && timeDiffHours <= 1) {
      notifications.push(
        this.createNotification(
          assignment.assignedTo.id,
          NotificationType.TASK_DUE_SOON,
          `Assignment due soon: ${assignment.title}`,
          `Your assignment "${assignment.title}" is due in ${Math.ceil(timeDiffHours * 60)} minutes`,
          assignment.id,
          'assignment'
        )
      );
    }
    
    return notifications;
  }

  /**
   * Calendar Notifications - Project Deadline Approaching
   * Notify project manager and stakeholders 24 hours before a project deadline
   */
  public static handleProjectDeadlineReminder(project: Project, users: User[]): Notification[] {
    const notifications: Notification[] = [];
    
    // Only generate notifications for active projects
    if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
      return notifications;
    }
    
    const now = new Date();
    const deadlineDate = new Date(project.endDate);
    
    // Calculate time difference in hours
    const timeDiffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Check if deadline is within the 24-hour notification window (between 23-24 hours)
    // This ensures we send only one notification per day
    if (timeDiffHours > 23 && timeDiffHours <= 24) {
      // Get stakeholders to notify
      const projectManager = project.projectManager;
      const department = project.department;
      
      if (!projectManager || !department) {
        return notifications;
      }
      
      // Get users by role for notification
      const subPMOs = users.filter(user => 
        user.role === UserRole.SUB_PMO && user.department?.id === department.id
      );
      
      const mainPMOs = users.filter(user => 
        user.role === UserRole.MAIN_PMO
      );
      
      const directors = users.filter(user => 
        user.role === UserRole.DEPARTMENT_DIRECTOR && user.department?.id === department.id
      );
      
      // Create notification message
      const title = `Project deadline approaching: ${project.name}`;
      const message = `Project "${project.name}" is due in 24 hours`;
      
      // Notify project manager
      notifications.push(
        this.createNotification(
          projectManager.id,
          NotificationType.TASK_DUE_SOON,
          title,
          message,
          project.id,
          'project'
        )
      );
      
      // Notify other stakeholders
      [...subPMOs, ...mainPMOs, ...directors].forEach(user => {
        notifications.push(
          this.createNotification(
            user.id,
            NotificationType.TASK_DUE_SOON,
            title,
            message,
            project.id,
            'project'
          )
        );
      });
    }
    
    return notifications;
  }

  /**
   * Check all calendar events and generate appropriate notifications
   * This method would be called on a regular basis (e.g., every 15 minutes)
   */
  public static checkCalendarEvents(
    meetings: Meeting[],
    assignments: Assignment[],
    projects: Project[],
    users: User[]
  ): Notification[] {
    let notifications: Notification[] = [];
    
    // Check meetings for reminders
    meetings.forEach(meeting => {
      notifications = [
        ...notifications,
        ...this.handleMeetingReminder(meeting)
      ];
    });
    
    // Check assignments for due soon reminders
    assignments.forEach(assignment => {
      notifications = [
        ...notifications,
        ...this.handleAssignmentDueReminder(assignment)
      ];
    });
    
    // Check projects for deadline reminders
    projects.forEach(project => {
      notifications = [
        ...notifications,
        ...this.handleProjectDeadlineReminder(project, users)
      ];
    });
    
    return notifications;
  }
}

export default NotificationRulesService; 