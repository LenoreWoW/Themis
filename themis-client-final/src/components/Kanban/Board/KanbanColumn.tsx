import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Box, Typography, Paper, Chip, Tooltip, IconButton, Menu, MenuItem } from '@mui/material';
import { Task, TaskStatus } from '../../../types';
import KanbanTask from './KanbanTask';
import { Add as AddIcon, MoreVert as MoreIcon } from '@mui/icons-material';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  status: TaskStatus;
  color: string;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: () => void;
  isDropDisabled?: boolean;
  isCombineEnabled?: boolean;
  maxTasksPerColumn?: number;
  maxTasks?: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  status,
  color,
  onTaskClick,
  onAddTask,
  isDropDisabled = false,
  isCombineEnabled = false,
  maxTasksPerColumn,
}) => {
  const isColumnFull = maxTasksPerColumn ? tasks.length >= maxTasksPerColumn : false;
  const columnStyles = {
    backgroundColor: isColumnFull ? '#f9e6e6' : '#f5f5f5',
    border: isColumnFull ? '1px dashed #d32f2f' : '1px solid #e0e0e0',
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleAddTaskClick = () => {
    handleMenuClose();
    if (onAddTask) {
      onAddTask();
    }
  };

  return (
    <Box
      sx={{
        width: '300px',
        minWidth: '300px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mr: 2,
        flexShrink: 0,
      }}
      role="region"
      aria-label={`${title} column`}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          px: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={`${tasks.length} tasks in this column`}>
            <Chip
              label={tasks.length}
              size="small"
              sx={{
                backgroundColor: color,
                color: 'white',
                fontWeight: 'bold',
                mr: 1
              }}
            />
          </Tooltip>
          
          <Tooltip title="Column actions">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleAddTaskClick}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Add Task
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Droppable
        droppableId={id}
        type="TASK"
        isDropDisabled={isDropDisabled || isColumnFull}
        isCombineEnabled={isCombineEnabled}
        ignoreContainerClipping={false}
      >
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 1,
              height: 'calc(100% - 40px)',
              ...columnStyles,
              transition: 'background-color 0.2s ease',
              ...(snapshot.isDraggingOver && {
                backgroundColor: '#e3f2fd',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
              }),
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onAddTask) {
                onAddTask();
              }
            }}
          >
            {tasks.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  cursor: 'pointer',
                }}
                onClick={() => onAddTask && onAddTask()}
              >
                <Typography variant="body2" color="text.secondary">
                  No tasks - Click to add
                </Typography>
              </Box>
            ) : (
              tasks.map((task, index) => (
                <KanbanTask
                  key={String(task.id)}
                  task={task}
                  index={index}
                  onClick={() => onTaskClick && onTaskClick(task.id)}
                />
              ))
            )}
            {provided.placeholder}
          </Paper>
        )}
      </Droppable>
    </Box>
  );
};

export default KanbanColumn; 