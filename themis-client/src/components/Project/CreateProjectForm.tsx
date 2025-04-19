import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormWithValidation, { 
  FormTextField, 
  FormSelect, 
  FormDatePicker 
} from '../shared/FormWithValidation';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { Department, Project, ProjectPriority, ProjectStatus, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Paper,
  Typography
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';

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
  teamMembers: string[];
  client: string;
  priority: ProjectPriority;
}

interface CreateProjectFormProps {
  departments: Department[];
  users: User[];
  onProjectAdded: (project: Project) => void;
  onCancel: () => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  departments,
  users,
  onProjectAdded,
  onCancel
}) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    teamMembers: [],
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

  // Form submission handler
  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const projectData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        client: data.client.trim(),
        budget: data.budget,
        teamMembers: data.teamMembers,
        priority: data.priority
      };
      
      const projectResponse = await api.projects.createProject(projectData, token || '');
      
      if (projectResponse.data) {
        onProjectAdded(projectResponse.data as unknown as Project);
      } else {
        setSubmitError('Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setSubmitError('An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <FormWithValidation<ProjectFormData>
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        title={t('project.addNew')}
        subtitle={t('project.fillDetails')}
        submitButtonText={t('common.create')}
        cancelButtonText={t('common.cancel')}
        onCancel={onCancel}
        isLoading={isSubmitting}
        error={submitError || undefined}
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
              name="client"
              label={t('project.client')}
              required
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
          
          <GridItem xs={12}>
            <FormTextField
              name="goalsLink"
              label={t('project.goalsLink')}
            />
          </GridItem>
        </GridContainer>
      </FormWithValidation>
    </Paper>
  );
};

export default CreateProjectForm; 