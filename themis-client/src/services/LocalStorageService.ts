import { Task, Project, User, Risk, Issue, Department } from '../types';

// Keys for localStorage items
const STORAGE_KEYS = {
  TASKS: 'themis_tasks',
  PROJECTS: 'themis_projects',
  MEETINGS: 'themis_meetings',
  INDEPENDENT_TASKS: 'themis_independent_tasks',
  RISKS: 'themis_risks',
  ISSUES: 'themis_issues',
  DEPARTMENTS: 'themis_departments'
};

// Interface for a Meeting object
export interface Meeting {
  id: string;
  title: string;
  description: string;
  date?: string;
  startTime: string;
  endTime: string;
  location?: string;
  organizer: User;
  participants: User[];
  attendees?: User[];
  isActive?: boolean;
  meetingLink?: string;
  projectId?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for persisting data in localStorage when using mock data
 * This allows data to survive page refreshes during development
 */
const LocalStorageService = {
  // Tasks
  getTasks: (projectId: string): Task[] => {
    try {
      const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!tasksJson) return [];
      
      const allTasks = JSON.parse(tasksJson) as Record<string, Task[]>;
      return allTasks[projectId] || [];
    } catch (error) {
      console.error('Error retrieving tasks from localStorage:', error);
      return [];
    }
  },
  
  saveTasks: (projectId: string, tasks: Task[]): void => {
    try {
      const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
      const allTasks = tasksJson ? JSON.parse(tasksJson) as Record<string, Task[]> : {};
      
      allTasks[projectId] = tasks;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  },
  
  addTask: (task: Task): void => {
    try {
      // Get the projectId from the task's project property
      const projectId = task.project?.id;
      if (!projectId) return;
      
      const tasks = LocalStorageService.getTasks(projectId);
      tasks.push(task);
      LocalStorageService.saveTasks(projectId, tasks);
    } catch (error) {
      console.error('Error adding task to localStorage:', error);
    }
  },
  
  updateTask: (projectId: string, taskId: string, updatedTask: Partial<Task>): Task | null => {
    try {
      const tasks = LocalStorageService.getTasks(projectId);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) return null;
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
      LocalStorageService.saveTasks(projectId, tasks);
      
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error updating task in localStorage:', error);
      return null;
    }
  },
  
  deleteTask: (projectId: string, taskId: string): void => {
    try {
      const tasks = LocalStorageService.getTasks(projectId);
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      LocalStorageService.saveTasks(projectId, updatedTasks);
    } catch (error) {
      console.error('Error deleting task from localStorage:', error);
    }
  },
  
  // Independent Tasks
  getIndependentTasks: (): Task[] => {
    try {
      const tasksJson = localStorage.getItem(STORAGE_KEYS.INDEPENDENT_TASKS);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error retrieving independent tasks from localStorage:', error);
      return [];
    }
  },
  
  saveIndependentTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.INDEPENDENT_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving independent tasks to localStorage:', error);
    }
  },
  
  addIndependentTask: (task: Task): void => {
    try {
      const tasks = LocalStorageService.getIndependentTasks();
      tasks.push(task);
      LocalStorageService.saveIndependentTasks(tasks);
    } catch (error) {
      console.error('Error adding independent task to localStorage:', error);
    }
  },
  
  updateIndependentTask: (taskId: string, updatedTask: Partial<Task>): Task | null => {
    try {
      const tasks = LocalStorageService.getIndependentTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) return null;
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
      LocalStorageService.saveIndependentTasks(tasks);
      
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error updating independent task in localStorage:', error);
      return null;
    }
  },
  
  deleteIndependentTask: (taskId: string): void => {
    try {
      const tasks = LocalStorageService.getIndependentTasks();
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      LocalStorageService.saveIndependentTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting independent task from localStorage:', error);
    }
  },
  
  // Projects
  getProjects: (): Project[] => {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return projectsJson ? JSON.parse(projectsJson) : [];
    } catch (error) {
      console.error('Error retrieving projects from localStorage:', error);
      return [];
    }
  },
  
  saveProjects: (projects: Project[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  },
  
  getProject: (projectId: string): Project | null => {
    try {
      const projects = LocalStorageService.getProjects();
      return projects.find(p => p.id === projectId) || null;
    } catch (error) {
      console.error('Error retrieving project from localStorage:', error);
      return null;
    }
  },
  
  addProject: (project: Project): void => {
    try {
      const projects = LocalStorageService.getProjects();
      projects.push(project);
      LocalStorageService.saveProjects(projects);
    } catch (error) {
      console.error('Error adding project to localStorage:', error);
    }
  },
  
  updateProject: (projectId: string, updatedProject: Partial<Project>): Project | null => {
    try {
      const projects = LocalStorageService.getProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) return null;
      
      projects[projectIndex] = { ...projects[projectIndex], ...updatedProject };
      LocalStorageService.saveProjects(projects);
      
      return projects[projectIndex];
    } catch (error) {
      console.error('Error updating project in localStorage:', error);
      return null;
    }
  },
  
  deleteProject: (projectId: string): void => {
    try {
      const projects = LocalStorageService.getProjects();
      const updatedProjects = projects.filter(p => p.id !== projectId);
      LocalStorageService.saveProjects(updatedProjects);
      
      // Also delete associated tasks
      const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (tasksJson) {
        const allTasks = JSON.parse(tasksJson) as Record<string, Task[]>;
        delete allTasks[projectId];
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks));
      }
      
      // Risks
      const risksJson = localStorage.getItem(STORAGE_KEYS.RISKS);
      if (risksJson) {
        const allRisks = JSON.parse(risksJson) as Record<string, Risk[]>;
        delete allRisks[projectId];
        localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(allRisks));
      }
      
      // Issues
      const issuesJson = localStorage.getItem(STORAGE_KEYS.ISSUES);
      if (issuesJson) {
        const allIssues = JSON.parse(issuesJson) as Record<string, Issue[]>;
        delete allIssues[projectId];
        localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(allIssues));
      }
    } catch (error) {
      console.error('Error deleting project from localStorage:', error);
    }
  },
  
  // Meetings
  getMeetings: (): Meeting[] => {
    try {
      const meetingsJson = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      return meetingsJson ? JSON.parse(meetingsJson) : [];
    } catch (error) {
      console.error('Error retrieving meetings from localStorage:', error);
      return [];
    }
  },
  
  saveMeetings: (meetings: Meeting[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch (error) {
      console.error('Error saving meetings to localStorage:', error);
    }
  },
  
  addMeeting: (meeting: Meeting): void => {
    try {
      const meetings = LocalStorageService.getMeetings();
      meetings.push(meeting);
      LocalStorageService.saveMeetings(meetings);
    } catch (error) {
      console.error('Error adding meeting to localStorage:', error);
    }
  },
  
  updateMeeting: (meetingId: string, updatedMeeting: Partial<Meeting>): Meeting | null => {
    try {
      const meetings = LocalStorageService.getMeetings();
      const meetingIndex = meetings.findIndex(m => m.id === meetingId);
      
      if (meetingIndex === -1) return null;
      
      meetings[meetingIndex] = { ...meetings[meetingIndex], ...updatedMeeting };
      LocalStorageService.saveMeetings(meetings);
      
      return meetings[meetingIndex];
    } catch (error) {
      console.error('Error updating meeting in localStorage:', error);
      return null;
    }
  },
  
  deleteMeeting: (meetingId: string): void => {
    try {
      const meetings = LocalStorageService.getMeetings();
      const updatedMeetings = meetings.filter(m => m.id !== meetingId);
      LocalStorageService.saveMeetings(updatedMeetings);
    } catch (error) {
      console.error('Error deleting meeting from localStorage:', error);
    }
  },
  
  // Risks
  getRisks: (projectId: string): Risk[] => {
    try {
      const risksJson = localStorage.getItem(STORAGE_KEYS.RISKS);
      if (!risksJson) return [];
      
      const allRisks = JSON.parse(risksJson) as Record<string, Risk[]>;
      return allRisks[projectId] || [];
    } catch (error) {
      console.error('Error retrieving risks from localStorage:', error);
      return [];
    }
  },
  
  saveRisks: (projectId: string, risks: Risk[]): void => {
    try {
      const risksJson = localStorage.getItem(STORAGE_KEYS.RISKS);
      const allRisks = risksJson ? JSON.parse(risksJson) as Record<string, Risk[]> : {};
      
      allRisks[projectId] = risks;
      localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(allRisks));
    } catch (error) {
      console.error('Error saving risks to localStorage:', error);
    }
  },
  
  addRisk: (risk: Risk): void => {
    try {
      const { projectId } = risk;
      
      const risks = LocalStorageService.getRisks(projectId);
      risks.push(risk);
      LocalStorageService.saveRisks(projectId, risks);
    } catch (error) {
      console.error('Error adding risk to localStorage:', error);
    }
  },
  
  updateRisk: (projectId: string, riskId: string, updatedRisk: Partial<Risk>): Risk | null => {
    try {
      const risks = LocalStorageService.getRisks(projectId);
      const riskIndex = risks.findIndex(r => r.id === riskId);
      
      if (riskIndex === -1) return null;
      
      risks[riskIndex] = { ...risks[riskIndex], ...updatedRisk };
      LocalStorageService.saveRisks(projectId, risks);
      
      return risks[riskIndex];
    } catch (error) {
      console.error('Error updating risk in localStorage:', error);
      return null;
    }
  },
  
  deleteRisk: (projectId: string, riskId: string): void => {
    try {
      const risks = LocalStorageService.getRisks(projectId);
      const updatedRisks = risks.filter(r => r.id !== riskId);
      LocalStorageService.saveRisks(projectId, updatedRisks);
    } catch (error) {
      console.error('Error deleting risk from localStorage:', error);
    }
  },
  
  // Issues
  getIssues: (projectId: string): Issue[] => {
    try {
      const issuesJson = localStorage.getItem(STORAGE_KEYS.ISSUES);
      if (!issuesJson) return [];
      
      const allIssues = JSON.parse(issuesJson) as Record<string, Issue[]>;
      return allIssues[projectId] || [];
    } catch (error) {
      console.error('Error retrieving issues from localStorage:', error);
      return [];
    }
  },
  
  saveIssues: (projectId: string, issues: Issue[]): void => {
    try {
      const issuesJson = localStorage.getItem(STORAGE_KEYS.ISSUES);
      const allIssues = issuesJson ? JSON.parse(issuesJson) as Record<string, Issue[]> : {};
      
      allIssues[projectId] = issues;
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(allIssues));
    } catch (error) {
      console.error('Error saving issues to localStorage:', error);
    }
  },
  
  addIssue: (issue: Issue): void => {
    try {
      const { projectId } = issue;
      
      const issues = LocalStorageService.getIssues(projectId);
      issues.push(issue);
      LocalStorageService.saveIssues(projectId, issues);
    } catch (error) {
      console.error('Error adding issue to localStorage:', error);
    }
  },
  
  updateIssue: (projectId: string, issueId: string, updatedIssue: Partial<Issue>): Issue | null => {
    try {
      const issues = LocalStorageService.getIssues(projectId);
      const issueIndex = issues.findIndex(i => i.id === issueId);
      
      if (issueIndex === -1) return null;
      
      issues[issueIndex] = { ...issues[issueIndex], ...updatedIssue };
      LocalStorageService.saveIssues(projectId, issues);
      
      return issues[issueIndex];
    } catch (error) {
      console.error('Error updating issue in localStorage:', error);
      return null;
    }
  },
  
  deleteIssue: (projectId: string, issueId: string): void => {
    try {
      const issues = LocalStorageService.getIssues(projectId);
      const updatedIssues = issues.filter(i => i.id !== issueId);
      LocalStorageService.saveIssues(projectId, updatedIssues);
    } catch (error) {
      console.error('Error deleting issue from localStorage:', error);
    }
  },
  
  // Departments
  getDepartments: (): Department[] => {
    try {
      const departmentsJson = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      return departmentsJson ? JSON.parse(departmentsJson) : [];
    } catch (error) {
      console.error('Error retrieving departments from localStorage:', error);
      return [];
    }
  },
  
  saveDepartments: (departments: Department[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    } catch (error) {
      console.error('Error saving departments to localStorage:', error);
    }
  },
  
  addDepartment: (department: Department): void => {
    try {
      const departments = LocalStorageService.getDepartments();
      if (!departments.find(d => d.id === department.id)) {
        departments.push(department);
        LocalStorageService.saveDepartments(departments);
      }
    } catch (error) {
      console.error('Error adding department to localStorage:', error);
    }
  },
  
  getDepartment: (departmentId: string): Department | null => {
    try {
      const departments = LocalStorageService.getDepartments();
      return departments.find(d => d.id === departmentId) || null;
    } catch (error) {
      console.error('Error retrieving department from localStorage:', error);
      return null;
    }
  },
  
  updateDepartment: (departmentId: string, updatedDepartment: Partial<Department>): Department | null => {
    try {
      const departments = LocalStorageService.getDepartments();
      const departmentIndex = departments.findIndex(d => d.id === departmentId);
      
      if (departmentIndex === -1) return null;
      
      departments[departmentIndex] = { ...departments[departmentIndex], ...updatedDepartment };
      LocalStorageService.saveDepartments(departments);
      
      return departments[departmentIndex];
    } catch (error) {
      console.error('Error updating department in localStorage:', error);
      return null;
    }
  },
  
  deleteDepartment: (departmentId: string): void => {
    try {
      const departments = LocalStorageService.getDepartments();
      const updatedDepartments = departments.filter(d => d.id !== departmentId);
      LocalStorageService.saveDepartments(updatedDepartments);
    } catch (error) {
      console.error('Error deleting department from localStorage:', error);
    }
  },
  
  // Initialize with default data if storage is empty
  initialize: (defaultProjects: Project[] = [], defaultMeetings: Meeting[] = []): void => {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
        LocalStorageService.saveProjects(defaultProjects);
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
        LocalStorageService.saveMeetings(defaultMeetings);
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
        const defaultDepartments: Department[] = [
          {
            id: '1',
            name: 'IT',
            description: 'Information Technology Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Operations',
            description: 'Operations Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Engineering',
            description: 'Engineering Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Marketing',
            description: 'Marketing Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Sales',
            description: 'Sales Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '6',
            name: 'Finance',
            description: 'Finance Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '7',
            name: 'HR',
            description: 'Human Resources Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '8',
            name: 'Legal',
            description: 'Legal Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '9',
            name: 'Product Development',
            description: 'Product Development Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '10',
            name: 'Research',
            description: 'Research and Development Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        LocalStorageService.saveDepartments(defaultDepartments);
      }
    } catch (error) {
      console.error('Error initializing localStorage:', error);
    }
  },
  
  // Clear all storage (for testing/reset)
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.MEETINGS);
      localStorage.removeItem(STORAGE_KEYS.INDEPENDENT_TASKS);
      localStorage.removeItem(STORAGE_KEYS.RISKS);
      localStorage.removeItem(STORAGE_KEYS.ISSUES);
      localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export default LocalStorageService; 