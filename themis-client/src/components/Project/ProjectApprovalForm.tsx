import React, { useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { FormTextField, FormSelect, FormDatePicker } from '../shared/FormWithValidation';
import WorkflowForm, { WorkflowAction } from '../shared/WorkflowForm';
import { 
  InputAdornment,
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { 
  Department, 
  Project, 
  ProjectPriority, 
  ProjectStatus, 
  User, 
  UserRole
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ApprovalStatus } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { usePermission, Permission } from '../shared/PermissionGuard';

// Create a simple project form for demonstration
interface ProjectFormData {
  name: string;
  description: string;
  departmentId: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  projectManagerId: string;
  budget: number;
  priority: ProjectPriority;
}

interface ProjectApprovalFormProps {
  project?: Project; // Optional existing project for editing
  departments: Department[];
  users: User[];
  onSubmit: (data: any, action: WorkflowAction) => Promise<void>;
  onCancel: () => void;
}

// Create validation schema
const projectSchema = yup.object({
  name: yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters'),
  
  description: yup.string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  
  departmentId: yup.string()
    .required('Department is required'),
  
  projectManagerId: yup.string()
    .required('Project manager is required'),
  
  startDate: yup.date()
    .required('Start date is required'),
  
  endDate: yup.date()
    .required('End date is required')
    .min(
      yup.ref('startDate'),
      'End date must be after the start date'
    ),
  
  budget: yup.number()
    .required('Budget is required')
    .min(0, 'Budget cannot be negative'),
  
  status: yup.string()
    .required('Status is required'),
  
  priority: yup.string()
    .required('Priority is required')
}).required();

const ProjectApprovalForm: React.FC<ProjectApprovalFormProps> = ({
  project,
  departments,
  users,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviewComments, setReviewComments] = useState<string>('');
  
  // Check permissions
  const canApprove = usePermission(Permission.APPROVE_PROJECT, project?.projectManager?.id === user?.id);
  const canEdit = usePermission(Permission.EDIT_PROJECT, project?.projectManager?.id === user?.id);
  
  // Default values for the form
  const defaultValues: ProjectFormData = {
    name: project?.name || '',
    description: project?.description || '',
    departmentId: project?.department?.id || '',
    startDate: project?.startDate ? new Date(project.startDate) : new Date(),
    endDate: project?.endDate ? new Date(project.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: project?.status || ProjectStatus.PLANNING,
    projectManagerId: project?.projectManager?.id || user?.id || '',
    budget: project?.budget || 0,
    priority: project?.priority || ProjectPriority.MEDIUM
  };
  
  // Current approval status
  const currentStatus = project?.approvalStatus || ApprovalStatus.DRAFT;
  
  // Determine if this is user's own project
  const isOwnProject = project ? 
    project.projectManager?.id === user?.id : 
    true; // New projects are owned by the creator
  
  // Handle form submission
  const handleFormSubmit = async (data: ProjectFormData, action: WorkflowAction) => {
    // Add review comments for certain actions
    const submitData = {
      ...data,
      reviewComments: ['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(action) ? reviewComments : undefined
    };
    
    await onSubmit(submitData, action);
  };
  
  // Get project managers for dropdown
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
  
  return (
    <WorkflowForm<ProjectFormData>
      defaultValues={defaultValues}
      validationSchema={yupResolver(projectSchema)}
      onSubmit={handleFormSubmit}
      title={project ? t('project.edit') : t('project.addNew')}
      subtitle={t('project.fillDetails')}
      currentStatus={currentStatus}
      isOwnItem={isOwnProject}
      objectOwner={project?.projectManager?.id}
    >
      <GridContainer spacing={3}>
        <GridItem xs={12}>
          <FormTextField
            name="name"
            label={t('project.name')}
            required
          />
        </GridItem>
        
        <GridItem xs={12}>
          <FormTextField
            name="description"
            label={t('project.description')}
            multiline
            rows={3}
            required
          />
        </GridItem>
        
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
          />
        </GridItem>
        
        <GridItem xs={12} sm={6}>
          <FormDatePicker
            name="endDate"
            label={t('project.endDate')}
            required
            startIcon={
              <InputAdornment position="start">
                <CalendarIcon color="action" />
              </InputAdornment>
            }
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
          />
        </GridItem>
        
        <GridItem xs={12} sm={6}>
          <FormTextField
            name="budget"
            label={t('project.budget')}
            type="number"
            required
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
              { value: ProjectStatus.ON_HOLD, label: t('projectStatus.ON_HOLD') }
            ]}
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
          />
        </GridItem>
        
        {/* Review comments section - only visible to reviewers during appropriate stages */}
        {(user?.role === UserRole.SUB_PMO || 
          user?.role === UserRole.MAIN_PMO || 
          user?.role === UserRole.ADMIN) && 
         (currentStatus === ApprovalStatus.SUBMITTED || 
          currentStatus === ApprovalStatus.SUB_PMO_APPROVED) && (
          <GridItem xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {t('project.reviewerComments')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('project.addFeedback')}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
            />
          </GridItem>
        )}
        
        {/* Display existing comments if any */}
        {project?.comments && (
          <GridItem xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2">{t('project.previousComments')}:</Typography>
              <Typography variant="body2">{project.comments}</Typography>
            </Alert>
          </GridItem>
        )}
      </GridContainer>
    </WorkflowForm>
  );
};

export default ProjectApprovalForm; 