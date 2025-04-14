import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Avatar, 
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskStatus, TaskPriority, Project } from '../../types';
import { 
  Edit as EditIcon, 
  Flag as FlagIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import MuiGridWrapper from '../common/MuiGridWrapper';
import './KanbanBoard.css';

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
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
      return '#9e9e9e'; // gray
  }
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  project, 
  tasks, 
  onTaskUpdate,
  onTaskClick 
}) => {
  const [columns, setColumns] = useState<{[key in TaskStatus]: Task[]}>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: []
  });
  
  useEffect(() => {
    // Organize tasks into columns
    const newColumns: {[key in TaskStatus]: Task[]} = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: []
    };

    tasks.forEach(task => {
      if (newColumns[task.status]) {
        newColumns[task.status].push(task);
      } else {
        // If task has a status that's not in our columns, put it in TODO
        newColumns[TaskStatus.TODO].push(task);
      }
    });

    setColumns(newColumns);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside of a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Get the source and destination columns
    const sourceColumn = columns[source.droppableId as TaskStatus];
    const destColumn = columns[destination.droppableId as TaskStatus];

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const newTasks = Array.from(sourceColumn);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);

      const newColumns = {
        ...columns,
        [source.droppableId as TaskStatus]: newTasks
      };

      setColumns(newColumns);
    } else {
      // Moving from one column to another
      const sourceTasks = Array.from(sourceColumn);
      const destTasks = Array.from(destColumn);
      const [movedTask] = sourceTasks.splice(source.index, 1);
      
      // Update the task's status
      const newStatus = destination.droppableId as TaskStatus;
      const updatedTask = { 
        ...movedTask, 
        status: newStatus
      };
      destTasks.splice(destination.index, 0, updatedTask);

      const newColumns = {
        ...columns,
        [source.droppableId as TaskStatus]: sourceTasks,
        [destination.droppableId as TaskStatus]: destTasks
      };

      setColumns(newColumns);

      // Notify parent component about the task update
      if (onTaskUpdate) {
        // The parent component should handle the backend status mapping
        // so we just pass the updated task with the frontend status
        onTaskUpdate(updatedTask);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Helper function to get column title
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
        return status;
    }
  };

  // Helper function to get column color
  const getColumnColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return '#e0e0e0';
      case TaskStatus.IN_PROGRESS:
        return '#bbdefb';
      case TaskStatus.REVIEW:
        return '#ffecb3';
      case TaskStatus.DONE:
        return '#c8e6c9';
      default:
        return '#e0e0e0';
    }
  };

  return (
    <Box className="kanban-board">
      <DragDropContext onDragEnd={onDragEnd}>
        <MuiGridWrapper container spacing={2}>
          {Object.keys(columns).map((columnId) => (
            <MuiGridWrapper item xs={12} sm={6} md={3} key={columnId}>
              <Paper 
                elevation={1} 
                className="kanban-column"
                sx={{ 
                  height: '100%',
                  backgroundColor: getColumnColor(columnId as TaskStatus),
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <Typography variant="h6" component="div">
                    {getColumnTitle(columnId as TaskStatus)}
                    <Chip 
                      label={columns[columnId as TaskStatus].length} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="kanban-tasks"
                      sx={{ 
                        p: 1, 
                        minHeight: '400px',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        backgroundColor: snapshot.isDraggingOver 
                          ? 'rgba(0, 0, 0, 0.05)' 
                          : 'transparent'
                      }}
                    >
                      {columns[columnId as TaskStatus].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ 
                                mb: 2, 
                                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                                backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'white',
                                boxShadow: snapshot.isDragging ? 3 : 1,
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: 2,
                                  '& .task-actions': {
                                    visibility: 'visible'
                                  }
                                }
                              }}
                              onClick={() => handleTaskClick(task)}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {task.title}
                                  </Typography>
                                  <Box className="task-actions" sx={{ visibility: 'hidden' }}>
                                    <Tooltip title="Edit">
                                      <IconButton size="small">
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="More">
                                      <IconButton size="small">
                                        <MoreIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {task.description}
                                </Typography>
                                
                                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {task.assignee && (
                                      <Tooltip title={`Assigned to: ${task.assignee.username}`}>
                                        <Avatar 
                                          sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}
                                        >
                                          {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
                                        </Avatar>
                                      </Tooltip>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                  <Tooltip title={`Priority: ${task.priority}`}>
                                    <FlagIcon 
                                      fontSize="small" 
                                      sx={{ color: getPriorityColor(task.priority) }} 
                                    />
                                  </Tooltip>
                                </Stack>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </MuiGridWrapper>
          ))}
        </MuiGridWrapper>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoard; 