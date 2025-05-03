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
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';
import { GridContainer, GridItem } from '../components/common/MuiGridWrapper';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

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
  isProgressAutoCalculated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectWeight {
  projectId: string;
  weight: number; // Weight as a percentage (0-100)
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
}

// Export the initial goals for use in other components
export const initialStrategicGoals = [
  {
    id: '1',
    title: 'Improve Project Completion Rate',
    description: 'Increase on-time project completion rate by 15%',
    type: GoalType.STRATEGIC,
    category: GoalCategory.PERFORMANCE,
    status: GoalStatus.IN_PROGRESS,
    progress: 65,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    assignedTo: 'Department A',
    linkedProjects: [
      { projectId: 'p1', weight: 60 },
      { projectId: 'p4', weight: 40 }
    ],
    isProgressAutoCalculated: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    title: 'Reduce Project Costs',
    description: 'Reduce average project costs by 10%',
    type: GoalType.STRATEGIC,
    category: GoalCategory.FINANCIAL,
    status: GoalStatus.NOT_STARTED,
    progress: 0,
    startDate: '2023-02-15',
    endDate: '2025-11-30',
    assignedTo: 'Department B',
    linkedProjects: [],
    isProgressAutoCalculated: false,
    createdAt: '2023-02-15',
    updatedAt: '2023-02-15'
  },
];

// Export the initial annual goals
export const initialAnnualGoals = [
  {
    id: '3',
    title: 'Client Satisfaction',
    description: 'Achieve 90% positive client feedback',
    type: GoalType.ANNUAL,
    category: GoalCategory.CUSTOMER,
    status: GoalStatus.COMPLETED,
    progress: 100,
    startDate: '2023-01-15',
    endDate: '2023-12-31',
    assignedTo: 'All Departments',
    linkedProjects: [
      { projectId: 'p2', weight: 50 },
      { projectId: 'p3', weight: 50 }
    ],
    isProgressAutoCalculated: true,
    createdAt: '2023-01-15',
    updatedAt: '2023-12-15'
  },
  {
    id: '4',
    title: 'Staff Training',
    description: 'Complete required training for all staff members',
    type: GoalType.ANNUAL,
    category: GoalCategory.LEARNING,
    status: GoalStatus.IN_PROGRESS,
    progress: 75,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    assignedTo: 'HR Department',
    linkedProjects: [],
    isProgressAutoCalculated: false,
    createdAt: '2023-01-01',
    updatedAt: '2023-10-01'
  },
];

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
  const [strategicGoals, setStrategicGoals] = useState<GoalInterface[]>(initialStrategicGoals);
  const [annualGoals, setAnnualGoals] = useState<GoalInterface[]>(initialAnnualGoals);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalInterface | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectWeights, setProjectWeights] = useState<{ [key: string]: number }>({});

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
  }, []);

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
        isProgressAutoCalculated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setProjectWeights({});
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGoal(null);
    setIsEditing(false);
    setProjectWeights({});
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentGoal) return;
    
    // Ensure project weights are properly set before saving
    const finalLinkedProjects = currentGoal.linkedProjects.map(project => ({
      projectId: project.projectId,
      weight: projectWeights[project.projectId] || 0
    }));
    
    const finalGoal = {
      ...currentGoal,
      linkedProjects: finalLinkedProjects,
      updatedAt: new Date().toISOString()
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
      // Add new goal
      if (finalGoal.type === GoalType.STRATEGIC) {
        setStrategicGoals(prevGoals => [...prevGoals, finalGoal]);
      } else {
        setAnnualGoals(prevGoals => [...prevGoals, finalGoal]);
      }
    }
    
    setOpenDialog(false);
    setCurrentGoal(null);
    setProjectWeights({});
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
            
            {goal.linkedProjects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {t('goals.linkedProjects')}:
                </Typography>
                {goal.linkedProjects.map((projectWeight) => {
                  const project = projects.find(p => p.id === projectWeight.projectId);
                  return (
                    <Box key={projectWeight.projectId} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5 
                    }}>
                      <Chip
                        icon={<LinkIcon fontSize="small" />}
                        label={project ? project.name : projectWeight.projectId}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                        {projectWeight.weight}%
                      </Typography>
                    </Box>
                  );
                })}
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">{t('navigation.goals')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('goals.add')}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="goal types">
          <Tab label={t('goals.strategic')} {...a11yProps(0)} />
          <Tab label={t('goals.annual')} {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderGoalCards(strategicGoals)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderGoalCards(annualGoals)}
      </TabPanel>

      {/* Goal Edit/Create Dialog */}
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
            
            <GridItem xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="linked-projects-label">{t('goals.linkedProjects')}</InputLabel>
                <Select
                  labelId="linked-projects-label"
                  multiple
                  value={currentGoal?.linkedProjects.map(p => p.projectId) || []}
                  onChange={handleLinkedProjectsChange}
                  input={<OutlinedInput label={t('goals.linkedProjects')} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const project = projects.find(p => p.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={project ? project.name : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      <Checkbox checked={currentGoal?.linkedProjects.some(p => p.projectId === project.id) || false} />
                      <ListItemText primary={project.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
            
            <GridItem xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentGoal?.isProgressAutoCalculated || false}
                    onChange={handleAutoCalculateChange}
                    name="isProgressAutoCalculated"
                  />
                }
                label={t('goals.autoCalculateProgress')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('goals.autoCalculateDescription')}
              </Typography>
            </GridItem>
            
            {!currentGoal?.isProgressAutoCalculated && (
              <GridItem xs={12}>
                <Typography id="progress-slider" gutterBottom>
                  {t('project.progress')}: {currentGoal?.progress || 0}%
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
            {currentGoal?.linkedProjects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('Project Weights')}
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                  {t('Adjust the weight of each project\'s contribution to this goal. Weights will automatically balance to 100%.')}
                </Typography>
                
                {currentGoal.linkedProjects.map((projectLink) => {
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
    </Box>
  );
};

export default GoalsPage; 