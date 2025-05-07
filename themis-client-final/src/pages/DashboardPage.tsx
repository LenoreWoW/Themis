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
import AssignedByMeTasks from '../components/Dashboard/AssignedByMeTasks';

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
        let fetchedProjects = projectsResponse.data;
        
        // Filter projects by department for Department Directors
        if (isDirector && user?.department) {
          fetchedProjects = fetchedProjects.filter((p: Project) => 
            p.department?.id === user.department?.id
          );
        }
        
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
  const navigateToApprovals = () => navigate('/approvals');
  const navigateToProjectDetail = (projectId: string) => navigate(`/projects/${projectId}`);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isDirector && user?.department 
            ? `${user.department.name} ${t('dashboard.title')}`
            : t('dashboard.title')}
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
            {isDirector && user?.department && `${t('dashboard.departmentDirectorDashboard', 'Department Director Dashboard')} - ${user.department.name}`}
            {isExecutive && t('dashboard.title')}
            {isMainPMO && t('dashboard.pmoDashboard', 'PMO Dashboard')}
            {isSubPMO && t('dashboard.pmoDashboard', 'PMO Dashboard')}
            {!isDirector && !isExecutive && !isMainPMO && !isSubPMO && t('dashboard.pmDashboard', 'Project Manager Dashboard')}
          </Typography>
          {isDirector && user?.department && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {t('dashboard.departmentFilteredView', 'Showing projects from your department only')}
            </Typography>
          )}
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
          
          {/* KPI content... */}
        </Box>
        
        {/* What I've Assigned Section - New component */}
        {(user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEAD' || user?.role === 'SUB_PMO' || user?.role === 'ADMIN') && (
          <Box>
            <AssignedByMeTasks maxItems={5} />
          </Box>
        )}
        
        {/* Projects Section */}
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.recentProjects', 'Recent Projects')}</Typography>
          
          {/* Projects content... */}
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