import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Project, ProjectStatus, ProjectPriority } from '../../types';
import { projectService } from '../../services/ProjectService';
import { Box, Button, TextField, Typography, Paper, Autocomplete, Chip } from '@mui/material';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';

// Extended Project interface with dependencies
interface ProjectWithDependencies extends Project {
  dependsOnProjects: string[];
  projectsDependingOnThis: string[];
}

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Partial<ProjectWithDependencies>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    budget: 0,
    dependsOnProjects: [],
    projectsDependingOnThis: []
  });
  const [error, setError] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch all projects for the dropdown selectors
    const fetchAllProjects = async () => {
      try {
        const projects = await projectService.getProjects();
        setAllProjects(projects);
      } catch (err) {
        console.error('Failed to fetch projects for dependencies', err);
      }
    };

    // Fetch current project details if editing
    const fetchCurrentProject = async () => {
      if (id) {
        try {
          const data = await projectService.getProjectById(id);
          setProject(data);
        } catch (err) {
          setError('Failed to fetch project details');
        }
      }
    };

    fetchAllProjects();
    fetchCurrentProject();
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
      if (id) {
        await projectService.updateProject(id, project as ProjectWithDependencies);
      } else {
        await projectService.createProject(project as ProjectWithDependencies);
      }
      navigate('/projects');
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
          <GridContainer spacing={3}>
            <GridItem xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={project.name}
                onChange={handleChange}
                required
              />
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={project.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
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
            </GridItem>
            
            <GridItem xs={12} sm={6}>
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
            </GridItem>
            
            <GridItem xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Project Dependencies
              </Typography>
            </GridItem>

            <GridItem xs={12}>
              <Autocomplete
                multiple
                id="depends-on-projects"
                options={allProjects.filter(p => p.id !== id)}
                getOptionLabel={(option) => option.name}
                value={allProjects.filter(p => project.dependsOnProjects?.includes(p.id))}
                onChange={(_, newValue) => {
                  setProject(prev => ({
                    ...prev,
                    dependsOnProjects: newValue.map(p => p.id)
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Projects This Project Depends On"
                    placeholder="Select projects"
                    helperText="Optional: Select projects that must be completed before this one"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </GridItem>

            <GridItem xs={12}>
              <Autocomplete
                multiple
                id="projects-depending-on-this"
                options={allProjects.filter(p => p.id !== id)}
                getOptionLabel={(option) => option.name}
                value={allProjects.filter(p => project.projectsDependingOnThis?.includes(p.id))}
                onChange={(_, newValue) => {
                  setProject(prev => ({
                    ...prev,
                    projectsDependingOnThis: newValue.map(p => p.id)
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Projects That Depend On This"
                    placeholder="Select projects"
                    helperText="Optional: Select projects that require this one to be completed first"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </GridItem>

            <GridItem xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
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
            </GridItem>
          </GridContainer>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm; 