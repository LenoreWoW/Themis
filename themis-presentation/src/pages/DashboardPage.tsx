import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ExecutiveDashboardPage from './ExecutiveDashboardPage';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ProjectStatus, Project } from '../types/index';
import { subDays } from 'date-fns';

// Define custom project status types that might be used in the UI
type CustomProjectStatus = ProjectStatus | 'DRAFT' | 'SubPMOReview' | 'MainPMOApproval';

// Mock data
const mockProjects = [
  { 
    id: '1', 
    name: 'Digital Transformation', 
    status: 'InProgress', 
    completion: 65, 
    department: 'IT', 
    manager: 'John Doe',
    riskCount: 3,
    issueCount: 1
  },
  { 
    id: '2', 
    name: 'Infrastructure Upgrade', 
    status: 'InProgress', 
    completion: 30, 
    department: 'Operations', 
    manager: 'Jane Smith',
    riskCount: 2,
    issueCount: 0
  },
  { 
    id: '3', 
    name: 'Mobile App Development', 
    status: 'MainPMOApproval', 
    completion: 0, 
    department: 'Product', 
    manager: 'Mike Johnson',
    riskCount: 1,
    issueCount: 0
  },
  { 
    id: '4', 
    name: 'Security Enhancement', 
    status: 'Completed', 
    completion: 100, 
    department: 'IT', 
    manager: 'Sarah Williams',
    riskCount: 0,
    issueCount: 0
  },
];

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch(status) {
    case 'InProgress': return 'primary';
    case 'Completed': return 'success';
    case 'OnHold': return 'warning';
    case 'Cancelled': return 'error';
    case 'Draft': return 'default';
    case 'SubPMOReview': return 'info';
    case 'MainPMOApproval': return 'secondary';
    default: return 'default';
  }
};

// Helper function to get status label
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'InProgress': return 'In Progress';
    case 'Completed': return 'Completed';
    case 'OnHold': return 'On Hold';
    case 'Cancelled': return 'Cancelled';
    case 'Draft': return 'Draft';
    case 'SubPMOReview': return 'Sub PMO Review';
    case 'MainPMOApproval': return 'Main PMO Approval';
    default: return status;
  }
};

// Define extended dashboard KPI interface to include all needed fields
interface DashboardKpiData {
  totalProjects: number;
  inProgress: number;
  onHold: number;
  completed: number;
  overdueProjects: number;
  totalBudget: number;
  totalActualCost: number;
  budgetVariance: number;
  draft: number;
  averageCompletion: number;
  risksOpen: number;
  issuesOpen: number;
  approvalsPending: number;
  legacyProjects: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<DashboardKpiData>({
    totalProjects: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    overdueProjects: 0,
    totalBudget: 0,
    totalActualCost: 0,
    budgetVariance: 0,
    draft: 0,
    averageCompletion: 0,
    risksOpen: 0,
    issuesOpen: 0,
    approvalsPending: 0,
    legacyProjects: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isDirector = user?.role === 'DEPARTMENT_DIRECTOR';
  const isExecutive = user?.role === 'EXECUTIVE' || user?.role === 'ADMIN';
  const isMainPMO = user?.role === 'MAIN_PMO';
  const isSubPMO = user?.role === 'SUB_PMO';
  
  // Load dashboard data when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handlePrint = () => {
    console.log('Printing dashboard...');
    handleMenuClose();
  };
  
  const handleExport = () => {
    console.log('Exporting dashboard...');
    handleMenuClose();
  };
  
  const handleRefresh = async () => {
    // Call fetchDashboardData instead of only fetching projects
    fetchDashboardData();
  };
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch projects
      const projectsResponse = await api.projects.getAllProjects('');
      if (projectsResponse.data) {
        const fetchedProjects = projectsResponse.data;
        setProjects(fetchedProjects);
        
        // Calculate KPI data from projects
        const inProgressCount = fetchedProjects.filter((p: Project) => p.status === ProjectStatus.IN_PROGRESS).length;
        const onHoldCount = fetchedProjects.filter((p: Project) => p.status === ProjectStatus.ON_HOLD).length;
        const completedCount = fetchedProjects.filter((p: Project) => p.status === ProjectStatus.COMPLETED).length;
        const legacyCount = fetchedProjects.filter((p: Project) => p.legacyImport === true).length;
        
        // Check for string status values (these might be custom statuses not in the enum)
        const draftCount = fetchedProjects.filter((p: Project) => {
          const status = String(p.status);
          return status === ProjectStatus.PLANNING || status === 'DRAFT';
        }).length;
        
        // Calculate average completion
        const avgCompletion = fetchedProjects.length > 0 
          ? fetchedProjects.reduce((acc: number, p: Project) => acc + (p.progress || 0), 0) / fetchedProjects.length 
          : 0;
        
        // Fetch risks and issues
        let risksCount = 0;
        let issuesCount = 0;
        let pendingApprovalsCount = 0;
        
        // Get counts for each project
        await Promise.all(fetchedProjects.map(async (project: Project) => {
          // Fetch risks
          const risksResponse = await api.risks.getAllRisks(project.id, '');
          if (risksResponse.success && risksResponse.data) {
            risksCount += risksResponse.data.filter((r: any) => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length;
          }
          
          // Fetch issues
          const issuesResponse = await api.issues.getAllIssues(project.id, '');
          if (issuesResponse.success && issuesResponse.data) {
            issuesCount += issuesResponse.data.filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
          }
        }));
        
        // Count pending approvals - using string comparison for custom statuses
        pendingApprovalsCount = fetchedProjects.filter((p: Project) => {
          const status = String(p.status);
          return status === 'SubPMOReview' || status === 'MainPMOApproval';
        }).length;
        
        // Update KPI data
        setKpiData({
          totalProjects: fetchedProjects.length,
          inProgress: inProgressCount,
          onHold: onHoldCount,
          completed: completedCount,
          overdueProjects: 0,
          totalBudget: 0,
          totalActualCost: 0,
          budgetVariance: 0,
          draft: draftCount,
          averageCompletion: Math.round(avgCompletion),
          risksOpen: risksCount,
          issuesOpen: issuesCount,
          approvalsPending: pendingApprovalsCount,
          legacyProjects: legacyCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If the user is an EXECUTIVE or ADMIN, show the ExecutiveDashboardPage
  if (isExecutive) {
    return <ExecutiveDashboardPage />;
  }
  
  // Render only first 4 projects for Recent Projects section or all if less than 4
  const recentProjects = projects.slice(0, 4);

  // Navigation functions for each card
  const navigateToProjects = () => navigate('/projects');
  const navigateToInProgressProjects = () => navigate('/projects', { state: { filterStatus: 'IN_PROGRESS' } });
  const navigateToCompletedProjects = () => navigate('/projects', { state: { filterStatus: 'COMPLETED' } });
  const navigateToOnHoldProjects = () => navigate('/projects', { state: { filterStatus: 'ON_HOLD' } });
  const navigateToLegacyProjects = () => navigate('/projects', { state: { filterStatus: 'LEGACY' } });
  const navigateToDraftProjects = () => navigate('/projects', { state: { filterStatus: 'PLANNING' } });
  const navigateToRisks = () => navigate('/risks-issues', { state: { tab: 'risks' } });
  const navigateToIssues = () => navigate('/risks-issues', { state: { tab: 'issues' } });
  const navigateToApprovals = () => navigate('/project-approvals');
  const navigateToProjectDetail = (projectId: string) => navigate(`/projects/${projectId}`);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('dashboard.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('dashboard.refresh')}>
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.actions')}>
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handlePrint}>
              <PrintIcon fontSize="small" sx={{ mr: 1 }} />
              {t('common.print', 'Print Dashboard')}
            </MenuItem>
            <MenuItem onClick={handleExport}>
              <ExportIcon fontSize="small" sx={{ mr: 1 }} />
              {t('dashboard.export')}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Stack spacing={3}>
        {/* Welcome Card */}
        <Paper sx={{ p: 3, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t('common.welcome', 'Welcome')}, {user?.username || t('common.user', 'User')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {isDirector && t('dashboard.departmentDirectorDashboard', 'Department Director Dashboard')}
            {isExecutive && t('dashboard.title')}
            {isMainPMO && t('dashboard.pmoDashboard', 'PMO Dashboard')}
            {isSubPMO && t('dashboard.pmoDashboard', 'PMO Dashboard')}
            {!isDirector && !isExecutive && !isMainPMO && !isSubPMO && t('dashboard.pmDashboard', 'Project Manager Dashboard')}
          </Typography>
        </Paper>
        
        {/* KPI Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {t('dashboard.kpi')}
            {kpiData.averageCompletion > 70 ? (
              <TrendingUpIcon color="success" />
            ) : (
              <TrendingDownIcon color="error" />
            )}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }}
              onClick={navigateToProjects}
            >
              <Typography variant="h3" color="primary" sx={{ mb: 1 }}>{kpiData.totalProjects}</Typography>
              <Typography variant="body1" color="text.secondary">{t('dashboard.totalProjects')}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ mt: 2, height: 4, borderRadius: 2 }} 
              />
            </Paper>
            
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }}
              onClick={navigateToInProgressProjects}
            >
              <Typography variant="h3" color="info.main" sx={{ mb: 1 }}>{kpiData.inProgress}</Typography>
              <Typography variant="body1" color="text.secondary">{t('dashboard.inProgress')}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(kpiData.inProgress / kpiData.totalProjects) * 100} 
                color="info"
                sx={{ mt: 2, height: 4, borderRadius: 2 }} 
              />
            </Paper>
            
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }}
              onClick={navigateToCompletedProjects}
            >
              <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>{kpiData.completed}</Typography>
              <Typography variant="body1" color="text.secondary">{t('dashboard.completed')}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(kpiData.completed / kpiData.totalProjects) * 100} 
                color="success"
                sx={{ mt: 2, height: 4, borderRadius: 2 }} 
              />
            </Paper>
            
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }}
              onClick={navigateToOnHoldProjects}
            >
              <Typography variant="h3" color="warning.main" sx={{ mb: 1 }}>{kpiData.onHold}</Typography>
              <Typography variant="body1" color="text.secondary">{t('dashboard.onHold')}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(kpiData.onHold / kpiData.totalProjects) * 100} 
                color="warning"
                sx={{ mt: 2, height: 4, borderRadius: 2 }} 
              />
            </Paper>

            {/* Add a new row for additional metrics */}
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }}
              onClick={navigateToLegacyProjects}
            >
              <Typography variant="h3" color="secondary.main" sx={{ mb: 1 }}>{kpiData.legacyProjects}</Typography>
              <Typography variant="body1" color="text.secondary">{t('dashboard.legacyProjects', 'Legacy Imports')}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(kpiData.legacyProjects / kpiData.totalProjects) * 100} 
                color="secondary"
                sx={{ mt: 2, height: 4, borderRadius: 2 }} 
              />
            </Paper>
            
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }}
              onClick={navigateToDraftProjects}
            >
              <Typography variant="h3" color="info.main" sx={{ mb: 1 }}>{kpiData.draft}</Typography>
              <Typography variant="body1" color="text.secondary">{t('dashboard.draft', 'Draft')}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(kpiData.draft / kpiData.totalProjects) * 100} 
                color="info"
                sx={{ mt: 2, height: 4, borderRadius: 2 }} 
              />
            </Paper>
          </Box>
          
          <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2, 
                bgcolor: 'error.light',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9, boxShadow: 6 }
              }}
              onClick={navigateToRisks}
            >
              <Typography variant="h3" color="white" sx={{ mb: 1 }}>{kpiData.risksOpen}</Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>{t('dashboard.openRisks')}</Typography>
            </Paper>
            
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2, 
                bgcolor: 'warning.light',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9, boxShadow: 6 }
              }}
              onClick={navigateToIssues}
            >
              <Typography variant="h3" color="white" sx={{ mb: 1 }}>{kpiData.issuesOpen}</Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>{t('dashboard.openIssues')}</Typography>
            </Paper>
            
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                borderRadius: 2, 
                boxShadow: 2, 
                bgcolor: 'secondary.light',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9, boxShadow: 6 }
              }}
              onClick={navigateToApprovals}
            >
              <Typography variant="h3" color="white" sx={{ mb: 1 }}>{kpiData.approvalsPending}</Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>{t('common.pendingApprovals', 'Pending Approvals')}</Typography>
            </Paper>
          </Box>
        </Box>
        
        {/* Projects Section */}
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.recentProjects', 'Recent Projects')}</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {projects.length === 0 ? (
              <Typography>{t('dashboard.noProjects', 'No projects found.')}</Typography>
            ) : (
              recentProjects.map((project) => (
                <Card 
                  key={project.id} 
                  sx={{ 
                    borderRadius: 2, 
                    boxShadow: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6, bgcolor: 'rgba(0, 0, 0, 0.02)' }
                  }}
                  onClick={() => navigateToProjectDetail(project.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">{project.name}</Typography>
                      <Chip 
                        label={t(`status.${String(project.status).toLowerCase()}`, String(project.status))} 
                        color={getStatusColor(String(project.status)) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('project.department')}: {project.department?.name || ''} | {t('project.projectManager')}: {project.projectManager?.firstName} {project.projectManager?.lastName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1, minWidth: '100px' }}>
                        {t('project.progress')}: {project.progress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress ?? 0} 
                        sx={{ 
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 1,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: (project.progress ?? 0) < 30 
                              ? 'error.main' 
                              : (project.progress ?? 0) < 70 
                              ? 'warning.main' 
                              : 'success.main'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      {t('common.view', 'View Details')}
                    </Button>
                    {(String(project.status) === 'SubPMOReview' && isSubPMO) && (
                      <Button size="small" color="secondary">{t('common.review', 'Review')}</Button>
                    )}
                    {(String(project.status) === 'MainPMOApproval' && isMainPMO) && (
                      <Button size="small" color="secondary">{t('common.approve', 'Approve')}</Button>
                    )}
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
          {projects.length > 4 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={navigateToProjects}
              >
                {t('dashboard.viewAllProjects', 'View All Projects')} ({projects.length})
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

// Re-export the ExecutiveDashboardPage as DashboardPage
// This allows routes to use '/dashboard' as a more generic URL
// while maintaining the same component implementation with both
// the dashboard overview and assignments tab
export default DashboardPage; 