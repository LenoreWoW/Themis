import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, TextField, Chip, Grid, Divider, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';

import { useAuth } from '../../context/AuthContext';
import { ChangeRequest, ChangeRequestStatus, ChangeRequestType } from '../../types/change-request';
import { UserRole } from '../../types';
import changeRequestService from '../../services/change-request';
import { isFromSameDepartment, getNextApprovalStatus, ApprovalStatus } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const ChangeRequestApproval: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [changeRequest, setChangeRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChangeRequest = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await changeRequestService.getChangeRequestById(id);
        if (response.success && response.data) {
          setChangeRequest(response.data);
        } else {
          setError('Failed to load change request details');
        }
      } catch (err) {
        setError('An error occurred while fetching the change request');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChangeRequest();
  }, [id]);
  
  const handleStatusUpdate = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    if (!changeRequest || !currentUser || !id) return;
    
    const sameDepartment = isFromSameDepartment(currentUser, changeRequest.department?.id);
    
    // Get next status using the unified function
    const nextApprovalStatus = getNextApprovalStatus(
      changeRequest.status as unknown as ApprovalStatus,
      currentUser.role,
      action,
      sameDepartment,
      'CHANGE_REQUEST'
    );
    
    // Convert from ApprovalStatus to ChangeRequestStatus
    let nextStatus: ChangeRequestStatus;
    
    if (!nextApprovalStatus) {
      setError('Invalid status transition');
      return;
    }
    
    // Map ApprovalStatus to ChangeRequestStatus
    switch (nextApprovalStatus) {
      case ApprovalStatus.APPROVED:
        nextStatus = ChangeRequestStatus.APPROVED;
        break;
      case ApprovalStatus.APPROVED_BY_SUB_PMO:
        nextStatus = ChangeRequestStatus.APPROVED_BY_SUB_PMO;
        break;
      case ApprovalStatus.REJECTED:
        nextStatus = ChangeRequestStatus.REJECTED;
        break;
      case ApprovalStatus.REJECTED_BY_SUB_PMO:
        nextStatus = ChangeRequestStatus.REJECTED_BY_SUB_PMO;
        break;
      case ApprovalStatus.PENDING_MAIN_PMO:
        nextStatus = ChangeRequestStatus.PENDING_MAIN_PMO;
        break;
      case ApprovalStatus.PENDING_SUB_PMO:
        nextStatus = ChangeRequestStatus.PENDING_SUB_PMO;
        break;
      case ApprovalStatus.CHANGES_REQUESTED:
        nextStatus = ChangeRequestStatus.CHANGES_REQUESTED;
        break;
      default:
        setError('Unsupported status transition');
        return;
    }
    
    // Check if user has permission
    if (!canTakeAction(changeRequest.status, currentUser.role, sameDepartment)) {
      setError('You do not have permission to perform this action');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reviewerData = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        role: currentUser.role
      };
      
      const response = await changeRequestService.updateChangeRequestStatus(
        id, 
        nextStatus,
        reviewerData,
        comments
      );
      
      if (response.success) {
        // If the change request was approved by Main PMO, apply the changes to the project
        if (nextStatus === ChangeRequestStatus.APPROVED) {
          await changeRequestService.applyChangeRequest(id);
        }
        
        navigate('/change-requests');
      } else {
        setError('Failed to update change request status');
      }
    } catch (err) {
      setError('An error occurred while updating the status');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Check if a user can take action on a change request
  const canTakeAction = (
    status: ChangeRequestStatus, 
    userRole: string, 
    isSameDepartment: boolean
  ): boolean => {
    // Executives can only view, not take actions
    if (userRole === UserRole.EXECUTIVE) {
      return false;
    }
    
    if (status === ChangeRequestStatus.PENDING_SUB_PMO) {
      return (userRole === UserRole.SUB_PMO && isSameDepartment) || 
             userRole === UserRole.MAIN_PMO || 
             userRole === UserRole.ADMIN;
    }
    
    if (status === ChangeRequestStatus.PENDING_MAIN_PMO) {
      return userRole === UserRole.MAIN_PMO || userRole === UserRole.ADMIN;
    }
    
    return false;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !changeRequest) {
    return (
      <Box p={3}>
        <Typography color="error">{error || 'Change request not found'}</Typography>
        <Button variant="outlined" onClick={() => navigate('/change-requests')} sx={{ mt: 2 }}>
          Back to Change Requests
        </Button>
      </Box>
    );
  }
  
  const canReview = () => {
    if (!currentUser) return false;
    
    const sameDepartment = isFromSameDepartment(currentUser, changeRequest.department?.id);
    return canTakeAction(changeRequest.status, currentUser.role, sameDepartment);
  };
  
  const getStatusChipColor = (status: ChangeRequestStatus) => {
    switch (status) {
      case ChangeRequestStatus.DRAFT:
        return 'default';
      case ChangeRequestStatus.PENDING_SUB_PMO:
      case ChangeRequestStatus.PENDING_MAIN_PMO:
        return 'warning';
      case ChangeRequestStatus.APPROVED_BY_SUB_PMO:
        return 'info';
      case ChangeRequestStatus.APPROVED:
        return 'success';
      case ChangeRequestStatus.REJECTED:
      case ChangeRequestStatus.REJECTED_BY_SUB_PMO:
        return 'error';
      case ChangeRequestStatus.CHANGES_REQUESTED:
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Change Request Review
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Request ID
              </Typography>
              <Typography variant="body1">{changeRequest.id}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={changeRequest.status} 
                color={getStatusChipColor(changeRequest.status) as any}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Project ID
              </Typography>
              <Typography variant="body1">{changeRequest.projectId || 'N/A'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body1">{changeRequest.department?.name || 'N/A'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">{changeRequest.type}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Requested By
              </Typography>
              <Typography variant="body1">
                {changeRequest.requestedBy ? 
                  `${changeRequest.requestedBy.firstName} ${changeRequest.requestedBy.lastName}` : 
                  'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Submitted On
              </Typography>
              <Typography variant="body1">
                {changeRequest.submissionDate ? formatDate(new Date(changeRequest.submissionDate)) : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Request Details
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {changeRequest.description}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary">
            Justification
          </Typography>
          <Typography variant="body1" paragraph>
            {changeRequest.justification}
          </Typography>
          
          {changeRequest.type === ChangeRequestType.SCHEDULE && (
            <>
              <Typography variant="subtitle1" color="text.secondary">
                Schedule Changes
              </Typography>
              <Typography variant="body1">
                New End Date: {changeRequest.newEndDate ? formatDate(new Date(changeRequest.newEndDate)) : 'N/A'}
              </Typography>
            </>
          )}
          
          {changeRequest.type === ChangeRequestType.BUDGET && (
            <>
              <Typography variant="subtitle1" color="text.secondary">
                Budget Changes
              </Typography>
              <Typography variant="body1" paragraph>
                New Budget: ${changeRequest.newBudget?.toLocaleString() || 'N/A'}
              </Typography>
            </>
          )}
          
          {changeRequest.type === ChangeRequestType.STATUS && (
            <>
              <Typography variant="subtitle1" color="text.secondary">
                Status Changes
              </Typography>
              <Typography variant="body1" paragraph>
                New Status: {changeRequest.newStatus || 'N/A'}
              </Typography>
            </>
          )}
          
          {changeRequest.reviewHistory && changeRequest.reviewHistory.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review History
              </Typography>
              
              {changeRequest.reviewHistory.map((review, index) => (
                <Box key={review.id || index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    {review.action} by {review.reviewer ? 
                      `${review.reviewer.firstName} ${review.reviewer.lastName}` : 
                      'Unknown'} on {formatDate(new Date(review.timestamp))}
                  </Typography>
                  {review.comments && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      "{review.comments}"
                    </Typography>
                  )}
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Card>
      
      {canReview() && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Review Decision
            </Typography>
            
            <TextField
              label="Comments"
              multiline
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Add your comments or feedback about this change request"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleStatusUpdate('REQUEST_CHANGES')}
                disabled={submitting}
              >
                Request Changes
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleStatusUpdate('REJECT')}
                disabled={submitting}
              >
                Reject
              </Button>
              
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleStatusUpdate('APPROVE')}
                disabled={submitting}
              >
                Approve
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/change-requests')}>
          Back to Change Requests
        </Button>
      </Box>
    </Box>
  );
};

export default ChangeRequestApproval; 