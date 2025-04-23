import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { Paper, InputAdornment } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Department, Project, ProjectPriority, ProjectStatus, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { FormTextField, FormSelect, FormDatePicker } from '../shared/FormWithValidation';
import { Control, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';

// Project form data structure
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
  client: string;
  priority: ProjectPriority;
}

// Form props interface
interface CreateProjectFormWithYupProps {
  departments: Department[];
  users: User[];
  onProjectAdded: (project: Project) => void;
  onCancel: () => void;
}

// Create a Yup schema for form validation
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
  
  client: yup.string()
    .required('Client name is required'),
  
  budget: yup.number()
    .required('Budget is required')
    .min(0, 'Budget cannot be negative'),
  
  status: yup.string()
    .required('Status is required')
    .oneOf(
      Object.values(ProjectStatus), 
      'Invalid project status'
    ),
  
  priority: yup.string()
    .required('Priority is required')
    .oneOf(
      Object.values(ProjectPriority),
      'Invalid priority level'
    ),
  
  goalsLink: yup.string()
    .url('Please enter a valid URL')
    .nullable()
}).required();

const CreateProjectFormWithYup: React.FC<CreateProjectFormWithYupProps> = ({
  departments,
  users,
  onProjectAdded,
  onCancel
}) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default values for the form
  const defaultValues: ProjectFormData = {
    name: '',
    description: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    status: ProjectStatus.PLANNING,
    projectManagerId: '',
    budget: 0,
    goalsLink: '',
    client: '',
    priority: ProjectPriority.MEDIUM
  };
  
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
  
  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const projectData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        client: data.client.trim(),
        budget: data.budget
      };
      
      const projectResponse = await api.projects.createProject(projectData, token || '');
      
      if (projectResponse.data) {
        onProjectAdded(projectResponse.data as unknown as Project);
        navigate(`/projects/${projectResponse.data.id}`);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Create form using react-hook-form with yup resolver
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
    resolver: yupResolver(projectSchema as any)
  }) as { 
    control: Control<ProjectFormData>;
    handleSubmit: UseFormHandleSubmit<ProjectFormData>;
    formState: { errors: FieldErrors<ProjectFormData> }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <h2>{t('project.addNew')}</h2>
      <p>{t('project.fillDetails')}</p>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <GridContainer spacing={3}>
          <GridItem xs={12}>
            <FormTextField
              name="name"
              label={t('project.name')}
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          
          <GridItem xs={12}>
            <FormTextField
              name="description"
              label={t('project.description')}
              control={control}
              errors={errors}
              multiline
              rows={3}
              required
            />
          </GridItem>
          
          <GridItem xs={12} sm={6}>
            <FormDatePicker
              name="startDate"
              label={t('project.startDate')}
              control={control}
              errors={errors}
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
              control={control}
              errors={errors}
              required
              minDate={defaultValues.startDate}
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
              control={control}
              errors={errors}
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
              control={control}
              errors={errors}
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
              name="client"
              label={t('project.client')}
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          
          <GridItem xs={12} sm={6}>
            <FormTextField
              name="budget"
              label={t('project.budget')}
              control={control}
              errors={errors}
              type="number"
              required
            />
          </GridItem>
          
          <GridItem xs={12} sm={6}>
            <FormSelect
              name="status"
              label={t('project.status')}
              control={control}
              errors={errors}
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
              control={control}
              errors={errors}
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
          
          <GridItem xs={12}>
            <FormTextField
              name="goalsLink"
              label={t('project.goalsLink')}
              control={control}
              errors={errors}
            />
          </GridItem>
          
          <GridItem xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <button 
              type="button" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? t('common.creating') : t('common.create')}
            </button>
          </GridItem>
        </GridContainer>
        
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
      </form>
    </Paper>
  );
};

export default CreateProjectFormWithYup; 