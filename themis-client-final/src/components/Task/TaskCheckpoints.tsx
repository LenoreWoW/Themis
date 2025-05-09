import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Checkbox, 
  TextField, 
  Button, 
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import FocusService from '../../services/FocusService';

// Define a local Checkpoint interface until we fix the types
interface Checkpoint {
  id: string;
  taskId: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskCheckpointsProps {
  taskId: string;
  onProgressChange?: (progress: number) => void;
  onNextCheckpointChange?: (nextCheckpoint: string | null) => void;
}

const TaskCheckpoints: React.FC<TaskCheckpointsProps> = ({ 
  taskId, 
  onProgressChange,
  onNextCheckpointChange
}) => {
  const { user } = useAuth();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [newCheckpointText, setNewCheckpointText] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Calculate completion percentage
  const calculateProgress = (): number => {
    if (checkpoints.length === 0) return 0;
    const completedCount = checkpoints.filter(cp => cp.completed).length;
    return Math.round((completedCount / checkpoints.length) * 100);
  };

  // Get the next uncompleted checkpoint
  const getNextCheckpoint = (): string | null => {
    const nextCheckpoint = checkpoints.find(cp => !cp.completed);
    return nextCheckpoint ? nextCheckpoint.text : null;
  };

  // Load checkpoints on component mount
  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        const focusService = FocusService.getInstance();
        const checkpointsData = await focusService.getCheckpoints(taskId);
        
        setCheckpoints(checkpointsData);
      } catch (error) {
        console.error('Error fetching checkpoints:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckpoints();
  }, [taskId]);

  // Update progress and next checkpoint when checkpoints change
  useEffect(() => {
    const progress = calculateProgress();
    if (onProgressChange) {
      onProgressChange(progress);
    }

    // Update next checkpoint
    const next = getNextCheckpoint();
    if (onNextCheckpointChange) {
      onNextCheckpointChange(next);
    }
  }, [checkpoints, onProgressChange, onNextCheckpointChange]);

  // Toggle checkpoint completion
  const handleToggleCheckpoint = async (checkpointId: string, completed: boolean) => {
    try {
      const focusService = FocusService.getInstance();
      const updatedCheckpoint = await focusService.updateCheckpoint(
        taskId, 
        checkpointId, 
        { completed: !completed }
      );
      
      if (updatedCheckpoint) {
        // Update local state
        setCheckpoints(prev => 
          prev.map(cp => 
            cp.id === checkpointId ? { ...cp, completed: !completed } : cp
          )
        );
        
        // Show completion animation or notification for 100% progress
        const newProgress = calculateProgress();
        if (newProgress === 100) {
          // You could trigger a confetti animation or show a celebration message
          console.log('All checkpoints completed! 🎉');
        }
      } else {
        console.error('Failed to update checkpoint');
      }
    } catch (error) {
      console.error('Error updating checkpoint:', error);
    }
  };

  // Add new checkpoint
  const handleAddCheckpoint = async () => {
    if (!newCheckpointText.trim()) return;
    
    try {
      const focusService = FocusService.getInstance();
      const newCheckpoint = await focusService.createCheckpoint(
        taskId, 
        newCheckpointText.trim()
      );
      
      if (newCheckpoint) {
        // Add new checkpoint to local state
        setCheckpoints(prev => [...prev, newCheckpoint]);
        // Clear input field
        setNewCheckpointText('');
      } else {
        console.error('Failed to create checkpoint');
      }
    } catch (error) {
      console.error('Error creating checkpoint:', error);
    }
  };

  // Delete checkpoint
  const handleDeleteCheckpoint = async (checkpointId: string) => {
    try {
      const focusService = FocusService.getInstance();
      const success = await focusService.deleteCheckpoint(taskId, checkpointId);
      
      if (success) {
        // Remove checkpoint from local state
        setCheckpoints(prev => prev.filter(cp => cp.id !== checkpointId));
      } else {
        console.error('Failed to delete checkpoint');
      }
    } catch (error) {
      console.error('Error deleting checkpoint:', error);
    }
  };

  // Handle enter key press in input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCheckpoint();
    }
  };

  // Toggle expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Determine progress bar color
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'primary';
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1,
          cursor: 'pointer'
        }}
        onClick={toggleExpanded}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Checkpoints {checkpoints.length > 0 && `(${calculateProgress()}%)`}
        </Typography>
        <IconButton size="small" edge="end">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {checkpoints.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={calculateProgress()} 
              color={getProgressColor(calculateProgress())}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.5s ease'
                }
              }} 
            />

            <List dense sx={{ py: 0 }}>
              {checkpoints.map((checkpoint) => (
                <ListItem 
                  key={checkpoint.id}
                  secondaryAction={
                    <Tooltip title="Delete checkpoint">
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCheckpoint(checkpoint.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    bgcolor: checkpoint.completed ? 'action.hover' : 'transparent',
                    borderRadius: 1,
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Checkbox
                      edge="start"
                      checked={checkpoint.completed}
                      onChange={() => handleToggleCheckpoint(checkpoint.id, checkpoint.completed)}
                      inputProps={{ 'aria-label': `Checkpoint ${checkpoint.id}` }}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={checkpoint.text}
                    sx={{
                      textDecoration: checkpoint.completed ? 'line-through' : 'none',
                      color: checkpoint.completed ? 'text.secondary' : 'text.primary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
          <TextField
            variant="outlined"
            placeholder="Add a checkpoint..."
            size="small"
            fullWidth
            value={newCheckpointText}
            onChange={(e) => setNewCheckpointText(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddCheckpoint}
            disabled={!newCheckpointText.trim()}
          >
            Add
          </Button>
        </Box>

        {checkpoints.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            No checkpoints yet. Add steps to track progress.
          </Typography>
        )}
      </Collapse>
    </Box>
  );
};

export default TaskCheckpoints; 