import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  AccountTree as MindMapIcon,
  Timeline as HierarchyIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Project, Goal, UserRole } from '../types';
import ProjectGoalMindMap from '../components/MindMap/ProjectGoalMindMap';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../hooks/useAuth';

// Interface for visualization type
type VisualizationType = 'mind-map' | 'hierarchy';

const ProjectRelationshipMapPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const { projects, loading: projectsLoading } = useProjects();
  const { user } = useAuth();
  
  const [visType, setVisType] = useState<VisualizationType>('mind-map');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId || null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [rootType, setRootType] = useState<'project' | 'goal'>('project');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Filter projects based on user role
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    let filtered: Project[] = [];

    if (user) {
      switch (user.role) {
        case UserRole.PROJECT_MANAGER:
          // Project Managers see only what's related to their projects
          filtered = projects.filter(p => p.projectManager?.id === user.id);
          break;
          
        case UserRole.SUB_PMO:
        case UserRole.DEPARTMENT_DIRECTOR:
          // Sub-PMO and Department Directors see their department scope
          const userDepartmentId = user.department?.id;
          filtered = projects.filter(p => p.department?.id === userDepartmentId);
          break;
          
        case UserRole.MAIN_PMO:
        case UserRole.EXECUTIVE:
        case UserRole.ADMIN:
          // Main PMO, Executives, and Admins see everything
          filtered = [...projects];
          break;
          
        default:
          // Default - see your own projects
          filtered = projects.filter(p => 
            p.projectManager?.id === user.id || 
            p.teamMembers?.some(m => m.id === user.id)
          );
      }
    }
    
    setFilteredProjects(filtered);
    
    // If selected project is not in filtered list, reset selection
    if (selectedProjectId && !filtered.some(p => p.id === selectedProjectId)) {
      setSelectedProjectId(null);
    }
  }, [projects, user, selectedProjectId]);

  // Fetch goals data
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        // Use API service to fetch goals
        const response = await api.goals.getAllGoals('');
        if (response.success) {
          setGoals(response.data);
        } else {
          setError('Failed to load goals data');
        }
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError('Error fetching goals data');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Handle visualization type change
  const handleVisTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newVisType: VisualizationType | null
  ) => {
    if (newVisType !== null) {
      setVisType(newVisType);
    }
  };

  // Handle project selection
  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedProjectId(value === 'all' ? null : value);
    if (value !== 'all') {
      setRootType('project');
      setSelectedGoalId(null); // Clear goal selection when selecting a project
    }
  };

  // Handle goal selection
  const handleGoalChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedGoalId(value === 'all' ? null : value);
    if (value !== 'all') {
      setRootType('goal');
      setSelectedProjectId(null); // Clear project selection when selecting a goal
    }
  };

  // Find the selected project or goal
  const selectedProject = selectedProjectId 
    ? filteredProjects.find(p => p.id === selectedProjectId) 
    : null;
    
  const selectedGoal = selectedGoalId 
    ? goals.find(g => g.id === selectedGoalId) 
    : null;

  // Title for the page based on selection
  const pageTitle = selectedProject 
    ? `${t('project.relationships')}: ${selectedProject.name}` 
    : selectedGoal 
      ? `${t('goal.relationships')}: ${selectedGoal.title || 'Unnamed Goal'}` 
      : t('project.allRelationships');

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          {t('navigation.home')}
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/projects');
          }}
        >
          {t('navigation.projects')}
        </Link>
        <Typography color="text.primary">{t('project.relationshipMap')}</Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
      >
        {t('common.back')}
      </Button>

      {/* Page title */}
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {pageTitle}
      </Typography>

      {/* Filters and options */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="project-select-label">{t('project.select')}</InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProjectId || 'all'}
              label={t('project.select')}
              onChange={handleProjectChange as any}
              disabled={loading || projectsLoading}
            >
              <MenuItem value="all">{t('project.all')}</MenuItem>
              {filteredProjects.map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body1" sx={{ display: { xs: 'none', md: 'block' } }}>
            {t('common.or')}
          </Typography>

          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="goal-select-label">{t('goal.select')}</InputLabel>
            <Select
              labelId="goal-select-label"
              value={selectedGoalId || 'all'}
              label={t('goal.select')}
              onChange={handleGoalChange as any}
              disabled={loading}
            >
              <MenuItem value="all">{t('goal.all')}</MenuItem>
              {goals.map(goal => (
                <MenuItem key={goal.id} value={goal.id}>
                  {goal.title || 'Unnamed Goal'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <ToggleButtonGroup
            value={visType}
            exclusive
            onChange={handleVisTypeChange}
            aria-label="visualization type"
            size="small"
          >
            <ToggleButton value="mind-map" aria-label="mind map">
              <MindMapIcon sx={{ mr: 1 }} /> {t('visualization.mindMap')}
            </ToggleButton>
            <ToggleButton value="hierarchy" aria-label="hierarchy">
              <HierarchyIcon sx={{ mr: 1 }} /> {t('visualization.hierarchy')}
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? t('common.collapse') : t('common.expandAll')}
          </Button>
        </Stack>
      </Paper>

      {/* Description */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('project.relationshipDescription')}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {visType === 'mind-map' 
            ? t('visualization.mindMapDescription') 
            : t('visualization.hierarchyDescription')}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={t('project.legend.project')} 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={t('project.legend.strategicGoal')} 
            color="success" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={t('project.legend.annualGoal')} 
            color="secondary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={t('project.legend.dependsOn')} 
            color="warning" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={t('project.legend.dependedBy')} 
            color="info" 
            variant="outlined" 
            size="small" 
          />
        </Box>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Visualization */}
      <Paper sx={{ height: '700px', mb: 3 }}>
        {loading || projectsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          visType === 'mind-map' ? (
            <ProjectGoalMindMap
              projects={filteredProjects}
              goals={goals}
              rootId={selectedProjectId || selectedGoalId || undefined}
              rootType={rootType}
              expandAll={expandAll}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
              <HierarchyIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">
                {t('visualization.hierarchyComingSoon')}
              </Typography>
            </Box>
          )
        )}
      </Paper>
    </Box>
  );
};

export default ProjectRelationshipMapPage; 