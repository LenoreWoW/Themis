import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import ProjectForm from '../components/ProjectForm';
import { useProjects } from '../hooks/useProjects';

const ProjectFormPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading, error, addProject, updateProject, getProjectById } = useProjects();
  const [currentProject, setCurrentProject] = useState(null);
  const [formError, setFormError] = useState(null);
  const isEditing = Boolean(projectId);

  useEffect(() => {
    if (isEditing && projects.length > 0) {
      const project = getProjectById(projectId);
      if (project) {
        setCurrentProject(project);
      } else {
        setFormError('Project not found');
        setTimeout(() => navigate('/projects'), 2000);
      }
    }
  }, [isEditing, projectId, projects, getProjectById, navigate]);

  const handleSubmit = (formData) => {
    try {
      if (isEditing) {
        updateProject({
          ...formData,
          id: projectId
        });
        navigate(`/projects/${projectId}`);
      } else {
        const newId = Date.now().toString();
        const newProject = {
          ...formData,
          id: newId,
          createdAt: new Date().toISOString()
        };
        addProject(newProject);
        navigate(`/projects/${newId}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save project');
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (isEditing && !currentProject && !formError) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography>Loading project...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </Typography>
        
        {formError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}
        
        <ProjectForm 
          project={currentProject} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      </Box>
    </Container>
  );
};

export default ProjectFormPage; 