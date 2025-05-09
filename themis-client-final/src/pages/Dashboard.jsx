import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTestAuth } from '../context/TestAuthContext';
import UserRoleBadge from '../components/UserRoleBadge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BilingualContentDisplay from '../components/BilingualContentDisplay';

// Initialize empty arrays for data that will be fetched from backend
const tasks = [];
const projects = [];
const teamMembers = [];
const timelineEvents = [];

function Dashboard() {
  const { t } = useTranslation();
  const { 
    testUser, 
    canCreateProjects, 
    canEditProjects, 
    canApproveProjects, 
    canViewAllProjects,
    canCreateTasks,
    canAssignTasks,
    canReviewTasks,
    canManageUsers,
    canViewReports,
    canManageSettings,
    canAccessAdminPanel
  } = useTestAuth();

  const [selectedView, setSelectedView] = useState('overview');
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const reviewTasks = tasks.filter(task => task.status === 'review').length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  
  // Priority breakdown
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'in-progress': return 'status-progress';
      case 'review': return 'status-review';
      case 'done': return 'status-done';
      default: return '';
    }
  };
  
  // Example metric data
  const metrics = {
    totalProjects: 12,
    inProgress: 5,
    completed: 4,
    overdue: 3,
    openTasks: 28,
    upcomingDeadlines: 7
  };

  // Check if user is authenticated
  if (!testUser) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('Please log in to access the dashboard')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              mb: 3
            }}
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {t('common.welcome')}, {testUser.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  {t('Your role')}:
                </Typography>
                <UserRoleBadge showTooltip />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {t('dashboard.title')} - {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Your Role and Permissions */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title={t('Role Permissions')}
              subheader={t('These are the actions you can perform')}
            />
            <Divider />
            <CardContent>
              <List dense>
                <PermissionListItem 
                  has={canCreateProjects()}
                  label={t('Create Projects')}
                  icon={<FolderSpecialIcon />}
                />
                <PermissionListItem 
                  has={canEditProjects()}
                  label={t('Edit Projects')}
                  icon={<FolderSpecialIcon />}
                />
                <PermissionListItem 
                  has={canApproveProjects()}
                  label={t('Approve Projects')}
                  icon={<FolderSpecialIcon />}
                />
                <PermissionListItem 
                  has={canViewAllProjects()}
                  label={t('View All Projects')}
                  icon={<FolderSpecialIcon />}
                />
                <PermissionListItem 
                  has={canCreateTasks()}
                  label={t('Create Tasks')}
                  icon={<AssignmentIcon />}
                />
                <PermissionListItem 
                  has={canAssignTasks()}
                  label={t('Assign Tasks')}
                  icon={<AssignmentIcon />}
                />
                <PermissionListItem 
                  has={canReviewTasks()}
                  label={t('Review Tasks')}
                  icon={<AssignmentIcon />}
                />
                <PermissionListItem 
                  has={canManageUsers()}
                  label={t('Manage Users')}
                  icon={<PeopleIcon />}
                />
                <PermissionListItem 
                  has={canViewReports()}
                  label={t('View Reports')}
                  icon={<AssessmentIcon />}
                />
                <PermissionListItem 
                  has={canManageSettings()}
                  label={t('Manage Settings')}
                  icon={<SettingsIcon />}
                />
                <PermissionListItem 
                  has={canAccessAdminPanel()}
                  label={t('Access Admin Panel')}
                  icon={<AdminPanelSettingsIcon />}
                />
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* KPIs / Metrics */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title={<BilingualContentDisplay content={t('dashboard.kpi')} />}
              subheader={<BilingualContentDisplay content={t('dashboard.metrics')} />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <KpiItem 
                  title={t('dashboard.totalProjects')}
                  value={metrics.totalProjects}
                  color="primary"
                />
                <KpiItem 
                  title={t('dashboard.inProgress')}
                  value={metrics.inProgress}
                  color="info"
                />
                <KpiItem 
                  title={t('dashboard.completed')}
                  value={metrics.completed}
                  color="success"
                />
                <KpiItem 
                  title={t('dashboard.overdue')}
                  value={metrics.overdue}
                  color="error"
                />
                <KpiItem 
                  title={t('dashboard.tasks')}
                  value={metrics.openTasks}
                  color="secondary"
                />
                <KpiItem 
                  title={t('dashboard.approachingDeadline')}
                  value={metrics.upcomingDeadlines}
                  color="warning"
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Workflow Explanation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('Project Workflow')}
            </Typography>
            <Typography variant="body1" paragraph>
              This is a test environment where you can explore different user roles and permissions. 
              Based on your current role as <strong>{testUser.permissions.name}</strong>, you have 
              specific permissions that determine what actions you can perform in the system.
            </Typography>
            <Typography variant="body1" paragraph>
              Try changing roles on the login page to see how the user experience differs based on permissions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// Helper component for permission list items
const PermissionListItem = ({ has, label, icon }) => (
  <ListItem>
    <ListItemIcon>
      {has ? (
        <CheckCircleIcon color="success" />
      ) : (
        <CancelIcon color="disabled" />
      )}
    </ListItemIcon>
    <ListItemIcon>
      {icon}
    </ListItemIcon>
    <ListItemText 
      primary={label}
      sx={{ color: has ? 'text.primary' : 'text.disabled' }}
    />
  </ListItem>
);

// Helper component for KPI items
const KpiItem = ({ title, value, color }) => (
  <Grid item xs={6}>
    <Box sx={{ 
      p: 2, 
      bgcolor: `${color}.lighter`, 
      color: `${color}.darker`,
      borderRadius: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Typography variant="body2" component="div" sx={{ textAlign: 'center' }}>
        {title}
      </Typography>
    </Box>
  </Grid>
);

export default Dashboard; 