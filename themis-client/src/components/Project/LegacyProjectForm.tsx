import React, { useState, useEffect } from 'react';
import { useForm, Control, FieldErrors } from 'react-hook-form';
import FormWithValidation, { 
  FormTextField, 
  FormSelect, 
  FormDatePicker
} from '../shared/FormWithValidation';
import { 
  Box, 
  Paper, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Divider, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment, 
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { 
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Department, Project, ProjectPriority, ProjectStatus, User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { canManageProjects } from '../../utils/permissions';

// Define a simple TeamMemberList component for now
const TeamMemberList: React.FC<{
  users: User[];
  selectedMembers: string[];
  onMembersChange: (members: string[]) => void;
}> = ({ users, selectedMembers, onMembersChange }) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        Team members selection will be implemented here
      </Typography>
      {/* Placeholder UI for team member selection */}
      <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 1 }}>
        Add Team Member
      </Button>
    </Box>
  );
};

// Define a simple MilestoneList component for now
const MilestoneList: React.FC<{
  milestones: any[];
  onMilestonesChange: (milestones: any[]) => void;
}> = ({ milestones, onMilestonesChange }) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        Milestones will be implemented here
      </Typography>
      {/* Placeholder UI for milestones */}
      <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 1 }}>
        Add Milestone
      </Button>
    </Box>
  );
};

// Define a simple BudgetForm component for now
const BudgetForm: React.FC<{
  items: any[];
  onItemsChange: (items: any[]) => void;
}> = ({ items, onItemsChange }) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        Budget items will be implemented here
      </Typography>
      {/* Placeholder UI for budget items */}
      <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 1 }}>
        Add Budget Item
      </Button>
    </Box>
  );
};

// Enum for audit actions
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT'
}

// Update the interface
interface LegacyProjectFormData {
  name: string;
  description: string;
  departmentId: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  projectManagerId: string;
  budget: number;
  goalsLink: string;
  teamMembers: string[];
  client: string;
  priority: ProjectPriority;
  legacyImport: boolean;
  milestones: any[];
  budgetItems: any[];
  id?: string; // Add optional id property
}

// Extend the audit logs API interface
interface AuditLogAPI {
  getAuditLogs: (token: string) => Promise<any>;
  getAuditLogById: (logId: string, token: string) => Promise<any>;
  createAuditLog: (auditData: any, token: string) => Promise<any>;
}

// Add the createAuditLog function to the auditLogs API
(api.auditLogs as AuditLogAPI).createAuditLog = async (auditData: any, token: string) => {
  console.log('Creating audit log:', auditData);
  // This is a stub - in a real implementation, it would call the API
  return { success: true };
};

// Continue with the component
interface LegacyProjectFormProps {
  departments: Department[];
  users: User[];
  onCancel: () => void;
}

const steps = ['Basic Information', 'Team & Timeline', 'Budget & Documents'];

const LegacyProjectForm: React.FC<LegacyProjectFormProps> = ({
  departments,
  users,
  onCancel
}) => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState<LegacyProjectFormData>({
    name: '',
    description: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: ProjectStatus.PLANNING,
    projectManagerId: '',
    budget: 0,
    goalsLink: '',
    teamMembers: [],
    client: '',
    priority: ProjectPriority.MEDIUM,
    legacyImport: true,
    milestones: [],
    budgetItems: []
  });
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  // Check if user has appropriate role (SUB_PMO, MAIN_PMO, or ADMIN)
  const hasPermission = user?.role === UserRole.SUB_PMO || 
                       user?.role === UserRole.MAIN_PMO || 
                       user?.role === UserRole.ADMIN;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!hasPermission) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  // Default values for the form
  const defaultValues: LegacyProjectFormData = {
    name: '',
    description: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    status: ProjectStatus.PLANNING,
    projectManagerId: '',
    budget: 0,
    goalsLink: '',
    teamMembers: [],
    client: '',
    priority: ProjectPriority.MEDIUM,
    legacyImport: true, // Default to true for legacy import
    milestones: [],
    budgetItems: []
  };

  // Get project managers
  const getProjectManagers = () => {
    return users
      .filter(user => 
        user.role === UserRole.PROJECT_MANAGER || 
        user.role === UserRole.SUB_PMO || 
        user.role === UserRole.MAIN_PMO
      )
      .map(pm => ({
        value: pm.id,
        label: `${pm.firstName} ${pm.lastName}`
      }));
  };

  // Handle closing the snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Custom function to create audit log since the API endpoint might be missing
  const createProjectAuditLog = async (projectId: string, details: string, metadata: any) => {
    try {
      // In a real implementation, this would call api.auditLogs.createAuditLog
      // For now, we'll just log the information
      console.log('Creating audit log:', {
        action: AuditAction.CREATE,
        entityType: 'Project',
        entityId: projectId,
        details,
        metadata
      });
      // Return a success response
      return { success: true };
    } catch (error) {
      console.error('Error creating audit log:', error);
      return { success: false };
    }
  };

  // Function to save as draft
  const saveProjectAsDraft = async (data: LegacyProjectFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const projectDataToSave = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        client: data.client.trim(),
        budget: data.budget,
        teamMembers: teamMembers,
        milestones: milestones,
        budgetItems: budgetItems,
        priority: data.priority,
        legacyImport: true,
        isDraft: true,
        status: ProjectStatus.PLANNING
      };
      
      const projectResponse = await api.projects.createProject(projectDataToSave, token || '');
      
      if (projectResponse.data) {
        // Create audit log for the legacy import
        await createProjectAuditLog(
          projectResponse.data.id,
          `Manual legacy import created as draft by ${user?.firstName} ${user?.lastName}`,
          {
            legacyImport: true,
            createdBy: user?.id,
            createdAt: new Date().toISOString()
          }
        );
        
        setSnackbarMessage('Legacy project saved as draft');
        setSnackbarOpen(true);
        
        // Redirect to projects list after a short delay
        setTimeout(() => {
          navigate('/projects');
        }, 2000);
      } else {
        setSubmitError('Failed to save project draft. Please try again.');
      }
    } catch (error) {
      console.error('Error saving project draft:', error);
      setSubmitError('An error occurred while saving the project draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to publish the project
  const publishProject = async (data: LegacyProjectFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const projectDataToSave = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        client: data.client.trim(),
        budget: data.budget,
        teamMembers: teamMembers,
        milestones: milestones,
        budgetItems: budgetItems,
        priority: data.priority,
        legacyImport: true,
        isDraft: false,
        status: data.status
      };
      
      const projectResponse = await api.projects.createProject(projectDataToSave, token || '');
      
      if (projectResponse.data) {
        // Create audit log for the legacy import
        await createProjectAuditLog(
          projectResponse.data.id,
          `Manual legacy import published by ${user?.firstName} ${user?.lastName}`,
          {
            legacyImport: true,
            createdBy: user?.id,
            createdAt: new Date().toISOString()
          }
        );
        
        setSnackbarMessage('Legacy project published successfully');
        setSnackbarOpen(true);
        
        // Redirect to projects list after a short delay
        setTimeout(() => {
          navigate('/projects');
        }, 2000);
      } else {
        setSubmitError('Failed to publish project. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing project:', error);
      setSubmitError('An error occurred while publishing the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle team members update
  const handleTeamMembersUpdate = (members: string[]) => {
    setTeamMembers(members);
  };

  // Handle milestones update
  const handleMilestonesUpdate = (milestoneList: any[]) => {
    setMilestones(milestoneList);
  };

  // Handle budget items update
  const handleBudgetItemsUpdate = (items: any[]) => {
    setBudgetItems(items);
  };

  // Form validation
  const validateForm = (data: LegacyProjectFormData) => {
    const errors: Partial<Record<keyof LegacyProjectFormData, string>> = {};
    
    if (!data.name) {
      errors.name = 'Project name is required';
    }
    
    if (!data.departmentId) {
      errors.departmentId = 'Department is required';
    }
    
    if (!data.projectManagerId) {
      errors.projectManagerId = 'Project manager is required';
    }
    
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!data.endDate) {
      errors.endDate = 'End date is required';
    } else if (data.endDate < data.startDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (!data.status) {
      errors.status = 'Status is required';
    }
    
    return errors;
  };

  // Handle step navigation
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  // Handle form submission on each step
  const handleStepSubmit = (data: LegacyProjectFormData) => {
    const errors = validateForm(data);
    
    if (Object.keys(errors).length === 0) {
      setProjectData(prevData => ({ ...prevData, ...data }));
      
      if (activeStep === steps.length - 1) {
        if (saveAsDraft) {
          saveProjectAsDraft({ ...projectData, ...data });
        } else {
          publishProject({ ...projectData, ...data });
        }
      } else {
        handleNext();
      }
    } else {
      setSubmitError('Please fix the errors before continuing');
    }
  };

  // Handle deleting the draft
  const handleDeleteDraft = async () => {
    if (!projectData?.id) {
      setOpenDeleteDialog(false);
      onCancel();
      return;
    }
    
    try {
      await api.projects.deleteProject(projectData.id as string, token || '');
      setSnackbarMessage('Draft deleted successfully');
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
      
      // Redirect to projects list after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (error) {
      console.error('Error deleting draft:', error);
      setSnackbarMessage('Failed to delete draft');
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };

  // Then update the getStepContent function with proper types
  const getStepContent = (
    step: number, 
    control: Control<LegacyProjectFormData>, 
    errors: FieldErrors<LegacyProjectFormData>
  ): React.ReactNode => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3, mt: 2 }}>
            <GridContainer spacing={3}>
              <GridItem xs={12}>
                <FormTextField
                  name="name"
                  label={t('project.name')}
                  required
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12}>
                <FormTextField
                  name="description"
                  label={t('project.description')}
                  multiline
                  rows={3}
                  required
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormSelect
                  name="departmentId"
                  label={t('project.department')}
                  required
                  options={departments.map(dept => ({
                    value: dept.id,
                    label: dept.name
                  }))}
                  startIcon={
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  }
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormSelect
                  name="projectManagerId"
                  label={t('project.projectManager')}
                  required
                  options={getProjectManagers()}
                  startIcon={
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  }
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormTextField
                  name="client"
                  label={t('project.client')}
                  required
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormSelect
                  name="priority"
                  label={t('project.priority')}
                  required
                  options={[
                    { value: ProjectPriority.LOW, label: t('projectPriority.LOW') },
                    { value: ProjectPriority.MEDIUM, label: t('projectPriority.MEDIUM') },
                    { value: ProjectPriority.HIGH, label: t('projectPriority.HIGH') },
                    { value: ProjectPriority.CRITICAL, label: t('projectPriority.CRITICAL') }
                  ]}
                  startIcon={
                    <InputAdornment position="start">
                      <PriorityIcon color="action" />
                    </InputAdornment>
                  }
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={true}
                      disabled={true}
                    />
                  }
                  label="Imported from Legacy PMO"
                />
              </GridItem>
            </GridContainer>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3, mt: 2 }}>
            <GridContainer spacing={3}>
              <GridItem xs={12} sm={6}>
                <FormDatePicker
                  name="startDate"
                  label={t('project.startDate')}
                  required
                  startIcon={
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  }
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormDatePicker
                  name="endDate"
                  label={t('project.endDate')}
                  required
                  minDate={defaultValues.startDate}
                  startIcon={
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  }
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormSelect
                  name="status"
                  label={t('project.status')}
                  required
                  options={[
                    { value: ProjectStatus.PLANNING, label: t('projectStatus.PLANNING') },
                    { value: ProjectStatus.IN_PROGRESS, label: t('projectStatus.IN_PROGRESS') },
                    { value: ProjectStatus.ON_HOLD, label: t('projectStatus.ON_HOLD') },
                    { value: ProjectStatus.COMPLETED, label: t('projectStatus.COMPLETED') },
                    { value: ProjectStatus.CANCELLED, label: t('projectStatus.CANCELLED') }
                  ]}
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Team Members
                </Typography>
                <TeamMemberList 
                  users={users}
                  selectedMembers={teamMembers}
                  onMembersChange={handleTeamMembersUpdate}
                />
              </GridItem>
              
              <GridItem xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Milestones
                </Typography>
                <MilestoneList
                  milestones={milestones}
                  onMilestonesChange={handleMilestonesUpdate}
                />
              </GridItem>
            </GridContainer>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3, mt: 2 }}>
            <GridContainer spacing={3}>
              <GridItem xs={12} sm={6}>
                <FormTextField
                  name="budget"
                  label={t('project.budget')}
                  type="number"
                  required
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormTextField
                  name="goalsLink"
                  label={t('project.goalsLink')}
                  control={control}
                  errors={errors}
                />
              </GridItem>
              
              <GridItem xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Budget Items
                </Typography>
                <BudgetForm
                  items={budgetItems}
                  onItemsChange={handleBudgetItemsUpdate}
                />
              </GridItem>
            </GridContainer>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Add Legacy Project
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={onCancel}
          >
            Back to Projects
          </Button>
        </Box>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <FormWithValidation<LegacyProjectFormData>
            defaultValues={defaultValues}
            onSubmit={handleStepSubmit}
            submitButtonText={activeStep === steps.length - 1 ? 'Publish Project' : 'Next'}
            cancelButtonText={activeStep === 0 ? 'Cancel' : 'Back'}
            onCancel={activeStep === 0 ? onCancel : handleBack}
            isLoading={isSubmitting}
            error={submitError || undefined}
          >
            {(control, errors) => (
              <>
                {getStepContent(activeStep, control, errors)}
                {activeStep === steps.length - 1 && (
                  <Box sx={{ display: 'flex', mt: 3 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => {
                        setSaveAsDraft(true);
                        // Submit form is triggered which will check saveAsDraft flag
                      }}
                      sx={{ mr: 1 }}
                      disabled={isSubmitting}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setOpenDeleteDialog(true)}
                      disabled={isSubmitting}
                    >
                      Delete Draft
                    </Button>
                  </Box>
                )}
              </>
            )}
          </FormWithValidation>
        </Paper>
      </Box>
      
      {/* Delete Draft Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Draft Project?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this draft project? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteDraft} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default LegacyProjectForm; 