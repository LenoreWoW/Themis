import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  ViewList as ListIcon,
  ViewKanban as KanbanIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority, User, Project, ProjectStatus, ProjectPriority, Department, UserRole, ProjectTemplateType } from '../types';
import { TaskService } from '../services/TaskService';
import { useTranslation } from 'react-i18next';
import TaskDetailDialog from '../components/Task/TaskDetailDialog';
import TaskEditDialog from '../components/Task/TaskEditDialog';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

// Mock data for tasks
const mockTasks = [
  { 
    id: '1', 
    title: 'Requirements Gathering', 
    projectName: 'Digital Transformation',
    description: 'Gather and document system requirements from stakeholders.',
    status: 'IN_PROGRESS', 
    priority: 'HIGH',
    startDate: '2023-01-15', 
    dueDate: '2023-01-31',
    assignee: 'admin'
  },
  { 
    id: '2', 
    title: 'Database Schema Design', 
    projectName: 'Digital Transformation',
    description: 'Design the database schema for the new system.',
    status: 'TODO', 
    priority: 'MEDIUM',
    startDate: '2023-02-01', 
    dueDate: '2023-02-15',
    assignee: 'admin'
  },
  { 
    id: '3', 
    title: 'Frontend Prototype', 
    projectName: 'Digital Transformation',
    description: 'Create a prototype of the user interface.',
    status: 'TODO', 
    priority: 'MEDIUM',
    startDate: '2023-02-15', 
    dueDate: '2023-03-01',
    assignee: 'admin'
  },
  { 
    id: '4', 
    title: 'API Documentation', 
    projectName: 'Cloud Migration',
    description: 'Document all API endpoints and their usage.',
    status: 'DONE', 
    priority: 'LOW',
    startDate: '2023-01-10', 
    dueDate: '2023-01-20',
    assignee: 'admin'
  },
  { 
    id: '5', 
    title: 'Security Audit', 
    projectName: 'Cloud Migration',
    description: 'Perform a security audit of the system.',
    status: 'REVIEW', 
    priority: 'HIGH',
    startDate: '2023-01-25', 
    dueDate: '2023-02-10',
    assignee: 'admin'
  }
];

// Helper functions for determining the status and priority display
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

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'REVIEW': return 'In Review';
    case 'DONE': return 'Completed';
    default: return status;
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

const TasksPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  const { user, token } = useAuth();
  const { t } = useTranslation();
  
  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Just set empty arrays for all data
        setTasks([]);
        setProjects([]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
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
    // In a real app, this would call an API to update the task
    console.log('Save edited task:', editedTask);
    
    // Update the task in the local state
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === editedTask.id ? editedTask : task
      )
    );
    
    setIsTaskEditOpen(false);
  };
  
  const handleUpdateProgress = (taskId: string, progress: number, newStatus: TaskStatus) => {
    // In a real app, this would call an API to update the task progress and status
    console.log('Update task progress:', taskId, progress, newStatus);
    
    // Update the task in the local state
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: newStatus
          };
        }
        return task;
      })
    );
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
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          // Create or update the comments array
          const existingComments = task.comments || [];
          return {
            ...task,
            comments: [...existingComments, newComment]
          };
        }
        return task;
      })
    );
    
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
  
  // Filter tasks based on search query and current user
  const filteredTasks = tasks.filter((task) => {
    // Only show tasks assigned to the current user (for this demo, show all if user is admin)
    const isAssignedToUser = user?.username === task.assignee?.username;
    
    // Check if the search query matches task title, description, or project
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return (isAssignedToUser || user?.role === UserRole.ADMIN) && matchesSearch;
  });
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1">
            {t('assignments.myTasks')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage tasks assigned to you
          </Typography>
        </div>
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
                          <TableCell>{task.project.name}</TableCell>
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