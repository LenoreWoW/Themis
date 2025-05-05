import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Divider, 
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle
} from '@mui/material';
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import { Project } from '../../types';
import { projectService } from '../../services/ProjectService';

// Extended Project interface with dependencies
interface ProjectWithDependencies extends Project {
  dependsOnProjects?: string[];
  projectsDependingOnThis?: string[];
}

interface ProjectDependenciesProps {
  project: ProjectWithDependencies;
}

const ProjectDependencies: React.FC<ProjectDependenciesProps> = ({ project }) => {
  const [dependsOnProjects, setDependsOnProjects] = useState<Project[]>([]);
  const [projectsDependingOn, setProjectsDependingOn] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);
        // Check if dependency data exists
        if (project.dependsOnProjects && project.dependsOnProjects.length > 0) {
          // Fetch all projects and filter out any null results
          const dependsOnPromises = project.dependsOnProjects.map(id => 
            projectService.getProjectById(id).catch(err => {
              console.error(`Error fetching project ${id}:`, err);
              return null;
            })
          );
          
          const dependsOnResults = await Promise.all(dependsOnPromises);
          // Filter out null results
          const validDependsOnProjects = dependsOnResults.filter(project => project !== null) as Project[];
          setDependsOnProjects(validDependsOnProjects);
        }

        if (project.projectsDependingOnThis && project.projectsDependingOnThis.length > 0) {
          // Fetch all projects and filter out any null results
          const dependingOnPromises = project.projectsDependingOnThis.map(id => 
            projectService.getProjectById(id).catch(err => {
              console.error(`Error fetching project ${id}:`, err);
              return null;
            })
          );
          
          const dependingOnResults = await Promise.all(dependingOnPromises);
          // Filter out null results
          const validDependingOnProjects = dependingOnResults.filter(project => project !== null) as Project[];
          setProjectsDependingOn(validDependingOnProjects);
        }
      } catch (err) {
        console.error('Error fetching project dependencies:', err);
        setError('Failed to load project dependencies');
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [project]);

  const noDependencies = dependsOnProjects.length === 0 && projectsDependingOn.length === 0;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Project Dependencies
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Typography>Loading dependencies...</Typography>
      ) : error ? (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      ) : noDependencies ? (
        <Alert severity="info">
          <AlertTitle>No Dependencies</AlertTitle>
          This project doesn't have any dependencies defined.
        </Alert>
      ) : (
        <Box>
          {dependsOnProjects.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                This project depends on:
              </Typography>
              <List disablePadding>
                {dependsOnProjects.map(dep => (
                  <ListItem key={dep.id} sx={{ py: 1 }}>
                    <ArrowBack color="primary" sx={{ mr: 1 }} />
                    <ListItemText
                      primary={dep.name}
                      secondary={`Status: ${dep.status} | Due: ${new Date(dep.endDate).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={dep.status}
                      color={
                        dep.status === 'COMPLETED' ? 'success' :
                        dep.status === 'IN_PROGRESS' ? 'info' :
                        dep.status === 'ON_HOLD' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {projectsDependingOn.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Projects that depend on this:
              </Typography>
              <List disablePadding>
                {projectsDependingOn.map(dep => (
                  <ListItem key={dep.id} sx={{ py: 1 }}>
                    <ArrowForward color="secondary" sx={{ mr: 1 }} />
                    <ListItemText
                      primary={dep.name}
                      secondary={`Status: ${dep.status} | Due: ${new Date(dep.endDate).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={dep.status}
                      color={
                        dep.status === 'COMPLETED' ? 'success' :
                        dep.status === 'IN_PROGRESS' ? 'info' :
                        dep.status === 'ON_HOLD' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ProjectDependencies; 