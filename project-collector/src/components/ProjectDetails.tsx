import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { Project } from '../types';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{project.name}</Typography>
          <Button variant="outlined" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography paragraph>{project.description}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Department</Typography>
            <Typography>{project.department}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Status</Typography>
            <Typography>{project.status}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Budget</Typography>
            <Typography>${project.budget}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Timeline</Typography>
            <Typography>
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                Edit Project
              </Button>
              <Button variant="outlined" color="error">
                Delete Project
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProjectDetails; 