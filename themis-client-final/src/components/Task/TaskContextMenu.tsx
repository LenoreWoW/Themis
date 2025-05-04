import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  InsertDriveFile as FileIcon,
  AssignmentTurnedIn as CompleteIcon,
  ArrowForward as MoveIcon
} from '@mui/icons-material';
import { TaskStatus } from '../../types';

interface TaskContextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onAddComment: () => void;
  onAttach: () => void;
  onMove: (status: TaskStatus) => void;
  currentStatus: TaskStatus;
}

const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  onComplete,
  onAddComment,
  onAttach,
  onMove,
  currentStatus
}) => {
  // Get possible statuses to move to (excluding current status)
  const getAvailableStatuses = () => {
    return Object.values(TaskStatus).filter(status => status !== currentStatus);
  };

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    onClose();
  };

  const handleMoveClick = (status: TaskStatus) => {
    onMove(status);
    onClose();
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.REVIEW: return 'In Review';
      case TaskStatus.DONE: return 'Done';
      default: return status;
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={() => handleMenuItemClick(onEdit)}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Task</ListItemText>
      </MenuItem>
      
      {currentStatus !== TaskStatus.DONE && (
        <MenuItem onClick={() => handleMenuItemClick(onComplete)}>
          <ListItemIcon>
            <CompleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Complete</ListItemText>
        </MenuItem>
      )}
      
      <MenuItem onClick={() => handleMenuItemClick(onAddComment)}>
        <ListItemIcon>
          <CommentIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Add Comment</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleMenuItemClick(onAttach)}>
        <ListItemIcon>
          <FileIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Attach File</ListItemText>
      </MenuItem>
      
      {getAvailableStatuses().length > 0 && (
        [
          <MenuItem
            key="move-divider"
            disabled
            sx={{ opacity: 0.6, py: 0.5, fontSize: '0.75rem' }}
            dense
          >
            Move to Status
          </MenuItem>,
          ...getAvailableStatuses().map(status => (
            <MenuItem 
              key={status}
              onClick={() => handleMoveClick(status)}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <MoveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{getStatusLabel(status)}</ListItemText>
            </MenuItem>
          ))
        ]
      )}
      
      <MenuItem 
        onClick={() => handleMenuItemClick(onDelete)}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete Task</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default TaskContextMenu; 