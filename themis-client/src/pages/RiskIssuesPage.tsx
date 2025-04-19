import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Risk, RiskStatus, RiskImpact, Issue, IssueStatus, Project } from '../types';
import api from '../services/api';

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
      id={`risks-issues-tabpanel-${index}`}
      aria-labelledby={`risks-issues-tab-${index}`}
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
    id: `risks-issues-tab-${index}`,
    'aria-controls': `risks-issues-tabpanel-${index}`,
  };
}

const RiskIssuesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRiskDialog, setOpenRiskDialog] = useState(false);
  const [openIssueDialog, setOpenIssueDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'risk' | 'issue'} | null>(null);
  
  // Form state for risk
  const [riskForm, setRiskForm] = useState<Partial<Risk>>({
    title: '',
    description: '',
    status: RiskStatus.IDENTIFIED,
    impact: RiskImpact.MEDIUM,
    probability: 50,
    mitigation: ''
  });
  
  // Form state for issue
  const [issueForm, setIssueForm] = useState<Partial<Issue>>({
    title: '',
    description: '',
    status: IssueStatus.OPEN,
    impact: RiskImpact.MEDIUM,
    resolutionSummary: ''
  });
  
  const [editMode, setEditMode] = useState(false);
  
  useEffect(() => {
    // Fetch projects
    const fetchProjects = async () => {
      try {
        const response = await api.projects.getAllProjects(token || '');
        if (response.success && response.data) {
          setProjects(response.data);
          
          // Select the first project by default if available
          if (response.data.length > 0 && !selectedProjectId) {
            setSelectedProjectId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, [token]);
  
  useEffect(() => {
    if (selectedProjectId) {
      fetchRisksAndIssues();
    }
  }, [selectedProjectId, token]);
  
  const fetchRisksAndIssues = async () => {
    setLoading(true);
    
    try {
      // Fetch risks
      const risksResponse = await api.risks.getAllRisks(selectedProjectId, token || '');
      if (risksResponse.success && risksResponse.data) {
        setRisks(risksResponse.data);
      }
      
      // Fetch issues
      const issuesResponse = await api.issues.getAllIssues(selectedProjectId, token || '');
      if (issuesResponse.success && issuesResponse.data) {
        setIssues(issuesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching risks and issues:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    setSelectedProjectId(event.target.value);
  };
  
  const handleOpenRiskDialog = (risk?: Risk) => {
    if (risk) {
      setRiskForm(risk);
      setEditMode(true);
    } else {
      setRiskForm({
        title: '',
        description: '',
        status: RiskStatus.IDENTIFIED,
        impact: RiskImpact.MEDIUM,
        probability: 50,
        mitigation: ''
      });
      setEditMode(false);
    }
    setOpenRiskDialog(true);
  };
  
  const handleOpenIssueDialog = (issue?: Issue) => {
    if (issue) {
      setIssueForm(issue);
      setEditMode(true);
    } else {
      setIssueForm({
        title: '',
        description: '',
        status: IssueStatus.OPEN,
        impact: RiskImpact.MEDIUM,
        resolutionSummary: ''
      });
      setEditMode(false);
    }
    setOpenIssueDialog(true);
  };
  
  const handleCloseRiskDialog = () => {
    setOpenRiskDialog(false);
  };
  
  const handleCloseIssueDialog = () => {
    setOpenIssueDialog(false);
  };
  
  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRiskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRiskSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setRiskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProbabilityChange = (event: Event, newValue: number | number[]) => {
    setRiskForm(prev => ({
      ...prev,
      probability: newValue as number
    }));
  };
  
  const handleIssueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIssueForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleIssueSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setIssueForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveRisk = async () => {
    if (!selectedProjectId || !riskForm.title || !riskForm.description) return;
    
    try {
      if (editMode && riskForm.id) {
        // Update existing risk
        const response = await api.risks.updateRisk(
          selectedProjectId,
          riskForm.id,
          {
            ...riskForm,
            owner: user || undefined
          },
          token || ''
        );
        
        if (response.success) {
          setRisks(prev => prev.map(r => (r.id === riskForm.id ? response.data : r)));
        }
      } else {
        // Create new risk
        const response = await api.risks.createRisk(
          selectedProjectId,
          {
            ...riskForm,
            projectId: selectedProjectId,
            owner: user || undefined,
            createdBy: user || undefined
          },
          token || ''
        );
        
        if (response.success) {
          setRisks(prev => [...prev, response.data]);
        }
      }
      
      setOpenRiskDialog(false);
    } catch (error) {
      console.error('Error saving risk:', error);
    }
  };
  
  const saveIssue = async () => {
    if (!selectedProjectId || !issueForm.title || !issueForm.description) return;
    
    try {
      if (editMode && issueForm.id) {
        // Update existing issue
        const response = await api.issues.updateIssue(
          selectedProjectId,
          issueForm.id,
          {
            ...issueForm,
            owner: user || undefined
          },
          token || ''
        );
        
        if (response.success) {
          setIssues(prev => prev.map(i => (i.id === issueForm.id ? response.data : i)));
        }
      } else {
        // Create new issue
        const response = await api.issues.createIssue(
          selectedProjectId,
          {
            ...issueForm,
            projectId: selectedProjectId,
            owner: user || undefined,
            createdBy: user || undefined
          },
          token || ''
        );
        
        if (response.success) {
          setIssues(prev => [...prev, response.data]);
        }
      }
      
      setOpenIssueDialog(false);
    } catch (error) {
      console.error('Error saving issue:', error);
    }
  };
  
  const handleDeleteConfirm = (id: string, type: 'risk' | 'issue') => {
    setItemToDelete({ id, type });
    setDeleteConfirmDialog(true);
  };
  
  const handleDelete = async () => {
    if (!itemToDelete || !selectedProjectId) return;
    
    try {
      if (itemToDelete.type === 'risk') {
        await api.risks.deleteRisk(selectedProjectId, itemToDelete.id, token || '');
        setRisks(prev => prev.filter(r => r.id !== itemToDelete.id));
      } else {
        await api.issues.deleteIssue(selectedProjectId, itemToDelete.id, token || '');
        setIssues(prev => prev.filter(i => i.id !== itemToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeleteConfirmDialog(false);
      setItemToDelete(null);
    }
  };
  
  const getRiskStatusChip = (status: RiskStatus) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case RiskStatus.IDENTIFIED:
        color = 'warning';
        break;
      case RiskStatus.ASSESSED:
        color = 'info';
        break;
      case RiskStatus.MITIGATED:
        color = 'success';
        break;
      case RiskStatus.CLOSED:
        color = 'default';
        break;
    }
    
    return <Chip label={status} color={color} size="small" />;
  };
  
  const getImpactChip = (impact: RiskImpact) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (impact) {
      case RiskImpact.LOW:
        color = 'success';
        break;
      case RiskImpact.MEDIUM:
        color = 'warning';
        break;
      case RiskImpact.HIGH:
        color = 'error';
        break;
      case RiskImpact.CRITICAL:
        color = 'secondary';
        break;
    }
    
    return <Chip label={impact} color={color} size="small" />;
  };
  
  const getIssueStatusChip = (status: IssueStatus) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case IssueStatus.OPEN:
        color = 'error';
        break;
      case IssueStatus.IN_PROGRESS:
        color = 'warning';
        break;
      case IssueStatus.RESOLVED:
        color = 'success';
        break;
      case IssueStatus.CLOSED:
        color = 'default';
        break;
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Risks & Issues
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage project risks and issues
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel id="project-select-label">Project</InputLabel>
          <Select
            labelId="project-select-label"
            id="project-select"
            value={selectedProjectId}
            label="Project"
            onChange={handleProjectChange}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="risks and issues tabs">
            <Tab label="Risks" {...a11yProps(0)} />
            <Tab label="Issues" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !selectedProjectId ? (
            <Alert severity="info">
              <AlertTitle>No Project Selected</AlertTitle>
              Please select a project to view or manage risks.
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenRiskDialog()}
                >
                  Add Risk
                </Button>
              </Box>
              
              {risks.length === 0 ? (
                <Alert severity="info">
                  <AlertTitle>No Risks Found</AlertTitle>
                  No risks have been added to this project yet. Click the "Add Risk" button to create a new risk.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Impact</TableCell>
                        <TableCell>Probability</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {risks.map((risk) => (
                        <TableRow key={risk.id}>
                          <TableCell>{risk.title}</TableCell>
                          <TableCell>{getRiskStatusChip(risk.status)}</TableCell>
                          <TableCell>{getImpactChip(risk.impact)}</TableCell>
                          <TableCell>{risk.probability}%</TableCell>
                          <TableCell>{risk.owner?.firstName} {risk.owner?.lastName}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleOpenRiskDialog(risk)} title="Edit">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteConfirm(risk.id, 'risk')} title="Delete">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !selectedProjectId ? (
            <Alert severity="info">
              <AlertTitle>No Project Selected</AlertTitle>
              Please select a project to view or manage issues.
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenIssueDialog()}
                >
                  Add Issue
                </Button>
              </Box>
              
              {issues.length === 0 ? (
                <Alert severity="info">
                  <AlertTitle>No Issues Found</AlertTitle>
                  No issues have been added to this project yet. Click the "Add Issue" button to create a new issue.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Impact</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell>{issue.title}</TableCell>
                          <TableCell>{getIssueStatusChip(issue.status)}</TableCell>
                          <TableCell>{getImpactChip(issue.impact)}</TableCell>
                          <TableCell>{issue.owner?.firstName} {issue.owner?.lastName}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleOpenIssueDialog(issue)} title="Edit">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteConfirm(issue.id, 'issue')} title="Delete">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </TabPanel>
      </Paper>
      
      {/* Risk Dialog */}
      <Dialog open={openRiskDialog} onClose={handleCloseRiskDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Risk' : 'Add Risk'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={riskForm.title || ''}
              onChange={handleRiskChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={riskForm.description || ''}
              onChange={handleRiskChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={riskForm.status || RiskStatus.IDENTIFIED}
                onChange={handleRiskSelectChange}
                label="Status"
              >
                <MenuItem value={RiskStatus.IDENTIFIED}>Identified</MenuItem>
                <MenuItem value={RiskStatus.ASSESSED}>Assessed</MenuItem>
                <MenuItem value={RiskStatus.MITIGATED}>Mitigated</MenuItem>
                <MenuItem value={RiskStatus.CLOSED}>Closed</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Impact</InputLabel>
              <Select
                name="impact"
                value={riskForm.impact || RiskImpact.MEDIUM}
                onChange={handleRiskSelectChange}
                label="Impact"
              >
                <MenuItem value={RiskImpact.LOW}>Low</MenuItem>
                <MenuItem value={RiskImpact.MEDIUM}>Medium</MenuItem>
                <MenuItem value={RiskImpact.HIGH}>High</MenuItem>
                <MenuItem value={RiskImpact.CRITICAL}>Critical</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography id="probability-slider-label" gutterBottom>
                Probability: {riskForm.probability}%
              </Typography>
              <Slider
                aria-labelledby="probability-slider-label"
                value={riskForm.probability || 50}
                onChange={handleProbabilityChange}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Mitigation Plan"
              name="mitigation"
              value={riskForm.mitigation || ''}
              onChange={handleRiskChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRiskDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveRisk}>Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Issue Dialog */}
      <Dialog open={openIssueDialog} onClose={handleCloseIssueDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Issue' : 'Add Issue'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={issueForm.title || ''}
              onChange={handleIssueChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={issueForm.description || ''}
              onChange={handleIssueChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={issueForm.status || IssueStatus.OPEN}
                onChange={handleIssueSelectChange}
                label="Status"
              >
                <MenuItem value={IssueStatus.OPEN}>Open</MenuItem>
                <MenuItem value={IssueStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={IssueStatus.RESOLVED}>Resolved</MenuItem>
                <MenuItem value={IssueStatus.CLOSED}>Closed</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Impact</InputLabel>
              <Select
                name="impact"
                value={issueForm.impact || RiskImpact.MEDIUM}
                onChange={handleIssueSelectChange}
                label="Impact"
              >
                <MenuItem value={RiskImpact.LOW}>Low</MenuItem>
                <MenuItem value={RiskImpact.MEDIUM}>Medium</MenuItem>
                <MenuItem value={RiskImpact.HIGH}>High</MenuItem>
                <MenuItem value={RiskImpact.CRITICAL}>Critical</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Resolution Summary"
              name="resolutionSummary"
              value={issueForm.resolutionSummary || ''}
              onChange={handleIssueChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIssueDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveIssue}>Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onClose={() => setDeleteConfirmDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskIssuesPage; 