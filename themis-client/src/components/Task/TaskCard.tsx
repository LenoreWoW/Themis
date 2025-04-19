import React from 'react';
import { Card, CardContent, Typography, Chip, Box, LinearProgress } from '@mui/material';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { CalendarToday, Person } from '@mui/icons-material';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  // Calculate days until deadline
  const calculateDaysUntilDeadline = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine card border color based on deadline
  const getBorderColor = () => {
    if (task.status === TaskStatus.DONE) return 'success.main';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return 'error.main'; // Overdue
    if (daysLeft <= 2) return 'warning.main'; // Close to deadline
    if (daysLeft <= 5) return 'info.main'; // Approaching deadline
    return 'primary.main'; // Plenty of time
  };

  // Get status chip color
  const getStatusColor = (status: TaskStatus) => {
    // Check if task is overdue first
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0 && status !== TaskStatus.DONE) return 'error';
    
    // Default status colors
    switch (status) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.IN_PROGRESS: return 'primary';
      case TaskStatus.REVIEW: return 'warning';
      case TaskStatus.DONE: return 'success';
      default: return 'default';
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'success';
      case TaskPriority.MEDIUM: return 'warning';
      case TaskPriority.HIGH: return 'error';
      default: return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Determine deadline message
  const getDeadlineMessage = () => {
    if (task.status === TaskStatus.DONE) return 'Completed';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} days`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    return `${daysLeft} days left`;
  };

  // Calculate progress
  const getProgress = () => {
    switch (task.status) {
      case TaskStatus.TODO: return 0;
      case TaskStatus.IN_PROGRESS: return 50;
      case TaskStatus.REVIEW: return 80;
      case TaskStatus.DONE: return 100;
      default: return 0;
    }
  };

  return (
    <Card 
      sx={{ 
        borderLeft: 5, 
        borderColor: getBorderColor(),
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { 
          transform: 'translateY(-4px)',
          boxShadow: 3,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
        } : {},
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip 
            label={task.status} 
            size="small" 
            color={getStatusColor(task.status)}
          />
          <Chip 
            label={task.priority} 
            size="small" 
            color={getPriorityColor(task.priority)}
            variant="outlined"
          />
        </Box>

        {calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE && (
          <Chip 
            label="OVERDUE" 
            size="small" 
            color="error"
            sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}
          />
        )}

        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {task.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description?.length > 100 
            ? `${task.description.substring(0, 100)}...` 
            : task.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatDate(task.startDate)} - {formatDate(task.dueDate)}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <Typography 
              variant="body2" 
              color={calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE ? 'error.main' : 'text.secondary'}
              fontWeight={calculateDaysUntilDeadline() < 0 && task.status !== TaskStatus.DONE ? 'bold' : 'normal'}
            >
              {getDeadlineMessage()}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgress()} 
            color={task.status === TaskStatus.DONE ? 'success' : 
                  calculateDaysUntilDeadline() < 0 ? 'error' : 
                  calculateDaysUntilDeadline() <= 2 ? 'warning' : 'primary'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 