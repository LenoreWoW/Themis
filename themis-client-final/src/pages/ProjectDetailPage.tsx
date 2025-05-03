import React, { useState, useEffect, useRef } from 'react';
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
  AvatarGroup,
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
  LinearProgress,
  Menu
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
  Person as PersonIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ChangeCircle as ChangeCircleIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Subject as SubjectIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon
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
  ProjectTemplateType
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
import { runFullAudit, AuditResult } from '../utils/auditUtils';

// Add this enum at the top of your file, just before const mockUsers
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT'
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
  department: {
    id: string;
    name: string;
  };
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  projectManager: {
    id: string;
    firstName: string;
    lastName: string;
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
  id: 'mock-project-1',
  name: 'Digital Transformation',
  description: 'Company-wide digital transformation initiative',
  department: {
    id: '1',
    name: 'Engineering'
  },
  status: ProjectStatus.IN_PROGRESS,
  priority: ProjectPriority.MEDIUM,
  startDate: new Date(2023, 0, 15).toISOString(),
  endDate: new Date(2023, 11, 31).toISOString(),
  projectManager: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe'
  },
  team: mockUsers,
  attachments: mockAttachments,
  budget: 1500000,
  actualCost: 425000,
  progress: 35,
  createdAt: new Date(2022, 11, 15).toISOString(),
  updatedAt: new Date(2023, 1, 5).toISOString()
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
    default: return status;
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

// Function to convert ProjectWithTeamData to a full Project with proper types
const convertToFullProject = (data: ProjectWithTeamData): Project => {
  // Set the project manager
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

  // Set the department
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
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  timestamp: string;
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

const ProjectDetailPage: React.FC = () => {
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
  const { tasks: contextTasks, addTask, updateTask, deleteTask, moveTask, loading: tasksLoading, error: contextError } = useTasks();
  const navigate = useNavigate();
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [addingTeamMembers, setAddingTeamMembers] = useState(false);
  const [projectAttachments, setProjectAttachments] = useState<Attachment[]>(mockAttachments);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | undefined>(undefined);
  const [projectLogs, setProjectLogs] = useState<ProjectLog[]>(mockProjectLogs);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch project data based on ID
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, this would use the API
        // const response = await projectService.getProjectById(id);
        // const projectData = response.data;
        
        // For now, find the project in the projects array or use mock data
        const foundProject = projects.find(p => p.id === id);
        
        if (foundProject) {
          // Convert to ProjectWithTeamData format if needed
          const projectWithTeam: ProjectWithTeamData = {
            id: foundProject.id,
            name: foundProject.name,
            description: foundProject.description,
            status: foundProject.status,
            priority: foundProject.priority,
            startDate: foundProject.startDate,
            endDate: foundProject.endDate,
            projectManager: foundProject.projectManager 
              ? { 
                  id: foundProject.projectManager.id,
                  firstName: foundProject.projectManager.firstName,
                  lastName: foundProject.projectManager.lastName
                }
              : { id: '1', firstName: 'Default', lastName: 'Manager' },
            department: foundProject.department 
              ? { 
                  id: foundProject.department.id,
                  name: foundProject.department.name
                }
              : { id: '1', name: 'Default Department' },
            team: mockUsers, // In a real app, you would fetch the team members
            attachments: mockAttachments, // In a real app, you would fetch the attachments
            budget: foundProject.budget,
            actualCost: foundProject.actualCost || 0,
            progress: foundProject.progress,
            createdAt: foundProject.createdAt || new Date().toISOString(), 
            updatedAt: foundProject.updatedAt || new Date().toISOString()
          };
          setProject(projectWithTeam);
        } else {
          // If project not found in the context, use the mock data as fallback
          // but with the correct ID
          const mockWithCorrectId = {
            ...mockProject,
            id: id
          };
          setProject(mockWithCorrectId);
          console.warn(`Project with ID ${id} not found in context, using mock data.`);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, projects]);

  // Load available users when needed
  useEffect(() => {
    if (isAddTeamMemberDialogOpen && user?.token) {
      const fetchUsers = async () => {
        try {
          // In a real app, you would fetch users from your API
          // For now, we'll use mock data
          setAvailableUsers(mockUsers);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      
      fetchUsers();
    }
  }, [isAddTeamMemberDialogOpen, user?.token]);

  // Fetch attachments when the Attachments tab is selected
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!id || !user?.token || tabValue !== 5) return;
      
      try {
        // In a real app, you would fetch the attachments from the API
        // For now, we'll just use the mock data
        setProjectAttachments(mockAttachments);
      } catch (err) {
        console.error('Error fetching attachments:', err);
      }
    };
    
    fetchAttachments();
  }, [id, user?.token, tabValue]);

  // Fetch logs when the Logs tab is selected
  useEffect(() => {
    const fetchLogs = async () => {
      if (!id || !user?.token || tabValue !== 7) return;
      
      try {
        // In a real app, you would fetch the logs from the API
        // For now, we'll just use mock data
        setProjectLogs(mockProjectLogs);
      } catch (err) {
        console.error('Error fetching project logs:', err);
      }
    };
    
    fetchLogs();
  }, [id, user?.token, tabValue]);

  // Gantt Chart error handling
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

  const handleAddTask = async (newTask: Task) => {
    try {
      await addTask(newTask);
      setIsAddTaskDialogOpen(false);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      await updateTask(taskId, updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await moveTask(taskId, newStatus);
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  const handleOpenAddTeamMemberDialog = () => {
    setSelectedTeamMembers([]);
    setIsAddTeamMemberDialogOpen(true);
  };
  
  const handleCloseAddTeamMemberDialog = () => {
    setIsAddTeamMemberDialogOpen(false);
  };
  
  const handleTeamMembersChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedTeamMembers(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleAddTeamMembers = async () => {
    if (!id || !user?.token || selectedTeamMembers.length === 0) return;
    
    setAddingTeamMembers(true);
    try {
      // In a real app, you would call your API to add team members
      // For now, we'll just simulate success
      console.log('Adding team members:', selectedTeamMembers);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the UI with the new team members
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
      
      // In a real app, you would refetch the project data
      // For now, we'll just update our mock data
      mockProject.team = [...mockProject.team, ...newTeamMembers];
      
      handleCloseAddTeamMemberDialog();
    } catch (err) {
      console.error('Error adding team members:', err);
    } finally {
      setAddingTeamMembers(false);
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

  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove a selected file before upload
  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Upload files to the server
  const handleUploadFiles = async () => {
    if (!id || !user?.token || selectedFiles.length === 0) return;
    
    setUploadingFile(true);
    try {
      // In a real app, you would upload the files to the API
      // For now, we'll just simulate a delay and add them to our mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new mock attachments
      const newAttachments: Attachment[] = selectedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        filename: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // In a real app, this would be the URL from the server
        uploadedBy: {
          id: user?.id || '0',
          firstName: user?.firstName || 'Unknown',
          lastName: user?.lastName || 'User'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      setProjectAttachments([...projectAttachments, ...newAttachments]);
      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
    } catch (err) {
      console.error('Error uploading files:', err);
    } finally {
      setUploadingFile(false);
    }
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
      // In a real app, you would call the API to delete the attachment
      // For now, we'll just update our local state
      setProjectAttachments(prevAttachments => 
        prevAttachments.filter(att => att.id !== attachmentId)
      );
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  // Update the handleAddTaskOpen function
  const handleAddTaskOpen = (status?: TaskStatus) => {
    if (status) {
      setNewTaskStatus(status);
    }
    setIsAddTaskDialogOpen(true);
  };

  // Add this function along with your other handlers
  const handleGanttTaskClick = (task: Task) => {
    console.log('Task clicked from Gantt:', task);
    // Do something with the task, e.g. show details
  };

  const handleRequestTask = () => {
    setIsRequestTaskDialogOpen(true);
  };

  const handleRequestTaskSubmit = async (taskData: Partial<Task>) => {
    try {
      // In a real app, you would send this to a task request endpoint
      console.log('Task request submitted:', taskData);
      setIsRequestTaskDialogOpen(false);
    } catch (err) {
      console.error('Error submitting task request:', err);
    }
  };

  // Fix for the TaskClick handler
  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
    // Do something with the task, e.g. show details
  };

  // Add a state for selected task view
  const [activeTaskView, setActiveTaskView] = useState<'kanban' | 'gantt' | 'mindmap'>('kanban');
  
  // Add shared task state to be used across all views
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  // Sync tasks from context to local state
  useEffect(() => {
    if (contextTasks) {
      setProjectTasks(contextTasks);
      console.log('Task state synchronized across views:', contextTasks);
    }
  }, [contextTasks]);

  // Add snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

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
  
  // Update the handleTaskAdded function to ensure synchronization
  const handleTaskAdded = async (newTask: Task) => {
    try {
      // Add task through context which will update the global task state
      await addTask(newTask);
      showSnackbar('Task added successfully', 'success');
    } catch (error) {
      console.error('Error adding task:', error);
      showSnackbar('Failed to add task', 'error');
    }
  };

  // Create a wrapper function that matches the expected signature for AddTaskDialog
  const handleTaskAddedWrapper = (success: boolean) => {
    if (success) {
      showSnackbar('Task added successfully', 'success');
    } else {
      showSnackbar('Failed to add task', 'error');
    }
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
  const [changeRequestType, setChangeRequestType] = useState<string | null>(null);
  const openChangeRequestMenu = Boolean(anchorEl);
  
  const handleChangeRequestMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChangeRequestMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangeRequestOpen = (type: string | null = null) => {
    setChangeRequestType(type);
    setIsChangeRequestDialogOpen(true);
    handleChangeRequestMenuClose();
  };

  const handleChangeRequestClose = () => {
    setIsChangeRequestDialogOpen(false);
  };

  const handleChangeRequestSubmitted = () => {
    showSnackbar('Change request submitted successfully!', 'success');
  };

  // Add state for change request menu and dialog
  const [isChangeRequestDialogOpen, setIsChangeRequestDialogOpen] = useState(false);

  // Add state for audit results
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

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

  return (
    <Box>
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
              {mockProject.name}
            </Typography>
            <Tooltip title={`Status: ${getStatusLabel(mockProject.status)}${isOverdue ? ' (Overdue)' : ''}`}>
              <Chip 
                label={getStatusLabel(mockProject.status)} 
                color={getStatusColor(mockProject.status, mockProject.endDate) as any}
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
                    <MenuItem onClick={() => handleChangeRequestOpen('SCHEDULE')}>
                      <ListItemIcon>
                        <EventIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Extend Project</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestOpen('CLOSURE')}>
                      <ListItemIcon>
                        <CloseIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Close Project</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestOpen('SCOPE')}>
                      <ListItemIcon>
                        <SubjectIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Change Project Scope</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestOpen('BUDGET')}>
                      <ListItemIcon>
                        <AttachMoneyIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Change Project Cost</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestOpen('RESOURCE')}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Delegate Project</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeRequestOpen('OTHER')}>
                      <ListItemIcon>
                        <MoreHorizIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Other Changes</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
              {userCanAddTasks ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddTaskDialogOpen(true)}
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
          {mockProject.description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
            <Typography variant="body1">{mockProject.projectManager.firstName} {mockProject.projectManager.lastName}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1">{mockProject.department.name}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
            <Typography variant="body1">
              {new Date(mockProject.startDate).toLocaleDateString()} - {new Date(mockProject.endDate).toLocaleDateString()}
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
            <Tab icon={<KanbanIcon />} label="Kanban" {...a11yProps(2)} />
            <Tab icon={<GanttIcon />} label="Gantt Chart" {...a11yProps(3)} />
            <Tab icon={<MindMapIcon />} label="Mind Map" {...a11yProps(4)} />
            <Tab icon={<UploadIcon />} label="Attachments" {...a11yProps(5)} />
            <Tab icon={<SummarizeIcon />} label="Weekly Updates" {...a11yProps(6)} />
            <Tab icon={<LogIcon />} label="Logs" {...a11yProps(7)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Project Overview</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Budget</Typography>
                      <Typography variant="body1">${mockProject.budget.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Actual Cost</Typography>
                      <Typography variant="body1">${mockProject.actualCost.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Remaining</Typography>
                      <Typography variant="body1">${(mockProject.budget - mockProject.actualCost).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Days Remaining</Typography>
                      <Typography variant="body1">{daysRemaining} days</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Tasks</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    {mockTasks.slice(0, 3).map(task => (
                      <Box key={task.id}>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Assigned to: {task.assignee}
                          </Typography>
                          <Chip 
                            label={task.status.replace('_', ' ')} 
                            size="small"
                            color={
                              task.dueDate && new Date(task.dueDate) < new Date() 
                                ? 'error' 
                                : task.status === 'DONE' 
                                  ? 'success' 
                                  : task.status === 'IN_PROGRESS' 
                                    ? 'primary' 
                                    : 'default'
                            }
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
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
            {(mockProject.team || []).map((user) => (
              <Box key={user.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
                    <Typography color="text.secondary">{user.role} - {user.department.name}</Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
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
              <Typography variant="h6" gutterBottom>Kanban Board</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage tasks by dragging them between the columns to update their status.
              </Typography>
              
              <KanbanBoard
                {...{
                  project: convertToFullProject(mockProject),
                  tasks: contextTasks,
                  onTaskUpdate: handleMoveTask,
                  onTaskClick: handleTaskClick,
                  onAddTask: userCanAddTasks ? () => setIsAddTaskDialogOpen(true) : undefined,
                  onRequestTask: userCanRequestTasks ? handleRequestTask : undefined
                } as CustomKanbanBoardProps}
              />
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          ) : ganttError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {ganttError}
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={() => setGanttError(null)}>
                  Try Again
                </Button>
              </Box>
            </Alert>
          ) : (
            <Box sx={{ height: '600px' }}>
              <Typography variant="h6" gutterBottom>Gantt Chart</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                View tasks in a timeline format showing dependencies and milestones.
              </Typography>
              
              <ErrorBoundary onError={handleGanttError}>
                <Box sx={{ position: 'relative' }}>
                  <GanttChart
                    project={convertToFullProject(mockProject)}
                    tasks={contextTasks}
                    onTaskClick={handleGanttTaskClick}
                  />
                </Box>
              </ErrorBoundary>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
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
            <Box sx={{ height: '600px' }}>
              <Typography variant="h6" gutterBottom>Mind Map</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Visualize project structure, tasks, and relationships in a mind map.
              </Typography>
              
              <MindMapView 
                project={convertToFullProject(mockProject)}
                tasks={contextTasks}
              />
            </Box>
          )}
        </TabPanel>

        {/* Attachments Tab */}
        <TabPanel value={tabValue} index={5}>
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

          {projectAttachments.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No attachments have been uploaded for this project
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
            <Box>
              <Paper>
                <List>
                  {projectAttachments.map((attachment) => (
                    <ListItem
                      key={attachment.id}
                      secondaryAction={
                        <Box>
                          <IconButton 
                            aria-label="download" 
                            onClick={() => handleDownloadAttachment(attachment)}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton 
                            aria-label="delete" 
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(attachment.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={attachment.filename}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy.firstName} {attachment.uploadedBy.lastName} • {new Date(attachment.createdAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <WeeklyUpdates projectId={mockProject.id} />
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Project Activity Logs</Typography>
            <Typography variant="body2" color="text.secondary">
              Track all changes and activities related to this project.
            </Typography>
          </Box>

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
                {projectLogs
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
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {log.user.firstName.charAt(0)}
                            {log.user.lastName.charAt(0)}
                          </Avatar>
                          {log.user.firstName} {log.user.lastName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                {projectLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No activity logs found for this project
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={projectLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabPanel>
      </Paper>

      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        projectId={mockProject.id}
        initialStatus={newTaskStatus}
        onTaskAdded={handleTaskAddedWrapper}
        projectUsers={mockProject.team}
      />

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

      <RequestTaskDialog
        open={isRequestTaskDialogOpen}
        onClose={() => setIsRequestTaskDialogOpen(false)}
        projectId={mockProject.id}
      />

      {/* Change Request Dialog */}
      <ChangeRequestDialog
        open={isChangeRequestDialogOpen}
        onClose={handleChangeRequestClose}
        projectId={mockProject.id}
        onSubmitted={handleChangeRequestSubmitted}
        changeRequestType={changeRequestType}
      />

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
    </Box>
  );
};

// Create mock components for missing imports
const RequestTaskDialog = ({ open, onClose, projectId }: { open: boolean, onClose: () => void, projectId: string }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Request Task (Mock)</DialogTitle>
    <DialogContent>
      <Typography>This is a mock component for RequestTaskDialog</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default ProjectDetailPage; 