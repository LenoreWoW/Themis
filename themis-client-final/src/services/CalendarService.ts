import { Task, User, Project, Meeting, Assignment, UserRole } from '../types';
import api from './api';
import { formatISO } from 'date-fns';

/**
 * Event types for the calendar
 */
export enum CalendarEventType {
  TASK = 'task',
  ASSIGNMENT = 'assignment',
  MEETING = 'meeting',
  DEADLINE = 'deadline',
  BOOKING = 'booking'
}

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  projectId?: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  editable: boolean;
  extendedProps?: {
    description?: string;
    status?: string;
    priority?: string;
    assignee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    projectName?: string;
  };
}

/**
 * Booking slot interface
 */
export interface BookingSlot {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  service_type: 'built-in' | 'external';
  external_link?: string;
  booked: boolean;
  booker_name?: string;
  booker_email?: string;
}

/**
 * Service to handle calendar-related operations
 */
export const calendarService = {
  /**
   * Fetches calendar events based on user role and permissions
   */
  async getCalendarEvents(user: User): Promise<CalendarEvent[]> {
    try {
      const token = localStorage.getItem('token') || '';
      
      // 1. Fetch all data based on user's role
      let projects: Project[] = [];
      let tasks: Task[] = [];
      let assignments: Assignment[] = [];
      let meetings: Meeting[] = [];
      let bookingSlots: BookingSlot[] = [];
      
      // Fetch projects based on user role
      if (this.canViewAllProjects(user.role)) {
        // Executive, Main PMO - Fetch all projects
        const projectsResponse = await api.projects.getAllProjects(token);
        projects = projectsResponse.data || [];
      } else if (user.role === UserRole.SUB_PMO || user.role === UserRole.DEPARTMENT_DIRECTOR) {
        // Sub PMO, Department Director - Fetch department projects
        if (user.department?.id) {
          const projectsResponse = await api.projects.getProjectsByDepartment(user.department.id, token);
          projects = projectsResponse.data || [];
        }
      } else if (user.role === UserRole.PROJECT_MANAGER) {
        // Project Manager - Only projects they belong to
        const projectsResponse = await api.projects.getAllProjects(token);
        // Filter projects where user is the project manager
        projects = (projectsResponse.data || []).filter(project => 
          project.projectManager?.id === user.id
        );
      }
      
      // Get project IDs user has access to
      const accessibleProjectIds = projects.map(project => project.id);
      
      // Fetch tasks, assignments, and meetings for these projects
      if (accessibleProjectIds.length > 0) {
        // Fetch tasks
        const tasksResponse = await api.tasks.getAllTasks(null, token);
        if (tasksResponse.data) {
          tasks = tasksResponse.data.filter(task => 
            accessibleProjectIds.includes(task.projectId)
          );
        }
        
        // Fetch meetings (assuming meeting API has similar structure)
        const meetingsResponse = await api.meetings.getAllMeetings(token);
        if (meetingsResponse.data) {
          meetings = meetingsResponse.data.filter(meeting => 
            !meeting.projectId || accessibleProjectIds.includes(meeting.projectId)
          );
        }
        
        // Fetch assignments (assuming assignment API has similar structure)
        const assignmentsResponse = await api.assignments.getAllAssignments(token);
        if (assignmentsResponse.data) {
          // Filter assignments based on user role and accessible projects
          assignments = assignmentsResponse.data;
        }
      }
      
      // Fetch booking slots
      try {
        const bookingSlotsResponse = await this.getBookingSlots(user.id, token);
        bookingSlots = bookingSlotsResponse || [];
      } catch (error) {
        console.error('Error fetching booking slots:', error);
      }
      
      // 2. Transform data into calendar events
      const events: CalendarEvent[] = [
        ...this.transformTasksToEvents(tasks),
        ...this.transformAssignmentsToEvents(assignments),
        ...this.transformMeetingsToEvents(meetings),
        ...this.transformProjectDeadlinesToEvents(projects),
        ...this.transformBookingSlotsToEvents(bookingSlots)
      ];
      
      return events;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  },

  /**
   * Update a calendar event (task, assignment, meeting)
   */
  async updateCalendarEvent(
    eventId: string, 
    eventType: CalendarEventType, 
    start: string, 
    end: string, 
    user: User
  ): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || '';
      
      switch (eventType) {
        case CalendarEventType.TASK:
          // Update task dates
          const task = await api.tasks.getTaskById('', eventId, token);
          if (task.data) {
            await api.tasks.updateTask(eventId, {
              ...task.data,
              startDate: start,
              dueDate: end
            }, token, null);
          }
          break;
        
        case CalendarEventType.ASSIGNMENT:
          // Update assignment dates
          await api.assignments.updateAssignment(eventId, {
            startDate: start,
            dueDate: end
          }, token);
          break;
        
        case CalendarEventType.MEETING:
          // Update meeting dates
          await api.meetings.updateMeeting(eventId, {
            startTime: start,
            endTime: end
          }, token);
          break;
        
        case CalendarEventType.DEADLINE:
        case CalendarEventType.BOOKING:
          // Don't allow updating deadlines or booking slots via drag-and-drop
          return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating ${eventType}:`, error);
      return false;
    }
  },

  /**
   * Get booking slots for the current user
   */
  async getBookingSlots(userId: string, token: string): Promise<BookingSlot[]> {
    try {
      // Instead of fetching from a non-existent API endpoint, return mock data
      // Generate 5 random booking slots for demo purposes
      const now = new Date();
      const mockSlots: BookingSlot[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = new Date(now);
        startTime.setDate(now.getDate() + Math.floor(i / 2));
        startTime.setHours(9 + i % 8, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);
        
        mockSlots.push({
          id: `slot-${i}-${userId}`,
          user_id: userId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          service_type: 'built-in',
          booked: i % 3 === 0, // Every third slot is booked
          booker_name: i % 3 === 0 ? 'Example User' : undefined,
          booker_email: i % 3 === 0 ? 'user@example.com' : undefined
        });
      }
      
      return mockSlots;
    } catch (error) {
      console.error('Error fetching booking slots:', error);
      return [];
    }
  },

  /**
   * Transform tasks to calendar events
   */
  transformTasksToEvents(tasks: Task[]): CalendarEvent[] {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      type: CalendarEventType.TASK,
      projectId: task.projectId,
      start: task.startDate,
      end: task.dueDate,
      allDay: false,
      color: '#3788d8', // Blue
      editable: true,
      extendedProps: {
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        projectName: task.project?.name
      }
    }));
  },

  /**
   * Transform assignments to calendar events
   */
  transformAssignmentsToEvents(assignments: Assignment[]): CalendarEvent[] {
    return assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      type: CalendarEventType.ASSIGNMENT,
      start: assignment.startDate || assignment.createdAt,
      end: assignment.dueDate,
      allDay: false,
      color: '#2e7d32', // Green
      editable: true,
      extendedProps: {
        description: assignment.description,
        status: assignment.status,
        priority: assignment.priority,
        assignee: {
          id: assignment.assignedTo.id,
          firstName: assignment.assignedTo.firstName,
          lastName: assignment.assignedTo.lastName
        }
      }
    }));
  },

  /**
   * Transform meetings to calendar events
   */
  transformMeetingsToEvents(meetings: Meeting[]): CalendarEvent[] {
    return meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      type: CalendarEventType.MEETING,
      projectId: meeting.projectId,
      start: meeting.startTime,
      end: meeting.endTime,
      allDay: false,
      color: '#9c27b0', // Violet
      editable: true,
      extendedProps: {
        description: meeting.description,
        status: meeting.status,
        projectName: meeting.projectId ? 'Project Meeting' : 'General Meeting'
      }
    }));
  },

  /**
   * Transform booking slots to calendar events
   */
  transformBookingSlotsToEvents(slots: BookingSlot[]): CalendarEvent[] {
    return slots.map(slot => ({
      id: slot.id,
      title: slot.booked ? `Booked: ${slot.booker_name || 'Anonymous'}` : 'Available Slot',
      type: CalendarEventType.BOOKING,
      start: slot.start_time,
      end: slot.end_time,
      allDay: false,
      color: '#ff9800', // Orange
      editable: false,
      extendedProps: {
        description: slot.booked ? `Booked by: ${slot.booker_name || 'Anonymous'} (${slot.booker_email || 'No email'})` : 'Available for booking',
        status: slot.booked ? 'booked' : 'available',
      }
    }));
  },

  /**
   * Transform project deadlines to calendar events
   */
  transformProjectDeadlinesToEvents(projects: Project[]): CalendarEvent[] {
    return projects.map(project => ({
      id: `deadline_${project.id}`,
      title: `${project.name} Deadline`,
      type: CalendarEventType.DEADLINE,
      projectId: project.id,
      start: project.endDate,
      end: project.endDate,
      allDay: true,
      color: '#f44336', // Red
      editable: false,
      extendedProps: {
        description: `Project deadline for ${project.name}`,
        projectName: project.name
      }
    }));
  },

  /**
   * Check if user can view all projects
   */
  canViewAllProjects(role: UserRole): boolean {
    return [
      UserRole.ADMIN,
      UserRole.MAIN_PMO,
      UserRole.EXECUTIVE
    ].includes(role);
  }
};

export default calendarService; 