import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { FormTextField, FormSelect, FormDatePicker } from '../shared/FormWithValidation';
import WorkflowForm, { WorkflowAction } from '../shared/WorkflowForm';
import { 
  InputAdornment,
  Box,
  Alert,
  TextField,
  CircularProgress,
  Typography
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
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Project form data interface
interface ProjectFormData {
  name: string;
  description: string;
  departmentId: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  projectManagerId: string;
  budget: number;
  goalsLink: string;
  priority: ProjectPriority;
  dependencySeverity: 'high' | 'medium' | 'low';
  approvalStatus: ApprovalStatus;
  comments?: string;
}

// Props interface
interface WorkflowProjectFormProps {
  projectId?: string; // Optional: If provided, form is in edit mode
  departments: Department[];
  users: User[];
  onSave?: (project: Project) => void;
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
    .required('Start date is required')
    .min(new Date(Date.now() - 86400000), 'Start date cannot be in the past'),
  
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
    .required('Priority is required'),
  
  dependencySeverity: yup.string()
    .required('Dependency severity is required'),
  
  goalsLink: yup.string()
    .url('Please enter a valid URL')
    .nullable()
}).required();

const WorkflowProjectForm: React.FC<WorkflowProjectFormProps> = ({
  projectId,
  departments,
  users,
  onSave,
  onCancel
}) => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(projectId ? true : false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<string>('');
  
  // Determine if this is user's own project
  const isOwnProject = project ? 
    project.projectManager?.id === user?.id : 
    true; // New projects are owned by the creator
  
  // Default values for the form
  const defaultValues: ProjectFormData = {
    name: '',
    description: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    status: ProjectStatus.PLANNING,
    projectManagerId: user?.id || '',
    budget: 0,
    goalsLink: '',
    priority: ProjectPriority.MEDIUM,
    dependencySeverity: 'medium',
    approvalStatus: ApprovalStatus.DRAFT
  };
  
  // Load project data for editing
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !token) return;
      
      try {
        setIsLoading(true);
        const response = await api.projects.getProject(projectId, token);
        
        if (response.data) {
          // Convert API response to Project type with proper enums
          const responseData = response.data as any;
          const projectData = {
            ...responseData,
            status: responseData.status as ProjectStatus,
            priority: responseData.priority as ProjectPriority,
            approvalStatus: (responseData.approvalStatus as ApprovalStatus) || ApprovalStatus.DRAFT,
            goalsLink: responseData.goalsLink || '',
            actualCost: responseData.actualCost,
            dependencySeverity: responseData.dependencySeverity || 'medium'
          };
          
          setProject(projectData as Project);
          
          // Pre-fill form with project data
          defaultValues.name = responseData.name;
          defaultValues.description = responseData.description;
          defaultValues.departmentId = responseData.department?.id || '';
          defaultValues.startDate = new Date(responseData.startDate);
          defaultValues.endDate = new Date(responseData.endDate);
          defaultValues.status = responseData.status as ProjectStatus;
          defaultValues.projectManagerId = responseData.projectManager?.id || '';
          defaultValues.budget = responseData.budget;
          defaultValues.priority = responseData.priority as ProjectPriority;
          defaultValues.goalsLink = responseData.goalsLink || '';
          defaultValues.dependencySeverity = responseData.dependencySeverity || 'medium';
          defaultValues.approvalStatus = (responseData.approvalStatus as ApprovalStatus) || ApprovalStatus.DRAFT;
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, token]);
  
  // Get project managers
  const getProjectManagers = () => {
    return users
      .filter(user => 
        user.role === 'PROJECT_MANAGER' || 
        user.role === 'SUB_PMO' || 
        user.role === 'MAIN_PMO'
      )
      .map(pm => ({
        value: pm.id,
        label: `${pm.firstName} ${pm.lastName}`
      }));
  };
  
  // Handle submit based on workflow action
  const handleSubmit = async (data: ProjectFormData, action: WorkflowAction) => {
    if (!token) {
      setError('You must be logged in');
      return;
    }
    
    try {
      // Determine next approval status based on action
      let nextStatus: ApprovalStatus;
      
      switch (action) {
        case 'SAVE_DRAFT':
          nextStatus = ApprovalStatus.DRAFT;
          break;
        case 'SUBMIT':
          nextStatus = ApprovalStatus.SUBMITTED;
          break;
        case 'APPROVE':
          if (user?.role === UserRole.SUB_PMO) {
            nextStatus = ApprovalStatus.SUB_PMO_APPROVED;
          } else if (user?.role === UserRole.MAIN_PMO || user?.role === UserRole.ADMIN) {
            nextStatus = ApprovalStatus.APPROVED;
          } else {
            nextStatus = data.approvalStatus; // No change if not authorized
          }
          break;
        case 'REJECT':
          nextStatus = ApprovalStatus.REJECTED;
          break;
        case 'REQUEST_CHANGES':
          nextStatus = ApprovalStatus.CHANGES_REQUESTED;
          break;
        default:
          nextStatus = data.approvalStatus;
      }
      
      // Prepare project data
      const projectData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        approvalStatus: nextStatus,
        dependencySeverity: data.dependencySeverity,
        comments: comments || undefined
      };
      
      let response;
      
      if (projectId) {
        // Update existing project
        response = await api.projects.updateProject(projectId, projectData, token);
      } else {
        // Create new project
        response = await api.projects.createProject(projectData, token);
      }
      
      if (response.data) {
        if (onSave) {
          onSave(response.data);
        }
        
        // Redirect to project detail page
        navigate(`/projects/${response.data.id}`);
      } else {
        setError('Failed to save project');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setError('An error occurred while saving the project');
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (error && !projectId) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  // Render form with workflow
  return (
    <WorkflowForm<ProjectFormData>
      defaultValues={defaultValues}
      validationSchema={yupResolver(projectSchema)}
      onSubmit={handleSubmit}
      title={projectId ? t('project.edit') : t('project.addNew')}
      subtitle={t('project.fillDetails')}
      currentStatus={(project as any)?.approvalStatus || ApprovalStatus.DRAFT}
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
        
        <GridItem xs={12} sm={6}>
          <FormSelect
            name="dependencySeverity"
            label={t('dependencies.impact')}
            required
            options={[
              { value: 'high', label: t('dependencies.highImpact') },
              { value: 'medium', label: t('dependencies.mediumImpact') },
              { value: 'low', label: t('dependencies.lowImpact') }
            ]}
            startIcon={
              <InputAdornment position="start">
                <PriorityIcon color="action" />
              </InputAdornment>
            }
          />
        </GridItem>
        
        <GridItem xs={12}>
          <FormTextField
            name="goalsLink"
            label={t('project.goalsLink')}
          />
        </GridItem>
        
        {/* Comments field for reviewers */}
        {(user?.role === UserRole.SUB_PMO || 
          user?.role === UserRole.MAIN_PMO || 
          user?.role === UserRole.ADMIN) && 
         ((project as any)?.approvalStatus === ApprovalStatus.SUBMITTED || 
          (project as any)?.approvalStatus === ApprovalStatus.SUB_PMO_APPROVED) && (
          <GridItem xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Reviewer Comments
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add your comments, feedback, or reasons for approval/rejection"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </GridItem>
        )}
        
        {/* Display previous comments history */}
        {(project as any)?.comments && (
          <GridItem xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2">Previous Comments:</Typography>
              <Typography variant="body2">{(project as any).comments}</Typography>
            </Alert>
          </GridItem>
        )}
      </GridContainer>
    </WorkflowForm>
  );
};

export default WorkflowProjectForm; 