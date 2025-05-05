import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Tooltip, 
  LinearProgress,
  Avatar
} from '@mui/material';
import { 
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { Task, TaskPriority, TaskStatus } from '../../../types';

interface KanbanTaskProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

// Helper function to get priority color
const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.HIGH:
      return '#f44336'; // red
    case TaskPriority.MEDIUM:
      return '#ff9800'; // orange
    case TaskPriority.LOW:
      return '#4caf50'; // green
    default:
      return '#9e9e9e'; // grey
  }
};

// Helper function to get priority label
const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.HIGH:
      return 'High';
    case TaskPriority.MEDIUM:
      return 'Medium';
    case TaskPriority.LOW:
      return 'Low';
    default:
      return 'Unknown';
  }
};

// Helper function to get status color
const getStatusColor = (status: TaskStatus, overdue: boolean): string => {
  if (overdue) {
    return '#f44336'; // red for overdue tasks
  }
  
  switch (status) {
    case TaskStatus.TODO:
      return '#9e9e9e'; // grey
    case TaskStatus.IN_PROGRESS:
      return '#2196f3'; // blue
    case TaskStatus.REVIEW:
      return '#ff9800'; // orange
    case TaskStatus.DONE:
      return '#4caf50'; // green
    default:
      return '#9e9e9e'; // grey
  }
};

// Helper function to get status label
const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return 'To Do';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.REVIEW:
      return 'Review';
    case TaskStatus.DONE:
      return 'Done';
    default:
      return 'Unknown';
  }
};

// Calculate task progress based on dates
const calculateProgress = (startDate: string, dueDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(dueDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  const total = end - start;
  const current = now - start;
  return Math.round((current / total) * 100);
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, index, onClick }) => {
  // Get priority color and label
  const priorityColor = getPriorityColor(task.priority);
  const priorityLabel = getPriorityLabel(task.priority);
  
  // Calculate progress if we have both dates
  const progress = task.startDate && task.dueDate 
    ? calculateProgress(task.startDate, task.dueDate) 
    : null;
  
  // Check if task is overdue
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
  
  // Get status color and label
  const statusColor = getStatusColor(task.status, isOverdue);
  const statusLabel = getStatusLabel(task.status);

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            p: 1.5,
            mb: 1.5,
            borderRadius: 1,
            boxShadow: snapshot.isDragging 
              ? '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)' 
              : '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
            backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'white',
            border: `1px solid ${snapshot.isDragging ? '#e0e0e0' : 'transparent'}`,
            '&:hover': {
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
            },
            borderLeft: `4px solid ${priorityColor}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
          }}
          onClick={onClick}
        >
          <Box sx={{ mb: 1.5 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold',
                mb: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {task.title}
            </Typography>
            
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  mb: 1
                }}
              >
                {task.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={`Status: ${statusLabel}${isOverdue ? ' (Overdue)' : ''}`}>
                <Chip
                  label={statusLabel}
                  size="small"
                  sx={{
                    backgroundColor: statusColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
              </Tooltip>
              
              <Tooltip title={`Priority: ${priorityLabel}`}>
                <Chip
                  label={priorityLabel}
                  size="small"
                  sx={{
                    backgroundColor: priorityColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
              </Tooltip>
            </Box>
            
            {task.dueDate && (
              <Tooltip title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon fontSize="small" sx={{ mr: 0.5, color: isOverdue ? 'error.main' : 'text.secondary', fontSize: '0.9rem' }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: isOverdue ? 'error.main' : 'text.secondary',
                      fontWeight: isOverdue ? 'bold' : 'normal'
                    }}
                  >
                    {formatDate(task.dueDate)}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>

          {progress !== null && (
            <Box sx={{ mb: 1.5 }}>
              <Tooltip title={`Progress: ${progress}%`}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progress > 80 ? '#4caf50' : progress > 50 ? '#ff9800' : '#f44336',
                    }
                  }}
                />
              </Tooltip>
            </Box>
          )}

          {task.assignee && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Tooltip title={`Assigned to: ${task.assignee.firstName} ${task.assignee.lastName}`}>
                <Avatar 
                  sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.8rem' }}
                >
                  {task.assignee.firstName.charAt(0)}
                </Avatar>
              </Tooltip>
            </Box>
          )}
        </Paper>
      )}
    </Draggable>
  );
};

export default KanbanTask;