import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Box,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ProjectForm from '../components/project/ProjectForm';
import BilingualContentDisplay from '../components/BilingualContentDisplay';

// Mock data and API calls for demonstration
const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'ERP Implementation',
    description: 'Implementation of enterprise resource planning system',
    client: 'ABC Corporation',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    departmentId: 1,
    managerId: 1,
    budget: 500000,
    progress: 35
  },
  {
    id: 2,
    name: 'Website Redesign',
    description: 'Redesign of corporate website with new branding',
    client: 'XYZ Inc',
    status: 'PLANNING',
    priority: 'MEDIUM',
    startDate: '2023-03-15',
    endDate: '2023-08-30',
    departmentId: 2,
    managerId: 2,
    budget: 120000,
    progress: 10
  }
];

const getStatusColor = (status) => {
  switch(status) {
    case 'PLANNING': return { color: '#3f51b5', bgColor: '#e8eaf6' };
    case 'IN_PROGRESS': return { color: '#2196f3', bgColor: '#e3f2fd' };
    case 'ON_HOLD': return { color: '#ff9800', bgColor: '#fff3e0' };
    case 'COMPLETED': return { color: '#4caf50', bgColor: '#e8f5e9' };
    case 'CANCELLED': return { color: '#f44336', bgColor: '#ffebee' };
    default: return { color: '#757575', bgColor: '#f5f5f5' };
  }
};

const getPriorityColor = (priority) => {
  switch(priority) {
    case 'HIGH': return '#f44336';
    case 'MEDIUM': return '#ff9800';
    case 'LOW': return '#4caf50';
    default: return '#757575';
  }
};

const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch projects
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setLoading(false);
    }, 1000);
  }, []);

  // Fetch departments and users for form dropdowns
  useEffect(() => {
    // Mock data
    setDepartments([
      { id: 1, name: 'IT' },
      { id: 2, name: 'Marketing' }
    ]);
    
    setUsers([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]);
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleViewProject = (project) => {
    // Navigate to project details page using React Router
    navigate(`/projects/${project.id}`);
    console.log('Navigating to project details page for project ID:', project.id);
  };

  const handleDeleteProject = (projectId) => {
    // Delete project API call
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleSubmitProject = (projectData) => {
    // Create or update project
    if (projectData.id) {
      // Update existing project
      setProjects(projects.map(p => 
        p.id === projectData.id ? { ...p, ...projectData } : p
      ));
    } else {
      // Create new project
      const newProject = {
        ...projectData,
        id: Math.max(...projects.map(p => p.id), 0) + 1
      };
      setProjects([...projects, newProject]);
    }
    setIsFormOpen(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2, 
          backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('project.title', 'Projects')}
            </Typography>
            <Typography variant="subtitle1">
              {t('project.subtitle', 'Manage and track all your organization projects')}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddProject}
            sx={{ 
              px: 3, 
              py: 1.2,
              fontWeight: 'bold',
              borderRadius: 8,
              boxShadow: 4,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6
              },
              transition: 'all 0.2s'
            }}
          >
            {t('project.add', 'Add Project')}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder={t('common.search', 'Search projects...')}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <Tooltip title={t('common.filter', 'Filter')}>
            <IconButton size="small" sx={{ mr: 1 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.sort', 'Sort')}>
            <IconButton size="small">
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : isFormOpen ? (
        <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
            {selectedProject ? t('project.edit', 'Edit Project') : t('project.add', 'Add Project')}
          </Typography>
          <ProjectForm 
            project={selectedProject} 
            onSubmit={handleSubmitProject} 
            departments={departments}
            users={users}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => setIsFormOpen(false)}
              sx={{ mr: 2 }}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              form="project-form"
            >
              {t('common.save', 'Save')}
            </Button>
          </Box>
        </Paper>
      ) : filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map(project => {
            const statusStyles = getStatusColor(project.status);
            return (
              <Grid item xs={12} md={6} key={project.id}>
                <Card 
                  elevation={1} 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16, 
                      zIndex: 1,
                    }}
                  >
                    <Chip 
                      label={t(`projectStatus.${project.status}`, project.status)}
                      size="small"
                      sx={{ 
                        bgcolor: statusStyles.bgColor,
                        color: statusStyles.color,
                        fontWeight: 'medium',
                        px: 1
                      }}
                    />
                  </Box>
                  <CardContent sx={{ pt: 4, pb: 2 }}>
                    <BilingualContentDisplay
                      contentKey={`project_name_${project.id}`}
                      content={project.name}
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        {t('project.client', 'Client')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {project.department?.name || t('common.noDepartment', 'No Department')}
                      </Typography>
                    </Box>
                    <BilingualContentDisplay
                      contentKey={`project_desc_${project.id}`}
                      content={project.description}
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        mb: 2, 
                        height: 40, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {users.find(u => u.id === project.managerId)?.name || t('project.unassigned', 'Unassigned')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {t('project.priority', 'Priority')}:
                          </Typography>
                          <Chip 
                            label={t(`projectPriority.${project.priority}`, project.priority)}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(getPriorityColor(project.priority), 0.1),
                              color: getPriorityColor(project.priority),
                              fontWeight: 'medium',
                              height: 20,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1, minWidth: 65 }}>
                            {t('project.progress', 'Progress')}:
                          </Typography>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <Box
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  borderRadius: 3,
                                  width: `${project.progress}%`,
                                  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {project.progress}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ px: 2, py: 1, justifyContent: 'space-between' }}>
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditProject(project)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Button 
                      variant="outlined"
                      color="primary"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleViewProject(project)}
                      sx={{ borderRadius: 4 }}
                    >
                      {t('common.view', 'View')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ textAlign: 'center', p: 8, borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm ? t('common.noResults', 'No projects match your search') : t('project.createNewToStart', 'No projects yet. Create your first project to get started.')}
          </Typography>
          {!searchTerm && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddProject}
              sx={{ mt: 2 }}
            >
              {t('project.add', 'Add Project')}
            </Button>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default Projects; 