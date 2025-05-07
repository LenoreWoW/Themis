import React, { useState } from 'react';
import { 
  ListItem, 
  ListItemText, 
  Chip, 
  Typography, 
  IconButton, 
  Box,
  Collapse,
  Paper,
  Grid,
  Button,
  Divider
} from '@mui/material';
import { 
  ChangeRequest, 
  ChangeRequestStatus, 
  ChangeRequestType 
} from '../../types/change-request';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useAuth } from '../../context/AuthContext';

interface ChangeRequestListItemProps {
  changeRequest: ChangeRequest;
  onClick: (id: string) => void;
}

const getStatusColor = (status: ChangeRequestStatus | string) => {
  switch (status) {
    case ChangeRequestStatus.PENDING_SUB_PMO:
    case ChangeRequestStatus.PENDING_MAIN_PMO:
    case 'PENDING':
      return 'warning';
    case ChangeRequestStatus.APPROVED:
    case 'APPROVED':
      return 'success';
    case ChangeRequestStatus.REJECTED:
    case ChangeRequestStatus.REJECTED_BY_SUB_PMO:
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
};

const getTypeColor = (type: ChangeRequestType | string) => {
  switch (type) {
    case ChangeRequestType.SCHEDULE:
    case 'SCHEDULE':
      return '#FFA726'; // Orange
    case ChangeRequestType.BUDGET:
    case 'BUDGET':
      return '#66BB6A'; // Green
    case ChangeRequestType.SCOPE:
    case 'SCOPE':
      return '#42A5F5'; // Blue
    case ChangeRequestType.RESOURCE:
    case 'RESOURCE':
      return '#AB47BC'; // Purple
    case ChangeRequestType.CLOSURE:
    case 'CLOSURE':
      return '#EF5350'; // Red
    default:
      return '#78909C'; // Blue Grey
  }
};

const ChangeRequestListItem: React.FC<ChangeRequestListItemProps> = ({ 
  changeRequest, 
  onClick 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';
  
  // Handle expanding/collapsing the details
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  // Handle viewing full details in the dialog
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (changeRequest.id) {
      onClick(changeRequest.id);
    }
  };
  
  return (
    <>
      <ListItem
        alignItems="flex-start"
        divider={!expanded}
        sx={{ 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        onClick={handleToggleExpand}
      >
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1" component="span">
                {changeRequest.description}
              </Typography>
              <Chip
                label={t(`changeRequest.type.${String(changeRequest.type).toLowerCase()}`)}
                size="small"
                sx={{ 
                  backgroundColor: getTypeColor(changeRequest.type),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          }
          secondary={
            <React.Fragment>
              <Box component="span" display="flex" flexDirection="column" mt={1}>
                <Typography variant="body2" color="text.secondary" component="span">
                  {changeRequest.justification && changeRequest.justification.length > 100 
                    ? `${changeRequest.justification.substring(0, 100)}...` 
                    : changeRequest.justification || ''}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Chip
                    label={t(`changeRequest.status.${String(changeRequest.status).toLowerCase()}`)}
                    size="small"
                    color={getStatusColor(changeRequest.status)}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    {t('common.submitted')}: {format(new Date(changeRequest.requestedAt), 'dd/MM/yyyy')}
                  </Typography>
                </Box>
              </Box>
            </React.Fragment>
          }
        />
        
        <IconButton onClick={handleToggleExpand}>
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </ListItem>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            borderRadius: 0, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('changeRequest.details', 'Change Request Details')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('changeRequest.type', 'Type')}:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t(`changeRequest.type.${String(changeRequest.type).toLowerCase()}`)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('changeRequest.status', 'Status')}:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t(`changeRequest.status.${String(changeRequest.status).toLowerCase()}`)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('changeRequest.requestedBy', 'Requested By')}:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {changeRequest.requestedBy ? 
                  `${changeRequest.requestedBy.firstName} ${changeRequest.requestedBy.lastName}` : 
                  '-'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('changeRequest.requestedDate', 'Requested Date')}:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {changeRequest.requestedAt ? format(new Date(changeRequest.requestedAt), 'PPP') : '-'}
              </Typography>
            </Grid>
            
            {/* Type-specific details */}
            {changeRequest.type === ChangeRequestType.SCHEDULE && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('changeRequest.newEndDate', 'New End Date')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {changeRequest.newEndDate ? format(new Date(changeRequest.newEndDate), 'PPP') : '-'}
                </Typography>
              </Grid>
            )}
            
            {changeRequest.type === ChangeRequestType.BUDGET && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('changeRequest.newBudget', 'New Budget')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {changeRequest.newBudget ? `$${changeRequest.newBudget.toLocaleString()}` : '-'}
                </Typography>
              </Grid>
            )}
            
            {changeRequest.type === ChangeRequestType.SCOPE && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('changeRequest.scopeChanges', 'Scope Changes')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {changeRequest.justification || '-'}
                </Typography>
              </Grid>
            )}
            
            {changeRequest.type === ChangeRequestType.RESOURCE && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('changeRequest.newManager', 'New Project Manager')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {changeRequest.newManager || '-'}
                </Typography>
              </Grid>
            )}
            
            {changeRequest.type === ChangeRequestType.CLOSURE && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('changeRequest.closureJustification', 'Closure Justification')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {changeRequest.justification || '-'}
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('changeRequest.description', 'Description')}:
              </Typography>
              <Typography variant="body1" paragraph>
                {changeRequest.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('changeRequest.justification', 'Justification')}:
              </Typography>
              <Typography variant="body1" paragraph>
                {changeRequest.justification || '-'}
              </Typography>
            </Grid>
            
            {/* Show approval/rejection details if available */}
            {changeRequest.status !== ChangeRequestStatus.PENDING_SUB_PMO && 
             changeRequest.status !== ChangeRequestStatus.PENDING_MAIN_PMO && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    {changeRequest.status === ChangeRequestStatus.APPROVED
                      ? t('changeRequest.approvalDetails', 'Approval Details')
                      : t('changeRequest.rejectionDetails', 'Rejection Details')}:
                  </Typography>
                </Grid>
                
                {changeRequest.status === ChangeRequestStatus.APPROVED && changeRequest.approvedBy && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('changeRequest.approvedBy', 'Approved By')}:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {`${changeRequest.approvedBy.firstName} ${changeRequest.approvedBy.lastName}`}
                    </Typography>
                  </Grid>
                )}
                
                {changeRequest.status === ChangeRequestStatus.REJECTED && changeRequest.rejectedBy && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('changeRequest.rejectedBy', 'Rejected By')}:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {`${changeRequest.rejectedBy.firstName} ${changeRequest.rejectedBy.lastName}`}
                    </Typography>
                  </Grid>
                )}
                
                {changeRequest.status === ChangeRequestStatus.APPROVED && changeRequest.approvedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('changeRequest.approvedDate', 'Approved Date')}:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {format(new Date(changeRequest.approvedAt), 'PPP')}
                    </Typography>
                  </Grid>
                )}
                
                {changeRequest.status === ChangeRequestStatus.REJECTED && changeRequest.rejectedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('changeRequest.rejectedDate', 'Rejected Date')}:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {format(new Date(changeRequest.rejectedAt), 'PPP')}
                    </Typography>
                  </Grid>
                )}
                
                {changeRequest.status === ChangeRequestStatus.REJECTED && changeRequest.rejectionReason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('changeRequest.rejectionReason', 'Rejection Reason')}:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {changeRequest.rejectionReason}
                    </Typography>
                  </Grid>
                )}
              </>
            )}
            
            {/* Action buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={handleViewDetails}
                >
                  {t('common.viewDetails', 'View Details')}
                </Button>
                
                {/* For admin users, show approve/reject buttons if change request is pending */}
                {isAdmin && (changeRequest.status === ChangeRequestStatus.PENDING_SUB_PMO || 
                            changeRequest.status === ChangeRequestStatus.PENDING_MAIN_PMO) && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (changeRequest.id) {
                          onClick(changeRequest.id); // Open the approval dialog
                        }
                      }}
                    >
                      {t('common.approve', 'Approve')}
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (changeRequest.id) {
                          onClick(changeRequest.id); // Open the rejection dialog
                        }
                      }}
                    >
                      {t('common.reject', 'Reject')}
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </>
  );
};

export default ChangeRequestListItem; 