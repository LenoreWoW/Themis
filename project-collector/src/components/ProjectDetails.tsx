import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Project } from '../types';
import { projectService } from '../services/projectService';

interface ProjectDetailsProps {
  project: Project;
  onDelete?: (id: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleEdit = () => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDelete) {
        await onDelete(project.id);
      } else {
        await projectService.deleteProject(project.id);
      }
      setDeleteDialogOpen(false);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          alert('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          alert(`Failed to delete project: ${error.message}`);
        }
      } else {
        alert('An unexpected error occurred while deleting the project.');
      }
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {project.name}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {project.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Department
            </Typography>
            <Typography>
              {project.department}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Budget
            </Typography>
            <Typography>
              ${project.budget}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Client
            </Typography>
            <Typography>
              {project.client || 'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Project Manager
            </Typography>
            <Typography>
              {project.projectManager || 'Not assigned'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Start Date
            </Typography>
            <Typography>
              {new Date(project.startDate).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              End Date
            </Typography>
            <Typography>
              {new Date(project.endDate).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Status
            </Typography>
            <Typography>
              {project.status === 'in_progress' ? 'In Progress' : 'Completed'}
            </Typography>
          </Grid>
        </Grid>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Delete Project
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ProjectDetails; 