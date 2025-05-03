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
  Tab
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project, ProjectStatus, UserRole } from '../types';
import { ApprovalStatus, getNextApprovalStatus } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Project[]>([]);
  const [completedApprovals, setCompletedApprovals] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
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

  const handleRefresh = () => {
    fetchApprovals();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleOpenDialog = (project: Project, type: 'approve' | 'reject') => {
    setSelectedProject(project);
    setDialogType(type);
    setComments('');
    setRejectReason('');
    setSubmitError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleApproveReject = async () => {
    if (!selectedProject || !token || !user) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return t('status.draft');
      case 'SUBMITTED':
        return t('status.submitted');
      case 'SUB_PMO_REVIEW':
        return t('status.subPmoReview');
      case 'SUB_PMO_APPROVED':
        return t('status.subPmoApproved');
      case 'MAIN_PMO_REVIEW':
        return t('status.mainPmoReview');
      case 'APPROVED':
        return t('status.approved');
      case 'REJECTED':
        return t('status.rejected');
      case 'CHANGES_REQUESTED':
        return t('status.changesRequested');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'SUBMITTED':
      case 'SUB_PMO_REVIEW':
      case 'MAIN_PMO_REVIEW':
        return 'info';
      case 'SUB_PMO_APPROVED':
        return 'secondary';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CHANGES_REQUESTED':
        return 'warning';
      default:
        return 'default';
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
              <TableCell>{t('project.name')}</TableCell>
              <TableCell>{t('project.department')}</TableCell>
              <TableCell>{t('project.projectManager')}</TableCell>
              <TableCell>{t('project.submittedDate')}</TableCell>
              <TableCell>{t('project.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.department?.name || t('common.none')}</TableCell>
                <TableCell>
                  {project.projectManager ? 
                    `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                    t('common.unassigned')}
                </TableCell>
                <TableCell>{formatDate(project.createdAt || '')}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel((project as any).approvalStatus || String(project.status))} 
                    color={getStatusColor((project as any).approvalStatus || String(project.status)) as any} 
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('approvals.title', 'Project Approvals')}
          </Typography>
          
          <IconButton onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('approvals.pending', 'Pending')} />
            <Tab label={t('approvals.completed', 'Completed')} />
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
      </Box>
      
      {/* Approval/Rejection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'approve' ? t('approvals.approveProject') : t('approvals.rejectProject')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedProject && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">{selectedProject.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('project.id')}: {selectedProject.id}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                label={t('approvals.comments')}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              {dialogType === 'reject' && (
                <TextField
                  label={t('approvals.rejectionReason')}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  error={submitError?.includes('reason')}
                  helperText={submitError?.includes('reason') ? t('approvals.reasonRequired') : t('approvals.reasonHelp')}
                />
              )}
              
              {submitError && !submitError.includes('reason') && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {submitError}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleApproveReject}
            color={dialogType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={submitLoading || (dialogType === 'reject' && !rejectReason.trim())}
          >
            {submitLoading ? (
              <CircularProgress size={24} />
            ) : dialogType === 'approve' ? (
              t('approvals.approve')
            ) : (
              t('approvals.reject')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApprovalsPage; 