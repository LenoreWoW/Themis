import { User, Project, Task, Meeting, UserRole, ProjectStatus, TaskStatus, TaskPriority } from '../types';
import { ChangeRequest, ChangeRequestType } from '../types/index';
import { canApproveProjects } from '../utils/permissions';

/**
 * AIService provides intelligent assistance features for the Themis application
 */
class AIService {
  // AI Project Manager implementation
  
  /**
   * Generates a project template based on requirements and historical data
   * @param requirements Project requirements and parameters
   * @param similarProjects Array of similar historical projects to learn from
   * @returns A generated project template
   */
  generateProjectTemplate = (requirements: any, similarProjects: Project[] = []): Partial<Project> & { suggestedRoles?: UserRole[] } => {
    // In a real implementation, this would use ML to generate optimal templates
    // For now, we'll use basic logic based on requirements
    
    // Default template with common project structure
    const template: Partial<Project> & { suggestedRoles?: UserRole[] } = {
      name: requirements.name || 'New Project',
      description: requirements.description || '',
      priority: requirements.priority || 'MEDIUM',
      status: ProjectStatus.PLANNING,
      budget: requirements.budget || 0,
      startDate: requirements.startDate || new Date().toISOString(),
      // Set default end date to 3 months from start if not provided
      endDate: requirements.endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    };
    
    // If we have similar projects, adjust template based on their average properties
    if (similarProjects.length > 0) {
      // Calculate average budget and duration of similar projects
      const avgBudget = similarProjects.reduce((sum, p) => sum + (p.budget || 0), 0) / similarProjects.length;
      
      // If no budget specified, suggest based on similar projects
      if (!requirements.budget) {
        template.budget = Math.round(avgBudget);
      }
      
      // Suggest common team roles based on similar projects
      template.suggestedRoles = this.extractCommonRoles(similarProjects);
    }
    
    return template;
  };
  
  /**
   * Extract common team roles from similar projects
   * @param projects Array of similar projects
   * @returns Array of common role types
   */
  private extractCommonRoles = (projects: Project[]): UserRole[] => {
    const roleCount: Record<string, number> = {};
    
    // Count occurrence of each role
    projects.forEach(project => {
      if ('team' in project && Array.isArray(project.team)) {
        project.team.forEach((member: any) => {
          if (member.role) {
            roleCount[member.role] = (roleCount[member.role] || 0) + 1;
          }
        });
      }
    });
    
    // Return roles that appear in at least 50% of projects
    const threshold = projects.length * 0.5;
    return Object.entries(roleCount)
      .filter(([_, count]) => count >= threshold)
      .map(([role]) => role as UserRole);
  };
  
  /**
   * Predicts potential delays in a project based on current progress
   * @param project Current project
   * @param tasks Project tasks
   * @returns Predicted delay in days, or 0 if on schedule
   */
  predictProjectDelays = (project: Project, tasks: Task[]): number => {
    // In a real implementation, this would use ML for prediction
    // For now, use a simple heuristic based on task completion vs. time elapsed
    
    if (!project.startDate || !project.endDate) return 0;
    
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const now = new Date();
    
    // Calculate project duration and elapsed time
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    
    // Calculate percentage of time elapsed
    const percentTimeElapsed = Math.min(elapsedTime / totalDuration, 1);
    
    // Calculate percentage of tasks completed
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const percentTasksCompleted = tasks.length > 0 ? completedTasks / tasks.length : 0;
    
    // If task completion is significantly behind time elapsed, predict a delay
    if (percentTasksCompleted < percentTimeElapsed - 0.2) {
      // Estimate delay based on current progress rate
      const completionRate = percentTasksCompleted / percentTimeElapsed;
      const predictedAdditionalDays = Math.ceil((1 - percentTimeElapsed) * (1 / completionRate - 1) * (totalDuration / (1000 * 60 * 60 * 24)));
      return Math.max(0, predictedAdditionalDays);
    }
    
    return 0;
  };

  // AI Workflow Builder implementation
  
  /**
   * Generates an approval workflow based on a change request type
   * @param changeRequestType Type of change request
   * @returns Array of approval steps with roles
   */
  generateApprovalWorkflow = (changeRequestType: ChangeRequestType): {step: number, role: UserRole, description: string}[] => {
    const workflow = [];
    
    // Common first step for all workflows
    workflow.push({
      step: 1,
      role: UserRole.PROJECT_MANAGER,
      description: 'Submit change request'
    });
    
    // Different approval flows based on change request type
    switch (changeRequestType) {
      case ChangeRequestType.SCHEDULE:
        // Project extensions require MAIN_PMO or ADMIN approval
        workflow.push({
          step: 2,
          role: UserRole.SUB_PMO,
          description: 'Initial review of schedule extension'
        });
        workflow.push({
          step: 3,
          role: UserRole.MAIN_PMO,
          description: 'Final approval of schedule extension'
        });
        break;
        
      case ChangeRequestType.BUDGET:
        // Budget changes require EXECUTIVE or ADMIN approval
        workflow.push({
          step: 2,
          role: UserRole.SUB_PMO,
          description: 'Initial review of budget change'
        });
        workflow.push({
          step: 3,
          role: UserRole.MAIN_PMO,
          description: 'Secondary review of budget change'
        });
        workflow.push({
          step: 4,
          role: UserRole.EXECUTIVE,
          description: 'Final approval of budget change'
        });
        break;
        
      case ChangeRequestType.SCOPE:
        // Scope changes require PROJECT_MANAGER, MAIN_PMO, EXECUTIVE or ADMIN approval
        workflow.push({
          step: 2,
          role: UserRole.SUB_PMO,
          description: 'Review of scope change'
        });
        workflow.push({
          step: 3,
          role: UserRole.MAIN_PMO,
          description: 'Final approval of scope change'
        });
        break;
        
      case ChangeRequestType.RESOURCE:
        // Project delegation requires MAIN_PMO or ADMIN approval
        workflow.push({
          step: 2,
          role: UserRole.SUB_PMO,
          description: 'Initial review of resource change'
        });
        workflow.push({
          step: 3,
          role: UserRole.MAIN_PMO,
          description: 'Final approval of resource change'
        });
        break;
        
      case ChangeRequestType.CLOSURE:
        // Project closure requires EXECUTIVE or ADMIN approval
        workflow.push({
          step: 2,
          role: UserRole.SUB_PMO,
          description: 'Initial review of closure request'
        });
        workflow.push({
          step: 3,
          role: UserRole.MAIN_PMO,
          description: 'Secondary review of closure request'
        });
        workflow.push({
          step: 4,
          role: UserRole.EXECUTIVE,
          description: 'Final approval of closure request'
        });
        break;
        
      default:
        // Other changes follow standard approval flow
        workflow.push({
          step: 2,
          role: UserRole.SUB_PMO,
          description: 'Review of change request'
        });
        workflow.push({
          step: 3,
          role: UserRole.MAIN_PMO,
          description: 'Final approval of change request'
        });
    }
    
    // Add admin as an alternative approver for the final step
    const finalStep = workflow[workflow.length - 1];
    workflow[workflow.length - 1] = {
      ...finalStep,
      description: `${finalStep.description} (ADMIN may also approve)`
    };
    
    return workflow;
  };

  // AI Meeting Notetaker implementation
  
  /**
   * Extracts action items from meeting notes
   * @param meetingNotes Raw meeting notes
   * @param projectId Associated project ID
   * @returns Array of extracted tasks
   */
  extractActionItems = (meetingNotes: string, projectId: string): Partial<Task>[] => {
    const actionItems: Partial<Task>[] = [];
    
    // In a real implementation, this would use NLP to identify action items
    // For now, use a simple rule-based approach to extract tasks
    
    // Split notes into lines and look for action item patterns
    const lines = meetingNotes.split('\n');
    
    lines.forEach(line => {
      // Look for common action item patterns like "Action:" or "TODO:"
      const actionMatch = line.match(/(?:action|todo|task|action item):\s*(.*?)(?:\s*@\s*([^\s]+))?(?:\s*by\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}))?/i);
      
      if (actionMatch) {
        const title = actionMatch[1]?.trim();
        const assignee = actionMatch[2]?.trim();
        const dueDate = actionMatch[3]?.trim();
        
        if (title) {
          const task: Partial<Task> = {
            title,
            description: `Auto-generated from meeting notes: ${title}`,
            projectId,
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM
          };
          
          // Add due date if found
          if (dueDate) {
            try {
              task.dueDate = new Date(dueDate).toISOString();
            } catch (e) {
              console.error('Invalid date format:', dueDate);
            }
          }
          
          actionItems.push(task);
        }
      }
    });
    
    return actionItems;
  };
  
  /**
   * Summarizes meeting notes
   * @param meetingNotes Raw meeting notes
   * @returns Summarized version of the notes
   */
  summarizeMeetingNotes = (meetingNotes: string): string => {
    // In a real implementation, this would use NLP to generate a summary
    // For now, return a basic summary with key points
    
    const lines = meetingNotes.split('\n');
    let summary = 'Meeting Summary:\n\n';
    
    // Extract the first sentence of each paragraph as a summary point
    let keyPoints = 0;
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && keyPoints < 5) {
        const firstSentence = trimmedLine.split(/[.!?]/).filter(s => s.trim())[0];
        if (firstSentence && firstSentence.length > 10) {
          summary += `• ${firstSentence.trim()}.\n`;
          keyPoints++;
        }
      }
    });
    
    // Extract action items
    const actionItems = this.extractActionItems(meetingNotes, '');
    if (actionItems.length > 0) {
      summary += '\nAction Items:\n';
      actionItems.forEach(item => {
        summary += `• ${item.title}\n`;
      });
    }
    
    return summary;
  };

  // AI Search Assistant implementation
  
  /**
   * Searches across multiple content types with intelligent ranking
   * @param query Search query
   * @param contentTypes Types of content to search (projects, tasks, etc.)
   * @param userRole User role for permission filtering
   * @returns Ranked search results
   */
  intelligentSearch = (query: string, contentTypes: string[], userRole: UserRole): any[] => {
    // In a real implementation, this would use a search index and semantic search
    // For now, use basic string matching with permission filtering
    
    // Create an array to store results
    const results: any[] = [];
    
    // Return empty results array instead of using localStorage
    if (!query || query.trim() === '') {
      return results;
    }
    
    // Normalize query for more effective searching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Get data from API in a real implementation
    const projects: Project[] = [];
    const tasks: Task[] = [];
    const changeRequests: ChangeRequest[] = [];
    
    // Search in projects if requested
    if (contentTypes.includes('projects')) {
      const projectResults = projects
        .filter((project: Project) => {
          // Check if project matches query
          const matchesQuery = 
            project.name.toLowerCase().includes(normalizedQuery) ||
            (project.description && project.description.toLowerCase().includes(normalizedQuery));
          
          // Check if user has permission to see this project
          const hasPermission = this.userCanAccessProject(userRole, project);
          
          return matchesQuery && hasPermission;
        })
        .map((project: Project) => ({
          type: 'project',
          id: project.id,
          title: project.name,
          description: project.description,
          relevance: project.name.toLowerCase().includes(normalizedQuery) ? 0.9 : 0.6
        }));
      
      results.push(...projectResults);
    }
    
    // Search in tasks if requested
    if (contentTypes.includes('tasks')) {
      const taskResults = tasks
        .filter((task: Task) => {
          // Check if task matches query
          const matchesQuery = 
            task.title.toLowerCase().includes(normalizedQuery) ||
            (task.description && task.description.toLowerCase().includes(normalizedQuery));
          
          // Check if user has permission to see this task's project
          const project = projects.find((p: Project) => p.id === task.projectId);
          const hasPermission = project ? this.userCanAccessProject(userRole, project) : false;
          
          return matchesQuery && hasPermission;
        })
        .map((task: Task) => ({
          type: 'task',
          id: task.id,
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          relevance: task.title.toLowerCase().includes(normalizedQuery) ? 0.8 : 0.5
        }));
      
      results.push(...taskResults);
    }
    
    // Search in change requests if requested
    if (contentTypes.includes('changeRequests')) {
      const crResults = changeRequests
        .filter((cr: ChangeRequest) => {
          // Check if change request matches query
          const matchesQuery = 
            cr.title.toLowerCase().includes(normalizedQuery) ||
            (cr.description && cr.description.toLowerCase().includes(normalizedQuery));
          
          // Check if user has permission to see this change request's project
          const project = projects.find((p: Project) => p.id === cr.projectId);
          const hasPermission = project ? this.userCanAccessProject(userRole, project) : false;
          
          return matchesQuery && hasPermission;
        })
        .map((cr: ChangeRequest) => ({
          type: 'changeRequest',
          id: cr.id,
          title: cr.title,
          description: cr.description,
          projectId: cr.projectId,
          relevance: cr.title.toLowerCase().includes(normalizedQuery) ? 0.7 : 0.4
        }));
      
      results.push(...crResults);
    }
    
    // Sort results by relevance score
    return results.sort((a, b) => b.relevance - a.relevance);
  };
  
  /**
   * Checks if a user can access a specific project
   * @param userRole User role
   * @param project Project to check
   * @returns Boolean indicating if user has access
   */
  private userCanAccessProject = (userRole: UserRole, project: Project): boolean => {
    // ADMIN, MAIN_PMO, and EXECUTIVE can see all projects
    if ([UserRole.ADMIN, UserRole.MAIN_PMO, UserRole.EXECUTIVE].includes(userRole)) {
      return true;
    }
    
    // PROJECT_MANAGER can see their own projects
    if (userRole === UserRole.PROJECT_MANAGER && project.projectManager?.id) {
      // In a real implementation, you would compare with the current user's ID
      // For now, we'll assume PM can access projects they manage
      return true;
    }
    
    // SUB_PMO can see projects in their department
    if (userRole === UserRole.SUB_PMO && project.department?.id) {
      // In a real implementation, you would compare with the user's department
      // For now, we'll assume SUB_PMO can access departmental projects
      return true;
    }
    
    // Team members can see projects they're assigned to
    if ('team' in project && Array.isArray(project.team)) {
      // In a real implementation, you would check if user is in team
      return false; // Placeholder - implement based on your user identity logic
    }
    
    return false;
  };
}

export const aiService = new AIService();
export default aiService; 