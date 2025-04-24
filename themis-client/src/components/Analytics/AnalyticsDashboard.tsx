import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useProjects } from '../../context/ProjectContext';
import { Project, ProjectStatus, ProjectPriority, UserRole, AssignmentStatus, RiskStatus, RiskImpact, IssueStatus, Risk, Issue } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

interface ChartData {
  name: string;
  value: number;
}

interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'area' | 'scatter' | 'radar' | 'composed';
  data: ChartData[];
  title: string;
}

interface MetricOption {
  value: string;
  label: string;
  allowedRoles: UserRole[];
  description?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard: React.FC = () => {
  const { projects } = useProjects();
  const { user, canViewAllProjects } = useAuth();
  const { t } = useTranslation();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedChartType, setSelectedChartType] = useState<ChartConfig['type']>('bar');
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  const metrics: MetricOption[] = [
    { value: 'client', label: t('analytics.projectsByClient', 'Number of Projects by Client'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO] },
    { value: 'projectManager', label: t('analytics.projectsByManager', 'Number of Projects by Project Manager'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR] },
    { value: 'priority', label: t('analytics.projectsByPriority', 'Number of Projects by Priority'), allowedRoles: Object.values(UserRole) },
    { value: 'status', label: t('analytics.projectsByStatus', 'Number of Projects by Status'), allowedRoles: Object.values(UserRole) },
    { value: 'department', label: t('analytics.projectsByDepartment', 'Number of Projects by Department'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO] },
    { value: 'delayed', label: t('analytics.delayedProjects', 'Number of Delayed Projects'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR, UserRole.PROJECT_MANAGER] },
    { value: 'stalled', label: t('analytics.stalledProjects', 'Number of Stalled Projects'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR, UserRole.PROJECT_MANAGER] },
    { value: 'inProgress', label: t('analytics.inProgressProjects', 'Number of Projects In Progress'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.SUB_PMO, UserRole.DEPARTMENT_DIRECTOR, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER] },
    
    // Budget metrics
    { value: 'budgetByDepartment', label: t('analytics.budgetByDepartment', 'Budget Allocation by Department'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO], description: t('analytics.budgetByDepartmentDesc', 'Shows how budget is distributed across departments') },
    { value: 'budgetVsActual', label: t('analytics.budgetVsActual', 'Budget vs Actual Cost'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR, UserRole.PROJECT_MANAGER], description: t('analytics.budgetVsActualDesc', 'Compares planned budget with actual expenditure') },
    { value: 'topBudgetProjects', label: t('analytics.topBudgetProjects', 'Top Projects by Budget'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR], description: t('analytics.topBudgetProjectsDesc', 'Shows projects with the highest budget allocation') },
    { value: 'budgetUtilization', label: t('analytics.budgetUtilization', 'Budget Utilization Rate'), allowedRoles: [UserRole.ADMIN, UserRole.EXECUTIVE, UserRole.MAIN_PMO, UserRole.DEPARTMENT_DIRECTOR, UserRole.PROJECT_MANAGER], description: t('analytics.budgetUtilizationDesc', 'Shows percentage of budget utilized by projects') },
    
    // Risk metrics
    { value: 'riskStatus', label: t('analytics.risksByStatus', 'Risks by Status'), allowedRoles: Object.values(UserRole), description: t('analytics.risksByStatusDesc', 'Shows the distribution of risks by their status') },
    { value: 'riskImpact', label: t('analytics.risksByImpact', 'Risks by Impact Level'), allowedRoles: Object.values(UserRole), description: t('analytics.risksByImpactDesc', 'Shows the distribution of risks by their impact level') },
    { value: 'highProbabilityRisks', label: t('analytics.highProbRisks', 'High Probability Risks'), allowedRoles: Object.values(UserRole), description: t('analytics.highProbRisksDesc', 'Shows risks with probability greater than 70%') },
    
    // Issue metrics
    { value: 'issueStatus', label: t('analytics.issuesByStatus', 'Issues by Status'), allowedRoles: Object.values(UserRole), description: t('analytics.issuesByStatusDesc', 'Shows the distribution of issues by their status') },
    { value: 'issuePriority', label: t('analytics.issuesByPriority', 'Issues by Priority'), allowedRoles: Object.values(UserRole), description: t('analytics.issuesByPriorityDesc', 'Shows the distribution of issues by their priority') },
    { value: 'openIssues', label: t('analytics.openIssuesByProject', 'Open Issues by Project'), allowedRoles: Object.values(UserRole), description: t('analytics.openIssuesByProjectDesc', 'Shows the number of open issues for each project') },
  ];

  // Filter projects based on user role and permissions
  const filteredProjects = useMemo(() => {
    if (canViewAllProjects || !user?.role) return projects;
    
    if (user.role === UserRole.DEPARTMENT_DIRECTOR && user.department) {
      return projects.filter(project => project.department.id === user.department!.id);
    } else if (user.role === UserRole.PROJECT_MANAGER) {
      return projects.filter(project => project.projectManager.id === user.id);
    }
    
    return projects;
  }, [projects, user, canViewAllProjects]);

  // Fetch risks and issues data for all visible projects
  const fetchRisksAndIssues = async () => {
    try {
      const allRisks: Risk[] = [];
      const allIssues: Issue[] = [];
      
      for (const project of filteredProjects) {
        // Fetch risks
        const risksResponse = await api.risks.getAllRisks(project.id, '');
        if (risksResponse.success && risksResponse.data) {
          risksResponse.data.forEach((risk: Risk) => allRisks.push({...risk, projectId: project.id}));
        }
        
        // Fetch issues
        const issuesResponse = await api.issues.getAllIssues(project.id, '');
        if (issuesResponse.success && issuesResponse.data) {
          issuesResponse.data.forEach((issue: Issue) => allIssues.push({...issue, projectId: project.id}));
        }
      }
      
      setRisks(allRisks);
      setIssues(allIssues);
    } catch (error) {
      console.error('Error fetching risks and issues:', error);
    }
  };

  const processData = (metric: string): ChartData[] => {
    if (!metric) return [];
    
    switch (metric) {
      case 'client':
        return processClientData();
      case 'projectManager':
        return processProjectManagerData();
      case 'priority':
        return processPriorityData();
      case 'status':
        return processStatusData();
      case 'delayed':
        return processDelayedData();
      case 'department':
        return processDepartmentData();
      case 'stalled':
        return processStalledData();
      case 'inProgress':
        return processInProgressData();
      // Budget metrics
      case 'budgetByDepartment':
        return processBudgetByDepartmentData();
      case 'budgetVsActual':
        return processBudgetVsActualData();
      case 'topBudgetProjects':
        return processTopBudgetProjectsData();
      case 'budgetUtilization':
        return processBudgetUtilizationData();
      // Risk metrics
      case 'riskStatus':
        return processRiskStatusData();
      case 'riskImpact':
        return processRiskImpactData();
      case 'highProbabilityRisks':
        return processHighProbabilityRisksData();
      // Issue metrics
      case 'issueStatus':
        return processIssueStatusData();
      case 'issuePriority':
        return processIssuePriorityData();
      case 'openIssues':
        return processOpenIssuesData();
      default:
        return [];
    }
  };

  const processClientData = (): ChartData[] => {
    const clientCounts = filteredProjects.reduce((acc: { [key: string]: number }, project) => {
      const client = project.client || 'Unknown';
      acc[client] = (acc[client] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(clientCounts).map(([name, value]) => ({ name, value }));
  };

  const processProjectManagerData = (): ChartData[] => {
    const pmCounts = filteredProjects.reduce((acc: { [key: string]: number }, project) => {
      const pm = project.projectManager?.firstName + ' ' + project.projectManager?.lastName || 'Unknown';
      acc[pm] = (acc[pm] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(pmCounts).map(([name, value]) => ({ name, value }));
  };

  const processPriorityData = (): ChartData[] => {
    const priorityCounts = filteredProjects.reduce((acc: { [key: string]: number }, project) => {
      const priority = project.priority || 'Unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
  };

  const processStatusData = (): ChartData[] => {
    const statusCounts = filteredProjects.reduce((acc: { [key: string]: number }, project) => {
      const status = project.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const processDelayedData = (): ChartData[] => {
    const delayedProjects = filteredProjects.filter(project => {
      const dueDate = new Date(project.endDate);
      const today = new Date();
      return dueDate < today && project.status !== ProjectStatus.COMPLETED;
    });
    return [{ name: 'Delayed Projects', value: delayedProjects.length }];
  };

  const processDepartmentData = (): ChartData[] => {
    const deptCounts = filteredProjects.reduce((acc: { [key: string]: number }, project) => {
      const dept = project.department?.name || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  };

  const processStalledData = (): ChartData[] => {
    const stalledProjects = filteredProjects.filter(project => 
      project.status === ProjectStatus.ON_HOLD
    );
    return [{ name: 'Stalled Projects', value: stalledProjects.length }];
  };

  const processInProgressData = (): ChartData[] => {
    const inProgressProjects = filteredProjects.filter(project => 
      project.status === ProjectStatus.IN_PROGRESS
    );
    return [{ name: 'Projects In Progress', value: inProgressProjects.length }];
  };

  // Risk metrics processing methods
  const processRiskStatusData = (): ChartData[] => {
    const statusCounts = risks.reduce((acc: { [key: string]: number }, risk) => {
      const status = risk.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const processRiskImpactData = (): ChartData[] => {
    const impactCounts = risks.reduce((acc: { [key: string]: number }, risk) => {
      const impact = risk.impact || 'Unknown';
      acc[impact] = (acc[impact] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(impactCounts).map(([name, value]) => ({ name, value }));
  };

  const processHighProbabilityRisksData = (): ChartData[] => {
    const highProbRisks = risks.filter(risk => risk.probability && risk.probability > 70);
    
    // Group by impact level
    const impactCounts = highProbRisks.reduce((acc: { [key: string]: number }, risk) => {
      const impact = risk.impact || 'Unknown';
      acc[impact] = (acc[impact] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(impactCounts).map(([name, value]) => ({ name, value }));
  };

  // Issue metrics processing methods
  const processIssueStatusData = (): ChartData[] => {
    const statusCounts = issues.reduce((acc: { [key: string]: number }, issue) => {
      const status = issue.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const processIssuePriorityData = (): ChartData[] => {
    const priorityCounts = issues.reduce((acc: { [key: string]: number }, issue) => {
      const priority = issue.impact || 'Unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
  };

  const processOpenIssuesData = (): ChartData[] => {
    const openIssues = issues.filter(issue => issue.status === IssueStatus.OPEN);
    const projectCounts = openIssues.reduce((acc: { [key: string]: number }, issue) => {
      const projectId = issue.projectId || 'Unknown';
      acc[projectId] = (acc[projectId] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(projectCounts).map(([name, value]) => ({ name, value }));
  };

  // Add new processing functions for budget metrics  
  const processBudgetByDepartmentData = (): ChartData[] => {
    const departmentBudgets = filteredProjects.reduce((acc: { [key: string]: number }, project) => {
      const deptName = project.department?.name || 'Unknown';
      acc[deptName] = (acc[deptName] || 0) + (project.budget || 0);
      return acc;
    }, {});
    
    return Object.entries(departmentBudgets)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const processBudgetVsActualData = (): ChartData[] => {
    const totalBudget = filteredProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalActual = filteredProjects.reduce((sum, project) => sum + (project.actualCost || 0), 0);
    
    return [
      { name: t('analytics.plannedBudget', 'Planned Budget'), value: totalBudget },
      { name: t('analytics.actualCost', 'Actual Cost'), value: totalActual }
    ];
  };

  const processTopBudgetProjectsData = (): ChartData[] => {
    return filteredProjects
      .filter(project => project.budget && project.budget > 0)
      .sort((a, b) => (b.budget || 0) - (a.budget || 0))
      .slice(0, 10)  // Get top 10 projects by budget
      .map(project => ({
        name: project.name,
        value: project.budget || 0
      }));
  };

  const processBudgetUtilizationData = (): ChartData[] => {
    return filteredProjects
      .filter(project => project.budget && project.budget > 0)
      .map(project => {
        const utilization = ((project.actualCost || 0) / (project.budget || 1)) * 100;
        return {
          name: project.name,
          value: Math.min(utilization, 100) // Cap at 100% for display purposes
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  useEffect(() => {
    if (!selectedMetric) return;
    const data = processData(selectedMetric);
    setCharts(prevCharts => [...prevCharts, {
      type: selectedChartType,
      data: data,
      title: metrics.find(m => m.value === selectedMetric)?.label || '',
    }]);
  }, [selectedMetric, selectedChartType, filteredProjects]);

  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setSelectedChartType(event.target.value as ChartConfig['type']);
  };

  const removeChart = (index: number) => {
    setCharts(prevCharts => prevCharts.filter((_, i) => i !== index));
  };

  // Get available metrics based on user role
  const getAvailableMetrics = () => {
    if (!user || !user.role) return [];
    // If user is admin, return all metrics
    if (user.role === UserRole.ADMIN) return metrics;
    return metrics.filter(metric => metric.allowedRoles.includes(user.role as UserRole));
  };

  const availableMetrics = getAvailableMetrics();

  const renderChart = (config: ChartConfig, index: number) => {
    const { type, data, title } = config;

    switch (type) {
      case 'bar':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      case 'pie':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      case 'line':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      case 'area':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      case 'scatter':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="value" />
                  <Tooltip />
                  <Legend />
                  <Scatter data={data} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      case 'radar':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      case 'composed':
        return (
          <Box key={index} sx={{ width: '50%', p: 1 }}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                  <Line type="monotone" dataKey="value" stroke="#ff7300" />
                </ComposedChart>
              </ResponsiveContainer>
              <Button onClick={() => removeChart(index)}>{t('common.remove', 'Remove')}</Button>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('analytics.title', 'Project Analytics Dashboard')}
      </Typography>
      
      {availableMetrics.length === 0 ? (
        <Alert severity="info">
          {t('analytics.noAccess', 'You don\'t have access to any analytics data. Please contact your administrator for access.')}
        </Alert>
      ) : (
        <>
          {/* KPI Summary Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>{t('dashboard.kpi')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' } }}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" color="textSecondary">{t('dashboard.totalProjects')}</Typography>
                  <Typography variant="h4">{filteredProjects.length}</Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' } }}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" color="textSecondary">{t('dashboard.inProgress')}</Typography>
                  <Typography variant="h4">
                    {filteredProjects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' } }}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" color="textSecondary">{t('analytics.overdueAssignments', 'Overdue Assignments')}</Typography>
                  <Typography variant="h4">
                    {assignments.filter(a => {
                      const dueDate = new Date(a.dueDate);
                      return dueDate < new Date() && a.status !== AssignmentStatus.COMPLETED;
                    }).length}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' } }}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" color="textSecondary">{t('analytics.highPriorityRisks', 'High Priority Risks')}</Typography>
                  <Typography variant="h4">
                    {risks.filter(r => r.impact === RiskImpact.HIGH || r.impact === RiskImpact.CRITICAL).length}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Paper>

          {/* Chart Configuration Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>{t('analytics.selectMetric', 'Select Metric')}</InputLabel>
                <Select
                  value={selectedMetric}
                  onChange={handleMetricChange}
                  label={t('analytics.selectMetric', 'Select Metric')}
                >
                  {availableMetrics.map((metric) => (
                    <MenuItem 
                      key={metric.value} 
                      value={metric.value}
                      title={metric.description}
                    >
                      {metric.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150, flex: 1 }}>
                <InputLabel>{t('analytics.chartType', 'Chart Type')}</InputLabel>
                <Select
                  value={selectedChartType}
                  onChange={handleChartTypeChange}
                  label={t('analytics.chartType', 'Chart Type')}
                >
                  <MenuItem value="bar">{t('analytics.barChart', 'Bar Chart')}</MenuItem>
                  <MenuItem value="pie">{t('analytics.pieChart', 'Pie Chart')}</MenuItem>
                  <MenuItem value="line">{t('analytics.lineChart', 'Line Chart')}</MenuItem>
                  <MenuItem value="area">{t('analytics.areaChart', 'Area Chart')}</MenuItem>
                  <MenuItem value="scatter">{t('analytics.scatterPlot', 'Scatter Plot')}</MenuItem>
                  <MenuItem value="radar">{t('analytics.radarChart', 'Radar Chart')}</MenuItem>
                  <MenuItem value="composed">{t('analytics.composedChart', 'Composed Chart')}</MenuItem>
                </Select>
              </FormControl>

              <Button 
                variant="contained" 
                onClick={() => {
                  if (!selectedMetric) return;
                  setCharts(prevCharts => [...prevCharts, {
                    type: selectedChartType,
                    data: processData(selectedMetric),
                    title: metrics.find(m => m.value === selectedMetric)?.label || '',
                  }]);
                }}
                disabled={!selectedMetric || !selectedChartType}
                sx={{ minWidth: 120 }}
              >
                {t('analytics.addChart', 'Add Chart')}
              </Button>
            </Stack>
            
            {/* Display selected metric description if available */}
            {selectedMetric && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                {metrics.find(m => m.value === selectedMetric)?.description || ''}
              </Typography>
            )}
          </Paper>

          {/* Display charts */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 3 }}>
            {charts.map((config, index) => renderChart(config, index))}
          </Box>
          
          {/* Show empty state message if no charts added */}
          {charts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                {t('analytics.emptyState', 'Select a metric and chart type from above, then click "Add Chart" to build your custom dashboard')}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AnalyticsDashboard; 