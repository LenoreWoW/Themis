import React, { useState } from 'react';
import { useForm, FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { ApprovalStatus, getNextApprovalStatus } from '../../context/AuthContext';
import { usePermission, Permission } from './PermissionGuard';
import FormWithValidation from './FormWithValidation';
import { UserRole } from '../../types';

interface WorkflowFormProps<T extends FieldValues> {
  defaultValues: DefaultValues<T>;
  validationSchema?: any;
  onSubmit: (data: T, action: WorkflowAction) => Promise<void>;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  currentStatus?: ApprovalStatus;
  isOwnItem?: boolean;
  objectOwner?: string;
}

export type WorkflowAction = 'SAVE_DRAFT' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

const WorkflowForm = <T extends FieldValues>({ 
  defaultValues,
  validationSchema,
  onSubmit,
  children,
  title,
  subtitle,
  currentStatus = ApprovalStatus.DRAFT,
  isOwnItem = true,
  objectOwner
}: WorkflowFormProps<T>) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check permissions
  const canApprove = usePermission(Permission.APPROVE_PROJECT, isOwnItem);
  const canEdit = usePermission(Permission.EDIT_PROJECT, isOwnItem);
  const canRequest = usePermission(Permission.REQUEST_CHANGES);
  
  // Determine active step based on current status
  const getActiveStep = () => {
    switch (currentStatus) {
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
        return -1;
      case ApprovalStatus.CHANGES_REQUESTED:
        return -1;
      default:
        return 0;
    }
  };
  
  // Handle workflow action
  const handleWorkflowAction = async (data: T, action: WorkflowAction) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data, action);
    } catch (err) {
      console.error('Error processing workflow action:', err);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    let color = 'default';
    
    switch (currentStatus) {
      case ApprovalStatus.DRAFT:
        color = 'default';
        break;
      case ApprovalStatus.SUBMITTED:
      case ApprovalStatus.SUB_PMO_REVIEW:
      case ApprovalStatus.MAIN_PMO_REVIEW:
        color = 'info';
        break;
      case ApprovalStatus.SUB_PMO_APPROVED:
        color = 'secondary';
        break;
      case ApprovalStatus.APPROVED:
        color = 'success';
        break;
      case ApprovalStatus.REJECTED:
        color = 'error';
        break;
      case ApprovalStatus.CHANGES_REQUESTED:
        color = 'warning';
        break;
    }
    
    return (
      <Chip 
        label={currentStatus.replace('_', ' ')} 
        color={color as any} 
        size="small" 
        sx={{ ml: 2 }}
      />
    );
  };
  
  // Determine if form should be readonly
  const isReadOnly = () => {
    // If user is the owner, they can edit drafts or items with requested changes
    if (isOwnItem && (currentStatus === ApprovalStatus.DRAFT || currentStatus === ApprovalStatus.CHANGES_REQUESTED)) {
      return false;
    }
    
    // Admin and MainPMO can edit anything
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.MAIN_PMO) {
      return false;
    }
    
    // SubPMO can edit in certain stages
    if (user?.role === UserRole.SUB_PMO && 
        (currentStatus === ApprovalStatus.SUBMITTED || 
         currentStatus === ApprovalStatus.SUB_PMO_REVIEW)) {
      return false;
    }
    
    // By default, form is readonly in other cases
    return true;
  };
  
  // Determine which action buttons to show
  const getActionButtons = () => {
    const buttons = [];
    
    // Draft actions
    if (currentStatus === ApprovalStatus.DRAFT && isOwnItem) {
      buttons.push(
        <Button
          key="save-draft"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'SAVE_DRAFT'))}
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
      );
      
      buttons.push(
        <Button
          key="submit"
          variant="contained"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'SUBMIT'))}
          disabled={isSubmitting}
        >
          Submit for Approval
        </Button>
      );
    }
    
    // Submitted actions (for reviewers)
    if ((currentStatus === ApprovalStatus.SUBMITTED || currentStatus === ApprovalStatus.SUB_PMO_REVIEW) && 
        (user?.role === UserRole.SUB_PMO || user?.role === UserRole.MAIN_PMO || user?.role === UserRole.ADMIN)) {
      
      buttons.push(
        <Button
          key="request-changes"
          color="warning"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'REQUEST_CHANGES'))}
          disabled={isSubmitting}
        >
          Request Changes
        </Button>
      );
      
      buttons.push(
        <Button
          key="reject"
          color="error"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'REJECT'))}
          disabled={isSubmitting}
        >
          Reject
        </Button>
      );
      
      buttons.push(
        <Button
          key="approve"
          variant="contained"
          color="success"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'APPROVE'))}
          disabled={isSubmitting}
        >
          Approve
        </Button>
      );
    }
    
    // SubPMO Approved actions (for Main PMO)
    if (currentStatus === ApprovalStatus.SUB_PMO_APPROVED && 
        (user?.role === UserRole.MAIN_PMO || user?.role === UserRole.ADMIN)) {
      
      buttons.push(
        <Button
          key="request-changes"
          color="warning"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'REQUEST_CHANGES'))}
          disabled={isSubmitting}
        >
          Request Changes
        </Button>
      );
      
      buttons.push(
        <Button
          key="reject"
          color="error"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'REJECT'))}
          disabled={isSubmitting}
        >
          Reject
        </Button>
      );
      
      buttons.push(
        <Button
          key="approve"
          variant="contained"
          color="success"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'APPROVE'))}
          disabled={isSubmitting}
        >
          Final Approval
        </Button>
      );
    }
    
    // Changes requested actions (for item owner)
    if (currentStatus === ApprovalStatus.CHANGES_REQUESTED && isOwnItem) {
      buttons.push(
        <Button
          key="save-changes"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'SAVE_DRAFT'))}
          disabled={isSubmitting}
        >
          Save Changes
        </Button>
      );
      
      buttons.push(
        <Button
          key="resubmit"
          variant="contained"
          onClick={handleSubmit((data) => handleWorkflowAction(data, 'SUBMIT'))}
          disabled={isSubmitting}
        >
          Resubmit
        </Button>
      );
    }
    
    return buttons;
  };
  
  // Get form methods from useForm
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<T>({
    defaultValues,
    ...(validationSchema && { resolver: validationSchema }),
  });

  // Display a read-only message if needed
  const readOnlyMessage = isReadOnly() ? (
    <Alert severity="info" sx={{ mb: 3 }}>
      This form is in read-only mode because it's currently under review.
      {isOwnItem ? ' You will be notified when action is required.' : null}
    </Alert>
  ) : null;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          {title}
        </Typography>
        {renderStatusBadge()}
      </Box>
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}
      
      <Stepper activeStep={getActiveStep()} sx={{ mb: 4 }}>
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
      
      {readOnlyMessage}
      
      <FormWithValidation<T>
        defaultValues={defaultValues}
        validationSchema={validationSchema}
        onSubmit={() => {}} // Handled by our wrapper
        error={error || undefined}
        isLoading={isSubmitting}
      >
        {children}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          {getActionButtons()}
        </Box>
      </FormWithValidation>
    </Paper>
  );
};

export default WorkflowForm; 