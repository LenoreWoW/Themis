import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChangeRequest, ChangeRequestType } from '../types/change-request';
import { useAuth } from '../context/AuthContext';
import changeRequestsService from '../services/changeRequests';

interface ChangeRequestDialogProps {
  open: boolean;
  onClose: () => void;
  changeRequest: ChangeRequest | null;
  onSuccess: () => void;
}

const ChangeRequestDialog: React.FC<ChangeRequestDialogProps> = ({
  open,
  onClose,
  changeRequest,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApproveReject = async () => {
    if (!changeRequest || !token || !user) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      const approverId = user.id;
      const approverName = `${user.firstName} ${user.lastName}`;
      
      if (dialogType === 'approve') {
        // For approval, we need userId, name, final approval status, and comments
        response = await changeRequestsService.approveChangeRequest(
          changeRequest.id,
          approverId,
          approverName,
          true, // Set as final approval
          comments,
          token
        );
      } else {
        // For rejection, we need userId, name, rejection reason, and token
        response = await changeRequestsService.rejectChangeRequest(
          changeRequest.id,
          approverId,
          approverName,
          rejectReason || 'Change request rejected',
          token
        );
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to process change request');
      }
    } catch (err) {
      setError('An error occurred while processing the change request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getChangeRequestTypeLabel = (type: string) => {
    switch (type) {
      case ChangeRequestType.SCOPE:
        return t('changeRequest.scope', 'Scope Change');
      case ChangeRequestType.SCHEDULE:
        return t('changeRequest.schedule', 'Schedule Change');
      case ChangeRequestType.BUDGET:
        return t('changeRequest.budget', 'Budget Change');
      case ChangeRequestType.RESOURCE:
        return t('changeRequest.resource', 'Resource Change');
      default:
        return type;
    }
  };

  const handleOpenApprove = () => {
    setDialogType('approve');
  };

  const handleOpenReject = () => {
    setDialogType('reject');
  };

  if (!changeRequest) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {dialogType === 'approve'
          ? t('changeRequest.approveRequest', 'Approve Change Request')
          : t('changeRequest.rejectRequest', 'Reject Change Request')}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('changeRequest.type', 'Type')}:
          </Typography>
          <Typography variant="body1">
            {getChangeRequestTypeLabel(changeRequest.type)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('changeRequest.description', 'Description')}:
          </Typography>
          <Typography variant="body1">
            {changeRequest.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('changeRequest.justification', 'Justification')}:
          </Typography>
          <Typography variant="body1">
            {changeRequest.justification}
          </Typography>
        </Box>

        {changeRequest.newEndDate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t('changeRequest.newEndDate', 'New End Date')}:
            </Typography>
            <Typography variant="body1">
              {new Date(changeRequest.newEndDate).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        {changeRequest.newBudget && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t('changeRequest.newBudget', 'New Budget')}:
            </Typography>
            <Typography variant="body1">
              ${changeRequest.newBudget.toLocaleString()}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {dialogType === 'approve' ? (
          <TextField
            label={t('changeRequest.approvalComments', 'Approval Comments')}
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        ) : (
          <TextField
            label={t('changeRequest.rejectionReason', 'Rejection Reason')}
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            error={dialogType === 'reject' && !rejectReason}
            helperText={
              dialogType === 'reject' && !rejectReason
                ? t('changeRequest.rejectionReasonRequired', 'Rejection reason is required')
                : ''
            }
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel', 'Cancel')}
        </Button>
        {dialogType === 'approve' ? (
          <Button 
            onClick={handleApproveReject} 
            color="primary" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('common.approve', 'Approve')}
          </Button>
        ) : (
          <Button
            onClick={handleApproveReject}
            color="error"
            variant="contained"
            disabled={loading || !rejectReason}
          >
            {loading ? <CircularProgress size={24} /> : t('common.reject', 'Reject')}
          </Button>
        )}
        {dialogType === 'approve' ? (
          <Button onClick={handleOpenReject} color="error" disabled={loading}>
            {t('common.reject', 'Reject Instead')}
          </Button>
        ) : (
          <Button onClick={handleOpenApprove} color="primary" disabled={loading}>
            {t('common.approve', 'Approve Instead')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRequestDialog; 