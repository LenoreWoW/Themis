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
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Badge
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import taskService from '../../services/TaskService';

const getStatusColor = (status: string, dueDate?: string) => {
  // Check if the task is overdue
  if (dueDate && new Date(dueDate) < new Date()) {
    return 'error';
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

const getPriorityIcon = (priority: string) => {
  switch(priority) {
    case 'HIGH':
      return <ErrorIcon color="error" fontSize="small" />;
    case 'MEDIUM':
      return <WarningIcon color="warning" fontSize="small" />;
    case 'LOW':
      return <CheckCircleIcon color="success" fontSize="small" />;
    default:
      return null;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  } catch (e) {
    return 'Invalid date';
  }
};

const isOverdue = (dueDate: string): boolean => {
  if (!dueDate) return false;
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  } catch (e) {
    return false;
  }
};

interface AssignedByMeTasksProps {
  maxItems?: number;
}

const AssignedByMeTasks: React.FC<AssignedByMeTasksProps> = ({ maxItems = 5 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (!user?.id) {
        setAssignedTasks([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Use the taskService to get tasks assigned by the current user
        const tasks = taskService.getTasksAssignedByUser(user.id);
        
        // We only want tasks assigned to others (not self-assigned)
        const filteredTasks = tasks.filter(task => 
          task.assignee?.id !== user.id
        );
        
        setAssignedTasks(filteredTasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching assigned tasks:', err);
        setError('Failed to load assigned tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedTasks();
  }, [user]);
  
  const navigateToTask = (taskId: string) => {
    navigate(`/tasks?id=${taskId}`);
  };
  
  const navigateToAllAssignedTasks = () => {
    navigate('/tasks?filter=assigned-by-me');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }
  
  if (assignedTasks.length === 0) {
    return (
      <Alert severity="info">You haven't assigned any tasks to team members yet.</Alert>
    );
  }
  
  return (
    <Paper sx={{ p: 0, mb: 2 }}>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">What I've Assigned</Typography>
        <Badge badgeContent={assignedTasks.length} color="primary">
          <Typography 
            variant="subtitle2" 
            color="primary"
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={navigateToAllAssignedTasks}
          >
            View All <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
          </Typography>
        </Badge>
      </Box>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignedTasks.slice(0, maxItems).map((task) => (
              <TableRow 
                key={task.id} 
                hover
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: isOverdue(task.dueDate) && task.status !== TaskStatus.DONE 
                    ? 'rgba(211, 47, 47, 0.05)' 
                    : undefined 
                }}
              >
                <TableCell>
                  <Tooltip title={task.description || 'No description'}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                      {task.title}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color={isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'error' : 'inherit'}
                  >
                    {formatDate(task.dueDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(task.status)} 
                    size="small"
                    color={getStatusColor(task.status, task.dueDate) as any}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPriorityIcon(task.priority)}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {task.priority}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small" 
                      onClick={() => navigateToTask(task.id)}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AssignedByMeTasks; 