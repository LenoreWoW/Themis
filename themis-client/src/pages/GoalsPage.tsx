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
  linkedProjects: string[];
  isProgressAutoCalculated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
}

// Initial strategy goals with linked projects
const initialStrategicGoals = [
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
    linkedProjects: ['p1', 'p4'],
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

// Initial annual goals with linked projects
const initialAnnualGoals = [
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
    linkedProjects: ['p2', 'p3'],
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
  const calculateGoalProgressFromProjects = (linkedProjectIds: string[]): number => {
    if (!linkedProjectIds.length) return 0;
    
    const linkedProjects = projects.filter(p => linkedProjectIds.includes(p.id));
    if (!linkedProjects.length) return 0;
    
    // Calculate the average progress of all linked projects
    const totalProgress = linkedProjects.reduce((sum, project) => sum + project.progress, 0);
    return Math.round(totalProgress / linkedProjects.length);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (goal: GoalInterface | null = null, editing = false) => {
    setCurrentGoal(goal ? { ...goal } : {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      type: tabValue === 0 ? GoalType.STRATEGIC : GoalType.ANNUAL,
      category: GoalCategory.PERFORMANCE,
      status: GoalStatus.NOT_STARTED,
      progress: 0,
      startDate: '',
      endDate: '',
      assignedTo: '',
      linkedProjects: [],
      isProgressAutoCalculated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as GoalInterface);
    setIsEditing(editing);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGoal(null);
    setIsEditing(false);
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
    const selectedProjects = event.target.value as string[];
    
    setCurrentGoal(prevGoal => {
      if (!prevGoal) return null;
      
      const updatedGoal = { ...prevGoal, linkedProjects: selectedProjects };
      
      // If auto-calculation is enabled, update the progress based on linked projects
      if (updatedGoal.isProgressAutoCalculated) {
        updatedGoal.progress = calculateGoalProgressFromProjects(selectedProjects);
      }
      
      return updatedGoal;
    });
  };

  const handleAutoCalculateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAutoCalculated = event.target.checked;
    
    setCurrentGoal(prevGoal => {
      if (!prevGoal) return null;
      
      const updatedGoal = { ...prevGoal, isProgressAutoCalculated: isAutoCalculated };
      
      // If enabling auto-calculation, update the progress based on linked projects
      if (isAutoCalculated) {
        updatedGoal.progress = calculateGoalProgressFromProjects(prevGoal.linkedProjects);
      }
      
      return updatedGoal;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentGoal) return;
    
    // Before saving, update the progress if auto-calculation is enabled
    if (currentGoal.isProgressAutoCalculated) {
      currentGoal.progress = calculateGoalProgressFromProjects(currentGoal.linkedProjects);
    }
    
    // Update updatedAt timestamp
    currentGoal.updatedAt = new Date().toISOString();
    
    if (isEditing) {
      if (tabValue === 0) {
        setStrategicGoals(prevGoals => 
          prevGoals.map(goal => goal.id === currentGoal.id ? currentGoal : goal)
        );
      } else {
        setAnnualGoals(prevGoals => 
          prevGoals.map(goal => goal.id === currentGoal.id ? currentGoal : goal)
        );
      }
    } else {
      if (tabValue === 0) {
        setStrategicGoals(prevGoals => [...prevGoals, currentGoal]);
      } else {
        setAnnualGoals(prevGoals => [...prevGoals, currentGoal]);
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
        <GridItem xs={12} md={6} key={goal.id}>
          <Paper sx={{ p: 3, position: 'relative', height: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6">{goal.title}</Typography>
              <Box>
                <IconButton size="small" onClick={() => handleOpenDialog(goal, true)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteGoal(goal.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {goal.description}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                label={getTranslatedCategory(goal.category)}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={getTranslatedStatus(goal.status)}
                size="small"
                color={getStatusColor(goal.status) as any}
              />
              {goal.isProgressAutoCalculated && (
                <Chip
                  label={t('goals.autoCalculated')}
                  size="small"
                  color="secondary"
                  icon={<LinkIcon />}
                />
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('project.progress')}: {goal.progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={goal.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t('goals.assignedTo')}: {goal.assignedTo}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t('common.timeline')}: {goal.startDate} {t('common.to')} {goal.endDate}
            </Typography>
            
            {goal.linkedProjects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {t('goals.linkedProjects')}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {goal.linkedProjects.map(projectId => {
                    const project = projects.find(p => p.id === projectId);
                    return (
                      <Chip
                        key={projectId}
                        label={project ? project.name : projectId}
                        size="small"
                        color="info"
                        variant="outlined"
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
              <FormControl fullWidth>
                <InputLabel id="linked-projects-label">{t('goals.linkedProjects')}</InputLabel>
                <Select
                  labelId="linked-projects-label"
                  id="linked-projects"
                  multiple
                  value={currentGoal?.linkedProjects || []}
                  onChange={handleLinkedProjectsChange}
                  input={<OutlinedInput label={t('goals.linkedProjects')} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((projectId) => {
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
                      <Checkbox checked={(currentGoal?.linkedProjects || []).indexOf(project.id) > -1} />
                      <ListItemText 
                        primary={project.name}
                        secondary={`${project.status} - ${project.progress}% complete`}
                      />
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