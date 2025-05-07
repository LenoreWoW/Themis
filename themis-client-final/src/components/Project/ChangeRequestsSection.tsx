import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import UpdateIcon from '@mui/icons-material/Update';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../../context/AuthContext';
// Replace the import with our local function
// import { formatDate } from '../../utils/formatters';
import { ChangeRequest, ChangeRequestType, ChangeRequestStatus } from '../../types/change-request';
import { UserRole } from '../../types';
import changeRequestsService from '../../services/changeRequests';
import ChangeRequestFormDialog from './ChangeRequestDialog';
import ChangeRequestApprovalDialog from '../ChangeRequestDialog';

// Local formatDate function to avoid dependency on the formatters module
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Simple permissions check function
const canApproveProjects = (role: string): boolean => {
  return ['ADMIN', 'MAIN_PMO', 'SUB_PMO'].includes(role);
};

interface ChangeRequestsSectionProps {
  projectId: string;
}

const ChangeRequestsSection: React.FC<ChangeRequestsSectionProps> = ({ projectId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<ChangeRequestType | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null);

  // Get canApprove based on user role, hide approval buttons for executives
  const canApprove = user?.role ? (user.role !== UserRole.EXECUTIVE && canApproveProjects(user.role)) : false;

  // Fetch change requests for this project
  useEffect(() => {
    const fetchChangeRequests = async () => {
      setLoading(true);
      try {
        if (user && user.id) {
          // For demo purposes, we're not actually using a token
          const demoToken = user.id; // In a real app, we'd use user.token
          const response = await changeRequestsService.getChangeRequestsByProject(projectId, demoToken);
          if (response.success && response.data) {
            setChangeRequests(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching change requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChangeRequests();
  }, [projectId, user]);

  // Handle opening the change request dialog
  const handleRequestChange = (type: ChangeRequestType) => {
    setSelectedRequestType(type);
    setIsRequestDialogOpen(true);
  };

  // Handle change request submission
  const handleRequestSubmitted = () => {
    // Refresh the list of change requests
    if (user && user.id) {
      const demoToken = user.id; // In a real app, we'd use user.token
      changeRequestsService.getChangeRequestsByProject(projectId, demoToken).then(response => {
        if (response.success && response.data) {
          setChangeRequests(response.data);
        }
      });
    }
  };

  // Navigate to approvals page
  const handleGoToApprovals = () => {
    navigate('/approvals?tab=2'); // Navigate to the approvals page with the Change Requests tab active
  };

  // Get icon for change request type
  const getChangeTypeIcon = (type: ChangeRequestType) => {
    switch (type) {
      case ChangeRequestType.SCHEDULE:
        return <ScheduleIcon />;
      case ChangeRequestType.BUDGET:
        return <MonetizationOnIcon />;
      case ChangeRequestType.SCOPE:
        return <ClassIcon />;
      case ChangeRequestType.RESOURCE:
        return <AssignmentIndIcon />;
      case ChangeRequestType.STATUS:
        return <UpdateIcon />;
      default:
        return <MoreVertIcon />;
    }
  };

  // Add a function to handle opening the approval dialog
  const handleOpenApprovalDialog = (changeRequest: ChangeRequest) => {
    setSelectedChangeRequest(changeRequest);
    setApprovalDialogOpen(true);
  };

  // Add a function to handle closing the approval dialog
  const handleCloseApprovalDialog = () => {
    setApprovalDialogOpen(false);
    setSelectedChangeRequest(null);
  };

  // Add a function to handle approval success
  const handleApprovalSuccess = () => {
    // Refresh change requests
    handleRequestSubmitted();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Change Requests</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleRequestChange(ChangeRequestType.SCHEDULE)}
            sx={{ mr: 1 }}
          >
            Schedule
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleRequestChange(ChangeRequestType.BUDGET)}
            sx={{ mr: 1 }}
          >
            Budget
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleRequestChange(ChangeRequestType.STATUS)}
          >
            Status
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : changeRequests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No change requests have been submitted for this project.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => setIsRequestDialogOpen(true)}
          >
            Submit Change Request
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changeRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getChangeTypeIcon(request.type as ChangeRequestType)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {request.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={request.justification}>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.description}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {`${request.requestedBy.firstName} ${request.requestedBy.lastName}`}
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(request.requestedAt))}
                  </TableCell>
                  <TableCell>
                    {(request.status === ChangeRequestStatus.PENDING_SUB_PMO || 
                      request.status === ChangeRequestStatus.PENDING_MAIN_PMO) && (
                      <Chip 
                        label="Pending" 
                        color="warning" 
                        size="small" 
                        icon={<ScheduleIcon fontSize="small" />} 
                      />
                    )}
                    {request.status === ChangeRequestStatus.APPROVED && (
                      <Chip 
                        label="Approved" 
                        color="success" 
                        size="small" 
                        icon={<CheckCircleIcon fontSize="small" />} 
                      />
                    )}
                    {(request.status === ChangeRequestStatus.REJECTED || 
                      request.status === ChangeRequestStatus.REJECTED_BY_SUB_PMO) && (
                      <Chip 
                        label="Rejected" 
                        color="error" 
                        size="small" 
                        icon={<CancelIcon fontSize="small" />} 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      {(request.status === ChangeRequestStatus.PENDING_SUB_PMO || 
                        request.status === ChangeRequestStatus.PENDING_MAIN_PMO) && canApprove && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleOpenApprovalDialog(request)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenApprovalDialog(request)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Change Request Dialog */}
      <ChangeRequestFormDialog
        open={isRequestDialogOpen}
        onClose={() => setIsRequestDialogOpen(false)}
        projectId={projectId}
        onSubmitted={handleRequestSubmitted}
        changeRequestType={selectedRequestType}
      />

      {/* Approval Dialog */}
      <ChangeRequestApprovalDialog
        open={approvalDialogOpen}
        onClose={handleCloseApprovalDialog}
        changeRequest={selectedChangeRequest}
        onSuccess={handleApprovalSuccess}
      />
    </Box>
  );
};

export default ChangeRequestsSection; 