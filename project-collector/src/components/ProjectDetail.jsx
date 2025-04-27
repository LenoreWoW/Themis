import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip,
  Divider,
  Button,
  Stack,
  LinearProgress
} from '@mui/material';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

const ProjectDetail = ({ project, onBack, onEdit }) => {
  if (!project) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            Back to Projects
          </Button>
        </Box>
        <Typography>Project not found or loading...</Typography>
      </Paper>
    );
  }

  const calculateProgress = () => {
    if (!project.startDate || !project.endDate) return 0;
    
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const today = new Date().getTime();
    
    if (today <= start) return 0;
    if (today >= end) return 100;
    
    return Math.round(((today - start) / (end - start)) * 100);
  };

  const progress = calculateProgress();

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Back to Projects
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => onEdit(project.id)}
        >
          Edit Project
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        {project.name}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body1" paragraph>
              {project.description || 'No description provided.'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Project Details</Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Client</Typography>
                <Typography variant="body1">{project.client}</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{project.department}</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Project Manager</Typography>
                <Typography variant="body1">{project.projectManager}</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Budget</Typography>
                <Typography variant="body1">
                  ${project.budget?.toLocaleString() || 'Not specified'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Status Information</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">
                    {project.startDate 
                      ? format(new Date(project.startDate), 'MMMM dd, yyyy') 
                      : 'Not set'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">
                    {project.endDate 
                      ? format(new Date(project.endDate), 'MMMM dd, yyyy') 
                      : 'Not set'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={project.status?.replace('_', ' ') || 'Not set'} 
                    color={getStatusColor(project.status)}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Chip 
                    label={project.priority || 'Not set'} 
                    color={getPriorityColor(project.priority)}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Timeline Progress ({progress}%)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ mt: 1, height: 10, borderRadius: 5 }} 
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PLANNING':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'ON_HOLD':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'LOW':
      return 'success';
    case 'MEDIUM':
      return 'info';
    case 'HIGH':
      return 'warning';
    case 'CRITICAL':
      return 'error';
    default:
      return 'default';
  }
};

export default ProjectDetail; 