import React from 'react';
import { Project, Task, TaskStatus } from '../../types';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';

// Define the styles inline since we removed most CSS
const styles = {
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    padding: '20px',
    textAlign: 'center',
    color: '#888'
  }
};

interface GanttChartProps {
  project: Project;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskDoubleClick?: (task: Task) => void;
}

// Function to get color based on task status
const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return '#6c757d';
    case TaskStatus.IN_PROGRESS:
      return '#007bff';
    case TaskStatus.DONE:
      return '#28a745';
    case TaskStatus.REVIEW:
      return '#dc3545';
    default:
      return '#007bff';
  }
};

const GanttChart: React.FC<GanttChartProps> = ({ 
  project, 
  tasks, 
  onTaskClick 
}) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aDate = new Date(a.startDate).getTime();
    const bDate = new Date(b.startDate).getTime();
    return aDate - bDate;
  });

  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  const totalProjectDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

  const handleClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  if (sortedTasks.length === 0) {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Project Timeline
        </Typography>
        <Box sx={styles.emptyState}>
          <Typography variant="body1">No tasks available for this project.</Typography>
          <Typography variant="body2">Add tasks to see them in the Gantt chart.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Project Timeline
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Project duration: {projectStart.toLocaleDateString()} - {projectEnd.toLocaleDateString()} ({totalProjectDays} days)
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {sortedTasks.map(task => {
          const startDate = new Date(task.startDate);
          const endDate = new Date(task.dueDate);
          const taskDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calculate position relative to project timeline
          const daysFromStart = Math.ceil((startDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
          const percentFromStart = (daysFromStart / totalProjectDays) * 100;
          const percentWidth = (taskDays / totalProjectDays) * 100;
          
          // Ensure percentFromStart is not negative (for tasks starting before project start)
          const adjustedPercentFromStart = Math.max(0, percentFromStart);
          // Ensure width + start doesn't exceed 100%
          const adjustedPercentWidth = Math.min(percentWidth, 100 - adjustedPercentFromStart);
          
          return (
            <Paper 
              key={task.id} 
              sx={{ 
                p: 1.5, 
                mb: 1, 
                cursor: 'pointer',
                borderLeft: `4px solid ${getStatusColor(task.status)}`,
                '&:hover': { boxShadow: 2 }
              }}
              onClick={() => handleClick(task)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">{task.title}</Typography>
                <Chip 
                  label={task.status} 
                  size="small" 
                  sx={{ bgcolor: getStatusColor(task.status), color: 'white' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} ({taskDays} days)
              </Typography>
              
              <Box sx={{ mt: 1, height: 8, width: '100%', bgcolor: '#f0f0f0', borderRadius: 1, overflow: 'hidden' }}>
                <Box 
                  sx={{ 
                    height: '100%', 
                    width: `${adjustedPercentWidth}%`, 
                    bgcolor: getStatusColor(task.status),
                    ml: `${adjustedPercentFromStart}%`
                  }} 
                />
              </Box>
              
              {task.assignee && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default GanttChart; 