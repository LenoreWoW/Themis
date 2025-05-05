import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Timeline as ForecastIcon,
  AttachMoney as BudgetIcon,
  Paid as ExpensesIcon,
  ReceiptLong as InvoicesIcon,
  AccountBalance as AccountsIcon,
  Assessment as ReportsIcon,
  ShowChart as ROIIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Project, ProjectStatus } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

// Mock finance-specific data
const defaultBudgetItems = [
  { category: 'Development', allocated: 80000, spent: 50000, remaining: 30000 },
  { category: 'Testing', allocated: 40000, spent: 15000, remaining: 25000 },
  { category: 'Implementation', allocated: 50000, spent: 10000, remaining: 40000 },
  { category: 'Training', allocated: 25000, spent: 5000, remaining: 20000 },
  { category: 'Contingency', allocated: 15000, spent: 0, remaining: 15000 }
];

const defaultFinancialMetrics = [
  { name: 'ROI', expected: '15%', current: '10%' },
  { name: 'IRR', expected: '12%', current: '8%' },
  { name: 'Payback Period', expected: '18 months', current: '24 months' },
  { name: 'NPV', expected: '$120,000', current: '$85,000' }
];

const defaultRecentExpenses = [
  { date: '2023-06-15', category: 'Development', amount: 12500, status: 'Approved' },
  { date: '2023-06-22', category: 'Testing', amount: 7500, status: 'Approved' },
  { date: '2023-07-01', category: 'Development', amount: 15000, status: 'Pending' },
  { date: '2023-07-05', category: 'Implementation', amount: 10000, status: 'Approved' }
];

const FinanceProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State for finance-specific data
  const [budgetItems, setBudgetItems] = useState(defaultBudgetItems);
  const [financialMetrics, setFinancialMetrics] = useState(defaultFinancialMetrics);
  const [recentExpenses, setRecentExpenses] = useState(defaultRecentExpenses);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Find the project in the projects context
        const foundProject = projects.find(p => p.id === id);
        
        if (foundProject) {
          setProject(foundProject);
          
          // Customize finance data based on project details
          
          // Adjust budget items based on actual project budget
          if (foundProject.budget) {
            const totalDefaultAllocated = defaultBudgetItems.reduce((sum, item) => sum + item.allocated, 0);
            const budgetRatio = foundProject.budget / totalDefaultAllocated;
            
            const updatedBudgetItems = defaultBudgetItems.map(item => {
              const adjustedAllocated = Math.round(item.allocated * budgetRatio);
              
              // Calculate spent based on project progress or actual cost
              let adjustedSpent = 0;
              if (foundProject.actualCost) {
                // If we have actual cost data, use that ratio
                const spentRatio = foundProject.actualCost / foundProject.budget;
                adjustedSpent = Math.round(adjustedAllocated * spentRatio * (item.spent / item.allocated));
              } else if (foundProject.progress !== undefined) {
                // Otherwise use progress as a proxy for spending
                adjustedSpent = Math.round(adjustedAllocated * (foundProject.progress / 100) * (item.spent / item.allocated));
              }
              
              // Ensure spent doesn't exceed allocated
              adjustedSpent = Math.min(adjustedSpent, adjustedAllocated);
              
              // Calculate remaining
              const adjustedRemaining = adjustedAllocated - adjustedSpent;
              
              return {
                category: item.category,
                allocated: adjustedAllocated,
                spent: adjustedSpent,
                remaining: adjustedRemaining
              };
            });
            
            setBudgetItems(updatedBudgetItems);
          }
          
          // Adjust financial metrics based on project progress
          if (foundProject.progress !== undefined) {
            const progressFactor = foundProject.progress / 100;
            const updatedMetrics = defaultFinancialMetrics.map(metric => {
              // For simplicity, we'll just adjust the current values
              // In a real app, you'd have more sophisticated calculations
              let adjustedCurrent;
              
              // Parse numeric values from expected
              if (metric.expected.includes('%')) {
                const expectedValue = parseFloat(metric.expected);
                adjustedCurrent = `${Math.round(expectedValue * progressFactor)}%`;
              } else if (metric.expected.includes('months')) {
                const expectedValue = parseFloat(metric.expected);
                adjustedCurrent = `${Math.round(expectedValue * (2 - progressFactor))} months`;
              } else if (metric.expected.includes('$')) {
                const expectedValue = parseFloat(metric.expected.replace(/[$,]/g, ''));
                adjustedCurrent = `$${Math.round(expectedValue * progressFactor).toLocaleString()}`;
              } else {
                adjustedCurrent = metric.current;
              }
              
              return { ...metric, current: adjustedCurrent };
            });
            
            setFinancialMetrics(updatedMetrics);
          }
          
          // Adjust expenses based on project timeline
          if (foundProject.startDate && foundProject.endDate) {
            const startDate = new Date(foundProject.startDate);
            const endDate = new Date(foundProject.endDate);
            const now = new Date();
            
            // Only show expenses if project has started
            if (now >= startDate) {
              const projectDuration = endDate.getTime() - startDate.getTime();
              const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              
              const updatedExpenses = defaultRecentExpenses.map((expense, index) => {
                // Adjust expense date based on project timeline
                const expenseDate = new Date(startDate);
                expenseDate.setDate(startDate.getDate() + Math.floor(daysSinceStart * (index / defaultRecentExpenses.length)));
                
                // Format date as yyyy-mm-dd
                const formattedDate = expenseDate.toISOString().split('T')[0];
                
                // Adjust amount based on project budget
                let adjustedAmount = expense.amount;
                if (foundProject.budget) {
                  const defaultTotalExpenses = defaultRecentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                  const expenseBudgetRatio = foundProject.actualCost ? 
                    foundProject.actualCost / defaultTotalExpenses : 
                    foundProject.budget / defaultTotalExpenses;
                  adjustedAmount = Math.round(expense.amount * expenseBudgetRatio);
                }
                
                // Determine status
                let status = 'Pending';
                if (expenseDate < now) {
                  status = 'Approved';
                }
                
                return {
                  ...expense,
                  date: formattedDate,
                  amount: adjustedAmount,
                  status
                };
              });
              
              setRecentExpenses(updatedExpenses);
            }
          }
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, projects]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate('/projects');
  };

  // Calculate total budget values
  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budgetItems.reduce((sum, item) => sum + item.remaining, 0);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading financial project details...</Typography>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  // Calculate project progress
  const progress = project.progress || 0;
  const isOverdue = new Date() > new Date(project.endDate) && project.status !== ProjectStatus.COMPLETED;

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="outlined" 
        startIcon={<BackIcon />} 
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

      <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2, background: 'linear-gradient(to right, #2e7d32, #43a047)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
              {project.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }} gutterBottom>
              Financial System Project
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {project.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Financial Overview</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Budget Status</Typography>
                  <Chip 
                    label={isOverdue ? 'At Risk' : 'On Track'} 
                    color={isOverdue ? 'error' : 'success'}
                    size="small"
                    sx={{ mt: 0.5, bgcolor: isOverdue ? 'error.main' : '#2e7d32' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Department</Typography>
                  <Typography variant="body1">{project.department?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Project Lead</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', bgcolor: '#2e7d32' }}>
                      {project.projectManager ? 
                        `${project.projectManager.firstName?.charAt(0)}${project.projectManager.lastName?.charAt(0)}` : 
                        '?'}
                    </Avatar>
                    <Typography variant="body1">
                      {project.projectManager ? 
                        `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                        'Unassigned'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Timeline</Typography>
                  <Typography variant="body2">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }} gutterBottom>Budget Utilization</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.actualCost ? Math.round((project.actualCost / project.budget) * 100) : 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#fff'
                      }
                    }} 
                  />
                  <Typography variant="body2" align="right">
                    {project.actualCost ? Math.round((project.actualCost / project.budget) * 100) : 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="project detail tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Budget" icon={<BudgetIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Expenses" icon={<ExpensesIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Forecast" icon={<ForecastIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Invoices" icon={<InvoicesIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Accounts" icon={<AccountsIcon />} iconPosition="start" {...a11yProps(4)} />
          <Tab label="ROI Analysis" icon={<ROIIcon />} iconPosition="start" {...a11yProps(5)} />
          <Tab label="Reports" icon={<ReportsIcon />} iconPosition="start" {...a11yProps(6)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Budget Breakdown</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Allocated</TableCell>
                      <TableCell align="right">Spent</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell align="right">Utilization</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgetItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {item.category}
                        </TableCell>
                        <TableCell align="right">${item.allocated.toLocaleString()}</TableCell>
                        <TableCell align="right">${item.spent.toLocaleString()}</TableCell>
                        <TableCell align="right">${item.remaining.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.round((item.spent / item.allocated) * 100)} 
                              sx={{ width: 100, mr: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">
                              {Math.round((item.spent / item.allocated) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell><Typography fontWeight="bold">Total</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight="bold">${totalAllocated.toLocaleString()}</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight="bold">${totalSpent.toLocaleString()}</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight="bold">${totalRemaining.toLocaleString()}</Typography></TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.round((totalSpent / totalAllocated) * 100)} 
                            sx={{ width: 100, mr: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {Math.round((totalSpent / totalAllocated) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Budget Summary</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">Total Budget</Typography>
                    <Typography variant="h5" color="primary">${project.budget?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">Spent To Date</Typography>
                    <Typography variant="h5" color="error">${project.actualCost?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Remaining</Typography>
                    <Typography variant="h5" color="success">
                      ${((project.budget || 0) - (project.actualCost || 0)).toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>Budget Utilization</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.actualCost ? Math.round((project.actualCost / project.budget) * 100) : 0} 
                    sx={{ height: 10, borderRadius: 5, mb: 1 }} 
                  />
                  <Typography variant="body1" align="right" fontWeight="medium">
                    {project.actualCost ? Math.round((project.actualCost / project.budget) * 100) : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Recent Expenses</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentExpenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell align="right">${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.status} 
                        size="small"
                        color={expense.status === 'Approved' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Financial Forecast</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            This section shows the project's financial forecasts and projections.
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Financial Metrics</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell>Expected</TableCell>
                          <TableCell>Current</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {financialMetrics.map((metric, index) => (
                          <TableRow key={index}>
                            <TableCell>{metric.name}</TableCell>
                            <TableCell>{metric.expected}</TableCell>
                            <TableCell>{metric.current}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Cost Projection</Typography>
                  <Typography variant="body2" paragraph>
                    Detailed cost projections and forecast charts will be displayed here.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Invoices</Typography>
          <Alert severity="info">
            This section will display all invoices related to the project.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Accounts</Typography>
          <Alert severity="info">
            Account information and mappings for this project will be displayed here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>ROI Analysis</Typography>
          <Alert severity="info">
            Return on Investment analysis and projections will be displayed here.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>Financial Reports</Typography>
          <Alert severity="info">
            Detailed financial reports will be generated here.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default FinanceProjectDetailPage; 