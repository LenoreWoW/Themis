import React, { useState } from 'react';
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
  DialogActions,
} from '@mui/material';
import { Project } from '../types';

interface ProjectDetailsProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(project.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
          </Box>

          <Grid container spacing={3} component="div">
            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {project.description}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Status
              </Typography>
              <Typography variant="body1" paragraph>
                {project.status}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Department
              </Typography>
              <Typography variant="body1" paragraph>
                {project.department?.name || 'Not assigned'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Project Manager
              </Typography>
              <Typography variant="body1" paragraph>
                {project.projectManager
                  ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                  : 'Not assigned'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Client
              </Typography>
              <Typography variant="body1" paragraph>
                {project.department?.name || 'Not specified'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Budget
              </Typography>
              <Typography variant="body1" paragraph>
                ${project.budget.toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Start Date
              </Typography>
              <Typography variant="body1" paragraph>
                {new Date(project.startDate).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} component="div">
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                End Date
              </Typography>
              <Typography variant="body1" paragraph>
                {new Date(project.endDate).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12} component="div">
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                >
                  Edit Project
                </Button>
                {onDelete && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                  >
                    Delete Project
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails; 