// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, ReactNode, ChangeEvent, MouseEvent } from 'react';
import {
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Chip,
  LinearProgress,
  Slider,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  ListItemText,
  Checkbox,
  OutlinedInput,
  SelectChangeEvent,
  Container
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';
import { GridContainer, GridItem } from '../components/common/MuiGridWrapper';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import GoalRelationshipsPage from './GoalRelationshipsPage';
import GoalMindMapPage from './GoalMindMapPage';
import ProjectGoalMindMapPage from './ProjectGoalMindMapPage';

// Enums used in this component
enum GoalType {
  STRATEGIC = 'STRATEGIC',
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY'
}

enum GoalCategory {
  PERFORMANCE = 'PERFORMANCE',
  FINANCIAL = 'FINANCIAL',
  CUSTOMER = 'CUSTOMER',
  LEARNING = 'LEARNING',
  PROCESS = 'PROCESS'
}

enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

// Local interfaces
interface GoalInterface {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  startDate: string;
  endDate: string;
  assignedTo: string;
  linkedProjects: ProjectWeight[];
  linkedGoals: GoalWeight[];
  isProgressAutoCalculated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectWeight {
  projectId: string;
  weight: number; // Weight as a percentage (0-100)
}

interface GoalWeight {
  goalId: string;
  weight: number; // Weight as a percentage (0-100)
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
}

// Tab panel component
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`goals-tabpanel-${index}`}
      aria-labelledby={`goals-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `goals-tab-${index}`,
    'aria-controls': `goals-tabpanel-${index}`,
  };
}

const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [strategicGoals, setStrategicGoals] = useState<GoalInterface[]>([]);
  const [annualGoals, setAnnualGoals] = useState<GoalInterface[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalInterface | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [projectWeights, setProjectWeights] = useState<{ [key: string]: number }>({});
  const [goalWeights, setGoalWeights] = useState<{ [key: string]: number }>({});

  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.projects.getAllProjects('');
        if (response.success) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array is fine since this only needs to run once on mount

  // Calculate a goal's progress based on the progress of its linked projects
  const calculateGoalProgressFromProjects = (linkedProjectWeights: ProjectWeight[]): number => {
    if (linkedProjectWeights.length === 0) return 0;
    
    let weightedProgress = 0;
    let totalWeight = 0;
    
    linkedProjectWeights.forEach(projectWeight => {
      const project = projects.find(p => p.id === projectWeight.projectId);
      if (project) {
        weightedProgress += (project.progress * projectWeight.weight);
        totalWeight += projectWeight.weight;
      }
    });
    
    // Return weighted average, or 0 if no valid projects were found
    return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (goal: GoalInterface | null = null, editing = false) => {
    setIsEditing(editing);
    
    if (goal) {
      setCurrentGoal(goal);
      
      // Initialize project weights from existing linked projects
      const weights: { [key: string]: number } = {};
      goal.linkedProjects.forEach(link => {
        weights[link.projectId] = link.weight;
      });
      setProjectWeights(weights);
      
      // Initialize goal weights from existing linked goals
      const gWeights: { [key: string]: number } = {};
      goal.linkedGoals.forEach(link => {
        gWeights[link.goalId] = link.weight;
      });
      setGoalWeights(gWeights);
    } else {
      // Create a new goal with default values
      setCurrentGoal({
        id: Date.now().toString(),
        title: '',
        description: '',
        type: tabValue === 0 ? GoalType.STRATEGIC : GoalType.ANNUAL,
        category: GoalCategory.PERFORMANCE,
        status: GoalStatus.NOT_STARTED,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        assignedTo: '',
        linkedProjects: [],
        linkedGoals: [],
        isProgressAutoCalculated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setProjectWeights({});
      setGoalWeights({});
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGoal(null);
    setIsEditing(false);
    setProjectWeights({});
    setGoalWeights({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentGoal(prevGoal => prevGoal ? { ...prevGoal, [name]: value } : null);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setCurrentGoal(prevGoal => {
      if (!prevGoal) return prevGoal;
      return { ...prevGoal, [name]: value };
    });
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    setCurrentGoal(prevGoal => {
      if (!prevGoal) return prevGoal;
      return { ...prevGoal, progress: newValue as number };
    });
  };

  const handleLinkedProjectsChange = (event: SelectChangeEvent<string[]>) => {
    if (!currentGoal) return;
    
    const selectedProjectIds = event.target.value as string[];
    
    // Initialize weights for newly selected projects
    const updatedWeights = { ...projectWeights };
    
    selectedProjectIds.forEach(projectId => {
      // If this is a newly selected project, initialize its weight to a default value
      if (!updatedWeights[projectId]) {
        updatedWeights[projectId] = 100 / selectedProjectIds.length; // Default to equal weights
      }
    });
    
    // Remove weights for projects that are no longer selected
    Object.keys(updatedWeights).forEach(projectId => {
      if (!selectedProjectIds.includes(projectId)) {
        delete updatedWeights[projectId];
      }
    });
    
    // Normalize weights to ensure they sum to 100%
    normalizeWeights(updatedWeights);
    setProjectWeights(updatedWeights);
    
    // Update the linked projects with new weights
    const updatedLinkedProjects = selectedProjectIds.map(projectId => ({
      projectId,
      weight: updatedWeights[projectId]
    }));
    
    setCurrentGoal({
      ...currentGoal,
      linkedProjects: updatedLinkedProjects
    });
  };

  const handleLinkedGoalsChange = (event: SelectChangeEvent<string[]>) => {
    if (!currentGoal) return;
    
    const selectedGoalIds = event.target.value as string[];
    
    // Initialize weights for newly selected goals
    const updatedWeights = { ...goalWeights };
    
    selectedGoalIds.forEach(goalId => {
      // If this is a newly selected goal, initialize its weight to a default value
      if (!updatedWeights[goalId]) {
        updatedWeights[goalId] = 100 / selectedGoalIds.length; // Default to equal weights
      }
    });
    
    // Set weights for selected goals
    setGoalWeights(updatedWeights);
    
    // Update the currentGoal with the new linked goals
    setCurrentGoal({
      ...currentGoal,
      linkedGoals: selectedGoalIds.map(goalId => ({
        goalId,
        weight: updatedWeights[goalId] || 0
      }))
    });
  };

  const handleAutoCalculateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAutoCalculated = event.target.checked;
    
    setCurrentGoal(prevGoal => {
      if (!prevGoal) return null;
      
      const updatedGoal = { ...prevGoal, isProgressAutoCalculated: isAutoCalculated };
      
      // If enabling auto-calculation, update the progress based on linked projects
      if (isAutoCalculated) {
        updatedGoal.progress = calculateGoalProgressFromProjects(prevGoal.linkedProjects.map(p => p));
      }
      
      return updatedGoal;
    });
  };

  const handleWeightChange = (projectId: string, newWeight: number) => {
    if (!currentGoal) return;
    
    const updatedWeights = { ...projectWeights };
    updatedWeights[projectId] = newWeight;
    
    // Ensure weights sum to 100%
    normalizeWeights(updatedWeights);
    setProjectWeights(updatedWeights);
    
    // Update linked projects with new weights
    const updatedLinkedProjects = currentGoal.linkedProjects.map(project => 
      project.projectId === projectId 
        ? { ...project, weight: newWeight }
        : { ...project, weight: updatedWeights[project.projectId] }
    );
    
    setCurrentGoal({
      ...currentGoal,
      linkedProjects: updatedLinkedProjects
    });
  };

  const handleGoalWeightChange = (goalId: string, newWeight: number) => {
    if (!currentGoal) return;
    
    // Update the weight for this goal
    const updatedGoalWeights = { ...goalWeights, [goalId]: newWeight };
    setGoalWeights(updatedGoalWeights);
    
    // Update the current goal with the new weights
    const updatedLinkedGoals = currentGoal.linkedGoals.map(goal =>
      goal.goalId === goalId ? { ...goal, weight: newWeight } : goal
    );
    
    setCurrentGoal({
      ...currentGoal,
      linkedGoals: updatedLinkedGoals
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentGoal) return;

    // Normalize the weights for linked projects to ensure they add up to 100%
    const finalLinkedProjects = currentGoal.linkedProjects.map(project => ({
      projectId: project.projectId,
      weight: project.weight
    }));

    // Normalize the weights for linked goals to ensure they add up to 100%
    const finalLinkedGoals = currentGoal.linkedGoals.map(goal => ({
      goalId: goal.goalId,
      weight: goal.weight
    }));

    const finalGoal = {
      ...currentGoal,
      linkedProjects: finalLinkedProjects,
      linkedGoals: finalLinkedGoals
    };

    // Save the goal
    if (isEditing) {
      // Update existing goal
      if (currentGoal.type === GoalType.STRATEGIC) {
        setStrategicGoals(prevGoals =>
          prevGoals.map(goal => goal.id === currentGoal.id ? finalGoal : goal)
        );
      } else {
        setAnnualGoals(prevGoals =>
          prevGoals.map(goal => goal.id === currentGoal.id ? finalGoal : goal)
        );
      }
    } else {
      // Create new goal
      if (finalGoal.type === GoalType.STRATEGIC) {
        setStrategicGoals(prevGoals => [...prevGoals, finalGoal]);
      } else {
        setAnnualGoals(prevGoals => [...prevGoals, finalGoal]);
      }
    }

    handleCloseDialog();
  };

  const handleDeleteGoal = (id: string) => {
    if (tabValue === 0) {
      setStrategicGoals(strategicGoals.filter(goal => goal.id !== id));
    } else {
      setAnnualGoals(annualGoals.filter(goal => goal.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case GoalStatus.NOT_STARTED:
        return 'default';
      case GoalStatus.IN_PROGRESS:
        return 'primary';
      case GoalStatus.COMPLETED:
        return 'success';
      case GoalStatus.ON_HOLD:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTranslatedStatus = (status: string): string => {
    switch (status) {
      case GoalStatus.NOT_STARTED: return t('goals.notStarted');
      case GoalStatus.IN_PROGRESS: return t('status.inProgress');
      case GoalStatus.COMPLETED: return t('status.completed');
      case GoalStatus.ON_HOLD: return t('status.onHold');
      default: return status;
    }
  };

  const getTranslatedCategory = (category: string): string => {
    switch (category) {
      case GoalCategory.PERFORMANCE: return t('goals.performance');
      case GoalCategory.FINANCIAL: return t('goals.financial');
      case GoalCategory.CUSTOMER: return t('goals.customer');
      case GoalCategory.LEARNING: return t('goals.learning');
      case GoalCategory.PROCESS: return t('goals.process');
      default: return category;
    }
  };

  const renderGoalCards = (goals: GoalInterface[]) => (
    <GridContainer spacing={3}>
      {goals.map(goal => (
        <GridItem key={goal.id} xs={12} md={6} lg={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10,
              display: 'flex'
            }}>
              <IconButton 
                size="small" 
                onClick={() => handleOpenDialog(goal, true)}
                sx={{ mr: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleDeleteGoal(goal.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {goal.title}
            </Typography>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 2, minHeight: '40px' }}
            >
              {goal.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={getTranslatedStatus(goal.status)} 
                size="small" 
                sx={{ mr: 1, mb: 1 }}
                color={getStatusColor(goal.status)}
              />
              <Chip 
                label={getTranslatedCategory(goal.category)} 
                size="small"
                sx={{ mb: 1 }}
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" display="flex" alignItems="center">
                <Box component="span" sx={{ width: '50%', fontWeight: 'bold', mr: 1 }}>
                  {t('goals.progress')}:
                </Box>
                <Box component="span" sx={{ width: '50%' }}>
                  {goal.progress}%
                </Box>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={goal.progress} 
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                <FormControlLabel
                  control={<Checkbox checked={goal.isProgressAutoCalculated} size="small" disabled />}
                  label={t('goals.autoCalculated')}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                />
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {t('timeline')}:
              </Typography>
              <Typography variant="body2">
                {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Typography variant="body2">
                {t('goals.assignedTo')}: {goal.assignedTo}
              </Typography>
            </Box>
            
            { /* Project Links */ }
            {goal.linkedProjects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">{t('Linked Projects')}:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {goal.linkedProjects.map(link => {
                    const project = projects.find(p => p.id === link.projectId);
                    return (
                      <Chip 
                        key={link.projectId}
                        label={project ? project.name : link.projectId}
                        size="small"
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
            
            { /* Goal Links */ }
            {goal.linkedGoals.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">{t('Linked Goals')}:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {goal.linkedGoals.map(link => {
                    const linkedGoal = [...strategicGoals, ...annualGoals].find(g => g.id === link.goalId);
                    return (
                      <Chip 
                        key={link.goalId}
                        label={linkedGoal ? linkedGoal.title : link.goalId}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Paper>
        </GridItem>
      ))}
    </GridContainer>
  );

  // Function to normalize weights to sum to 100%
  const normalizeWeights = (weights: { [key: string]: number }) => {
    const projectIds = Object.keys(weights);
    if (projectIds.length === 0) return;
    
    // Calculate the total of all weights
    const total = projectIds.reduce((sum, id) => sum + weights[id], 0);
    
    // If the total is not 100, normalize
    if (total !== 100 && total !== 0) {
      projectIds.forEach(id => {
        weights[id] = Math.round((weights[id] / total) * 100);
      });
      
      // Handle any rounding errors to ensure the sum is exactly 100
      const newTotal = projectIds.reduce((sum, id) => sum + weights[id], 0);
      if (newTotal !== 100) {
        weights[projectIds[0]] += (100 - newTotal);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ width: '100%', p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="goal tabs">
            <Tab label={t('goals.strategicGoals')} {...a11yProps(0)} />
            <Tab label={t('goals.annualGoals')} {...a11yProps(1)} />
            <Tab label={t('goals.relationships')} {...a11yProps(2)} />
            <Tab label={t('goals.goalMindMap')} {...a11yProps(3)} />
            <Tab label={t('goals.projectGoalMindMap')} {...a11yProps(4)} />
          </Tabs>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('goals.addGoal')}
          </Button>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {renderGoalCards(strategicGoals)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderGoalCards(annualGoals)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <GoalRelationshipsPage />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <GoalMindMapPage />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <ProjectGoalMindMapPage />
        </TabPanel>
      </Paper>
      
      {/* Dialog for adding/editing goals */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing 
            ? t('goals.edit')
            : `${t('goals.addNew')} ${tabValue === 0 ? t('goals.strategic') : t('goals.annual')} ${t('goals.goal')}`}
        </DialogTitle>
        <DialogContent>
          <GridContainer spacing={2} sx={{ mt: 1 }}>
            <GridItem xs={12}>
              <TextField
                label={t('goals.title')}
                name="title"
                value={currentGoal?.title || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                label={t('common.description')}
                name="description"
                value={currentGoal?.description || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                select
                label={t('goals.category')}
                name="category"
                value={currentGoal?.category || GoalCategory.PERFORMANCE}
                onChange={handleSelectChange as any}
                fullWidth
              >
                {Object.values(GoalCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getTranslatedCategory(category as string)}
                  </MenuItem>
                ))}
              </TextField>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                select
                label={t('status.status')}
                name="status"
                value={currentGoal?.status || GoalStatus.NOT_STARTED}
                onChange={handleSelectChange as any}
                fullWidth
              >
                {Object.values(GoalStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {getTranslatedStatus(status as string)}
                  </MenuItem>
                ))}
              </TextField>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                label={t('common.startDate')}
                name="startDate"
                type="date"
                value={currentGoal?.startDate || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                label={t('common.endDate')}
                name="endDate"
                type="date"
                value={currentGoal?.endDate || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                label={t('goals.assignedTo')}
                name="assignedTo"
                value={currentGoal?.assignedTo || ''}
                onChange={handleChange}
                fullWidth
              />
            </GridItem>
            
            { /* Linked Projects Section */ }
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              {t('goals.linkedProjects', 'Linked Projects')}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="linked-projects-label">{t('goals.selectProjects', 'Select Projects')}</InputLabel>
              <Select
                labelId="linked-projects-label"
                multiple
                value={currentGoal?.linkedProjects.map(p => p.projectId) || []}
                onChange={handleLinkedProjectsChange}
                input={<OutlinedInput label={t('goals.selectProjects', 'Select Projects')} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((projectId) => {
                      const project = projects.find(p => p.id === projectId);
                      return (
                        <Chip 
                          key={projectId} 
                          label={project ? project.name : projectId} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Checkbox checked={currentGoal?.linkedProjects.some(p => p.projectId === project.id) || false} />
                    <ListItemText primary={project.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            { /* Linked Goals Section */ }
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              {t('goals.linkedGoals', 'Linked Goals')}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="linked-goals-label">{t('goals.selectGoals', 'Select Goals')}</InputLabel>
              <Select
                labelId="linked-goals-label"
                multiple
                value={currentGoal?.linkedGoals.map(g => g.goalId) || []}
                onChange={handleLinkedGoalsChange}
                input={<OutlinedInput label={t('goals.selectGoals', 'Select Goals')} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((goalId) => {
                      // Find the goal in either strategic or annual goals
                      const goal = [...strategicGoals, ...annualGoals].find(g => g.id === goalId);
                      return (
                        <Chip 
                          key={goalId} 
                          label={goal ? goal.title : goalId} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {/* Filter out the current goal to prevent self-linking */}
                {[...strategicGoals, ...annualGoals]
                  .filter(goal => goal.id !== currentGoal?.id)
                  .map((goal) => (
                    <MenuItem key={goal.id} value={goal.id}>
                      <Checkbox checked={currentGoal?.linkedGoals.some(g => g.goalId === goal.id) || false} />
                      <ListItemText primary={goal.title} />
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>

            {/* Only show goal weights if there are linked goals */}
            {currentGoal?.linkedGoals.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {t('goals.adjustGoalWeights', 'Adjust the weight of each goal\'s contribution. Weights will automatically balance to 100%.')}
                </Typography>
                {currentGoal.linkedGoals.map(goalLink => {
                  const goal = [...strategicGoals, ...annualGoals].find(g => g.id === goalLink.goalId);
                  return (
                    <Box key={goalLink.goalId} sx={{ mt: 2 }}>
                      <Typography variant="body2">{goal ? goal.title : goalLink.goalId}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Slider
                          value={goalLink.weight}
                          onChange={(_, newValue) => handleGoalWeightChange(goalLink.goalId, newValue as number)}
                          aria-labelledby="goal-weight-slider"
                          valueLabelDisplay="auto"
                          step={5}
                          marks
                          min={0}
                          max={100}
                          sx={{ flexGrow: 1, mr: 2 }}
                        />
                        <Typography variant="body2">{goalLink.weight}%</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            <GridItem xs={12} sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentGoal?.isProgressAutoCalculated || false}
                    onChange={handleAutoCalculateChange}
                    name="isProgressAutoCalculated"
                  />
                }
                label={t('goals.autoCalculateProgress', 'Auto-calculate progress')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('goals.autoCalculateDescription', 'If enabled, progress will be calculated automatically based on linked projects.')}
              </Typography>
            </GridItem>
            
            {!currentGoal?.isProgressAutoCalculated && (
              <GridItem xs={12}>
                <Typography id="progress-slider" gutterBottom>
                  {t('project.progress', 'Progress')}: {currentGoal?.progress || 0}%
                </Typography>
                <Slider
                  value={currentGoal?.progress || 0}
                  onChange={handleProgressChange}
                  aria-labelledby="progress-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </GridItem>
            )}
            
            {/* Project Weights Section */}
            {currentGoal?.linkedProjects && currentGoal.linkedProjects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('Project Weights', 'Project Weights')}
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                  {t('goals.adjustProjectWeights', 'Adjust the weight of each project\'s contribution to this goal. Weights will automatically balance to 100%.')}
                </Typography>
                
                {currentGoal?.linkedProjects && currentGoal.linkedProjects.map((projectLink) => {
                  const project = projects.find(p => p.id === projectLink.projectId);
                  return (
                    <Box key={projectLink.projectId} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {project ? project.name : projectLink.projectId}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {projectWeights[projectLink.projectId] || projectLink.weight}%
                        </Typography>
                      </Box>
                      <Slider
                        value={projectWeights[projectLink.projectId] || projectLink.weight}
                        onChange={(_, newValue) => handleWeightChange(projectLink.projectId, newValue as number)}
                        aria-labelledby="project-weight-slider"
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={5}
                        max={100}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </GridContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GoalsPage; 