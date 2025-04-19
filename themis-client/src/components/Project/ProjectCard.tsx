import React from 'react';
import { Typography, Card, CardContent, Box, Chip, LinearProgress } from '@mui/material';
import { Project, ProjectStatus } from '../../types';
import { CalendarToday, Person, Business } from '@mui/icons-material';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  // Calculate days until deadline
  const calculateDaysUntilDeadline = () => {
    const deadline = new Date(project.endDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine card border color based on deadline
  const getBorderColor = () => {
    if (project.status === ProjectStatus.COMPLETED) return 'success.main';
    if (project.status === ProjectStatus.CANCELLED) return 'error.main';
    if (project.status === ProjectStatus.ON_HOLD) return 'warning.main';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return 'error.main'; // Overdue
    if (daysLeft <= 7) return 'warning.main'; // Close to deadline
    if (daysLeft <= 14) return 'info.main'; // Approaching deadline
    return 'primary.main'; // Plenty of time
  };

  // Calculate progress color
  const getProgressColor = () => {
    if (project.status === ProjectStatus.COMPLETED) return 'success';
    if (project.status === ProjectStatus.ON_HOLD) return 'warning';
    
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return 'error';
    if (daysLeft <= 7) return 'warning';
    return 'primary';
  };

  // Get status chip color
  const getStatusColor = (status: ProjectStatus) => {
    // Check if project is overdue first
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0 && status === ProjectStatus.IN_PROGRESS) return 'error';
    
    // Default status colors
    switch (status) {
      case ProjectStatus.PLANNING: return 'default';
      case ProjectStatus.IN_PROGRESS: return 'primary';
      case ProjectStatus.ON_HOLD: return 'warning';
      case ProjectStatus.COMPLETED: return 'success';
      case ProjectStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Determine deadline message
  const getDeadlineMessage = () => {
    const daysLeft = calculateDaysUntilDeadline();
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} days`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    return `${daysLeft} days left`;
  };

  // Mock progress value - in a real app, this would come from project data
  const progress = project.status === ProjectStatus.COMPLETED ? 100 : 
                   project.status === ProjectStatus.PLANNING ? 10 :
                   project.status === ProjectStatus.IN_PROGRESS ? 50 : 30;

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
            label={project.status} 
            size="small" 
            color={getStatusColor(project.status)}
          />
          <Chip 
            label={project.priority} 
            size="small" 
            variant="outlined"
          />
        </Box>

        {calculateDaysUntilDeadline() < 0 && project.status === ProjectStatus.IN_PROGRESS && (
          <Chip 
            label="OVERDUE" 
            size="small" 
            color="error"
            sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}
          />
        )}

        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {project.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description?.length > 100 
            ? `${project.description.substring(0, 100)}...` 
            : project.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Business fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {project.client}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {project.projectManager?.firstName} {project.projectManager?.lastName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <Typography 
              variant="body2" 
              color={calculateDaysUntilDeadline() < 0 ? 'error.main' : 'text.secondary'}
              fontWeight={calculateDaysUntilDeadline() < 0 ? 'bold' : 'normal'}
            >
              {getDeadlineMessage()}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={getProgressColor()}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 