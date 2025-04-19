import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Add as AddIcon, RequestQuote as RequestIcon } from '@mui/icons-material';
import { Task, TaskStatus, Project, UserRole, canAddTasks, canRequestTasks } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import KanbanColumn from './Board/KanbanColumn';

// Define the props interface for the KanbanBoard component
interface KanbanBoardProps {
  project?: Project;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: () => void;
  onRequestTask?: () => void;
  maxTasksPerStatus?: number;
}

// Helper function to get column color based on status
const getColumnColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return '#e0e0e0';
    case TaskStatus.IN_PROGRESS:
      return '#bbdefb';
    case TaskStatus.REVIEW:
      return '#fff9c4';
    case TaskStatus.DONE:
      return '#c8e6c9';
    default:
      return '#e0e0e0';
  }
};

// Helper function to get column title based on status
const getColumnTitle = (status: TaskStatus): string => {
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

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  project,
  onTaskClick,
  onAddTask,
  onRequestTask,
  maxTasksPerStatus,
}) => {
  const theme = useTheme();
  const { tasks, moveTask } = useTasks();
  const { user } = useAuth();
  const [columns, setColumns] = useState<Record<string, Task[]>>({});
  
  // Check if user has permission to add tasks
  const userCanAddTasks = user?.role ? canAddTasks(user.role) : false;
  const userCanRequestTasks = user?.role ? canRequestTasks(user.role) : false;
  
  // Organize tasks into columns by status
  useEffect(() => {
    const newColumns: Record<string, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    
    tasks.forEach(task => {
      if (!task.id) {
        console.warn('Task without ID found, skipping:', task);
        return;
      }
      
      const status = task.status || TaskStatus.TODO;
      
      if (newColumns[status]) {
        newColumns[status].push({
          ...task,
          id: String(task.id)
        });
      } else {
        console.warn(`Unknown status ${status} for task ${task.id}, placing in TODO`);
        newColumns[TaskStatus.TODO].push({
          ...task,
          id: String(task.id)
        });
      }
    });
    
    setColumns(newColumns);
  }, [tasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await moveTask(draggableId, destination.droppableId as TaskStatus);
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Kanban Board</Typography>
        {userCanAddTasks && onAddTask ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddTask}
          >
            Add Task
          </Button>
        ) : userCanRequestTasks && onRequestTask ? (
          <Button
            variant="outlined"
            startIcon={<RequestIcon />}
            onClick={onRequestTask}
          >
            Request Task
          </Button>
        ) : null}
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {Object.entries(columns).map(([status, columnTasks]) => (
            <KanbanColumn
              key={status}
              id={status}
              title={getColumnTitle(status as TaskStatus)}
              status={status as TaskStatus}
              color={getColumnColor(status as TaskStatus)}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
              maxTasks={maxTasksPerStatus}
            />
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoard; 