import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Container,
  Stack,
  Divider,
  Tooltip,
  CircularProgress,
  Button,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  CloudDownload as DownloadIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { Project, ProjectStatus, UserRole, Assignment, AssignmentStatus, TaskPriority, RiskStatus, IssueStatus, Risk, Issue, RiskImpact } from '../types';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate, getStatusColor, getDashboardAccess } from '../utils/helpers';
import { ProjectProvider } from '../context/ProjectContext';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MetricCard from '../components/common/MetricCard';

interface DashboardMetrics {
  totalProjects: number;
  inProgress: number;
  completed: number;
  onHold: number;
  overdue: number;
  approachingDeadline: number;
  openRisks: number;
  openIssues: number;
}

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  projects: Project[];
}

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: AssignmentStatus;
  dueDate: string;
  assignedBy: {
    firstName: string;
    lastName: string;
  };
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({ open, onClose, title, projects }) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('project.name')}</TableCell>
                <TableCell>{t('project.status')}</TableCell>
                <TableCell>{t('project.progress')}</TableCell>
                <TableCell>{t('project.dueDate')}</TableCell>
                <TableCell>{t('project.department')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project: Project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`status.${project.status.toLowerCase()}`)}
                      size="small"
                      sx={{ backgroundColor: getStatusColor(project.status, project.endDate), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box width="100%" mr={1}>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: project.progress < 30 ? '#f44336' :
                                project.progress < 70 ? '#fb8c00' : '#4caf50',
                            },
                          }}
                        />
                      </Box>
                      <Box minWidth={35}>
                        <Typography variant="body2" color="textSecondary">
                          {`${Math.round(project.progress)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(project.endDate)}</TableCell>
                  <TableCell>{project.department?.name || t('common.noData')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Set the initial tab value based on URL parameters
  const tabParam = new URLSearchParams(location.search).get('tab');
  const initialTabValue = tabParam === 'analytics' ? 1 : 0;
  const [tabValue, setTabValue] = useState(initialTabValue);
  
  // Get access permissions based on user role
  const accessPermissions = useMemo(() => 
    getDashboardAccess(user?.role as UserRole),
  [user?.role]);

  // Determine if user is an executive for customized UI
  const isExecutive = user?.role === UserRole.EXECUTIVE || user?.role === UserRole.ADMIN;
  const isDepartmentDirector = user?.role === UserRole.DEPARTMENT_DIRECTOR;
  
  // Get dashboard title based on user role
  const getDashboardTitle = () => {
    if (isExecutive) return t('dashboard.title');
    if (isDepartmentDirector) return `${user?.department?.name || t('project.department')} ${t('dashboard.title')}`;
    if (user?.role === UserRole.PROJECT_MANAGER) return t('dashboard.pmDashboard', 'Project Manager Dashboard');
    if (user?.role === UserRole.MAIN_PMO) return t('dashboard.pmoDashboard', 'PMO Dashboard');
    if (user?.role === UserRole.SUB_PMO) return t('dashboard.pmoDashboard', 'PMO Dashboard');
    return t('navigation.dashboard');
  };

  // New states for risks and issues dialogs
  const [risksDialogOpen, setRisksDialogOpen] = useState(false);
  const [issuesDialogOpen, setIssuesDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await api.projects.getAllProjects('');
        if (response.success) {
          let filteredProjects = response.data;
          
          // Only filter projects if the user can't view all projects
          if (!accessPermissions.canViewAllProjects && isDepartmentDirector && user?.department) {
            filteredProjects = filteredProjects.filter((project: Project) => 
              project.department?.id === user.department?.id
            );
          } else if (!accessPermissions.canViewAllProjects && user?.role === UserRole.PROJECT_MANAGER) {
            filteredProjects = filteredProjects.filter((project: Project) => 
              project.projectManager?.id === user.id
            );
          }
          
          setProjects(filteredProjects);
          
          // Fetch risks and issues
          const risksPromises = filteredProjects.map((project: Project) => 
            api.risks.getAllRisks(project.id, '')
          );
          
          const issuesPromises = filteredProjects.map((project: Project) => 
            api.issues.getAllIssues(project.id, '')
          );
          
          const risksResponses = await Promise.all(risksPromises);
          const issuesResponses = await Promise.all(issuesPromises);
          
          const allRisks = risksResponses
            .filter(response => response.success)
            .flatMap(response => response.data || []);
            
          const allIssues = issuesResponses
            .filter(response => response.success)
            .flatMap(response => response.data || []);
          
          setRisks(allRisks);
          setIssues(allIssues);
          
          // Update last refresh time
          setLastRefresh(new Date());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, accessPermissions.canViewAllProjects, isDepartmentDirector]);

  const metrics = useMemo(() => {
    const today = new Date();
    const deadlineWarningDays = 14;

    return {
      totalProjects: projects.length,
      inProgress: projects.filter((p) => p.status === ProjectStatus.IN_PROGRESS).length,
      completed: projects.filter((p) => p.status === ProjectStatus.COMPLETED).length,
      onHold: projects.filter((p) => p.status === ProjectStatus.ON_HOLD).length,
      overdue: projects.filter((p) => {
        const endDate = new Date(p.endDate);
        return endDate < today && p.status !== ProjectStatus.COMPLETED;
      }).length,
      approachingDeadline: projects.filter((p) => {
        const endDate = new Date(p.endDate);
        const daysUntilDue = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= deadlineWarningDays && daysUntilDue > 0 && p.status !== ProjectStatus.COMPLETED;
      }).length,
      openRisks: risks.filter(risk => risk.status === RiskStatus.IDENTIFIED || risk.status === RiskStatus.ANALYZING || risk.status === RiskStatus.MONITORED).length,
      openIssues: issues.filter(issue => issue.status === IssueStatus.OPEN || issue.status === IssueStatus.IN_PROGRESS).length,
    };
  }, [projects, risks, issues]);

  const getFilteredProjects = (metricType: string): Project[] => {
    const today = new Date();
    const deadlineWarningDays = 14;

    switch (metricType) {
      case 'totalProjects':
        return projects;
      case 'inProgress':
        return projects.filter((p) => p.status === ProjectStatus.IN_PROGRESS);
      case 'completed':
        return projects.filter((p) => p.status === ProjectStatus.COMPLETED);
      case 'onHold':
        return projects.filter((p) => p.status === ProjectStatus.ON_HOLD);
      case 'overdue':
        return projects.filter((p) => {
          const endDate = new Date(p.endDate);
          return endDate < today && p.status !== ProjectStatus.COMPLETED;
        });
      case 'approachingDeadline':
        return projects.filter((p) => {
          const endDate = new Date(p.endDate);
          const daysUntilDue = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= deadlineWarningDays && daysUntilDue > 0 && p.status !== ProjectStatus.COMPLETED;
        });
      default:
        return [];
    }
  };

  const handleMetricClick = (metricType: string) => {
    setSelectedMetric(metricType);
    setDialogOpen(true);
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const response = await api.projects.getAllProjects('');
      if (response.success) {
        // Process and update projects
        let filteredProjects = response.data;
        
        // Update with same filtering logic as above
        if (!accessPermissions.canViewAllProjects && isDepartmentDirector && user?.department) {
          filteredProjects = filteredProjects.filter((project: Project) => 
            project.department?.id === user.department?.id
          );
        } else if (!accessPermissions.canViewAllProjects && user?.role === UserRole.PROJECT_MANAGER) {
          filteredProjects = filteredProjects.filter((project: Project) => 
            project.projectManager?.id === user.id
          );
        }
        
        setProjects(filteredProjects);
        
        // Refresh risks and issues
        await Promise.all(filteredProjects.map(async (project: Project) => {
          // Refresh risks
          const risksResponse = await api.risks.getAllRisks(project.id, '');
          if (risksResponse.success) {
            setRisks(prev => {
              // Filter out risks for this project
              const filtered = prev.filter(risk => risk.projectId !== project.id);
              // Add updated risks
              return [...filtered, ...(risksResponse.data || [])];
            });
          }
          
          // Refresh issues
          const issuesResponse = await api.issues.getAllIssues(project.id, '');
          if (issuesResponse.success) {
            setIssues(prev => {
              // Filter out issues for this project
              const filtered = prev.filter(issue => issue.projectId !== project.id);
              // Add updated issues
              return [...filtered, ...(issuesResponse.data || [])];
            });
          }
        }));
        
        // Update last refresh time
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToRisks = (type: 'risks' | 'issues' = 'risks') => {
    if (type === 'risks') {
      setRisksDialogOpen(true);
    } else {
      setIssuesDialogOpen(true);
    }
  };

  const handleExportReport = () => {
    // In a real app, this would trigger a report generation
    console.log('Exporting dashboard report');
    alert('Report exported successfully');
  };

  const getDialogTitle = (metricType: string): string => {
    switch (metricType) {
      case 'totalProjects':
        return t('dashboard.totalProjects');
      case 'inProgress':
        return t('dashboard.inProgress');
      case 'completed':
        return t('dashboard.completed');
      case 'onHold':
        return t('dashboard.onHold');
      case 'overdue':
        return t('dashboard.overdue');
      case 'approachingDeadline':
        return t('dashboard.approachingDeadline');
      default:
        return '';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Update URL when switching tabs
    if (newValue === 1) {
      navigate('/dashboard?tab=analytics', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // Update tab when URL changes
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'analytics' && tabValue !== 1) {
      setTabValue(1);
    } else if (!tabParam && tabValue !== 0) {
      setTabValue(0);
    }
  }, [location, tabValue]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'error';
      case TaskPriority.MEDIUM:
        return 'warning';
      case TaskPriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  const renderDashboardContent = () => {
    switch (tabValue) {
      case 0: // Dashboard tab
        return (
          <>
            {/* KPI Section - Show complete KPI section for executives and admins */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                KPIs
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <MetricCard
                    title="Total Projects"
                    value={metrics.totalProjects}
                    color="primary"
                    progress={100}
                    onClick={() => handleMetricClick('totalProjects')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <MetricCard
                    title="In Progress Projects"
                    value={metrics.inProgress}
                    color="info"
                    progress={Math.round((metrics.inProgress / metrics.totalProjects) * 100)}
                    onClick={() => handleMetricClick('inProgress')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <MetricCard
                    title="Completed Projects"
                    value={metrics.completed}
                    color="success"
                    progress={Math.round((metrics.completed / metrics.totalProjects) * 100)}
                    onClick={() => handleMetricClick('completed')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <MetricCard
                    title="On Hold Projects"
                    value={metrics.onHold}
                    color="warning"
                    progress={Math.round((metrics.onHold / metrics.totalProjects) * 100)}
                    onClick={() => handleMetricClick('onHold')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <MetricCard
                    title="High Priority Risks"
                    value={metrics.openRisks}
                    color="error"
                    progress={Math.round((metrics.openRisks / metrics.totalProjects) * 100)}
                    onClick={() => handleNavigateToRisks('risks')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <MetricCard
                    title="Open Issues"
                    value={metrics.openIssues}
                    color="error"
                    progress={Math.round((metrics.openIssues / metrics.totalProjects) * 100)}
                    onClick={() => handleNavigateToRisks('issues')}
                  />
                </Box>
              </Box>
            </Box>
          </>
        );
        
      case 1: // Analytics tab
        return (
          <AnalyticsDashboard />
        );
        
      default:
        return null;
    }
  };

  return (
    <ProjectProvider>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {getDashboardTitle()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {accessPermissions.canExportReports && (
                <Button 
                  startIcon={<DownloadIcon />} 
                  variant="outlined" 
                  size="small"
                  onClick={handleExportReport}
                >
                  {t('dashboard.export')}
                </Button>
              )}
              <Typography variant="caption" color="text.secondary">
                {t('dashboard.lastUpdated')}: {lastRefresh.toLocaleTimeString()}
              </Typography>
              <Tooltip title={t('dashboard.refresh')}>
                <IconButton onClick={handleRefresh} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Tabs for Dashboard and Assignments */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
            >
              <Tab 
                label={t('navigation.dashboard')} 
                id="tab-0" 
                aria-controls="tabpanel-0" 
                icon={<DashboardIcon />}
                iconPosition="start"
              />
              <Tab 
                label={t('dashboard.analytics', 'Analytics')} 
                id="tab-1" 
                aria-controls="tabpanel-1" 
                icon={<BarChartIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {renderDashboardContent()}
          
          {/* Project Dialog */}
          {selectedMetric && (
            <ProjectDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              title={getDialogTitle(selectedMetric)}
              projects={getFilteredProjects(selectedMetric)}
            />
          )}
          
          {/* Risks Dialog */}
          <Dialog 
            open={risksDialogOpen} 
            onClose={() => setRisksDialogOpen(false)} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle>
              {t('dashboard.highPriorityRisks', 'High Priority Risks')}
              <IconButton
                aria-label="close"
                onClick={() => setRisksDialogOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('risk.title')}</TableCell>
                      <TableCell>{t('project.name')}</TableCell>
                      <TableCell>{t('risk.impact')}</TableCell>
                      <TableCell>{t('risk.status')}</TableCell>
                      <TableCell>{t('risk.createdAt')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {risks.filter(risk => risk.status === RiskStatus.IDENTIFIED || 
                                          risk.status === RiskStatus.ANALYZING || 
                                          risk.status === RiskStatus.MONITORED)
                      .map((risk) => {
                        const project = projects.find(p => p.id === risk.projectId);
                        return (
                          <TableRow key={risk.id}>
                            <TableCell>{risk.title}</TableCell>
                            <TableCell>{project?.name || t('common.noData')}</TableCell>
                            <TableCell>
                              <Chip
                                label={t(`risk.impact.${risk.impact.toLowerCase()}`)}
                                size="small"
                                color={risk.impact === RiskImpact.HIGH ? 'error' : 
                                      risk.impact === RiskImpact.MEDIUM ? 'warning' : 'success'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t(`risk.status.${risk.status.toLowerCase()}`)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(risk.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>

          {/* Issues Dialog */}
          <Dialog 
            open={issuesDialogOpen} 
            onClose={() => setIssuesDialogOpen(false)} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle>
              {t('dashboard.openIssues', 'Open Issues')}
              <IconButton
                aria-label="close"
                onClick={() => setIssuesDialogOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('issue.title')}</TableCell>
                      <TableCell>{t('project.name')}</TableCell>
                      <TableCell>{t('issue.impact')}</TableCell>
                      <TableCell>{t('issue.status')}</TableCell>
                      <TableCell>{t('issue.createdAt')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues.filter(issue => issue.status === IssueStatus.OPEN || 
                                            issue.status === IssueStatus.IN_PROGRESS)
                      .map((issue) => {
                        const project = projects.find(p => p.id === issue.projectId);
                        return (
                          <TableRow key={issue.id}>
                            <TableCell>{issue.title}</TableCell>
                            <TableCell>{project?.name || t('common.noData')}</TableCell>
                            <TableCell>
                              <Chip
                                label={t(`issue.impact.${issue.impact.toLowerCase()}`)}
                                size="small"
                                color={issue.impact === RiskImpact.HIGH ? 'error' : 
                                      issue.impact === RiskImpact.MEDIUM ? 'warning' : 'success'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t(`issue.status.${issue.status.toLowerCase()}`)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(issue.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </Box>
      </Container>
    </ProjectProvider>
  );
};

export default DashboardPage; 