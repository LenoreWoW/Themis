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
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MindMapCanvas from '../components/MindMap/MindMapCanvas';
import { createGoalMindMap } from '../utils/mindMapLayout';
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

const GoalMindMapPage: React.FC = () => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<any>({ nodes: [], connections: [] });
  
  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);
  
  // Fetch goals from API
  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.goals.getAllGoals('');
      
      if (response.success && response.data) {
        setGoals(response.data);
        
        // Set the first goal as selected if not already set
        if (!selectedGoalId && response.data.length > 0) {
          setSelectedGoalId(response.data[0].id);
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
  
  // Generate mind map when selected goal changes
  useEffect(() => {
    if (selectedGoalId && goals.length > 0) {
      const { nodes, connections } = createGoalMindMap(goals, selectedGoalId);
      setMindMapData({ nodes, connections });
    }
  }, [selectedGoalId, goals]);
  
  // Handle goal selection change
  const handleGoalChange = (event: SelectChangeEvent<string>) => {
    setSelectedGoalId(event.target.value);
  };
  
  // Handle node click in the mind map
  const handleNodeClick = (nodeId: string) => {
    setSelectedGoalId(nodeId);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('goals.goalMindMap', 'Goal Mind Map')}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          {t('goals.mindMapDescription', 'This mind map visualizes the relationships between goals, showing how they support or depend on each other.')}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel id="goal-select-label">
            {t('goals.selectCentralGoal', 'Select Central Goal')}
          </InputLabel>
          <Select
            labelId="goal-select-label"
            value={selectedGoalId}
            onChange={handleGoalChange}
            label={t('goals.selectCentralGoal', 'Select Central Goal')}
            disabled={loading}
          >
            {goals.map(goal => (
              <MenuItem key={goal.id} value={goal.id}>
                {goal.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
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
        ) : (
          <MindMapCanvas
            nodes={mindMapData.nodes}
            connections={mindMapData.connections}
            centerNodeId={selectedGoalId}
            onNodeClick={handleNodeClick}
          />
        )}
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="textSecondary">
          {t('goals.mindMapHelp', 'Drag to pan, scroll to zoom, click on a goal to center the mind map')}
        </Typography>
      </Box>
    </Container>
  );
};

export default GoalMindMapPage; 