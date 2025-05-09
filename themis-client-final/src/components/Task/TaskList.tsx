import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TablePagination,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Button,
  Stack
} from '@mui/material';
import {
  LowPriority as LowIcon,
  PriorityHigh as HighIcon,
  ErrorOutline as MediumIcon,
  MoreVert as MoreIcon,
  DateRange as DateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Comment as CommentIcon,
  AttachFile as AttachIcon,
  AutoAwesome as AutoOrganizeIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// API service
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

interface TaskListProps {
  onTaskClick?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onCompleteTask
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [autoOrganize, setAutoOrganize] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<{ auto_organize: boolean }>({ auto_organize: false });
  
  // Fetch tasks with optional auto-organize sorting
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Get user settings first
        const settingsResponse = await api.get(`/users/${user?.id}/settings`);
        const userAutoOrganize = settingsResponse.data?.auto_organize || false;
        setUserSettings({ auto_organize: userAutoOrganize });
        setAutoOrganize(userAutoOrganize);
        
        // Fetch tasks with auto-organize if enabled
        const sort = userAutoOrganize ? 'auto' : undefined;
        const tasksResponse = await api.get('/tasks', { 
          params: { sort } 
        });
        
        setTasks(tasksResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTasks();
    }
  }, [user]);
  
  // Handle auto-organize toggle
  const handleAutoOrganizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setAutoOrganize(newValue);
    
    try {
      // Update user settings
      await api.put(`/users/${user?.id}/settings`, {
        auto_organize: newValue
      });
      
      // Refetch tasks with the new sorting preference
      setLoading(true);
      const sort = newValue ? 'auto' : undefined;
      const response = await api.get('/tasks', { params: { sort } });
      setTasks(response.data);
    } catch (error) {
      console.error('Error updating auto-organize setting:', error);
      // Revert the switch if there was an error
      setAutoOrganize(!newValue);
    } finally {
      setLoading(false);
    }
  };
  
  // Task menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTaskId(null);
  };
  
  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedTaskId && onEditTask) {
      onEditTask(selectedTaskId);
    }
    handleMenuClose();
  };
  
  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedTaskId && onDeleteTask) {
      onDeleteTask(selectedTaskId);
    }
    handleMenuClose();
  };
  
  const handleCompleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedTaskId && onCompleteTask) {
      onCompleteTask(selectedTaskId);
    }
    handleMenuClose();
  };
  
  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Helper functions
  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return <HighIcon color="error" />;
      case TaskPriority.MEDIUM:
        return <MediumIcon color="warning" />;
      case TaskPriority.LOW:
        return <LowIcon color="success" />;
      default:
        return <MediumIcon color="warning" />;
    }
  };
  
  const getStatusChip = (status: TaskStatus) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case TaskStatus.TODO:
        color = 'default';
        break;
      case TaskStatus.IN_PROGRESS:
        color = 'info';
        break;
      case TaskStatus.REVIEW:
        color = 'warning';
        break;
      case TaskStatus.DONE:
        color = 'success';
        break;
    }
    
    return (
      <Chip 
        label={status.replace('_', ' ')} 
        size="small" 
        color={color}
      />
    );
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Calculate days remaining and urgency style
  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const getUrgencyStyle = (dueDate: string, priority: TaskPriority) => {
    const daysRemaining = getDaysRemaining(dueDate);
    
    if (daysRemaining === null) return {};
    
    // Define background colors based on urgency
    if (daysRemaining < 0) {
      return { backgroundColor: 'rgba(244, 67, 54, 0.1)' }; // Overdue - light red
    }
    
    if (daysRemaining === 0) {
      return { backgroundColor: 'rgba(255, 152, 0, 0.1)' }; // Due today - light orange
    }
    
    if (priority === TaskPriority.HIGH && daysRemaining <= 3) {
      return { backgroundColor: 'rgba(255, 193, 7, 0.1)' }; // High priority and due soon - light yellow
    }
    
    return {};
  };
  
  // Conditionally apply 'auto-organize' styles to each row
  const getRowStyle = (task: Task) => {
    if (!autoOrganize) return {};
    
    return getUrgencyStyle(task.dueDate, task.priority);
  };
  
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Tasks</Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoOrganize}
                onChange={handleAutoOrganizeChange}
                color="primary"
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <AutoOrganizeIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography variant="body2">Auto-Organize</Typography>
              </Box>
            }
          />
          
          <Button variant="contained" color="primary" size="small">
            New Task
          </Button>
        </Stack>
      </Box>
      
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={3} display="flex" justifyContent="center">
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={3}>
                      <Typography color="textSecondary">
                        No tasks found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                tasks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((task) => (
                    <TableRow 
                      key={task.id} 
                      hover 
                      onClick={() => onTaskClick && onTaskClick(task.id)}
                      style={getRowStyle(task)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2">{task.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getPriorityIcon(task.priority)}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {task.priority}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(task.status)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <DateIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {formatDate(task.dueDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.project?.name || 'None'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.assignee ? 
                            `${task.assignee.firstName} ${task.assignee.lastName}` : 
                            'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, task.id)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={tasks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      
      {/* Task Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleCompleteClick}>
          <CheckIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Complete
        </MenuItem>
        <MenuItem>
          <CommentIcon fontSize="small" sx={{ mr: 1 }} />
          Add Comment
        </MenuItem>
        <MenuItem>
          <AttachIcon fontSize="small" sx={{ mr: 1 }} />
          Attach File
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList; 