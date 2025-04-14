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
  IconButton
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
  InsertDriveFile as FileIcon,
  DescriptionOutlined as DocIcon,
  DeleteOutline as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import { Task, TaskStatus, TaskPriority, Project as ProjectType, ProjectStatus, UserRole, User, Attachment } from '../types';
import { TaskService } from '../services/TaskService';
import api from '../services/api';
import AddTaskDialog from '../components/Task/AddTaskDialog';
import GanttChart from '../components/Gantt/GanttChart';
import MindMap from '../components/MindMap/MindMap';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Mock data for project
const mockProject = {
  id: '1',
  name: 'Digital Transformation',
  description: 'Implement a new Enterprise Resource Planning system for the organization.',
  status: 'InProgress',
  completion: 65,
  department: 'IT',
  manager: 'John Doe',
  startDate: '2023-01-15',
  endDate: '2023-12-31',
  budget: 500000,
  actualCost: 325000,
  team: [
    { id: '1', name: 'John Doe', role: 'Project Manager', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', role: 'Business Analyst', avatar: 'JS' },
    { id: '3', name: 'Robert Brown', role: 'Developer', avatar: 'RB' },
    { id: '4', name: 'Sarah Williams', role: 'Developer', avatar: 'SW' },
    { id: '5', name: 'Mike Johnson', role: 'QA Engineer', avatar: 'MJ' }
  ]
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

// Mock data for project attachments
const mockAttachments = [
  {
    id: '1',
    fileName: 'Project_Charter.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000, // 1MB
    fileUrl: 'https://example.com/files/Project_Charter.pdf',
    uploadedBy: {
      id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.PROJECT_MANAGER,
      email: 'admin@example.com',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    uploadedAt: '2023-05-10T14:30:00Z'
  },
  {
    id: '2',
    fileName: 'Requirements_Spec.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 2048000, // 2MB
    fileUrl: 'https://example.com/files/Requirements_Spec.docx',
    uploadedBy: {
      id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.PROJECT_MANAGER,
      email: 'admin@example.com',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    uploadedAt: '2023-05-12T09:45:00Z'
  },
  {
    id: '3',
    fileName: 'Project_Timeline.png',
    fileType: 'image/png',
    fileSize: 512000, // 0.5MB
    fileUrl: 'https://example.com/files/Project_Timeline.png',
    uploadedBy: {
      id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.PROJECT_MANAGER,
      email: 'admin@example.com',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    uploadedAt: '2023-05-15T11:20:00Z'
  }
];

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch(status) {
    case 'InProgress': return 'primary';
    case 'Completed': return 'success';
    case 'OnHold': return 'warning';
    case 'Cancelled': return 'error';
    case 'Draft': return 'default';
    case 'SubPMOReview': return 'info';
    case 'MainPMOApproval': return 'secondary';
    default: return 'default';
  }
};

// Helper function to get status label
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'InProgress': return 'In Progress';
    case 'Completed': return 'Completed';
    case 'OnHold': return 'On Hold';
    case 'Cancelled': return 'Cancelled';
    case 'Draft': return 'Draft';
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

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [addingTeamMembers, setAddingTeamMembers] = useState(false);
  const [projectAttachments, setProjectAttachments] = useState<Attachment[]>(mockAttachments);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Gantt Chart error handling
  const [ganttError, setGanttError] = useState<string | null>(null);
  const handleGanttError = (error: Error) => {
    console.error('Gantt chart error:', error);
    setGanttError(error.message || 'An error occurred loading the Gantt chart');
  };

  // Fetch tasks when the Kanban, Gantt, or MindMap tab is selected
  useEffect(() => {
    const fetchTasks = async () => {
      // Only fetch if we're on a task-related tab (Kanban, Gantt, or MindMap)
      if (!projectId || !token || (tabValue !== 2 && tabValue !== 3 && tabValue !== 4)) return;
      
      setLoadingTasks(true);
      setTasksError(null);
      
      try {
        const taskData = await TaskService.getAllTasks(projectId, token);
        setTasks(taskData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasksError('Failed to load tasks. Please try again.');
      } finally {
        setLoadingTasks(false);
      }
    };
    
    fetchTasks();
  }, [projectId, token, tabValue]);

  // Load available users when needed
  useEffect(() => {
    if (isAddTeamMemberDialogOpen && token) {
      const fetchUsers = async () => {
        try {
          // In a real app, you would fetch users from your API
          // For now, we'll use mock data
          const mockUsers: User[] = [
            {
              id: '101',
              username: 'alice.johnson',
              firstName: 'Alice',
              lastName: 'Johnson',
              role: UserRole.PROJECT_MANAGER,
              email: 'alice@example.com',
              department: 'IT',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '102',
              username: 'bob.smith',
              firstName: 'Bob',
              lastName: 'Smith',
              role: UserRole.ADMIN,
              email: 'bob@example.com',
              department: 'Engineering',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '103',
              username: 'carol.williams',
              firstName: 'Carol',
              lastName: 'Williams',
              role: UserRole.SUB_PMO,
              email: 'carol@example.com',
              department: 'PMO',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          
          setAvailableUsers(mockUsers);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      
      fetchUsers();
    }
  }, [isAddTeamMemberDialogOpen, token]);

  // Fetch attachments when the Attachments tab is selected
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!projectId || !token || tabValue !== 5) return;
      
      try {
        // In a real app, you would fetch the attachments from the API
        // For now, we'll just use the mock data
        setProjectAttachments(mockAttachments);
      } catch (err) {
        console.error('Error fetching attachments:', err);
      }
    };
    
    fetchAttachments();
  }, [projectId, token, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate('/projects');
  };

  // In a real app, you would fetch the project data based on projectId
  // For now, we'll just use the mock data
  const project = mockProject;

  // Convert mock project to match ProjectType
  const projectData: ProjectType = {
    id: project.id,
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    status: ProjectStatus.IN_PROGRESS,
    progress: project.completion,
    budget: project.budget,
    actualCost: project.actualCost,
    department: project.department,
    projectManager: {
      id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.PROJECT_MANAGER,
      email: 'admin@example.com',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdBy: {
      id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.PROJECT_MANAGER,
      email: 'admin@example.com',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Handle task update from KanbanBoard
  const handleTaskUpdate = async (updatedTask: Task) => {
    if (!projectId || !token) return;
    
    try {
      await TaskService.updateTask(projectId, updatedTask.id, updatedTask, token);
      // Refresh tasks after update
      const taskData = await TaskService.getAllTasks(projectId, token);
      setTasks(taskData);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    // In a real app, you would show a task detail modal
    console.log('Task clicked:', task);
  };

  // Calculate project progress
  const progress = project.completion;
  const daysTotal = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 3600 * 24));
  const daysElapsed = Math.ceil((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 3600 * 24));
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const isOverdue = new Date() > new Date(project.endDate) && project.status !== 'Completed';

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
    if (!projectId || !token || selectedTeamMembers.length === 0) return;
    
    setAddingTeamMembers(true);
    try {
      // In a real app, you would call your API to add team members
      // For now, we'll just simulate success
      console.log('Adding team members:', selectedTeamMembers);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the UI with the new team members
      const newTeamMembers = selectedTeamMembers.map(userId => {
        const user = availableUsers.find(u => u.id === userId);
        return {
          id: userId,
          name: user ? `${user.firstName} ${user.lastName}` : `User ${userId}`,
          role: user ? user.role : 'Member',
          avatar: user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'U'
        };
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

  // Add a handler for the Add Task button
  const handleAddTaskClick = () => {
    setIsAddTaskDialogOpen(true);
  };

  // Add a handler for when a task is added
  const handleTaskAdded = async () => {
    if (projectId && token) {
      try {
        const taskData = await TaskService.getAllTasks(projectId, token);
        setTasks(taskData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasksError('Failed to load tasks. Please try again.');
      }
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
    if (!projectId || !token || selectedFiles.length === 0) return;
    
    setUploadingFile(true);
    try {
      // In a real app, you would upload the files to the API
      // For now, we'll just simulate a delay and add them to our mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new mock attachments
      const newAttachments = selectedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file), // In a real app, this would be the URL from the server
        uploadedBy: user as User,
        uploadedAt: new Date().toISOString()
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
    window.open(attachment.fileUrl, '_blank');
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!projectId || !token) return;
    
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

  return (
    <Box>
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
              {project.name}
            </Typography>
            <Chip 
              label={getStatusLabel(project.status)} 
              color={getStatusColor(project.status) as any}
            />
          </Stack>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTaskClick}
          >
            Add Task
          </Button>
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {project.description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
            <Typography variant="body1">{project.manager}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1">{project.department}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
            <Typography variant="body1">
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Completion</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1">{project.completion}%</Typography>
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
                      <Typography variant="body1">${project.budget.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Actual Cost</Typography>
                      <Typography variant="body1">${project.actualCost.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Remaining</Typography>
                      <Typography variant="body1">${(project.budget - project.actualCost).toLocaleString()}</Typography>
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
                              task.status === 'DONE' ? 'success' :
                              task.status === 'IN_PROGRESS' ? 'primary' : 'default'
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
            {project.team.map((member) => (
              <Box key={member.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' } }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{member.avatar}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">{member.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{member.role}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : tasksError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {tasksError}
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>Kanban Board</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage tasks by dragging them between the columns to update their status.
              </Typography>
              
              <KanbanBoard
                project={projectData}
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskClick={handleTaskClick}
              />
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : tasksError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {tasksError}
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
                    project={projectData}
                    tasks={tasks}
                    onTaskClick={handleTaskClick}
                  />
                </Box>
              </ErrorBoundary>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : tasksError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {tasksError}
            </Alert>
          ) : (
            <Box sx={{ height: '600px' }}>
              <Typography variant="h6" gutterBottom>Mind Map</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Visualize project structure, tasks, and relationships in a mind map.
              </Typography>
              
              <MindMap 
                project={projectData}
                tasks={tasks}
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
                        {getFileIcon(attachment.fileType)}
                      </ListItemIcon>
                      <ListItemText
                        primary={attachment.fileName}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploadedBy.firstName} {attachment.uploadedBy.lastName} • {new Date(attachment.uploadedAt).toLocaleDateString()}
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
      </Paper>

      {/* Add the AddTaskDialog component at the end of the return statement */}
      <AddTaskDialog 
        open={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        projectId={projectData.id}
        projectUsers={[]}
        onTaskAdded={handleTaskAdded}
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
                      secondary={`${user.role} - ${user.department}`} 
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
    </Box>
  );
};

export default ProjectDetailPage; 