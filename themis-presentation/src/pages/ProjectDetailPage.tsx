import { runFullAudit, AuditResult } from '../utils/auditUtils';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Chip,
  Stack,
  Avatar,
  Card,
  CardContent,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
  Tooltip,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  ListItemAvatar
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Group as TeamIcon,
  ViewKanban as KanbanIcon,
  Timeline as GanttIcon,
  AccountTree as MindMapIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as DocIcon,
  DescriptionOutlined as FileIcon,
  DeleteOutline as DeleteIcon,
  RequestQuote as RequestIcon,
  Summarize as SummarizeIcon,
  FactCheck as LogIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  ChangeCircle as ChangeCircleIcon,
  Event as EventIcon,
  TaskAlt as TaskAltIcon,
  ZoomOutMap as ZoomOutMapIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Project, 
  Task, 
  Risk, 
  User, 
  Issue,
  Department,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  Attachment,
  UserRole,
  ProjectTemplateType,
  TaskPriority
} from '../types';
import { TaskService } from '../services/TaskService';
import api from '../services/api';
import RiskIssueRegister from '../components/RiskIssue/RiskIssueRegister';
import TaskModal from '../components/Task/TaskModal';
import { useTranslation } from 'react-i18next';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import AddTaskDialog from '../components/Task/AddTaskDialog';
import MindMapView from '../components/MindMap/MindMapView';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useProjects } from '../context/ProjectContext';
import AddTeamMemberDialog from '../components/Project/AddTeamMemberDialog';
import WeeklyUpdates from '../components/Project/WeeklyUpdates';
import GanttChart from '../components/Gantt/GanttChart';
import ChangeRequestDialog from '../components/Project/ChangeRequestDialog';
import { canAddTasks, canRequestTasks, canManageProjects, canApproveProjects } from '../utils/permissions';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import EditTaskDialog from '../components/Task/EditTaskDialog';
import FilePreviewDialog from '../components/FilePreview/FilePreviewDialog';
import TaskDetailDialog from '../components/Task/TaskDetailDialog';
import DeleteTaskDialog from '../components/Task/DeleteTaskDialog';
import { formatEnumValue } from '../utils/helpers';
import { mockUsers as importedMockUsers } from '../services/mockData';

// Add this enum at the top of your file, just before const mockUsers
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  PROJECT_VIEWED = 'PROJECT_VIEWED'
}

// Mock data for project
const mockUsers: User[] = [
  {
    id: '1',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: UserRole.PROJECT_MANAGER,
    department: {
      id: '1',
      name: 'IT',
      description: 'Information Technology Department',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: UserRole.ADMIN,
    department: {
      id: '2',
      name: 'Engineering',
      description: 'Engineering Department',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'carol@example.com',
    firstName: 'Carol',
    lastName: 'Williams',
    role: UserRole.TEAM_LEAD,
    department: {
      id: '3',
      name: 'PMO',
      description: 'Project Management Office',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockAttachments: Attachment[] = [
  {
    id: '1',
    name: 'Project Charter',
    filename: 'Project Charter.pdf',
    type: 'application/pdf',
    size: 1024 * 1024,
    url: 'https://example.com/project-charter.pdf',
    uploadedBy: {
      id: mockUsers[0].id,
      firstName: mockUsers[0].firstName,
      lastName: mockUsers[0].lastName
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Requirements Document',
    filename: 'Requirements.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 512 * 1024,
    url: 'https://example.com/requirements.docx',
    uploadedBy: {
      id: mockUsers[1].id,
      firstName: mockUsers[1].firstName,
      lastName: mockUsers[1].lastName
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface ProjectWithTeamData {
  id: string;
  name: string;
  description: string;
  client?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  projectManager: {
    id: string;
    firstName: string;
    lastName: string;
  };
  department: {
    id: string;
    name: string;
  };
  team: User[];
  attachments: Attachment[];
  budget: number;
  actualCost: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

const mockProject: ProjectWithTeamData = {
  id: '1',
  name: 'Digital Transformation',
  description: 'Company-wide digital transformation initiative',
  client: 'Sample Client',
  status: ProjectStatus.IN_PROGRESS,
  priority: ProjectPriority.MEDIUM,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  projectManager: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe'
  },
  department: {
    id: '1',
    name: 'Engineering'
  },
  team: mockUsers,
  attachments: mockAttachments,
  budget: 1000000,
  actualCost: 450000,
  progress: 45,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

// Mock data for tasks
const mockTasks = [
  { 
    id: '1', 
    title: 'Requirements Gathering', 
    description: 'Gather and document system requirements from stakeholders.',
    status: 'DONE', 
    priority: 'HIGH',
    startDate: '2023-01-15', 
    dueDate: '2023-01-31',
    assignee: 'Jane Smith'
  },
  { 
    id: '2', 
    title: 'Database Schema Design', 
    description: 'Design the database schema for the new system.',
    status: 'DONE', 
    priority: 'MEDIUM',
    startDate: '2023-02-01', 
    dueDate: '2023-02-15',
    assignee: 'Robert Brown'
  },
  { 
    id: '3', 
    title: 'Frontend Prototype', 
    description: 'Create a prototype of the user interface.',
    status: 'IN_PROGRESS', 
    priority: 'MEDIUM',
    startDate: '2023-02-15', 
    dueDate: '2023-03-01',
    assignee: 'Sarah Williams'
  },
  { 
    id: '4', 
    title: 'API Development', 
    description: 'Develop the API endpoints for the system.',
    status: 'IN_PROGRESS', 
    priority: 'HIGH',
    startDate: '2023-02-15', 
    dueDate: '2023-03-15',
    assignee: 'Robert Brown'
  },
  { 
    id: '5', 
    title: 'Testing Plan', 
    description: 'Create a comprehensive testing plan for the system.',
    status: 'TODO', 
    priority: 'MEDIUM',
    startDate: '2023-03-01', 
    dueDate: '2023-03-15',
    assignee: 'Mike Johnson'
  }
];

// Helper function to get status color
const getStatusColor = (status: string, endDate?: string) => {
  // Check if the project is overdue (end date is before current date)
  if (endDate && new Date(endDate) < new Date()) {
    return 'error'; // Red color for overdue projects
  }
  
  switch(status) {
    case 'InProgress': 
    case 'IN_PROGRESS': return 'primary';
    case 'Completed': 
    case 'COMPLETED': return 'success';
    case 'OnHold': 
    case 'ON_HOLD': return 'warning';
    case 'Cancelled': 
    case 'CANCELLED': return 'error';
    case 'Draft': 
    case 'PLANNING': return 'default';
    case 'SubPMOReview': return 'info';
    case 'MainPMOApproval': return 'secondary';
    default: return 'default';
  }
};

// Helper function to get status label
const getStatusLabel = (status: string) => {
  if (!status) return '';
  
  // For some specific statuses, we have custom labels
  switch(status) {
    case 'InProgress': 
    case 'IN_PROGRESS': return 'In Progress';
    case 'Completed': 
    case 'COMPLETED': return 'Completed';
    case 'OnHold': 
    case 'ON_HOLD': return 'On Hold';
    case 'Cancelled': 
    case 'CANCELLED': return 'Cancelled';
    case 'Draft': 
    case 'PLANNING': return 'Planning';
    case 'SubPMOReview': return 'Sub PMO Review';
    case 'MainPMOApproval': return 'Main PMO Approval';
    default: return formatEnumValue(status);
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

// Updated interface for AuthContext
interface AuthUser extends User {
  token?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

interface RequestTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

// Define our own local enum for ChangeRequestType since it might be different
enum ChangeRequestType {
  SCHEDULE = 'SCHEDULE',
  BUDGET = 'BUDGET',
  SCOPE = 'SCOPE',
  RESOURCE = 'RESOURCE',
  CLOSURE = 'CLOSURE',
  OTHER = 'OTHER'
}

// Function to convert ProjectWithTeamData to a full Project with proper types
const convertToFullProject = (data: ProjectWithTeamData): Project => {
  // Create a complete User object from the minimal projectManager data
  const projectManager: User = {
    id: data.projectManager.id,
    firstName: data.projectManager.firstName,
    lastName: data.projectManager.lastName,
    email: `${data.projectManager.firstName.toLowerCase()}.${data.projectManager.lastName.toLowerCase()}@example.com`,
    role: UserRole.PROJECT_MANAGER,
    department: {
      id: data.department.id,
      name: data.department.name,
      description: 'Department description',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };

  // Create a complete Department object
  const department: Department = {
    id: data.department.id,
    name: data.department.name,
    description: 'Department description',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };

  // Create and return a complete Project object
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    priority: data.priority,
    startDate: data.startDate,
    endDate: data.endDate,
    projectManager: projectManager,
    department: department,
    progress: data.progress,
    budget: data.budget,
    actualCost: data.actualCost,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    templateType: ProjectTemplateType.DEFAULT
  };
};

// Need to define our own interface since KanbanBoardProps doesn't include tasks
interface CustomKanbanBoardProps {
  project: Project;
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onTaskClick: (taskId: string) => void;
  onAddTask?: () => void;
  onRequestTask?: () => void;
}

// Define the Log interface
interface ProjectLog {
  id: string;
  action: AuditAction;
  details: string;
  timestamp: string;
  userId?: string;
  projectId?: string;
  username?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Add mock logs data
const mockProjectLogs: ProjectLog[] = [
  {
    id: '1',
    action: AuditAction.CREATE,
    details: 'Project created',
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe'
    },
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    action: AuditAction.UPDATE,
    details: 'Project status updated to IN_PROGRESS',
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe'
    },
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    action: AuditAction.UPDATE,
    details: 'Team member added: Alice Smith',
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe'
    },
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    action: AuditAction.UPDATE,
    details: 'Project description updated',
    user: {
      id: '2',
      firstName: 'Bob',
      lastName: 'Johnson'
    },
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    action: AuditAction.UPDATE,
    details: 'New file uploaded: Project Charter.pdf',
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe'
    },
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    action: AuditAction.UPDATE,
    details: 'Team member added: Carol Williams',
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe'
    },
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const ProjectDetailPage: React.FC<{}> = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth() as AuthContextValue;
  const { projects } = useProjects();
  const [project, setProject] = useState<ProjectWithTeamData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isRequestTaskDialogOpen, setIsRequestTaskDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { tasks: contextTasks, addTask, updateTask, deleteTask, moveTask, refreshTasks, loading: tasksLoading, error: contextError } = useTasks();
  const navigate = useNavigate();
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [addingTeamMembers, setAddingTeamMembers] = useState(false);
  const [projectAttachments, setProjectAttachments] = useState<Attachment[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | undefined>(undefined);
  const [projectLogs, setProjectLogs] = useState<ProjectLog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [changeRequestType, setChangeRequestType] = useState<ChangeRequestType | null>(null);
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [isEditCostDialogOpen, setIsEditCostDialogOpen] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState<ProjectStatus | null>(null);
  const [updatedCost, setUpdatedCost] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTaskView, setActiveTaskView] = useState<'kanban' | 'gantt' | 'mindmap'>('kanban');
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add state for audit results
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // First, add a state for weekly updates
  const [weeklyUpdates, setWeeklyUpdates] = useState<Array<{
    id: string;
    week: string;
    progressUpdate: string;
    budgetUpdate: string;
    timeline: string;
    createdAt: string;
    comments: Array<{
      id: string;
      text: string;
      author: {
        id: string;
        firstName: string;
        lastName: string;
      };
      createdAt: string;
    }>;
    attachments: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      url: string;
      uploadedBy: {
        id: string;
        firstName: string;
        lastName: string;
      };
      createdAt: string;
    }>;
  }>>([]);

  // Add new states for weekly update management
  const [updateComment, setUpdateComment] = useState<string>('');
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  const [updateFiles, setUpdateFiles] = useState<File[]>([]);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailDialogOpen, setIsTaskDetailDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);

  // Run audit on page load to verify compliance with ClientTerms
  useEffect(() => {
    // Only run audit for admin users
    if (user?.role === UserRole.ADMIN) {
      const result = runFullAudit();
      setAuditResult(result);
      if (!result.passed) {
        showSnackbar('Audit found compliance issues. Check the console for details.', 'error');
        console.warn('Audit results:', result);
      }
    }
  }, [user?.role]);

  // Update the fetchProjectData function to properly use API when available
  const fetchProjectData = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First check localStorage for the most up-to-date project data
      let projectWithTeam: ProjectWithTeamData | null = null;
      const projectDataJson = localStorage.getItem(`project_${id}`);
      
      if (projectDataJson) {
        try {
          const localProject = JSON.parse(projectDataJson);
          console.log('Found project in localStorage:', localProject);
          
          // If it has all the required data, use it directly
          if (localProject.name && localProject.status) {
            console.log('Using complete project from localStorage');
            projectWithTeam = localProject as ProjectWithTeamData;
          }
        } catch (e) {
          console.error('Error parsing project from localStorage:', e);
        }
      }
      
      // If we don't have a complete project from localStorage, try to find it in context
      if (!projectWithTeam) {
        const foundProject = projects.find(p => p.id === id);
        
        if (foundProject) {
          console.log('Found project in context:', foundProject);
          
          // If we have partial data in localStorage, merge it with context data
          if (projectDataJson) {
            try {
              const localProject = JSON.parse(projectDataJson);
              if (localProject.status) {
                console.log('Using status from localStorage:', localProject.status);
                foundProject.status = localProject.status;
              }
              if (localProject.actualCost !== undefined) {
                console.log('Using actualCost from localStorage:', localProject.actualCost);
                foundProject.actualCost = localProject.actualCost;
              }
            } catch (e) {
              console.error('Error merging localStorage data:', e);
            }
          }
          
          // Ensure we have all required properties for ProjectWithTeamData
          projectWithTeam = {
            id: foundProject.id,
            name: foundProject.name,
            description: foundProject.description,
            status: foundProject.status,
            priority: foundProject.priority,
            startDate: foundProject.startDate,
            endDate: foundProject.endDate,
            projectManager: foundProject.projectManager || {
              id: '1',
              firstName: 'Default',
              lastName: 'Manager'
            },
            department: foundProject.department,
            team: [], // Initialize with empty team
            attachments: [], // Initialize with empty attachments
            budget: foundProject.budget,
            actualCost: foundProject.actualCost,
            progress: foundProject.progress,
            createdAt: foundProject.createdAt || new Date().toISOString(),
            updatedAt: foundProject.updatedAt || new Date().toISOString()
          };
        } else {
          console.warn(`Project with ID ${id} not found in context, using mock data.`);
          // If project not found in the context, use the mock data as fallback
          // but with the correct ID
          const mockWithCorrectId = {
            ...mockProject,
            id: id
          };
          projectWithTeam = mockWithCorrectId;
        }
      }
      
      // Try to get project team data
      try {
        // Get team members from localStorage if available
        const teamJson = localStorage.getItem(`project_${id}_team`) || sessionStorage.getItem(`project_${id}_team`);
        if (teamJson) {
          const teamData = JSON.parse(teamJson);
          projectWithTeam.team = Array.isArray(teamData) ? teamData : [];
        } else {
          // Project manager only - but ensure we include the project manager
          projectWithTeam.team = [];
          
          // Save to localStorage for future use
          localStorage.setItem(`project_${id}_team`, JSON.stringify([]));
        }
        
        // Also update the availableUsers state for team member selection
        setAvailableUsers(importedMockUsers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        projectWithTeam.team = [];
      }
      
      // Try to get project attachments data
      try {
        // Get attachments from localStorage if available
        const attachmentsJson = localStorage.getItem(`project_${id}_attachments`) || sessionStorage.getItem(`project_${id}_attachments`);
        if (attachmentsJson) {
          const attachmentsData = JSON.parse(attachmentsJson);
          projectWithTeam.attachments = Array.isArray(attachmentsData) ? attachmentsData : [];
          setProjectAttachments(projectWithTeam.attachments);
        } else {
          // Initialize with empty attachments - no random ones
          projectWithTeam.attachments = [];
          setProjectAttachments([]);
          
          // Save to localStorage for future use
          localStorage.setItem(`project_${id}_attachments`, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Error fetching attachments:', err);
        projectWithTeam.attachments = [];
        setProjectAttachments([]);
      }
      
      // Try to get project logs
      try {
        // Get logs from localStorage if available
        const logsJson = localStorage.getItem(`project_${id}_logs`) || sessionStorage.getItem(`project_${id}_logs`);
        if (logsJson) {
          const logsData = JSON.parse(logsJson);
          setProjectLogs(Array.isArray(logsData) ? logsData : []);
        } else {
          // Generate project logs that match the actual project data
          const generatedLogs: ProjectLog[] = [
            {
              id: `log-${Date.now()}-1`,
              action: AuditAction.CREATE,
              details: `Project "${projectWithTeam.name}" created`,
              timestamp: projectWithTeam.createdAt,
              user: {
                id: projectWithTeam.projectManager.id,
                firstName: projectWithTeam.projectManager.firstName,
                lastName: projectWithTeam.projectManager.lastName
              }
            },
            {
              id: `log-${Date.now()}-2`,
              action: AuditAction.UPDATE,
              details: `Project status set to ${getStatusLabel(projectWithTeam.status)}`,
              timestamp: new Date(new Date(projectWithTeam.createdAt).getTime() + 86400000).toISOString(),
              user: {
                id: projectWithTeam.projectManager.id,
                firstName: projectWithTeam.projectManager.firstName,
                lastName: projectWithTeam.projectManager.lastName
              }
            }
          ];
          
          // Add team member logs
          projectWithTeam.team.forEach((member, index) => {
            generatedLogs.push({
              id: `log-${Date.now()}-${index + 3}`,
              action: AuditAction.UPDATE,
              details: `Team member added: ${member.firstName} ${member.lastName}`,
              timestamp: new Date(new Date(projectWithTeam.createdAt).getTime() + (86400000 * (index + 1))).toISOString(),
              user: {
                id: projectWithTeam.projectManager.id,
                firstName: projectWithTeam.projectManager.firstName,
                lastName: projectWithTeam.projectManager.lastName
              }
            });
          });
          
          // Add attachment logs
          projectWithTeam.attachments.forEach((attachment, index) => {
            generatedLogs.push({
              id: `log-${Date.now()}-${index + projectWithTeam.team.length + 3}`,
              action: AuditAction.UPDATE,
              details: `File uploaded: ${attachment.name}`,
              timestamp: attachment.createdAt,
              user: {
                id: attachment.uploadedBy.id,
                firstName: attachment.uploadedBy.firstName,
                lastName: attachment.uploadedBy.lastName
              }
            });
          });
          
          // Sort logs by timestamp (newest first)
          generatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setProjectLogs(generatedLogs);
          
          // Save to localStorage for future use
          localStorage.setItem(`project_${id}_logs`, JSON.stringify(generatedLogs));
        }
      } catch (err) {
        console.error('Error fetching project logs:', err);
        setProjectLogs([]);
      }
      
      // Add this to the fetchProjectData function after the logs section
      // Try to get weekly updates
      try {
        // Get weekly updates from localStorage if available
        const updatesJson = localStorage.getItem(`project_${id}_weekly_updates`) || sessionStorage.getItem(`project_${id}_weekly_updates`);
        if (updatesJson) {
          const updatesData = JSON.parse(updatesJson);
          setWeeklyUpdates(Array.isArray(updatesData) ? updatesData : []);
        } else {
          // Generate weekly updates based on project data
          const startDate = new Date(projectWithTeam.startDate);
          const now = new Date();
          const weekCount = Math.min(
            3,
            Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
          );
          
          const updates = Array.from({ length: weekCount }, (_, i) => {
            const weekDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
            const progressValue = Math.min(100, Math.max(5, Math.round(projectWithTeam.progress - (i * 15))));
            const budgetValue = Math.min(projectWithTeam.budget, Math.max(0, Math.round(projectWithTeam.actualCost - (i * projectWithTeam.budget / 10))));
            const budgetPercent = Math.round((budgetValue / projectWithTeam.budget) * 100);
            
            // Calculate remaining days as of this update
            const endDate = new Date(projectWithTeam.endDate);
            const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - weekDate.getTime()) / (24 * 60 * 60 * 1000)));
            
            return {
              id: `weekly-update-${i + 1}`,
              week: `Week of ${weekDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
              progressUpdate: `${progressValue}% complete. ${
                progressValue < 30 
                  ? 'Project is in early stages.' 
                  : progressValue < 60 
                    ? 'Project is progressing as planned.' 
                    : progressValue < 90 
                      ? 'Project is nearing completion.' 
                      : 'Project is in final stages.'
              }`,
              budgetUpdate: `$${budgetValue.toLocaleString()} spent of $${projectWithTeam.budget.toLocaleString()} budget (${budgetPercent}% of budget used).`,
              timeline: `${daysRemaining} days remaining until project deadline.`,
              createdAt: weekDate.toISOString(),
              comments: [],
              attachments: []
            };
          });
          
          // Sort updates by date (newest first)
          updates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setWeeklyUpdates(updates);
          
          // Save to localStorage for future use
          localStorage.setItem(`project_${id}_weekly_updates`, JSON.stringify(updates));
        }
      } catch (err) {
        console.error('Error generating weekly updates:', err);
        setWeeklyUpdates([]);
      }
      
      setProject(projectWithTeam);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  }, [id, projects]);

  // Add back the useEffect that calls fetchProjectData
  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData, lastUpdated]);

  // Load tasks from context when they change
  useEffect(() => {
    if (contextTasks && id) {
      console.log('ProjectDetail: Context tasks changed, updating local state with filtered tasks');
      // Make a deep copy to avoid reference issues
      const filteredTasks = contextTasks
        .filter(task => String(task.projectId) === String(id))
        .map(task => ({...task}));
      
      console.log(`ProjectDetail: Filtered tasks for project ${id}:`, filteredTasks.length, 'out of', contextTasks.length);
      
      // Only update state if we have different tasks to avoid infinite loop
      // Use JSON.stringify for deep comparison
      const currentTasksJson = JSON.stringify(tasks.map(t => t.id).sort());
      const newTasksJson = JSON.stringify(filteredTasks.map(t => t.id).sort());
      
      if (currentTasksJson !== newTasksJson) {
        console.log('ProjectDetail: Tasks have changed, updating state');
        setTasks(filteredTasks);
        setProjectTasks(filteredTasks);
      } else {
        console.log('ProjectDetail: No change in tasks, skipping state update');
      }
    }
  }, [contextTasks, id, tasks]);

  // Debug tasks whenever they change
  useEffect(() => {
    console.log('ProjectDetail: Current tasks state changed:', tasks.length, 'tasks');
    console.log('ProjectDetail: Current projectTasks state changed:', projectTasks.length, 'tasks');
  }, [tasks, projectTasks]);

  // Remove the redundant effect that duplicates task syncing
  // This was causing issues with tasks disappearing due to race conditions
  // useEffect(() => {
  //   if (contextTasks && id) {
  //     const filteredTasks = contextTasks.filter(task => task.projectId === id);
  //     setProjectTasks(filteredTasks);
  //     setTasks(filteredTasks);
  //     console.log('Task state synchronized across views:', filteredTasks);
  //   }
  // }, [contextTasks, id]);

  // Update the useEffect for loading available users
  useEffect(() => {
    if (isAddTeamMemberDialogOpen && user?.token) {
      const fetchUsers = async () => {
        try {
          // In a real app, you would fetch users from your API
          // For now, we'll use mock data, but filter out users already in the team
          if (project) {
            const currentTeamIds = project.team.map(member => member.id);
            setAvailableUsers(importedMockUsers.filter(u => !currentTeamIds.includes(u.id)));
          } else {
            setAvailableUsers(importedMockUsers);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      
      fetchUsers();
    }
  }, [isAddTeamMemberDialogOpen, user?.token, project]);

  // Fetch attachments when the Attachments tab is selected
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!id || !user?.token || tabValue !== 3) return;
      
      try {
        // If we already have attachments in the project data, use those
        if (project && project.attachments && project.attachments.length > 0) {
          setProjectAttachments(project.attachments);
          return;
        }
        
        // In a real app, you would fetch the attachments from the API
        // For now, we'll just use the mock data
        setProjectAttachments(mockAttachments);
      } catch (err) {
        console.error('Error fetching attachments:', err);
      }
    };
    
    fetchAttachments();
  }, [id, user?.token, tabValue, project]);

  // Fetch project logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!id || !user?.token) return;
      
      try {
        console.log("Fetching logs for project:", id);
        const logsResponse = await api.auditLogs.getAuditLogsByProject(id, user.token);
        
        if (logsResponse && Array.isArray(logsResponse)) {
          console.log("Logs fetched successfully:", logsResponse);
          setProjectLogs(logsResponse);
        } else {
          console.error("Error fetching logs:", logsResponse);
          // Create initial logs if no logs found
          const initialLog: ProjectLog = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            action: AuditAction.PROJECT_VIEWED,
            userId: user.id || 'system',
            projectId: id,
            details: 'Project was viewed',
            username: `${user.firstName} ${user.lastName}` || 'System'
          };
          setProjectLogs([initialLog]);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
        // Handle error case
        setProjectLogs([]);
      }
    };

    fetchLogs();
  }, [id, user?.token, user?.id, user?.firstName, user?.lastName]);

  // Gantt Chart error handling
  const { t } = useTranslation();
  const [ganttError, setGanttError] = useState<string | null>(null);
  const handleGanttError = (error: Error) => {
    console.error('Gantt chart error:', error);
    setGanttError(error.message || 'An error occurred loading the Gantt chart');
  };

  // Check user permissions
  const userCanAddTasks = user?.role ? canAddTasks(user.role) : false;
  const userCanRequestTasks = user?.role ? canRequestTasks(user.role) : false;
  const userCanManageProjects = user?.role ? canManageProjects(user.role) : false;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Define handleGoBack function if it doesn't exist
  const handleGoBack = () => {
    navigate('/projects');
  };

  // Use the fetched project data instead of the mock
  const projectData = project || mockProject;

  // Calculate project progress
  const progress = projectData.progress;
  const daysTotal = Math.ceil((new Date(projectData.endDate).getTime() - new Date(projectData.startDate).getTime()) / (1000 * 3600 * 24));
  const daysElapsed = Math.ceil((new Date().getTime() - new Date(projectData.startDate).getTime()) / (1000 * 3600 * 24));
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const isOverdue = new Date() > new Date(projectData.endDate) && projectData.status !== ProjectStatus.COMPLETED;

  // Handle adding a task directly
  const handleAddTask = async (newTask: any) => {
    try {
      console.log('ProjectDetailPage: Adding task with data:', newTask);
      
      // Validate that we have a project ID
      const targetProjectId = id;
      if (!targetProjectId) {
        console.error('ProjectDetailPage: No project ID available for adding task');
        setSnackbar({
          open: true,
          message: 'Cannot add task: No project ID available',
          severity: 'error'
        });
        return;
      }
      
      // Ensure the task has a projectId
      const taskData = {
        ...newTask,
        projectId: targetProjectId
      };
      
      console.log('ProjectDetailPage: Calling context addTask with data:', taskData);
      // Call the context's addTask function
      const result = await addTask(taskData);
      console.log('ProjectDetailPage: Result from context addTask:', result);
      
      if (result.success) {
        // Update the local state directly with the new task to avoid refresh race conditions
        const newTask = result.data;
        setTasks(prevTasks => {
          // Only add if it doesn't already exist
          const exists = prevTasks.some(t => t.id === newTask.id);
          if (!exists) {
            return [...prevTasks, newTask];
          }
          return prevTasks;
        });
        
        setProjectTasks(prevTasks => {
          // Only add if it doesn't already exist
          const exists = prevTasks.some(t => t.id === newTask.id);
          if (!exists) {
            return [...prevTasks, newTask];
          }
          return prevTasks;
        });
        
        // Close the dialog and show success message
        setIsAddTaskDialogOpen(false);
        setSnackbar({
          open: true,
          message: 'Task added successfully',
          severity: 'success'
        });
      } else {
        console.error('ProjectDetailPage: Error adding task:', result.error);
        setSnackbar({
          open: true,
          message: 'Failed to add task: ' + (result.error || 'Unknown error'),
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('ProjectDetailPage: Error adding task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to add task: ' + (err instanceof Error ? err.message : 'Unknown error'),
        severity: 'error'
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      await updateTask(taskId, updatedTask);
      
      // Update local state to ensure immediate UI update
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task)
      );
      setProjectTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task)
      );
      
      setSnackbar({
        open: true,
        message: 'Task updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update task',
        severity: 'error'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Update local state to ensure immediate UI update
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setProjectTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      setSnackbar({
        open: true,
        message: 'Task deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete task',
        severity: 'error'
      });
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await moveTask(taskId, newStatus);
      
      // Update local state to ensure immediate UI update
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
      setProjectTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
      
      setSnackbar({
        open: true,
        message: `Task moved to ${newStatus.replace('_', ' ')}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error moving task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to move task',
        severity: 'error'
      });
    }
  };

  const handleOpenAddTeamMemberDialog = () => {
    setSelectedTeamMembers([]);
    setIsAddTeamMemberDialogOpen(true);
  };
  
  const handleCloseAddTeamMemberDialog = () => {
    setIsAddTeamMemberDialogOpen(false);
  };
  
  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddTaskOpen = (status?: TaskStatus) => {
    if (status) {
      setNewTaskStatus(status);
    }
    setIsAddTaskDialogOpen(true);
  };

  const handleGanttTaskClick = (task: Task) => {
    console.log('Task clicked from Gantt:', task);
  };

  const handleRequestTask = () => {
    setIsRequestTaskDialogOpen(true);
  };

  const handleTaskClick = (taskId: string) => {
    const selectedTask = projectTasks.find(task => task.id === taskId);
    if (selectedTask) {
      setSelectedTask(selectedTask);
      setIsTaskDetailDialogOpen(true);
    }
  };

  // Show snackbar function
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar function
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Wrapper function to handle task creation from components
  const handleTaskAddedWrapper = async (successOrTask: boolean | any) => {
    console.log('ProjectDetailPage: handleTaskAddedWrapper called with:', successOrTask);
    
    // The input can be either a boolean (simple success/failure) or actual task data
    if (typeof successOrTask === 'boolean') {
      // Boolean result means simple success/failure from legacy components
      if (successOrTask) {
        // Show success message
        setSnackbar({
          open: true,
          message: 'Task added successfully',
          severity: 'success'
        });
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: 'Failed to add task',
          severity: 'error'
        });
      }
    } 
    // Handle actual task data - this is the case from AddTaskDialog
    else if (successOrTask && typeof successOrTask === 'object') {
      console.log('ProjectDetailPage: Received task object to add:', successOrTask);
      
      try {
        // Use our handleAddTask function to process the task
        await handleAddTask(successOrTask);
        console.log('ProjectDetailPage: Task successfully added via handleAddTask');
      } catch (error) {
        console.error('ProjectDetailPage: Error handling task object:', error);
        setSnackbar({
          open: true,
          message: 'Failed to add task: ' + (error instanceof Error ? error.message : 'Unknown error'),
          severity: 'error'
        });
      }
    }
    
    // Always close the dialog
    setIsAddTaskDialogOpen(false);
  };

  // Handle log pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get action color
  const getActionColor = (action: AuditAction) => {
    switch(action) {
      case AuditAction.CREATE: return 'success';
      case AuditAction.UPDATE: return 'primary';
      case AuditAction.DELETE: return 'error';
      case AuditAction.APPROVE: return 'success';
      case AuditAction.REJECT: return 'error';
      case AuditAction.SUBMIT: return 'info';
      default: return 'default';
    }
  };

  // Change request handlers
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openChangeRequestMenu = Boolean(anchorEl);
  
  const handleChangeRequestMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChangeRequestMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangeRequestOpen = (type: ChangeRequestType | null = null) => {
    setChangeRequestType(type);
    setIsChangeRequestDialogOpen(true);
    handleChangeRequestMenuClose();
  };

  const handleChangeRequestClose = () => {
    setIsChangeRequestDialogOpen(false);
  };

  const handleChangeRequestSubmitted = () => {
    setSnackbar({
      open: true,
      message: 'Change request submitted successfully!',
      severity: 'success'
    });
  };

  // Add state for change request menu and dialog
  const [isChangeRequestDialogOpen, setIsChangeRequestDialogOpen] = useState(false);

  // Let's modify the handleChangeRequestMenuItemClick function to use our enum values
  const handleChangeRequestMenuItemClick = (type: ChangeRequestType) => {
    handleChangeRequestMenuClose();
    handleChangeRequestOpen(type);
  };

  // Helper function to generate consistent colors for avatars
  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  // Helper function to properly update project state and localStorage
  const updateProjectState = (updatedFields: Partial<ProjectWithTeamData>) => {
    // Only update if we have a project and ID
    if (!project || !id) {
      console.error('Cannot update project: No project or ID available');
      return;
    }
    
    console.log('Updating project state with fields:', updatedFields);
    
    try {
      // Create a fresh copy of the current project
      const updatedProject = { ...project, ...updatedFields, updatedAt: new Date().toISOString() };
      console.log('New project state:', updatedProject);
      
      // First update the local component state - make sure to force a new object reference
      setProject(JSON.parse(JSON.stringify(updatedProject)));
      
      // Force a direct update of projectData variable for the UI reference
      if (updatedFields.actualCost !== undefined) {
        projectData.actualCost = updatedFields.actualCost;
        
        // Force update of DOM elements if they exist
        setTimeout(() => {
          const actualCostElement = document.getElementById('actual-cost-display');
          if (actualCostElement) {
            actualCostElement.textContent = `$${updatedFields.actualCost.toLocaleString()}`;
          }
          
          const remainingBudgetElement = document.getElementById('remaining-budget-display');
          if (remainingBudgetElement) {
            remainingBudgetElement.textContent = `$${(projectData.budget - updatedFields.actualCost).toLocaleString()}`;
          }
        }, 100);
      }
      
      if (updatedFields.status !== undefined) {
        projectData.status = updatedFields.status;
      }
      
      // Then update localStorage - both in the projects array and individual entry
      try {
        // Update the individual project entry
        localStorage.setItem(`project_${id}`, JSON.stringify(updatedProject));
        
        // Also update in the projects array if it exists
        const projectsJson = localStorage.getItem('projects');
        if (projectsJson) {
          const allProjects = JSON.parse(projectsJson);
          const updatedProjects = allProjects.map((p: any) => {
            if (p.id === id) {
              return { ...p, ...updatedFields, updatedAt: new Date().toISOString() };
            }
            return p;
          });
          localStorage.setItem('projects', JSON.stringify(updatedProjects));
        }
        
        console.log('Successfully updated localStorage with new project state');
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      
      // Force a re-render by updating lastUpdated state
      const currentTime = new Date().toISOString();
      setLastUpdated(currentTime);
    } catch (err) {
      console.error('Error in updateProjectState:', err);
    }
  };

  // Update the handleUpdateProjectStatus function to use the new helper
  const handleUpdateProjectStatus = async () => {
    // Log the current state for debugging with specific type information
    console.log('Update status called with status:', updatedStatus, typeof updatedStatus);
    console.log('Current project status:', project?.status, typeof project?.status);
    console.log('Project state before update:', project);
    
    // Validate required data - removed token check
    if (!id || !updatedStatus) {
      console.log('Cannot update: missing data', { id, updatedStatus });
      return;
    }
    
    setIsUpdating(true);
    try {
      // Create a log entry for the change
      const newLog: ProjectLog = {
        id: `log-${Date.now()}`,
        action: AuditAction.UPDATE,
        details: `Project status updated to ${getStatusLabel(updatedStatus as string)}`,
        user: {
          id: user?.id || 'system',
          firstName: user?.firstName || 'System',
          lastName: user?.lastName || 'User'
        },
        timestamp: new Date().toISOString()
      };
      
      // Update the project using our helper function
      updateProjectState({ status: updatedStatus });
      
      // Update logs
      const updatedLogs = [newLog, ...projectLogs];
      setProjectLogs(updatedLogs);
      localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
      
      // Show success message
      showSnackbar(`Status updated to ${getStatusLabel(updatedStatus as string)}`, 'success');
    } catch (err) {
      console.error('Error in status update:', err);
      showSnackbar('Error updating status', 'error');
    } finally {
      // Clean up
      setUpdatedStatus(null);
      setIsUpdating(false);
      setIsEditStatusDialogOpen(false);
      console.log('Status update finished, dialog closed');
    }
  };

  // Update the handleUpdateProjectCost function to use the new helper
  const handleUpdateProjectCost = async () => {
    if (!id || updatedCost === null) return;
    
    console.log('Updating project cost from', project?.actualCost, 'to', updatedCost);
    
    setIsUpdating(true);
    try {
      // Create a new log entry
      const newLog: ProjectLog = {
        id: `log-${Date.now()}`,
        action: AuditAction.UPDATE,
        details: `Project actual cost updated to $${updatedCost.toLocaleString()}`,
        user: {
          id: user?.id || 'system',
          firstName: user?.firstName || 'System',
          lastName: user?.lastName || 'User'
        },
        timestamp: new Date().toISOString()
      };
      
      // Update the project using our helper function
      updateProjectState({ actualCost: updatedCost });
      
      // Update logs list with the new log at the top
      const updatedLogs = [newLog, ...projectLogs];
      setProjectLogs(updatedLogs);
      
      // Save to localStorage for persistence
      localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
      
      showSnackbar(`Project cost updated to $${updatedCost.toLocaleString()}`, 'success');
      
      // Force a re-render
      setTimeout(() => {
        const currentTime = new Date().toISOString();
        setLastUpdated(currentTime);
        console.log('Forced additional UI refresh for cost update');
      }, 100);
    } catch (err) {
      console.error('Error updating project cost:', err);
      showSnackbar('Failed to update project cost', 'error');
    } finally {
      setIsUpdating(false);
      setIsEditCostDialogOpen(false);
    }
  };

  // Handle team members change
  const handleTeamMembersChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedTeamMembers(typeof value === 'string' ? value.split(',') : value);
  };
  
  // Handle adding team members
  const handleAddTeamMembers = async () => {
    if (!id || selectedTeamMembers.length === 0) return;
    
    setAddingTeamMembers(true);
    try {
      // Get the selected users from the available users array
      const newTeamMembers = selectedTeamMembers.map(userId => {
        const foundUser = availableUsers.find(u => u.id === userId);
        if (foundUser) {
          // If we found the user in our available users, just use that
          return foundUser;
        } else {
          // Create a minimal valid User if not found
          return {
            id: userId,
            firstName: `User`,
            lastName: userId,
            email: `user${userId}@example.com`,
            role: UserRole.DEVELOPER,
            department: {
              id: '0',
              name: 'Unknown Department',
              description: 'Unknown department',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User;
        }
      });
      
      // Update the project's team using our helper function
      if (project) {
        const updatedTeam = [...(project.team || []), ...newTeamMembers];
        updateProjectState({ team: updatedTeam });
        
        // Save directly to localStorage for persistence
        localStorage.setItem(`project_${id}_team`, JSON.stringify(updatedTeam));
        
        // Add logs for the team member additions
        const newLogs = newTeamMembers.map((member, index) => ({
          id: `log-${Date.now()}-team-${index}`,
          action: AuditAction.UPDATE,
          details: `Team member added: ${member.firstName} ${member.lastName}`,
          timestamp: new Date().toISOString(),
          user: {
            id: user?.id || '1',
            firstName: user?.firstName || 'System',
            lastName: user?.lastName || 'User'
          }
        }));
        
        // Update logs state
        const updatedLogs = [...newLogs, ...projectLogs];
        setProjectLogs(updatedLogs);
        
        // Save logs to localStorage
        localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
        
        // Update availableUsers to remove the newly added team members
        setAvailableUsers(prevUsers => 
          prevUsers.filter(u => !selectedTeamMembers.includes(u.id))
        );
        
        // Show success message
        showSnackbar(`Added ${newTeamMembers.length} team member${newTeamMembers.length > 1 ? 's' : ''}`, 'success');
      }
      
      handleCloseAddTeamMemberDialog();
    } catch (err) {
      console.error('Error adding team members:', err);
      showSnackbar('Failed to add team members', 'error');
    } finally {
      setAddingTeamMembers(false);
      setSelectedTeamMembers([]);
    }
  };

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray]);
      
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Remove a selected file before upload
  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <PdfIcon color="error" />;
    } else if (fileType.includes('image')) {
      return <ImageIcon color="primary" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DocIcon color="info" />;
    }
    return <FileIcon />;
  };

  // Handle download attachment
  const handleDownloadAttachment = (attachment: Attachment) => {
    // In a real app, you would implement a proper download mechanism
    window.open(attachment.url, '_blank');
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id || !user?.token) return;
    
    try {
      // Find the attachment to be deleted
      const attachmentToDelete = projectAttachments.find(att => att.id === attachmentId);
      if (!attachmentToDelete) {
        console.error('Attachment not found:', attachmentId);
        return;
      }
      
      // Remove the attachment from the state
      const updatedAttachments = projectAttachments.filter(att => att.id !== attachmentId);
      setProjectAttachments(updatedAttachments);
      
      // Also update the project if we have it in state
      if (project) {
        const updatedProject = {
          ...project,
          attachments: updatedAttachments
        };
        setProject(updatedProject);
      }
      
      // Save to localStorage for persistence
      localStorage.setItem(`project_${id}_attachments`, JSON.stringify(updatedAttachments));
      
      // Create a log for the deletion
      const newLog = {
        id: `log-${Date.now()}-file-delete`,
        action: AuditAction.DELETE,
        details: `File deleted: ${attachmentToDelete.name}`,
        timestamp: new Date().toISOString(),
        user: {
          id: user.id || '1',
          firstName: user.firstName || 'System',
          lastName: user.lastName || 'User'
        }
      };
      
      // Update logs state
      const updatedLogs = [newLog, ...projectLogs];
      setProjectLogs(updatedLogs);
      
      // Save logs to localStorage
      localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
      
      // Show success message
      showSnackbar('File deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting attachment:', err);
      showSnackbar('Failed to delete file', 'error');
    }
  };

  // Upload files to the server
  const handleUploadFiles = async () => {
    if (!selectedFiles.length || !id) {
      return;
    }
    
    setUploadingFile(true);
    
    try {
      // Simulate uploading files to a server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create attachment objects for each file
      const newAttachments: Attachment[] = selectedFiles.map((file, index) => {
        return {
          id: `attachment-${Date.now()}-${index}`,
          name: file.name,
          filename: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // In a real app, this would be a server URL
          uploadedBy: {
            id: user?.id || '1',
            firstName: user?.firstName || 'System',
            lastName: user?.lastName || 'User'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      
      // Update attachments state
      const updatedAttachments = [...projectAttachments, ...newAttachments];
      setProjectAttachments(updatedAttachments);
      
      // Update project with new attachments using our helper function
      if (project) {
        const combinedAttachments = [...(project.attachments || []), ...newAttachments];
        updateProjectState({ attachments: combinedAttachments });
      }
      
      // Save directly to localStorage
      localStorage.setItem(`project_${id}_attachments`, JSON.stringify(updatedAttachments));
      
      // Create new log entries for each upload
      const newLogs: ProjectLog[] = newAttachments.map((attachment, index) => ({
        id: `log-${Date.now()}-file-${index}`,
        action: AuditAction.CREATE,
        details: `Attachment uploaded: ${attachment.name}`,
        timestamp: new Date().toISOString(),
        user: {
          id: user?.id || '1',
          firstName: user?.firstName || 'System',
          lastName: user?.lastName || 'User'
        }
      }));
      
      // Update logs state
      const updatedLogs = [...newLogs, ...projectLogs];
      setProjectLogs(updatedLogs);
      
      // Save logs to localStorage
      localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
      
      // Show success message
      showSnackbar(`Successfully uploaded ${newAttachments.length} file${newAttachments.length > 1 ? 's' : ''}`, 'success');
      
      // Reset form after upload
      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Failed to upload files:', error);
      showSnackbar('Failed to upload files', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle a request for a task
  const handleRequestTaskSubmit = async (taskData: Partial<Task>) => {
    try {
      // In a real app, you would send this to a task request endpoint
      console.log('Task request submitted:', taskData);
      setIsRequestTaskDialogOpen(false);
    } catch (err) {
      console.error('Error submitting task request:', err);
    }
  };

  // Handle opening the edit task dialog
  const handleEditTask = (taskId: string) => {
    const taskToEdit = projectTasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setSelectedTaskForEdit(taskToEdit);
      setIsEditTaskDialogOpen(true);
    }
  };

  // Handle task update (edit)
  const handleUpdateTaskDetails = async (taskId: string, updatedTask: Partial<Task>): Promise<void> => {
    try {
      await handleUpdateTask(taskId, updatedTask);
      setSnackbar({
        open: true,
        message: 'Task updated successfully',
        severity: 'success'
      });
      
      // Update the local state for the selected task
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          ...updatedTask
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update task',
        severity: 'error'
      });
      console.error('Error updating task:', error);
    }
  };

  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<Task | null>(null);

  const handleDeleteTaskClick = (taskId: string) => {
    const taskToDelete = projectTasks.find(task => task.id === taskId);
    if (taskToDelete) {
      setSelectedTaskForDelete(taskToDelete);
      setIsDeleteTaskDialogOpen(true);
    }
  };

  // Add new helper functions for weekly update management
  const handleAddUpdateComment = (updateId: string) => {
    if (!updateComment.trim() || !user) return;
    
    try {
      // Find the update to add the comment to
      const updatedWeeklyUpdates = weeklyUpdates.map(update => {
        if (update.id === updateId) {
          // Add the new comment
          const newComment = {
            id: `comment-${Date.now()}`,
            text: updateComment,
            author: {
              id: user.id || '1',
              firstName: user.firstName || 'System',
              lastName: user.lastName || 'User'
            },
            createdAt: new Date().toISOString()
          };
          
          return {
            ...update,
            comments: [...update.comments, newComment]
          };
        }
        return update;
      });
      
      // Update state
      setWeeklyUpdates(updatedWeeklyUpdates);
      
      // Save to localStorage
      localStorage.setItem(`project_${id}_weekly_updates`, JSON.stringify(updatedWeeklyUpdates));
      
      // Add log entry
      const newLog = {
        id: `log-${Date.now()}-update-comment`,
        action: AuditAction.UPDATE,
        details: `Comment added to weekly update`,
        timestamp: new Date().toISOString(),
        user: {
          id: user.id || '1',
          firstName: user.firstName || 'System',
          lastName: user.lastName || 'User'
        }
      };
      
      const updatedLogs = [newLog, ...projectLogs];
      setProjectLogs(updatedLogs);
      localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
      
      // Clear the comment input
      setUpdateComment('');
      setSelectedUpdateId(null);
      
      // Show success message
      showSnackbar('Comment added successfully', 'success');
    } catch (err) {
      console.error('Error adding comment to update:', err);
      showSnackbar('Failed to add comment', 'error');
    }
  };

  const handleUpdateFileSelect = () => {
    if (updateFileInputRef.current) {
      updateFileInputRef.current.click();
    }
  };

  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUpdateFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleAddUpdateAttachments = (updateId: string) => {
    if (!updateFiles.length || !user) return;
    
    try {
      // Create attachment objects
      const newAttachments = updateFiles.map((file, index) => ({
        id: `attachment-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedBy: {
          id: user.id || '1',
          firstName: user.firstName || 'System',
          lastName: user.lastName || 'User'
        },
        createdAt: new Date().toISOString()
      }));
      
      // Update the weekly updates
      const updatedWeeklyUpdates = weeklyUpdates.map(update => {
        if (update.id === updateId) {
          return {
            ...update,
            attachments: [...update.attachments, ...newAttachments]
          };
        }
        return update;
      });
      
      // Update state
      setWeeklyUpdates(updatedWeeklyUpdates);
      
      // Save to localStorage
      localStorage.setItem(`project_${id}_weekly_updates`, JSON.stringify(updatedWeeklyUpdates));
      
      // Add log entry
      const newLog = {
        id: `log-${Date.now()}-update-attachment`,
        action: AuditAction.UPDATE,
        details: `Attachment added to weekly update`,
        timestamp: new Date().toISOString(),
        user: {
          id: user.id || '1',
          firstName: user.firstName || 'System',
          lastName: user.lastName || 'User'
        }
      };
      
      const updatedLogs = [newLog, ...projectLogs];
      setProjectLogs(updatedLogs);
      localStorage.setItem(`project_${id}_logs`, JSON.stringify(updatedLogs));
      
      // Clear files
      setUpdateFiles([]);
      
      // Show success message
      showSnackbar('Attachments added successfully', 'success');
    } catch (err) {
      console.error('Error adding attachments to update:', err);
      showSnackbar('Failed to add attachments', 'error');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      // Use the imported mock users instead of API call
      setTimeout(() => {
        // Split the imported mock users - first 5 as team members, rest as available
        const teamMembers = importedMockUsers.slice(0, 5);
        const availableUsers = importedMockUsers.slice(5);
        
        // Update state with the mock data
        setProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            team: teamMembers
          };
        });
        
        setAvailableUsers(availableUsers);
        setIsLoading(false);
      }, 500);
      
      // Comment out the original API call for now
      /*
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/team`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data = await response.json();
      setTeamMembers(data.teamMembers || []);
      setAvailableUsers(data.availableUsers || []);
      */
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Use a standard snackbar instead of toast
      setSnackbar({
        open: true,
        message: 'Failed to load team members',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {auditResult && !auditResult.passed && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => console.log('Audit details:', auditResult)}>
              View Details
            </Button>
          }
        >
          This project has compliance issues with client terms. Please review and address them.
        </Alert>
      )}
      <Button 
        startIcon={<BackIcon />} 
        onClick={handleGoBack} 
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4" component="h1">
              {projectData.name}
            </Typography>
            <Tooltip title={`Status: ${getStatusLabel(projectData.status)}${isOverdue ? ' (Overdue)' : ''}`}>
              <Chip 
                label={getStatusLabel(projectData.status)} 
                color={getStatusColor(projectData.status, projectData.endDate) as any}
                sx={{ fontWeight: 'bold' }}
              />
            </Tooltip>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Project Details</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {userCanManageProjects && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<ChangeCircleIcon />}
                    onClick={handleChangeRequestMenuOpen}
                  >
                    Change Request
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={openChangeRequestMenu}
                    onClose={handleChangeRequestMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: { minWidth: 200 }
                    }}
                  >
                    <MenuItem onClick={() => handleChangeRequestMenuItemClick(ChangeRequestType.SCHEDULE)}>
                      <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Schedule Change</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestMenuItemClick(ChangeRequestType.CLOSURE)}>
                      <ListItemIcon><TaskAltIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Project Closure</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestMenuItemClick(ChangeRequestType.SCOPE)}>
                      <ListItemIcon><ZoomOutMapIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Scope Change</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestMenuItemClick(ChangeRequestType.BUDGET)}>
                      <ListItemIcon><AccountBalanceWalletIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Budget Change</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestMenuItemClick(ChangeRequestType.RESOURCE)}>
                      <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Resource Change</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestMenuItemClick(ChangeRequestType.OTHER)}>
                      <ListItemIcon><CategoryIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Other Change</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
              {userCanAddTasks ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddTaskOpen()}
                >
                  Add Task
                </Button>
              ) : userCanRequestTasks ? (
                <Button
                  variant="outlined"
                  startIcon={<RequestIcon />}
                  onClick={handleRequestTask}
                >
                  Request Task
                </Button>
              ) : null}
            </Box>
          </Box>
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {projectData.description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
            <Typography variant="body1">{projectData.projectManager.firstName} {projectData.projectManager.lastName}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1">{projectData.department.name}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
            <Typography variant="body1">
              {new Date(projectData.startDate).toLocaleDateString()} - {new Date(projectData.endDate).toLocaleDateString()}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Completion</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1">{progress}%</Typography>
              {isOverdue && (
                <Chip label="Overdue" size="small" color="error" />
              )}
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
            <Tab icon={<CalendarIcon />} label="Overview" {...a11yProps(0)} />
            <Tab icon={<TeamIcon />} label="Team" {...a11yProps(1)} />
            <Tab icon={<KanbanIcon />} label="Tasks" {...a11yProps(2)} />
            <Tab icon={<UploadIcon />} label="Attachments" {...a11yProps(3)} />
            <Tab icon={<SummarizeIcon />} label="Weekly Updates" {...a11yProps(4)} />
            <Tab icon={<LogIcon />} label="Logs" {...a11yProps(5)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Project Overview</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Status */}
                  <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={getStatusLabel(projectData.status)} 
                          color={getStatusColor(projectData.status, projectData.endDate) as any}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body1">{getStatusLabel(projectData.status)}</Typography>
                      </Box>
                    </Box>
                    {userCanManageProjects && (
                      <IconButton 
                        size="small"
                        color="primary"
                        onClick={() => {
                          // Make sure we're setting the status from the project object
                          // which is our source of truth
                          const currentStatus = project?.status || ProjectStatus.PLANNING;
                          console.log('Setting initial status for dialog:', currentStatus);
                          
                          // Force status update by using the current status value
                          setUpdatedStatus(currentStatus);
                          
                          // Open the dialog
                          setIsEditStatusDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* Budget */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Budget
                    </Typography>
                    <Typography variant="body1">${projectData.budget.toLocaleString()}</Typography>
                  </Box>
                  
                  {/* Actual Cost */}
                  <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Actual Cost
                      </Typography>
                      <Typography variant="body1" id="actual-cost-display">${projectData.actualCost.toLocaleString()}</Typography>
                    </Box>
                    {userCanManageProjects && (
                      <IconButton 
                        size="small"
                        color="primary"
                        onClick={() => {
                          setUpdatedCost(projectData.actualCost);
                          setIsEditCostDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* Remaining Budget */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Remaining
                    </Typography>
                    <Typography variant="body1" id="remaining-budget-display">${(projectData.budget - projectData.actualCost).toLocaleString()}</Typography>
                  </Box>
                  
                  {/* Days Remaining */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Days Remaining
                    </Typography>
                    <Typography variant="body1">{daysRemaining} days</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Recent Tasks</Typography>
                    {userCanAddTasks && (
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddTaskDialogOpen(true)}
                      >
                        Add Task
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {isLoading || tasksLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : contextTasks && contextTasks.filter(task => task.projectId === id).length > 0 ? (
                    <Stack spacing={2}>
                      {contextTasks
                        .filter(task => task.projectId === id)
                        .slice(0, 3)
                        .map(task => (
                          <Box key={task.id}>
                            <Typography variant="subtitle2">{task.title}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Assigned to: {typeof task.assignee === 'string' 
                                  ? task.assignee 
                                  : task.assignee?.firstName 
                                    ? `${task.assignee.firstName} ${task.assignee.lastName}` 
                                    : 'Unassigned'}
                              </Typography>
                              <Chip 
                                label={formatEnumValue(String(task.status))} 
                                size="small"
                                color={
                                  task.dueDate && new Date(task.dueDate) < new Date() 
                                    ? 'error' 
                                    : String(task.status) === 'DONE' || String(task.status) === String(TaskStatus.DONE)
                                      ? 'success' 
                                      : String(task.status) === 'IN_PROGRESS' || String(task.status) === String(TaskStatus.IN_PROGRESS)
                                        ? 'primary' 
                                        : 'default'
                                }
                              />
                            </Box>
                          </Box>
                        ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography color="text.secondary">No tasks found for this project</Typography>
                      {userCanAddTasks && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddTaskOpen()}
                          sx={{ mt: 1 }}
                        >
                          Add First Task
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Project Team</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddTeamMemberDialog}
            >
              Add Team Member
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Always display the project manager */}
            <Box key={projectData.projectManager.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' } }}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: stringToColor(projectData.projectManager.firstName + projectData.projectManager.lastName) }}>
                      {projectData.projectManager.firstName[0]}{projectData.projectManager.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{projectData.projectManager.firstName} {projectData.projectManager.lastName}</Typography>
                      <Typography color="text.secondary">Project Manager</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {projectData.department?.name || 'Department not specified'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            
            {/* Display other team members if any */}
            {projectData.team && projectData.team.length > 0 && projectData.team.map((user) => (
              <Box key={user.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' } }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: stringToColor(user.firstName + user.lastName) }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
                        <Typography color="text.secondary">{user.role || 'Team Member'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.department?.name || 'Department not specified'}
                        </Typography>
                        {user.email && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          
          {projectData.team.length === 0 && (
            <Paper sx={{ p: 3, textAlign: 'center', mt: 3 }}>
              <Typography color="text.secondary">
                No additional team members have been added to this project yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddTeamMemberDialog}
                sx={{ mt: 2 }}
              >
                Add Team Member
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>Task Views</Typography>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={activeTaskView}
                  exclusive
                  onChange={(e, newView) => {
                    if (newView) setActiveTaskView(newView);
                  }}
                  aria-label="task view"
                  size="small"
                >
                  <ToggleButton value="kanban" aria-label="kanban view">
                    <KanbanIcon sx={{ mr: 1 }} /> Kanban Board
                  </ToggleButton>
                  <ToggleButton value="gantt" aria-label="gantt view">
                    <GanttIcon sx={{ mr: 1 }} /> Gantt Chart
                  </ToggleButton>
                  <ToggleButton value="mindmap" aria-label="mindmap view">
                    <MindMapIcon sx={{ mr: 1 }} /> Mind Map
                  </ToggleButton>
                </ToggleButtonGroup>
                <Button 
                  startIcon={<RefreshIcon />}
                  onClick={async () => {
                    try {
                      await refreshTasks();
                      if (contextTasks && id) {
                        const filteredTasks = contextTasks.filter(task => task.projectId === id);
                        setTasks(filteredTasks);
                        setProjectTasks(filteredTasks);
                        setSnackbar({
                          open: true,
                          message: 'Tasks refreshed successfully',
                          severity: 'success'
                        });
                      }
                    } catch (err) {
                      console.error('Error refreshing tasks:', err);
                      setSnackbar({
                        open: true,
                        message: 'Failed to refresh tasks',
                        severity: 'error'
                      });
                    }
                  }}
                  variant="outlined"
                  size="small"
                >
                  Refresh Tasks
                </Button>
              </Box>

              {activeTaskView === 'kanban' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage tasks by dragging them between the columns to update their status.
                  </Typography>
                  
                  {/* Remove the DragDropContext here and let KanbanBoard handle it internally */}
                  <KanbanBoard
                    project={convertToFullProject(projectData)}
                    tasks={projectTasks}
                    onTaskUpdate={(taskId, newStatus) => {
                      console.log(`Task ${taskId} moved to ${newStatus}`);
                      return handleMoveTask(taskId, newStatus);
                    }}
                    onTaskClick={(taskId) => {
                      const task = projectTasks.find(t => t.id === taskId);
                      if (task) {
                        setSelectedTask(task);
                        setIsTaskDetailDialogOpen(true);
                      }
                    }}
                    onAddComment={async (taskId, comment) => {
                      console.log('Adding comment to task:', taskId, comment);
                      return Promise.resolve();
                    }}
                    onUpdateProgress={(taskId, progress, newStatus) => {
                      handleMoveTask(taskId, newStatus);
                    }}
                    onAddTask={userCanAddTasks ? () => handleAddTaskOpen() : undefined}
                    onRequestTask={userCanRequestTasks ? handleRequestTask : undefined}
                    onEdit={userCanAddTasks ? handleEditTask : undefined}
                    onDelete={userCanAddTasks ? handleDeleteTaskClick : undefined}
                    onAttach={(taskId) => {
                      console.log('Attach files to task:', taskId);
                      // In a real app, you would open a file picker dialog here
                    }}
                  />
                </>
              )}

              {activeTaskView === 'gantt' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    View tasks in a timeline format showing dependencies and milestones.
                  </Typography>
                  
                  <ErrorBoundary onError={handleGanttError}>
                    <Box sx={{ position: 'relative', height: '600px' }}>
                      <GanttChart
                        project={convertToFullProject(projectData)}
                        tasks={projectTasks}
                        onTaskClick={handleGanttTaskClick}
                      />
                    </Box>
                  </ErrorBoundary>
                </>
              )}

              {activeTaskView === 'mindmap' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Visualize project structure, tasks, and relationships in a mind map.
                  </Typography>
                  
                  <Box sx={{ height: '600px' }}>
                    <MindMapView 
                      project={convertToFullProject(projectData)}
                      tasks={projectTasks}
                    />
                  </Box>
                </>
              )}
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Project Attachments</Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Upload Files
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : projectAttachments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <FolderIcon color="disabled" sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No Attachments</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No files have been uploaded for this project yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setIsUploadDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Upload Your First File
              </Button>
            </Paper>
          ) : (
            <Paper elevation={1}>
              <List>
                {projectAttachments.map((attachment) => (
                  <ListItem
                    key={attachment.id}
                    divider
                    secondaryAction={
                      <Box>
                        <Tooltip title="Download File">
                          <IconButton 
                            aria-label="download" 
                            onClick={() => handleDownloadAttachment(attachment)}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete File">
                          <IconButton 
                            aria-label="delete" 
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      {getFileIcon(attachment.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={attachment.filename}
                      secondary={
                        <Typography component="span" variant="body2" color="text.secondary">
                          {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy.firstName} {attachment.uploadedBy.lastName} • {
                            formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })
                          }
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Weekly Project Updates</Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage weekly progress for this project.
            </Typography>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>This Week's Update</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress Update
                  </Typography>
                  <Typography variant="body1">
                    {projectData.progress}% complete. {
                      isOverdue 
                        ? 'Project is currently behind schedule.' 
                        : 'Project is currently on track.'
                    }
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Budget Update
                  </Typography>
                  <Typography variant="body1">
                    ${projectData.actualCost.toLocaleString()} spent of ${projectData.budget.toLocaleString()} budget 
                    ({Math.round(projectData.actualCost / projectData.budget * 100)}% of budget used).
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Timeline
                  </Typography>
                  <Typography variant="body1">
                    {daysRemaining} days remaining until project deadline.
                  </Typography>
                </Box>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    // Generate a new weekly update
                    const now = new Date();
                    const newUpdate = {
                      id: `weekly-update-${Date.now()}`,
                      week: `Week of ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
                      progressUpdate: `${projectData.progress}% complete. ${
                        isOverdue 
                          ? 'Project is currently behind schedule.' 
                          : 'Project is currently on track.'
                      }`,
                      budgetUpdate: `$${projectData.actualCost.toLocaleString()} spent of $${projectData.budget.toLocaleString()} budget 
                        (${Math.round(projectData.actualCost / projectData.budget * 100)}% of budget used).`,
                      timeline: `${daysRemaining} days remaining until project deadline.`,
                      createdAt: now.toISOString(),
                      comments: [],
                      attachments: []
                    };
                    
                    const updatedWeeklyUpdates = [newUpdate, ...weeklyUpdates];
                    setWeeklyUpdates(updatedWeeklyUpdates);
                    
                    // Save to localStorage
                    localStorage.setItem(`project_${id}_weekly_updates`, JSON.stringify(updatedWeeklyUpdates));
                    
                    // Show success message
                    showSnackbar('Weekly update added successfully', 'success');
                  }}
                >
                  Add Weekly Update
                </Button>
              </Box>
              
              {/* Hidden file input for update attachments */}
              <input
                type="file"
                multiple
                style={{ display: 'none' }}
                ref={updateFileInputRef}
                onChange={handleUpdateFileChange}
              />
              
              <Paper>
                <List>
                  {weeklyUpdates.length > 0 ? (
                    weeklyUpdates.map((update, index) => (
                      <ListItem 
                        key={update.id} 
                        divider={index < weeklyUpdates.length - 1}
                        alignItems="flex-start"
                        sx={{ flexDirection: 'column', py: 2 }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {update.week}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(update.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Typography component="div" variant="body2" gutterBottom>
                            <strong>Progress:</strong> {update.progressUpdate}
                          </Typography>
                          <Typography component="div" variant="body2" gutterBottom>
                            <strong>Budget:</strong> {update.budgetUpdate}
                          </Typography>
                          <Typography component="div" variant="body2" gutterBottom>
                            <strong>Timeline:</strong> {update.timeline}
                          </Typography>
                        </Box>
                        
                        {/* Attachments section */}
                        {update.attachments.length > 0 && (
                          <Box sx={{ width: '100%', mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Attachments ({update.attachments.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {update.attachments.map(attachment => (
                                <Chip 
                                  key={attachment.id}
                                  label={attachment.name}
                                  variant="outlined"
                                  size="small"
                                  icon={getFileIcon(attachment.type) as any}
                                  onClick={() => window.open(attachment.url, '_blank')}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {/* Comments section */}
                        {update.comments.length > 0 && (
                          <Box sx={{ width: '100%', mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Comments ({update.comments.length})
                            </Typography>
                            <List sx={{ bgcolor: 'background.default', borderRadius: 1, mt: 1 }}>
                              {update.comments.map(comment => (
                                <ListItem key={comment.id} sx={{ py: 1 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: stringToColor(comment.author.firstName + comment.author.lastName) }}>
                                      {comment.author.firstName[0]}{comment.author.lastName[0]}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle2">
                                          {comment.author.firstName} {comment.author.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(comment.createdAt).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={comment.text}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* Add comment and attachment section */}
                        <Box sx={{ width: '100%', mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {selectedUpdateId === update.id ? (
                            <>
                              <TextField
                                fullWidth
                                label="Add a comment"
                                variant="outlined"
                                multiline
                                rows={2}
                                value={updateComment}
                                onChange={(e) => setUpdateComment(e.target.value)}
                              />
                              
                              {updateFiles.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  {updateFiles.map((file, i) => (
                                    <Chip 
                                      key={i}
                                      label={file.name}
                                      variant="outlined"
                                      size="small"
                                      onDelete={() => setUpdateFiles(files => files.filter((_, index) => index !== i))}
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button 
                                  variant="outlined"
                                  size="small"
                                  startIcon={<UploadIcon />}
                                  onClick={handleUpdateFileSelect}
                                >
                                  Attach Files
                                </Button>
                                
                                <Button 
                                  variant="contained"
                                  size="small"
                                  onClick={() => {
                                    // If there are files, add them as attachments
                                    if (updateFiles.length > 0) {
                                      handleAddUpdateAttachments(update.id);
                                    }
                                    
                                    // If there's a comment, add it
                                    if (updateComment.trim()) {
                                      handleAddUpdateComment(update.id);
                                    } else {
                                      // If no comment, just clear selection
                                      setSelectedUpdateId(null);
                                      setUpdateFiles([]);
                                    }
                                  }}
                                >
                                  Submit
                                </Button>
                                
                                <Button 
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    setSelectedUpdateId(null);
                                    setUpdateComment('');
                                    setUpdateFiles([]);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </>
                          ) : (
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<CommentIcon />}
                              onClick={() => setSelectedUpdateId(update.id)}
                            >
                              Add Comment or Attachment
                            </Button>
                          )}
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No updates yet"
                        secondary="Weekly updates will appear here once they are added."
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Project Activity Logs</Typography>
            <Typography variant="body2" color="text.secondary">
              Track all changes and activities related to this project.
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="project logs table">
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectLogs.length > 0 ? (
                    projectLogs
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            <Chip
                              label={log.action.replace('_', ' ')}
                              size="small"
                              color={getActionColor(log.action) as any}
                            />
                          </TableCell>
                          <TableCell>{log.details}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1,
                                  bgcolor: stringToColor(log.user?.firstName + log.user?.lastName)
                                }}
                              >
                                {log.user?.firstName.charAt(0)}
                                {log.user?.lastName.charAt(0)}
                              </Avatar>
                              {log.user?.firstName} {log.user?.lastName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <LogIcon color="disabled" sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">No Activity Logs</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No activity logs have been recorded for this project yet.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {projectLogs.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={projectLogs.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              )}
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Task Dialogs */}
      {isAddTaskDialogOpen && (
        <AddTaskDialog
          open={isAddTaskDialogOpen}
          onClose={() => setIsAddTaskDialogOpen(false)}
          projectId={id || ''}
          projectUsers={project?.team || []}
          initialStatus={newTaskStatus}
          onTaskAdded={handleTaskAddedWrapper}
        />
      )}

      {/* Add Team Member Dialog */}
      <Dialog open={isAddTeamMemberDialogOpen} onClose={handleCloseAddTeamMemberDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Team Members</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="add-team-members-label">Select Users</InputLabel>
              <Select
                labelId="add-team-members-label"
                id="add-team-members"
                multiple
                value={selectedTeamMembers}
                onChange={handleTeamMembersChange}
                input={<OutlinedInput label="Select Users" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((userId) => {
                      const user = availableUsers.find(u => u.id === userId);
                      return (
                        <Chip 
                          key={userId} 
                          label={user ? `${user.firstName} ${user.lastName}` : userId} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedTeamMembers.indexOf(user.id) > -1} />
                    <ListItemText 
                      primary={`${user.firstName} ${user.lastName}`} 
                      secondary={`${user.role} - ${user.department.name}`} 
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select users to add to the project team
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTeamMemberDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddTeamMembers}
            disabled={selectedTeamMembers.length === 0 || addingTeamMembers}
          >
            {addingTeamMembers ? 'Adding...' : 'Add to Team'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Files Dialog */}
      <Dialog open={isUploadDialogOpen} onClose={() => !uploadingFile && setIsUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Project Files</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
            />
            
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              }}
              onClick={handleUploadClick}
            >
              <UploadIcon fontSize="large" color="primary" />
              <Typography variant="body1" sx={{ mt: 1 }}>
                Click to select files or drag and drop files here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Supported file types: PDF, DOCX, XLSX, JPG, PNG, and more
              </Typography>
            </Paper>
            
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Files ({selectedFiles.length})
                </Typography>
                <List>
                  {selectedFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="remove"
                          onClick={() => handleRemoveSelectedFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUploadDialogOpen(false)} disabled={uploadingFile}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadFiles}
            variant="contained"
            disabled={selectedFiles.length === 0 || uploadingFile}
            startIcon={uploadingFile ? <CircularProgress size={24} /> : <UploadIcon />}
          >
            {uploadingFile ? 'Uploading...' : 'Upload Files'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Task Dialog */}
      <Dialog open={isRequestTaskDialogOpen} onClose={() => setIsRequestTaskDialogOpen(false)}>
        <DialogTitle>Request Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, width: '500px', maxWidth: '100%' }}>
            <TextField 
              fullWidth
              label="Task Title"
              margin="normal"
              name="title"
            />
            <TextField 
              fullWidth
              label="Task Description"
              margin="normal"
              name="description"
              multiline
              rows={4}
            />
            <TextField 
              fullWidth
              label="Reason for Request"
              margin="normal"
              name="requestReason"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRequestTaskDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleRequestTaskSubmit({
                title: 'Requested Task',
                description: 'This is a task requested by a user',
                projectId: projectData.id
              });
              setIsRequestTaskDialogOpen(false);
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Request Dialog */}
      <ChangeRequestDialog
        open={isChangeRequestDialogOpen}
        onClose={handleChangeRequestClose}
        projectId={projectData.id}
        onSubmitted={handleChangeRequestSubmitted}
        changeRequestType={changeRequestType}
      />

      {/* Project Status Update Dialog */}
      <Dialog 
        open={isEditStatusDialogOpen} 
        onClose={() => !isUpdating && setIsEditStatusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Project Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="update-status-label">Status</InputLabel>
              <Select
                labelId="update-status-label"
                value={updatedStatus || ''}
                label="Status"
                onChange={(e) => {
                  console.log('Select onChange called with value:', e.target.value);
                  setUpdatedStatus(e.target.value as ProjectStatus);
                }}
                disabled={isUpdating}
              >
                {Object.values(ProjectStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    <Chip 
                      label={getStatusLabel(status)} 
                      color={getStatusColor(status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditStatusDialogOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('Update Status button clicked with status:', updatedStatus);
              console.log('Current project status:', project?.status);
              console.log('Button state - isUpdating:', isUpdating, 'updatedStatus exists:', !!updatedStatus);
              
              // Call the handler if we have a status
              if (updatedStatus) {
                console.log('About to call handleUpdateProjectStatus');
                handleUpdateProjectStatus();
                console.log('Called handleUpdateProjectStatus');
              } else {
                console.error('No status selected');
              }
            }}
            variant="contained"
            color="primary"
            disabled={isUpdating || !updatedStatus}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Cost Update Dialog */}
      <Dialog 
        open={isEditCostDialogOpen} 
        onClose={() => !isUpdating && setIsEditCostDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Project Cost</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Actual Cost"
              type="number"
              fullWidth
              value={updatedCost || ''}
              onChange={(e) => {
                // Parse as number, ensuring valid number input
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setUpdatedCost(value);
                } else if (e.target.value === '') {
                  // Allow clearing the field
                  setUpdatedCost(0);
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={isUpdating}
            />
            {project && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Current cost: ${project.actualCost.toLocaleString()}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditCostDialogOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('Update Cost button clicked with cost:', updatedCost);
              if (updatedCost !== null) {
                handleUpdateProjectCost();
              } else {
                console.error('No cost entered');
              }
            }}
            variant="contained"
            disabled={isUpdating || updatedCost === null || (project && updatedCost === project.actualCost)}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            {isUpdating ? 'Updating...' : 'Update Cost'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add this near the bottom of the component, along with the other dialogs */}
      {selectedTaskForEdit && (
        <EditTaskDialog
          open={isEditTaskDialogOpen}
          onClose={() => setIsEditTaskDialogOpen(false)}
          onTaskUpdated={handleUpdateTaskDetails}
          task={selectedTaskForEdit}
          projectUsers={projectData.team || []}
        />
      )}
      {selectedTask && (
        <TaskDetailDialog
          open={isTaskDetailDialogOpen}
          onClose={() => setIsTaskDetailDialogOpen(false)}
          task={selectedTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAddComment={async (taskId, comment) => {
            try {
              // For now, just add the comment to the local state
              // In a real app, you would call an API to save the comment
              console.log('Adding comment to task:', taskId, comment);
              return Promise.resolve();
            } catch (error) {
              console.error('Error adding comment:', error);
              return Promise.reject(error);
            }
          }}
        />
      )}
      {selectedTaskForDelete && (
        <DeleteTaskDialog
          open={isDeleteTaskDialogOpen}
          onClose={() => setIsDeleteTaskDialogOpen(false)}
          onConfirm={handleDeleteTask}
          task={selectedTaskForDelete}
        />
      )}
    </Box>
  );
};

export default ProjectDetailPage; 
