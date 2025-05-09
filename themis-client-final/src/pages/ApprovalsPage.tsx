import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Collapse,
  Grid
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project, ProjectStatus, UserRole } from '../types';
import { ApprovalStatus, getNextApprovalStatus } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { ChangeRequest, ChangeRequestType, ChangeRequestStatus } from '../types/change-request';
import changeRequestsService from '../services/changeRequests';
import { canApproveProjects } from '../utils/permissions';
import { cleanupMockData } from '../utils/cleanupUtils';

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
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ApprovalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tab from URL query parameter or from location state
  const getInitialTabValue = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam !== null) {
      const tabValue = parseInt(tabParam);
      return isNaN(tabValue) ? 0 : tabValue;
    }
    
    // Check for tab parameter in the URL path (e.g., /approvals/2)
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && !isNaN(Number(lastPart))) {
      return Number(lastPart);
    }
    
    // Check if we got here via change-requests redirect
    if (location.pathname.includes('change-requests')) {
      return 2; // Change requests tab
    }
    
    return location.state?.activeTab ?? 0;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Project[]>([]);
  const [completedApprovals, setCompletedApprovals] = useState<Project[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [crLoading, setCrLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the initial tab value from URL or location state
  const [tabValue, setTabValue] = useState(getInitialTabValue());

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null);
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Track expanded state for each change request
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});
  
  // Toggle expanded state for a change request
  const toggleExpanded = (requestId: string) => {
    setExpandedState(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  useEffect(() => {
    fetchApprovals();
    fetchChangeRequests();
  }, [token]);

  const fetchApprovals = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.projects.getAllProjects('');
      if (response.data) {
        const allProjects = response.data;

        // Filter projects by approval status
        const pending = allProjects.filter((project: Project) => {
          const status = String(project.status);
          return status === 'SUBMITTED' || 
                 status === 'SUB_PMO_REVIEW' || 
                 status === 'MAIN_PMO_REVIEW' || 
                 status === 'SUB_PMO_APPROVED';
        });
        
        const completed = allProjects.filter((project: Project) => {
          const status = String(project.status);
          return status === 'APPROVED' || 
                 status === 'REJECTED' || 
                 status === 'CHANGES_REQUESTED';
        });

        setProjects(allProjects);
        setPendingApprovals(pending);
        setCompletedApprovals(completed);
      } else {
        setError('Failed to fetch approvals');
      }
    } catch (err) {
      setError('An error occurred while fetching approvals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    setCrLoading(true);
    setError(null);

    try {
      // In a real app, we would fetch only pending change requests that the current user can approve
      const response = await changeRequestsService.getAllChangeRequests(token);
      if (response.success && response.data) {
        // Filter to only show pending change requests that require approval
        const pendingRequests = response.data.filter(cr => 
          cr.status === ChangeRequestStatus.PENDING_SUB_PMO || 
          cr.status === ChangeRequestStatus.PENDING_MAIN_PMO
        );
        setChangeRequests(pendingRequests);
      } else {
        setError('Failed to fetch change requests');
      }
    } catch (err) {
      setError('An error occurred while fetching change requests');
      console.error(err);
    } finally {
      setCrLoading(false);
    }
  };

  const handleRefresh = () => {
    // Clean up mock data first
    cleanupMockData();
    // Then fetch fresh data
    fetchApprovals();
    fetchChangeRequests();
  };

  // Update URL when tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    navigate(`/approvals${newValue > 0 ? `?tab=${newValue}` : ''}`, { replace: true });
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleOpenDialog = (project: Project, type: 'approve' | 'reject') => {
    setSelectedProject(project);
    setSelectedChangeRequest(null);
    setDialogType(type);
    setComments('');
    setRejectReason('');
    setSubmitError(null);
    setOpenDialog(true);
  };

  const handleOpenChangeRequestDialog = (changeRequest: ChangeRequest, type: 'approve' | 'reject') => {
    setSelectedChangeRequest(changeRequest);
    setSelectedProject(null);
    setDialogType(type);
    setComments('');
    setRejectReason('');
    setSubmitError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
    setSelectedChangeRequest(null);
  };

  const handleApproveReject = async () => {
    // Handle project approval
    if (selectedProject && !selectedChangeRequest) {
      if (!token || !user) {
        setSubmitError('Invalid project or user session');
        return;
      }

      // Validate reject reason is provided when rejecting
      if (dialogType === 'reject' && !rejectReason.trim()) {
        setSubmitError('Rejection reason is required');
        return;
      }

      setSubmitLoading(true);
      setSubmitError(null);

      try {
        let nextStatus: ApprovalStatus | null;
        const action = dialogType === 'approve' ? 'APPROVE' : 'REJECT';
        const currentStatus = (selectedProject as any).approvalStatus || ApprovalStatus.SUBMITTED;
        
        nextStatus = getNextApprovalStatus(currentStatus, user.role, action);
        
        if (!nextStatus) {
          setSubmitError('Cannot determine next approval status');
          setSubmitLoading(false);
          return;
        }

        // Prepare reviewComments, combining comments with rejection reason if applicable
        const reviewComments = dialogType === 'reject' 
          ? `${comments ? comments + '\n\n' : ''}REJECTION REASON: ${rejectReason}`
          : comments;

        // Prepare project data with review history
        const projectData = {
          ...selectedProject,
          approvalStatus: nextStatus,
          reviewHistory: [
            ...((selectedProject as any)?.reviewHistory || []),
            {
              id: Date.now().toString(),
              text: reviewComments,
              createdAt: new Date().toISOString(),
              user: user,
              action: action
            }
          ],
          lastReviewedBy: user,
          lastReviewedAt: new Date().toISOString(),
          comments: reviewComments
        };

        // Update project
        const response = await api.projects.updateProject(
          selectedProject.id, 
          projectData,
          localStorage.getItem('token') || ''
        );

        if (response.data) {
          handleCloseDialog();
          fetchApprovals();
        } else {
          setSubmitError('Failed to update project');
        }
      } catch (err) {
        setSubmitError('An error occurred while updating project');
        console.error(err);
      } finally {
        setSubmitLoading(false);
      }
    } 
    // Handle change request approval
    else if (selectedChangeRequest && !selectedProject) {
      if (!token || !user) {
        setSubmitError('Invalid change request or user session');
        return;
      }

      // Validate reject reason is provided when rejecting
      if (dialogType === 'reject' && !rejectReason.trim()) {
        setSubmitError('Rejection reason is required');
        return;
      }

      setSubmitLoading(true);
      setSubmitError(null);

      try {
        if (dialogType === 'approve') {
          const response = await changeRequestsService.approveChangeRequest(
            selectedChangeRequest.id,
            user.id,
            `${user.firstName} ${user.lastName}`,
            user.role === UserRole.MAIN_PMO || user.role === UserRole.ADMIN,
            comments,
            token
          );

          if (response.success) {
            handleCloseDialog();
            fetchChangeRequests();
          } else {
            setSubmitError(response.message || 'Failed to approve change request');
          }
        } else {
          const response = await changeRequestsService.rejectChangeRequest(
            selectedChangeRequest.id,
            user.id,
            `${user.firstName} ${user.lastName}`,
            rejectReason,
            token
          );

          if (response.success) {
            handleCloseDialog();
            fetchChangeRequests();
          } else {
            setSubmitError(response.message || 'Failed to reject change request');
          }
        }
      } catch (err) {
        setSubmitError('An error occurred while processing the change request');
        console.error(err);
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const canApprove = (project: Project): boolean => {
    const isOwnProject = project.projectManager?.id === user?.id;
    
    if (!user) return false;
    
    // Admin can approve anything
    if (user.role === UserRole.ADMIN) return true;
    
    // SUB_PMO can approve submitted projects that are not their own
    if (user.role === UserRole.SUB_PMO && !isOwnProject && 
        ((project as any).approvalStatus === ApprovalStatus.SUBMITTED || 
        (project.status === ProjectStatus.PLANNING))) {
      return true;
    }
    
    // MAIN_PMO can approve projects that have been approved by SUB_PMO
    if (user.role === UserRole.MAIN_PMO && 
        ((project as any).approvalStatus === ApprovalStatus.SUB_PMO_APPROVED)) {
      return true;
    }
    
    return false;
  };

  const canApproveChangeRequest = (changeRequest: ChangeRequest): boolean => {
    if (!user) return false;
    
    // Executives can only view, not approve
    if (user.role === UserRole.EXECUTIVE) {
      return false;
    }
    
    // Admin can approve any change request
    if (user.role === UserRole.ADMIN) return true;
    
    // Check based on status
    if (changeRequest.status === ChangeRequestStatus.PENDING_SUB_PMO && user.role === UserRole.SUB_PMO) {
      return true;
    }
    
    if (changeRequest.status === ChangeRequestStatus.PENDING_MAIN_PMO && user.role === UserRole.MAIN_PMO) {
      return true;
    }
    
    return false;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case ChangeRequestStatus.PENDING_SUB_PMO:
      case ChangeRequestStatus.PENDING_MAIN_PMO:
        return t('common.pending');
      case ChangeRequestStatus.APPROVED:
      case ChangeRequestStatus.APPROVED_BY_SUB_PMO:
        return t('common.approved');
      case ChangeRequestStatus.REJECTED:
      case ChangeRequestStatus.REJECTED_BY_SUB_PMO:
        return t('common.rejected');
      case ChangeRequestStatus.CHANGES_REQUESTED:
        return t('common.changesRequested');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ChangeRequestStatus.PENDING_SUB_PMO:
      case ChangeRequestStatus.PENDING_MAIN_PMO:
        return 'warning';
      case ChangeRequestStatus.APPROVED:
      case ChangeRequestStatus.APPROVED_BY_SUB_PMO:
        return 'success';
      case ChangeRequestStatus.REJECTED:
      case ChangeRequestStatus.REJECTED_BY_SUB_PMO:
        return 'error';
      case ChangeRequestStatus.CHANGES_REQUESTED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getChangeRequestTypeLabel = (type: string) => {
    switch (type) {
      case ChangeRequestType.SCHEDULE:
        return t('changeRequest.types.schedule', 'Schedule Change');
      case ChangeRequestType.BUDGET:
        return t('changeRequest.types.budget', 'Budget Change');
      case ChangeRequestType.SCOPE:
        return t('changeRequest.types.scope', 'Scope Change');
      case ChangeRequestType.RESOURCE:
        return t('changeRequest.types.resource', 'Resource Change');
      case ChangeRequestType.STATUS:
        return t('changeRequest.types.status', 'Status Change');
      case ChangeRequestType.CLOSURE:
        return t('changeRequest.types.closure', 'Project Closure');
      default:
        return t('changeRequest.types.other', 'Other Change');
    }
  };

  const renderApprovalsTable = (items: Project[]) => {
    if (items.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('approvals.noItemsFound')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.id')}</TableCell>
              <TableCell>{t('common.projectManager')}</TableCell>
              <TableCell>{t('common.department')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.id.substring(0, 8)}</TableCell>
                <TableCell>
                  {project.projectManager?.firstName} {project.projectManager?.lastName}
                </TableCell>
                <TableCell>{project.department?.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(String(project.status))} 
                    color={getStatusColor(String(project.status)) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleViewProject(project.id)}
                    sx={{ mr: 1 }}
                  >
                    {t('common.view')}
                  </Button>
                  
                  {canApprove(project) && tabValue === 0 && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleOpenDialog(project, 'approve')}
                        sx={{ mr: 1 }}
                      >
                        {t('approvals.approve')}
                      </Button>
                      
                      <Button
                        size="small"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleOpenDialog(project, 'reject')}
                      >
                        {t('approvals.reject')}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChangeRequestsTable = () => {
    if (changeRequests.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('approvals.noChangeRequestsFound', 'No pending change requests found')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%"></TableCell>
              <TableCell>{t('common.type')}</TableCell>
              <TableCell>{t('common.project')}</TableCell>
              <TableCell>{t('common.requestedBy')}</TableCell>
              <TableCell>{t('common.requestedAt')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell>{t('common.approvalLevel')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeRequests.map((request) => {
              // Find project name instead of showing just the ID
              const project = pendingApprovals.find(p => p.id === request.projectId) || 
                            completedApprovals.find(p => p.id === request.projectId);
              const projectName = project ? project.name : request.projectId;
              
              // Format the approval level to be more readable
              const formattedApprovalLevel = request.status === ChangeRequestStatus.PENDING_SUB_PMO
                ? t('common.subPMO', 'Sub PMO')
                : request.status === ChangeRequestStatus.PENDING_MAIN_PMO
                  ? t('common.mainPMO', 'Main PMO')
                  : request.status;

              // Check if this item is expanded
              const isExpanded = expandedState[request.id] || false;

              return (
                <React.Fragment key={request.id}>
                  <TableRow 
                    hover
                    onClick={() => toggleExpanded(request.id)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(request.id);
                        }}
                      >
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getChangeRequestTypeLabel(request.type)} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{projectName}</TableCell>
                    <TableCell>
                      {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                    </TableCell>
                    <TableCell>{formatDate(request.requestedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(request.status)} 
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formattedApprovalLevel}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProject(request.projectId);
                        }}
                        sx={{ mr: 1 }}
                      >
                        {t('common.viewProject')}
                      </Button>
                      
                      {canApproveChangeRequest(request) && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<ApproveIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChangeRequestDialog(request, 'approve');
                            }}
                            sx={{ mr: 1 }}
                          >
                            {t('approvals.approve')}
                          </Button>
                          
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChangeRequestDialog(request, 'reject');
                            }}
                          >
                            {t('approvals.reject')}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            {t('changeRequest.details', 'Change Request Details')}
                          </Typography>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {t('changeRequest.description', 'Description')}:
                              </Typography>
                              <Typography variant="body1">
                                {request.description || '-'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {t('changeRequest.justification', 'Justification')}:
                              </Typography>
                              <Typography variant="body1">
                                {request.justification || '-'}
                              </Typography>
                            </Grid>

                            {/* Type-specific details */}
                            {request.type === ChangeRequestType.SCHEDULE && request.newEndDate && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {t('changeRequest.newEndDate', 'New End Date')}:
                                </Typography>
                                <Typography variant="body1">
                                  {new Date(request.newEndDate).toLocaleDateString()}
                                </Typography>
                              </Grid>
                            )}
                            
                            {request.type === ChangeRequestType.BUDGET && request.newBudget && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {t('changeRequest.newBudget', 'New Budget')}:
                                </Typography>
                                <Typography variant="body1">
                                  ${request.newBudget.toLocaleString()}
                                </Typography>
                              </Grid>
                            )}
                            
                            {request.type === ChangeRequestType.RESOURCE && request.newManager && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {t('changeRequest.newManager', 'New Project Manager')}:
                                </Typography>
                                <Typography variant="body1">
                                  {request.newManager}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('approvals.title', 'Approvals Dashboard')}
          </Typography>
          
          <Box>
            <IconButton onClick={handleRefresh} disabled={loading || crLoading}>
              {loading || crLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('approvals.pendingProjects', 'Pending Projects')} />
            <Tab label={t('approvals.completedProjects', 'Completed Projects')} />
            <Tab label={t('approvals.changeRequests', 'Change Requests')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderApprovalsTable(pendingApprovals)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderApprovalsTable(completedApprovals)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {crLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderChangeRequestsTable()
          )}
        </TabPanel>
      </Box>
      
      {/* Approval/Rejection Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'approve' 
            ? t('approvals.approveTitle', 'Approve') 
            : t('approvals.rejectTitle', 'Reject')}
          {' '}
          {selectedProject 
            ? t('approvals.project', 'Project') 
            : t('approvals.changeRequest', 'Change Request')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedProject.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('common.id')}: {selectedProject.id.substring(0, 8)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('common.projectManager')}: {selectedProject.projectManager?.firstName} {selectedProject.projectManager?.lastName}
              </Typography>
            </Box>
          )}
          
          {selectedChangeRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {getChangeRequestTypeLabel(selectedChangeRequest.type)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('common.projectId')}: {selectedChangeRequest.projectId}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('common.requestedBy')}: {selectedChangeRequest.requestedBy?.firstName} {selectedChangeRequest.requestedBy?.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('common.requestedAt')}: {formatDate(selectedChangeRequest.requestedAt)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1">
                {t('common.description')}: {selectedChangeRequest.description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {t('common.justification')}: {selectedChangeRequest.justification}
              </Typography>
              
              {selectedChangeRequest.type === ChangeRequestType.SCHEDULE && selectedChangeRequest.newEndDate && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {t('common.newEndDate')}: {formatDate(selectedChangeRequest.newEndDate)}
                </Typography>
              )}
              
              {selectedChangeRequest.type === ChangeRequestType.BUDGET && selectedChangeRequest.newBudget && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {t('common.newBudget')}: ${selectedChangeRequest.newBudget.toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('approvals.comments')}:
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={t('approvals.commentsPlaceholder', 'Enter your comments (optional)')}
          />
          
          {dialogType === 'reject' && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                {t('approvals.rejectionReason')}*:
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('approvals.rejectionReasonPlaceholder', 'Enter reason for rejection')}
                required
                error={submitError?.includes('Rejection reason')}
                helperText={submitError?.includes('Rejection reason') ? submitError : ''}
              />
            </>
          )}
          
          {submitError && !submitError.includes('Rejection reason') && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          
          <Button 
            onClick={handleApproveReject}
            color={dialogType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={submitLoading}
            startIcon={
              submitLoading 
                ? <CircularProgress size={24} />
                : dialogType === 'approve' 
                  ? <ApproveIcon /> 
                  : <RejectIcon />
            }
          >
            {dialogType === 'approve' 
              ? t('approvals.approve', 'Approve') 
              : t('approvals.reject', 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApprovalsPage; 