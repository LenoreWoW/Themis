import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormWithValidation, { 
  FormTextField, 
  FormSelect, 
  FormDatePicker
} from '../shared/FormWithValidation';
import { FormControl, InputLabel, Select, MenuItem, ListItemText, Checkbox, OutlinedInput, Box, Chip } from '@mui/material';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { Department, Project, ProjectPriority, ProjectStatus, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  Alert,
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
import { v4 as uuidv4 } from 'uuid';

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
  priority: ProjectPriority;
  projectDependencies: string[];
  dependentProjects: string[];
}

interface CreateProjectFormProps {
  departments: Department[];
  users: User[];
  onProjectAdded: (project: Project) => void;
  onCancel: () => void;
}

// Add a FormMultiSelect component specific to this form since we haven't added it to the shared components yet
const ProjectMultiSelect: React.FC<{
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
}> = ({ name, label, options, value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel id={`${name}-label`}>{label}</InputLabel>
    <Select
      labelId={`${name}-label`}
      id={name}
      multiple
      value={value}
      onChange={onChange as any}
      input={<OutlinedInput label={label} />}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(selected as string[]).map((value) => {
            const option = options.find(opt => opt.value === value);
            return (
              <Chip 
                key={value} 
                label={option ? option.label : value} 
                size="small" 
              />
            );
          })}
        </Box>
      )}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 224,
            width: 250,
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Checkbox checked={value.indexOf(option.value) > -1} />
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDependencies, setProjectDependencies] = useState<string[]>([]);
  const [dependentProjects, setDependentProjects] = useState<string[]>([]);

  // Fetch all projects for dependencies selection
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await api.projects.getAllProjects(token || '');
        if (projectsData.data) {
          setProjects(projectsData.data as Project[]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, [token]);

  // Handle changes to project dependencies
  const handleProjectDependenciesChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setProjectDependencies(event.target.value as string[]);
  };

  // Handle changes to dependent projects
  const handleDependentProjectsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDependentProjects(event.target.value as string[]);
  };

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
    priority: ProjectPriority.MEDIUM,
    projectDependencies: [],
    dependentProjects: []
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
        id: uuidv4(),
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        budget: data.budget,
        goalsLink: data.goalsLink,
        teamMembers: data.teamMembers,
        projectManagerId: data.projectManagerId,
        projectDependencies: projectDependencies,
        dependentProjects: dependentProjects
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
          
          <GridItem xs={12}>
            <ProjectMultiSelect
              name="projectDependencies"
              label={t('project.dependsOn') || "Projects This Project Depends On"}
              options={projects.map(proj => ({
                value: proj.id,
                label: proj.name
              }))}
              value={projectDependencies}
              onChange={handleProjectDependenciesChange}
            />
          </GridItem>
          
          <GridItem xs={12}>
            <ProjectMultiSelect
              name="dependentProjects"
              label={t('project.dependedBy') || "Projects That Depend On This Project"}
              options={projects.map(proj => ({
                value: proj.id,
                label: proj.name
              }))}
              value={dependentProjects}
              onChange={handleDependentProjectsChange}
            />
          </GridItem>
        </GridContainer>
      </FormWithValidation>
    </Paper>
  );
};

export default CreateProjectForm; 