import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import { Task, TaskStatus, UserRole, Project } from '../../types';
import TaskCard from '../Task/TaskCard';
import { useTheme } from '@mui/material/styles';
import { Droppable } from 'react-beautiful-dnd';
import { formatEnumValue } from '../../utils/helpers';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  onAddComment?: (taskId: string, comment: string) => Promise<void>;
  onUpdateProgress?: (taskId: string, progress: number, newStatus: TaskStatus) => void;
  onTaskUpdate?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  project?: any;
  onAddTask?: () => void;
  onRequestTask?: () => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAttach?: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  onTaskClick, 
  onAddComment,
  onUpdateProgress,
  onTaskUpdate,
  onEdit,
  onDelete,
  onAttach
}) => {
  const theme = useTheme();
  const [columns, setColumns] = useState<{[key: string]: Task[]}>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: []
  });
  
  useEffect(() => {
    // Organize tasks by status
    const newColumns = {
      [TaskStatus.TODO]: tasks.filter(task => task.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.REVIEW]: tasks.filter(task => task.status === TaskStatus.REVIEW),
      [TaskStatus.DONE]: tasks.filter(task => task.status === TaskStatus.DONE)
    };
    setColumns(newColumns);
  }, [tasks]);

  const getColumnTitle = (status: TaskStatus) => {
    return formatEnumValue(status);
  };

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return theme.palette.grey[300];
      case TaskStatus.IN_PROGRESS:
        return theme.palette.primary.light;
      case TaskStatus.REVIEW:
        return theme.palette.warning.light;
      case TaskStatus.DONE:
        return theme.palette.success.light;
      default:
        return theme.palette.grey[300];
    }
  };

  const getStatusTitle = (status: TaskStatus): string => {
    return formatEnumValue(status);
  };

  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, gap: 2, minHeight: 500 }}>
      {/* Render each status column */}
      {Object.keys(columns).map((status) => (
        <Paper 
          key={status}
          sx={{ 
            minWidth: 300,
            width: 300,
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderTop: 5, 
            borderColor: getColumnColor(status as TaskStatus)
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" component="h3" fontWeight="bold">
              {formatEnumValue(String(status))}
              <Chip 
                label={columns[status].length} 
                size="small" 
                sx={{ ml: 1 }}
                color={status === TaskStatus.DONE ? 'success' :
                      status === TaskStatus.REVIEW ? 'warning' :
                      status === TaskStatus.IN_PROGRESS ? 'primary' : 'default'}
              />
            </Typography>
          </Box>
          <Divider />
          <Droppable droppableId={status} type="TASK">
            {(provided, snapshot) => (
              <Stack 
                spacing={2} 
                sx={{ 
                  p: 2, 
                  overflowY: 'auto', 
                  flexGrow: 1,
                  minHeight: 100,
                  backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns[status].map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onClick={() => onTaskClick && onTaskClick(task.id)}
                    onAddComment={onAddComment}
                    onUpdateProgress={onUpdateProgress}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAttach={onAttach}
                  />
                ))}
                {columns[status].length === 0 && (
                  <Box 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      color: 'text.secondary',
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2">No tasks</Typography>
                  </Box>
                )}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </Paper>
      ))}
    </Box>
  );
};

export default KanbanBoard; 