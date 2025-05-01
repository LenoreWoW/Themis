import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Project, ProjectStatus, ProjectPriority } from '../../themis-client/src/types';
import { projectService } from '../../themis-client/src/services/ProjectService';
import { Box, Button, TextField, Typography, Paper, Grid } from '@mui/material';

interface ProjectFormProps {
  onSubmit?: (project: Omit<Project, 'id'>) => void;
  initialProject?: Partial<Project>;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, initialProject }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    budget: 0,
    ...initialProject
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const data = await projectService.getProjectById(id);
          setProject(data);
        } catch (err) {
          setError('Failed to fetch project details');
        }
      };
      fetchProject();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        onSubmit(project as Omit<Project, 'id'>);
      } else {
        if (id) {
          await projectService.updateProject(id, project as Project);
        } else {
          await projectService.createProject(project as Project);
        }
        navigate('/projects');
      }
    } catch (err) {
      setError('Failed to save project');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Project' : 'Create Project'}
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={project.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={project.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={project.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={project.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {id ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm; 