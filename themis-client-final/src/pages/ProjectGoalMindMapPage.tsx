import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  CircularProgress,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FolderIcon from '@mui/icons-material/Folder';
import FlagIcon from '@mui/icons-material/Flag';
import MindMapCanvas from '../components/MindMap/MindMapCanvas';
import { createProjectGoalMindMap } from '../utils/mindMapLayout';
import api from '../services/api';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  progress: number;
  linkedGoals: { goalId: string; weight: number }[];
  linkedProjects: { projectId: string; weight: number }[];
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
}

const ProjectGoalMindMapPage: React.FC = () => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerNodeType, setCenterNodeType] = useState<'project' | 'goal'>('goal');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<any>({ nodes: [], connections: [] });
  
  // Fetch data on component mount
  useEffect(() => {
    Promise.all([fetchGoals(), fetchProjects()]);
  }, []);
  
  // Fetch goals from API
  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.goals.getAllGoals('');
      
      if (response.success && response.data) {
        setGoals(response.data);
        
        // Set the first goal as selected if not already set and center type is goal
        if (centerNodeType === 'goal' && !selectedNodeId && response.data.length > 0) {
          setSelectedNodeId(response.data[0].id);
        }
      } else {
        setError('Failed to fetch goals');
      }
    } catch (err) {
      setError('An error occurred while fetching goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.projects.getAllProjects('');
      
      if (response.success && response.data) {
        setProjects(response.data);
        
        // Set the first project as selected if not already set and center type is project
        if (centerNodeType === 'project' && !selectedNodeId && response.data.length > 0) {
          setSelectedNodeId(response.data[0].id);
        }
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('An error occurred while fetching projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mind map when selected node changes
  useEffect(() => {
    if (selectedNodeId && goals.length > 0 && projects.length > 0) {
      const { nodes, connections } = createProjectGoalMindMap(
        projects, 
        goals, 
        selectedNodeId,
        centerNodeType
      );
      setMindMapData({ nodes, connections });
    }
  }, [selectedNodeId, centerNodeType, goals, projects]);
  
  // Handle node type change
  const handleNodeTypeChange = (_event: React.MouseEvent<HTMLElement>, newNodeType: 'project' | 'goal' | null) => {
    if (newNodeType) {
      setCenterNodeType(newNodeType);
      // Reset selection when changing type
      setSelectedNodeId('');
    }
  };
  
  // Handle node selection change
  const handleNodeChange = (event: SelectChangeEvent<string>) => {
    setSelectedNodeId(event.target.value);
  };
  
  // Handle node click in the mind map
  const handleNodeClick = (nodeId: string) => {
    // Extract the actual ID from the node ID (format: project-ID or goal-ID)
    const parts = nodeId.split('-');
    if (parts.length > 1) {
      const type = parts[0] as 'project' | 'goal';
      const id = parts.slice(1).join('-'); // In case the ID itself contains hyphens
      setCenterNodeType(type);
      setSelectedNodeId(id);
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('goals.projectGoalMindMap', 'Project-Goal Relationships')}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          {t('goals.projectGoalMindMapDescription', 'This mind map visualizes the relationships between projects and goals, showing how they support and align with each other.')}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ToggleButtonGroup
            color="primary"
            value={centerNodeType}
            exclusive
            onChange={handleNodeTypeChange}
            aria-label="center node type"
          >
            <ToggleButton value="project">
              <FolderIcon sx={{ mr: 1 }} />
              {t('projects.project', 'Project')}
            </ToggleButton>
            <ToggleButton value="goal">
              <FlagIcon sx={{ mr: 1 }} />
              {t('goals.goal', 'Goal')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="node-select-label">
              {centerNodeType === 'project' 
                ? t('projects.selectCentralProject', 'Select Central Project')
                : t('goals.selectCentralGoal', 'Select Central Goal')
              }
            </InputLabel>
            <Select
              labelId="node-select-label"
              value={selectedNodeId}
              onChange={handleNodeChange}
              label={centerNodeType === 'project' 
                ? t('projects.selectCentralProject', 'Select Central Project')
                : t('goals.selectCentralGoal', 'Select Central Goal')
              }
              disabled={loading}
            >
              {centerNodeType === 'project' ? (
                projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))
              ) : (
                goals.map(goal => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Paper
        elevation={3}
        sx={{
          height: 'calc(100vh - 300px)',
          minHeight: 500,
          width: '100%',
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {loading && !mindMapData.nodes.length ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <CircularProgress />
          </Box>
        ) : selectedNodeId ? (
          <MindMapCanvas
            nodes={mindMapData.nodes}
            connections={mindMapData.connections}
            centerNodeId={`${centerNodeType}-${selectedNodeId}`}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column'
            }}
          >
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              {t('goals.selectNodePrompt', 'Please select a node to view relationships')}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="textSecondary">
          {t('goals.mindMapHelp', 'Drag to pan, scroll to zoom, click on a node to center the mind map')}
        </Typography>
      </Box>
    </Container>
  );
};

export default ProjectGoalMindMapPage; 