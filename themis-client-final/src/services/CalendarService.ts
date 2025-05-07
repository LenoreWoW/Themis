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
  DEADLINE = 'deadline'
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
 * Service to handle calendar-related operations
 */
class CalendarService {
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
      
      // 2. Transform data into calendar events
      const events: CalendarEvent[] = [
        ...this.transformTasksToEvents(tasks),
        ...this.transformAssignmentsToEvents(assignments),
        ...this.transformMeetingsToEvents(meetings),
        ...this.transformProjectDeadlinesToEvents(projects)
      ];
      
      return events;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

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
          const task = await api.tasks.getTaskById(eventId, token);
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
          // Don't allow updating deadlines via drag-and-drop
          return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Transform tasks to calendar events
   */
  private transformTasksToEvents(tasks: Task[]): CalendarEvent[] {
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
  }

  /**
   * Transform assignments to calendar events
   */
  private transformAssignmentsToEvents(assignments: Assignment[]): CalendarEvent[] {
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
  }

  /**
   * Transform meetings to calendar events
   */
  private transformMeetingsToEvents(meetings: Meeting[]): CalendarEvent[] {
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
  }

  /**
   * Transform project deadlines to calendar events
   */
  private transformProjectDeadlinesToEvents(projects: Project[]): CalendarEvent[] {
    return projects.map(project => ({
      id: `deadline-${project.id}`,
      title: `${project.name} deadline`,
      type: CalendarEventType.DEADLINE,
      projectId: project.id,
      start: project.endDate,
      end: project.endDate,
      allDay: true,
      color: '#f44336', // Red
      editable: false, // Deadlines are not editable
      extendedProps: {
        projectName: project.name,
        status: project.status
      }
    }));
  }

  /**
   * Check if user can view all projects
   */
  private canViewAllProjects(role: UserRole): boolean {
    return [
      UserRole.ADMIN,
      UserRole.MAIN_PMO,
      UserRole.EXECUTIVE
    ].includes(role);
  }
}

export default new CalendarService(); 