import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Drawer,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Tune as TuneIcon,
  ViewList as ListIcon,
  ViewKanban as KanbanIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority, User, UserRole, Project } from '../types';
import { useTranslation } from 'react-i18next';
import TaskDetailDialog from '../components/Task/TaskDetailDialog';
// import CreateTaskDialog from '../components/Task/CreateTaskDialog';
import TaskCard from '../components/Task/TaskCard';
import TaskEditDialog from '../components/Task/TaskEditDialog';
// import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateTasks } from '../redux/actions/dragActions';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useLocation } from 'react-router-dom';
import taskService from '../services/TaskService';

// Temporary hooks stubs
const useAppDispatch = () => (action: any) => console.log('Dispatch stub:', action);
const useAppSelector = (selector: any) => ({});

// Create an extended Task interface that includes assignedBy
interface TaskWithAssignedBy extends Task {
  assignedBy?: User;
}

// Helper functions for determining the status and priority display
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'REVIEW': return 'In Review';
    case 'DONE': return 'Completed';
    default: return status;
  }
};

const getStatusColor = (status: string, dueDate?: string) => {
  // Check if the task is overdue (due date is before current date)
  if (dueDate && new Date(dueDate) < new Date()) {
    return 'error'; // Red color for overdue tasks
  }
  
  switch(status) {
    case 'TODO': return 'default';
    case 'IN_PROGRESS': return 'primary';
    case 'REVIEW': return 'warning';
    case 'DONE': return 'success';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    default: return 'default';
  }
};

// Temporary component stubs
const KanbanBoard = (props: any) => null;

const TasksPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tabValue, setTabValue] = useState(0);
  
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Apply URL filters on component mount and URL changes
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const filter = query.get('filter');
    
    // Set filter mode based on URL parameter
    if (filter === 'assigned-by-me') {
      setFilterMode('assigned-by-me');
      setTabValue(1);
    } else {
      setFilterMode(null);
      setTabValue(0);
    }
    
    // Check if we need to open a specific task
    const taskId = query.get('id');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
      }
    }
  }, [location.search, tasks]);
  
  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would be an API call
        // For now, just initialize with an empty array
        setTasks([]);
        
        // Set up empty project list
        setProjects([]);
        
        setError('');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskDetailOpen(true);
    }
  };
  
  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };
  
  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskDetailOpen(false);
      setIsTaskEditOpen(true);
    }
  };
  
  const handleCloseTaskEdit = () => {
    setIsTaskEditOpen(false);
  };
  
  const handleSaveTask = (editedTask: Task) => {
    try {
      // Update task in the service
      const updatedTask = taskService.updateTask(editedTask.id, editedTask);
      
      if (updatedTask) {
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
        );
      }
      
      setIsTaskEditOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleUpdateProgress = (taskId: string, progress: number, newStatus: TaskStatus) => {
    // In a real app, this would call an API to update the task progress and status
    console.log('Update task progress:', taskId, progress, newStatus);
    
    // Update the task in Redux store
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus
        };
      }
      return task;
    });
    dispatch(updateTasks(updatedTasks));
  };
  
  const handleAddComment = async (taskId: string, comment: string) => {
    // In a real app, this would call an API to add the comment
    console.log('Add comment to task', taskId, comment);
    
    // Create the new comment
    const newComment = {
      id: `comment-${Date.now()}`,
      taskId: taskId,
      text: comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: user?.id || '1',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || ''
      }
    };
    
    // Update the tasks state with the new comment
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        // Create or update the comments array
        const existingComments = task.comments || [];
        return {
          ...task,
          comments: [...existingComments, newComment]
        };
      }
      return task;
    });
    dispatch(updateTasks(updatedTasks));
    
    return Promise.resolve();
  };
  
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'list' | 'kanban' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  // Filter and search tasks
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    let filtered = [...tasks];
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (user) {
      if (tabValue === 0) {
        // My Tasks tab - show tasks assigned to me
        filtered = filtered.filter(task => 
          task.assignee?.id === user.id
        );
      } else if (tabValue === 1) {
        // Tasks I've Assigned tab - show tasks assigned by me to others
        filtered = filtered.filter(task => {
          // Use the TaskWithAssignedBy interface for type safety
          const taskWithAssignedBy = task as TaskWithAssignedBy;
          return taskWithAssignedBy.assignedBy?.id === user.id && 
                task.assignee?.id !== user.id;
        });
      }
    }
    
    return filtered;
  }, [tasks, searchQuery, tabValue, user]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setFilterMode(null);
    } else {
      setFilterMode('assigned-by-me');
    }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1">
            {t('tasks.title', 'Tasks')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('tasks.description', 'View and manage your tasks')}
          </Typography>
        </div>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="task tabs"
        >
          <Tab label={t('tasks.myTasks', 'My Tasks')} />
          <Tab label={t('tasks.assignedByMe', 'Tasks I\'ve Assigned')} />
        </Tabs>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Search Tasks"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ListIcon />
            </ToggleButton>
            <ToggleButton value="kanban" aria-label="kanban view">
              <KanbanIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        
        {viewMode === 'list' ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>{t('status.title')}</TableCell>
                    <TableCell>{t('priority.title')}</TableCell>
                    <TableCell>Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography>Loading tasks...</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography color="error">{error}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 3 }}>
                          <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="h6">No tasks found</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery ? 'Try adjusting your search terms' : 'You have no tasks assigned to you'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((task) => (
                        <TableRow 
                          key={task.id} 
                          hover
                          onClick={() => handleTaskClick(task.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {task.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{task.project?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Tooltip 
                              title={
                                task.dueDate && new Date(task.dueDate) < new Date()
                                  ? `${getStatusLabel(task.status)} (Overdue)`
                                  : getStatusLabel(task.status)
                              }
                            >
                              <Chip 
                                label={getStatusLabel(task.status)} 
                                color={getStatusColor(task.status, task.dueDate) as any}
                                size="small"
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={task.priority} 
                              color={getPriorityColor(task.priority) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <DragDropContext
            onDragEnd={(result: DropResult) => {
              const { destination, source, draggableId } = result;
              
              // Dropped outside the list
              if (!destination) {
                return;
              }
              
              // Dropped in the same place
              if (
                destination.droppableId === source.droppableId &&
                destination.index === source.index
              ) {
                return;
              }
              
              // Handle the status change
              if (destination.droppableId !== source.droppableId) {
                const newStatus = destination.droppableId as TaskStatus;
                handleUpdateProgress(draggableId, 0, newStatus);
              }
            }}
          >
            <KanbanBoard 
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onAddComment={handleAddComment}
              onUpdateProgress={handleUpdateProgress}
              onEdit={handleEditTask}
              onDelete={(taskId) => console.log('Delete task:', taskId)}
            />
          </DragDropContext>
        )}
      </Paper>
      
      {/* Task Detail Dialog */}
      <TaskDetailDialog
        open={isTaskDetailOpen}
        task={selectedTask}
        onClose={handleCloseTaskDetail}
        onEdit={handleEditTask}
        onAddComment={handleAddComment}
      />
      
      {/* Task Edit Dialog */}
      <TaskEditDialog
        open={isTaskEditOpen}
        task={selectedTask}
        onClose={handleCloseTaskEdit}
        onSave={handleSaveTask}
        users={tasks.map(t => t.assignee).filter((a): a is User => !!a)}
      />
    </Box>
  );
};

export default TasksPage; 