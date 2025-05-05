import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon, 
  Edit as EditIcon,
  DoneAll as DoneAllIcon,
  Pending as PendingIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { ApprovalStatus } from '../../context/AuthContext';
// Instead of importing from types, define it locally
interface ReviewComment {
  id?: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUBMIT';
}
import { format } from 'date-fns';

interface ApprovalHistoryProps {
  approvalStatus: ApprovalStatus;
  reviewHistory?: ReviewComment[];
  createdAt?: string;
  lastReviewedAt?: string;
}

// Custom styled stepper connector
const ColorStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-active`]: {
    [`& .MuiStepConnector-line`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.MuiStepConnector-completed`]: {
    [`& .MuiStepConnector-line`]: {
      borderColor: theme.palette.success.main,
    },
  },
}));

const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ 
  approvalStatus, 
  reviewHistory = [],
  createdAt,
  lastReviewedAt
}) => {
  // Determine active step based on current status
  const getActiveStep = () => {
    switch (approvalStatus) {
      case ApprovalStatus.DRAFT:
        return 0;
      case ApprovalStatus.SUBMITTED:
      case ApprovalStatus.SUB_PMO_REVIEW:
        return 1;
      case ApprovalStatus.SUB_PMO_APPROVED:
      case ApprovalStatus.MAIN_PMO_REVIEW:
        return 2;
      case ApprovalStatus.APPROVED:
        return 3;
      case ApprovalStatus.REJECTED:
      case ApprovalStatus.CHANGES_REQUESTED:
        return -1; // Special case for rejected or changes requested
      default:
        return 0;
    }
  };
  
  const getRejectedIcon = () => {
    if (approvalStatus === ApprovalStatus.REJECTED) {
      return <ErrorIcon color="error" />;
    } else if (approvalStatus === ApprovalStatus.CHANGES_REQUESTED) {
      return <EditIcon color="warning" />;
    }
    return null;
  };
  
  const getStatusColor = () => {
    switch (approvalStatus) {
      case ApprovalStatus.DRAFT:
        return 'default';
      case ApprovalStatus.SUBMITTED:
      case ApprovalStatus.SUB_PMO_REVIEW:
      case ApprovalStatus.MAIN_PMO_REVIEW:
        return 'info';
      case ApprovalStatus.SUB_PMO_APPROVED:
        return 'secondary';
      case ApprovalStatus.APPROVED:
        return 'success';
      case ApprovalStatus.REJECTED:
        return 'error';
      case ApprovalStatus.CHANGES_REQUESTED:
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return <ApproveIcon color="success" />;
      case 'REJECT':
        return <RejectIcon color="error" />;
      case 'REQUEST_CHANGES':
        return <EditIcon color="warning" />;
      default:
        return <PendingIcon color="info" />;
    }
  };
  
  // Sort review history by date
  const sortedHistory = [...reviewHistory].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Approval Status
        <Chip 
          label={approvalStatus.replace('_', ' ')} 
          color={getStatusColor() as any} 
          size="small" 
          sx={{ ml: 2 }}
        />
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Approval status stepper */}
      {approvalStatus !== ApprovalStatus.REJECTED && 
       approvalStatus !== ApprovalStatus.CHANGES_REQUESTED && (
        <Stepper 
          activeStep={getActiveStep()} 
          alternativeLabel
          connector={<ColorStepConnector />}
          sx={{ mb: 3 }}
        >
          <Step>
            <StepLabel>Draft</StepLabel>
          </Step>
          <Step>
            <StepLabel>Department Review</StepLabel>
          </Step>
          <Step>
            <StepLabel>PMO Review</StepLabel>
          </Step>
          <Step>
            <StepLabel>Approved</StepLabel>
          </Step>
        </Stepper>
      )}
      
      {/* Special status for rejected or changes requested */}
      {(approvalStatus === ApprovalStatus.REJECTED || 
        approvalStatus === ApprovalStatus.CHANGES_REQUESTED) && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          my: 3, 
          p: 2, 
          borderRadius: 2,
          bgcolor: approvalStatus === ApprovalStatus.REJECTED ? 'error.light' : 'warning.light'
        }}>
          {getRejectedIcon()}
          <Typography variant="h6" component="span" sx={{ ml: 1 }}>
            {approvalStatus === ApprovalStatus.REJECTED 
              ? 'This project has been rejected'
              : 'Changes have been requested'}
          </Typography>
        </Box>
      )}
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Approval History
      </Typography>
      
      {sortedHistory.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No review history available yet.
        </Typography>
      ) : (
        <List>
          {sortedHistory.map((review, index) => (
            <ListItem key={review.id || index} alignItems="flex-start" divider={index < sortedHistory.length - 1}>
              <ListItemAvatar>
                <Avatar>
                  {getActionIcon(review.action)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {review.action === 'APPROVE' && 'Approved'}
                    {review.action === 'REJECT' && 'Rejected'}
                    {review.action === 'REQUEST_CHANGES' && 'Requested Changes'}
                    {' by '}
                    {review.user.firstName} {review.user.lastName}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {format(new Date(review.createdAt), 'PPpp')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {review.text}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {createdAt && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {format(new Date(createdAt), 'PPp')}
          </Typography>
          {lastReviewedAt && (
            <Typography variant="caption" color="text.secondary">
              Last reviewed: {format(new Date(lastReviewedAt), 'PPp')}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ApprovalHistory; 