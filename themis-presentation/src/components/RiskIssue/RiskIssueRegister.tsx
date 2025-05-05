import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { 
  Risk, 
  Issue, 
  RiskStatus, 
  IssueStatus, 
  RiskImpact,
  Project,
  UserRole
} from '../../types';
import { exportToExcel } from '../../utils/exportUtils';
import './RiskIssueRegister.css';

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
      id={`risk-issue-tabpanel-${index}`}
      aria-labelledby={`risk-issue-tab-${index}`}
      {...other}
      style={{ height: 'calc(100% - 48px)', overflow: 'auto' }}
    >
      {value === index && (
        <Box p={3} height="100%">
          {children}
        </Box>
      )}
    </div>
  );
}

interface RiskIssueRegisterProps {
  project: Project;
}

const RiskIssueRegister: React.FC<RiskIssueRegisterProps> = ({ project }) => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRiskDialogOpen, setIsRiskDialogOpen] = useState<boolean>(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState<boolean>(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [riskFormData, setRiskFormData] = useState<Partial<Risk>>({
    title: '',
    description: '',
    status: RiskStatus.IDENTIFIED,
    impact: RiskImpact.MEDIUM,
    probability: 50,
    mitigation: ''
  });
  const [issueFormData, setIssueFormData] = useState<Partial<Issue>>({
    title: '',
    description: '',
    status: IssueStatus.OPEN,
    impact: RiskImpact.MEDIUM,
    resolutionSummary: ''
  });
  const [risksPage, setRisksPage] = useState(0);
  const [issuesPage, setIssuesPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token, hasRole } = useAuth();
  const { showAlert } = useNotifications();

  // Load risks and issues
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setIsLoading(true);
      
      try {
        // Fetch risks
        const risksData = await api.risks.getAllRisks(project.id, token);
        setRisks(risksData.data || []);
        
        // Fetch issues
        const issuesData = await api.issues.getAllIssues(project.id, token);
        setIssues(issuesData.data || []);
      } catch (error) {
        console.error('Error loading risks and issues:', error);
        showAlert('Failed to load risks and issues', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [project.id, token, showAlert]);

  // Tab change handler
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  // Risk form handlers
  const handleRiskInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setRiskFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleRiskSelectChange = (event: SelectChangeEvent<RiskStatus | RiskImpact | string>) => {
    const { name, value } = event.target;
    setRiskFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenRiskDialog = (risk?: Risk) => {
    if (risk) {
      setEditingRisk(risk);
      setRiskFormData({
        title: risk.title,
        description: risk.description,
        status: risk.status,
        impact: risk.impact,
        probability: risk.probability,
        mitigation: risk.mitigation
      });
    } else {
      setEditingRisk(null);
      setRiskFormData({
        title: '',
        description: '',
        status: RiskStatus.IDENTIFIED,
        impact: RiskImpact.MEDIUM,
        probability: 50,
        mitigation: ''
      });
    }
    setIsRiskDialogOpen(true);
  };

  const handleCloseRiskDialog = () => {
    setIsRiskDialogOpen(false);
  };

  const handleSaveRisk = async () => {
    if (!token || !user) return;
    
    try {
      if (editingRisk) {
        // Update existing risk
        await api.risks.updateRisk(
          project.id,
          editingRisk.id,
          riskFormData,
          token
        );
        
        // Update local state
        setRisks(prev =>
          prev.map(risk =>
            risk.id === editingRisk.id ? { ...risk, ...riskFormData as Risk } : risk
          )
        );
        
        showAlert('Risk updated successfully', 'success');
      } else {
        // Create new risk
        const newRisk = await api.risks.createRisk(
          project.id,
          riskFormData,
          token
        );
        
        // Update local state
        setRisks(prev => [...prev, newRisk.data as Risk]);
        
        showAlert('Risk added successfully', 'success');
      }
      
      handleCloseRiskDialog();
    } catch (error) {
      console.error('Error saving risk:', error);
      showAlert('Failed to save risk', 'error');
    }
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (!token) return;
    
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        await api.risks.deleteRisk(project.id, riskId, token);
        
        // Update local state
        setRisks(prev => prev.filter(risk => risk.id !== riskId));
        
        showAlert('Risk deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting risk:', error);
        showAlert('Failed to delete risk', 'error');
      }
    }
  };

  // Issue form handlers
  const handleIssueInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setIssueFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleIssueSelectChange = (event: SelectChangeEvent<IssueStatus | RiskImpact | string>) => {
    const { name, value } = event.target;
    setIssueFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenIssueDialog = (issue?: Issue) => {
    if (issue) {
      setEditingIssue(issue);
      setIssueFormData({
        title: issue.title,
        description: issue.description,
        status: issue.status,
        impact: issue.impact,
        resolutionSummary: issue.resolutionSummary || ''
      });
    } else {
      setEditingIssue(null);
      setIssueFormData({
        title: '',
        description: '',
        status: IssueStatus.OPEN,
        impact: RiskImpact.MEDIUM,
        resolutionSummary: ''
      });
    }
    setIsIssueDialogOpen(true);
  };

  const handleCloseIssueDialog = () => {
    setIsIssueDialogOpen(false);
  };

  const handleSaveIssue = async () => {
    if (!token || !user) return;
    
    try {
      if (editingIssue) {
        // Update existing issue
        await api.issues.updateIssue(
          project.id,
          editingIssue.id,
          issueFormData,
          token
        );
        
        // Update local state
        setIssues(prev =>
          prev.map(issue =>
            issue.id === editingIssue.id ? { ...issue, ...issueFormData as Issue } : issue
          )
        );
        
        showAlert('Issue updated successfully', 'success');
      } else {
        // Create new issue
        const newIssue = await api.issues.createIssue(
          project.id,
          issueFormData,
          token
        );
        
        // Update local state
        setIssues(prev => [...prev, newIssue.data as Issue]);
        
        showAlert('Issue added successfully', 'success');
      }
      
      handleCloseIssueDialog();
    } catch (error) {
      console.error('Error saving issue:', error);
      showAlert('Failed to save issue', 'error');
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!token) return;
    
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await api.issues.deleteIssue(project.id, issueId, token);
        
        // Update local state
        setIssues(prev => prev.filter(issue => issue.id !== issueId));
        
        showAlert('Issue deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting issue:', error);
        showAlert('Failed to delete issue', 'error');
      }
    }
  };

  // Pagination handlers
  const handleRisksPageChange = (event: unknown, newPage: number) => {
    setRisksPage(newPage);
  };

  const handleIssuesPageChange = (event: unknown, newPage: number) => {
    setIssuesPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setRisksPage(0);
    setIssuesPage(0);
  };

  // Export functions
  const handleExportRisks = () => {
    const columns = [
      { field: 'Title', headerName: 'Title' },
      { field: 'Description', headerName: 'Description' },
      { field: 'Status', headerName: 'Status' },
      { field: 'Impact', headerName: 'Impact' },
      { field: 'Probability', headerName: 'Probability' },
      { field: 'Mitigation', headerName: 'Mitigation' },
      { field: 'Owner', headerName: 'Owner' },
      { field: 'CreatedBy', headerName: 'Created By' },
      { field: 'CreatedAt', headerName: 'Created At' }
    ];
    
    const data = risks.map(risk => ({
      Title: risk.title,
      Description: risk.description,
      Status: risk.status,
      Impact: risk.impact,
      Probability: `${risk.probability}%`,
      Mitigation: risk.mitigation,
      Owner: `${risk.owner.firstName} ${risk.owner.lastName}`,
      CreatedBy: `${risk.createdBy.firstName} ${risk.createdBy.lastName}`,
      CreatedAt: new Date(risk.createdAt).toLocaleString()
    }));
    
    exportToExcel(data, columns, `${project.name}_Risks_Register`);
  };

  const handleExportIssues = () => {
    const columns = [
      { field: 'Title', headerName: 'Title' },
      { field: 'Description', headerName: 'Description' },
      { field: 'Status', headerName: 'Status' },
      { field: 'Impact', headerName: 'Impact' },
      { field: 'Resolution', headerName: 'Resolution' },
      { field: 'Owner', headerName: 'Owner' },
      { field: 'CreatedBy', headerName: 'Created By' },
      { field: 'CreatedAt', headerName: 'Created At' }
    ];
    
    const data = issues.map(issue => ({
      Title: issue.title,
      Description: issue.description,
      Status: issue.status,
      Impact: issue.impact,
      Resolution: issue.resolutionSummary || '',
      Owner: `${issue.owner.firstName} ${issue.owner.lastName}`,
      CreatedBy: `${issue.createdBy.firstName} ${issue.createdBy.lastName}`,
      CreatedAt: new Date(issue.createdAt).toLocaleString()
    }));
    
    exportToExcel(data, columns, `${project.name}_Issues_Register`);
  };

  // Render impact color based on level
  const getImpactColor = (impact: RiskImpact) => {
    switch (impact) {
      case RiskImpact.LOW:
        return 'success';
      case RiskImpact.MEDIUM:
        return 'warning';
      case RiskImpact.HIGH:
        return 'error';
      case RiskImpact.CRITICAL:
        return 'error';
      default:
        return 'default';
    }
  };

  // Render status color
  const getRiskStatusColor = (status: RiskStatus) => {
    switch (status) {
      case RiskStatus.IDENTIFIED:
        return 'default';
      case RiskStatus.ASSESSED:
        return 'info';
      case RiskStatus.MITIGATED:
        return 'success';
      case RiskStatus.CLOSED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getIssueStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.OPEN:
        return 'error';
      case IssueStatus.IN_PROGRESS:
        return 'warning';
      case IssueStatus.RESOLVED:
        return 'success';
      case IssueStatus.CLOSED:
        return 'default';
      default:
        return 'default';
    }
  };

  const canEditRisksIssues = hasRole([
    UserRole.PROJECT_MANAGER, 
    UserRole.SUB_PMO, 
    UserRole.MAIN_PMO, 
    UserRole.ADMIN
  ]);

  return (
    <div className="risk-issue-register">
      <Paper elevation={0} className="risk-issue-container">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="risk and issue tabs"
          >
            <Tab label={`Risks (${risks.length})`} id="risk-issue-tab-0" />
            <Tab label={`Issues (${issues.length})`} id="risk-issue-tab-1" />
          </Tabs>
        </Box>

        {/* Risks Tab */}
        <TabPanel value={tabValue} index={0}>
          <div className="register-header">
            <div className="register-title">
              <Typography variant="h6">Risk Register</Typography>
              <Typography variant="body2" color="textSecondary">
                Project: {project.name}
              </Typography>
            </div>
            <div className="register-actions">
              {canEditRisksIssues && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenRiskDialog()}
                >
                  Add Risk
                </Button>
              )}
              <IconButton onClick={handleExportRisks}>
                <DownloadIcon />
              </IconButton>
            </div>
          </div>

          <TableContainer>
            <Table stickyHeader aria-label="risks table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Created</TableCell>
                  {canEditRisksIssues && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {risks
                  .slice(risksPage * rowsPerPage, risksPage * rowsPerPage + rowsPerPage)
                  .map((risk) => (
                    <TableRow key={risk.id} hover>
                      <TableCell>{risk.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={risk.status}
                          size="small"
                          color={getRiskStatusColor(risk.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={risk.impact}
                          size="small"
                          color={getImpactColor(risk.impact) as any}
                        />
                      </TableCell>
                      <TableCell>{risk.probability}%</TableCell>
                      <TableCell>
                        {risk.owner.firstName} {risk.owner.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(risk.createdAt).toLocaleDateString()}
                      </TableCell>
                      {canEditRisksIssues && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRiskDialog(risk)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRisk(risk.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                {risks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canEditRisksIssues ? 7 : 6} align="center">
                      No risks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={risks.length}
            page={risksPage}
            onPageChange={handleRisksPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TabPanel>

        {/* Issues Tab */}
        <TabPanel value={tabValue} index={1}>
          <div className="register-header">
            <div className="register-title">
              <Typography variant="h6">Issue Register</Typography>
              <Typography variant="body2" color="textSecondary">
                Project: {project.name}
              </Typography>
            </div>
            <div className="register-actions">
              {canEditRisksIssues && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenIssueDialog()}
                >
                  Add Issue
                </Button>
              )}
              <IconButton onClick={handleExportIssues}>
                <DownloadIcon />
              </IconButton>
            </div>
          </div>

          <TableContainer>
            <Table stickyHeader aria-label="issues table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Created</TableCell>
                  {canEditRisksIssues && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {issues
                  .slice(issuesPage * rowsPerPage, issuesPage * rowsPerPage + rowsPerPage)
                  .map((issue) => (
                    <TableRow key={issue.id} hover>
                      <TableCell>{issue.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={issue.status}
                          size="small"
                          color={getIssueStatusColor(issue.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={issue.impact}
                          size="small"
                          color={getImpactColor(issue.impact) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {issue.owner.firstName} {issue.owner.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </TableCell>
                      {canEditRisksIssues && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenIssueDialog(issue)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteIssue(issue.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                {issues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canEditRisksIssues ? 6 : 5} align="center">
                      No issues found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={issues.length}
            page={issuesPage}
            onPageChange={handleIssuesPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TabPanel>
      </Paper>

      {/* Risk Dialog */}
      <Dialog
        open={isRiskDialogOpen}
        onClose={handleCloseRiskDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRisk ? 'Edit Risk' : 'Add New Risk'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <TextField
                name="title"
                label="Risk Title"
                fullWidth
                value={riskFormData.title}
                onChange={handleRiskInputChange}
                required
              />
            </Box>
            <Box>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={riskFormData.description}
                onChange={handleRiskInputChange}
                required
              />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={riskFormData.status}
                    onChange={handleRiskSelectChange}
                    label="Status"
                    required
                  >
                    <MenuItem value={RiskStatus.IDENTIFIED}>Identified</MenuItem>
                    <MenuItem value={RiskStatus.ASSESSED}>Assessed</MenuItem>
                    <MenuItem value={RiskStatus.MITIGATED}>Mitigated</MenuItem>
                    <MenuItem value={RiskStatus.CLOSED}>Closed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Impact</InputLabel>
                  <Select
                    name="impact"
                    value={riskFormData.impact}
                    onChange={handleRiskSelectChange}
                    label="Impact"
                    required
                  >
                    <MenuItem value={RiskImpact.LOW}>Low</MenuItem>
                    <MenuItem value={RiskImpact.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={RiskImpact.HIGH}>High</MenuItem>
                    <MenuItem value={RiskImpact.CRITICAL}>Critical</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Box>
              <TextField
                name="probability"
                label="Probability (%)"
                type="number"
                fullWidth
                value={riskFormData.probability}
                onChange={handleRiskInputChange}
                inputProps={{ min: 0, max: 100 }}
                required
              />
            </Box>
            <Box>
              <TextField
                name="mitigation"
                label="Mitigation Strategy"
                fullWidth
                multiline
                rows={3}
                value={riskFormData.mitigation}
                onChange={handleRiskInputChange}
                required
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRiskDialog}>Cancel</Button>
          <Button
            onClick={handleSaveRisk}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog
        open={isIssueDialogOpen}
        onClose={handleCloseIssueDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingIssue ? 'Edit Issue' : 'Add New Issue'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <TextField
                name="title"
                label="Issue Title"
                fullWidth
                value={issueFormData.title}
                onChange={handleIssueInputChange}
                required
              />
            </Box>
            <Box>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={issueFormData.description}
                onChange={handleIssueInputChange}
                required
              />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={issueFormData.status}
                    onChange={handleIssueSelectChange}
                    label="Status"
                    required
                  >
                    <MenuItem value={IssueStatus.OPEN}>Open</MenuItem>
                    <MenuItem value={IssueStatus.IN_PROGRESS}>In Progress</MenuItem>
                    <MenuItem value={IssueStatus.RESOLVED}>Resolved</MenuItem>
                    <MenuItem value={IssueStatus.CLOSED}>Closed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Impact</InputLabel>
                  <Select
                    name="impact"
                    value={issueFormData.impact}
                    onChange={handleIssueSelectChange}
                    label="Impact"
                    required
                  >
                    <MenuItem value={RiskImpact.LOW}>Low</MenuItem>
                    <MenuItem value={RiskImpact.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={RiskImpact.HIGH}>High</MenuItem>
                    <MenuItem value={RiskImpact.CRITICAL}>Critical</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Box>
              <TextField
                name="resolutionSummary"
                label="Resolution Summary"
                fullWidth
                multiline
                rows={3}
                value={issueFormData.resolutionSummary}
                onChange={handleIssueInputChange}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIssueDialog}>Cancel</Button>
          <Button
            onClick={handleSaveIssue}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RiskIssueRegister; 