import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

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

const kpiData = {
  totalProjects: 12,
  inProgress: 5,
  onHold: 2,
  completed: 4,
  draft: 1,
  averageCompletion: 68,
  risksOpen: 9,
  issuesOpen: 3,
  approvalsPending: 2
};

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

const DashboardPage: React.FC = () => {
  const { user, isDepartmentDirector: isDirector, isHigherManagement: isExecutive, isMainPmo: isMainPMO, isSubPmo: isSubPMO } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handlePrint = () => {
    window.print();
    handleMenuClose();
  };
  
  const handleExport = () => {
    // Export logic would go here
    alert('Export functionality would be implemented here');
    handleMenuClose();
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
          <Tooltip title="Export options">
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
              Print Dashboard
            </MenuItem>
            <MenuItem onClick={handleExport}>
              <ExportIcon fontSize="small" sx={{ mr: 1 }} />
              Export as PDF
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Stack spacing={3}>
        {/* Welcome Card */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Welcome, {user?.username || 'User'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isDirector && 'Department Director Dashboard'}
            {isExecutive && 'Executive Dashboard'}
            {isMainPMO && 'Main PMO Dashboard'}
            {isSubPMO && 'Sub PMO Dashboard'}
            {!isDirector && !isExecutive && !isMainPMO && !isSubPMO && 'Project Manager Dashboard'}
          </Typography>
        </Paper>
        
        {/* KPI Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Key Performance Indicators</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="primary">{kpiData.totalProjects}</Typography>
              <Typography variant="body1">Total Projects</Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="primary">{kpiData.inProgress}</Typography>
              <Typography variant="body1">In Progress</Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="success.main">{kpiData.completed}</Typography>
              <Typography variant="body1">Completed</Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="warning.main">{kpiData.onHold}</Typography>
              <Typography variant="body1">On Hold</Typography>
            </Paper>
          </Box>
          
          <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="error.main">{kpiData.risksOpen}</Typography>
              <Typography variant="body1">Open Risks</Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="error.main">{kpiData.issuesOpen}</Typography>
              <Typography variant="body1">Open Issues</Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="secondary.main">{kpiData.approvalsPending}</Typography>
              <Typography variant="body1">Pending Approvals</Typography>
            </Paper>
          </Box>
        </Box>
        
        {/* Projects Section */}
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Projects</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {mockProjects.map((project) => (
              <Card key={project.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip 
                      label={getStatusLabel(project.status)} 
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Department: {project.department} | Manager: {project.manager}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1, minWidth: '100px' }}>
                      Completion: {project.completion}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.completion} 
                      sx={{ flexGrow: 1 }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', mt: 2 }}>
                    {project.riskCount > 0 && (
                      <Chip 
                        label={`${project.riskCount} Risks`} 
                        color="error" 
                        size="small" 
                        sx={{ mr: 1 }} 
                        variant="outlined"
                      />
                    )}
                    {project.issueCount > 0 && (
                      <Chip 
                        label={`${project.issueCount} Issues`} 
                        color="error" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">View Details</Button>
                  {(project.status === 'SubPMOReview' && isSubPMO) && (
                    <Button size="small" color="secondary">Review</Button>
                  )}
                  {(project.status === 'MainPMOApproval' && isMainPMO) && (
                    <Button size="small" color="secondary">Approve</Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default DashboardPage; 