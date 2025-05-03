import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import BilingualInput from '../BilingualInput';
import BilingualTextarea from '../BilingualTextarea';

const ProjectForm = ({ project, onSubmit, departments, users }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    departmentId: '',
    managerId: '',
    budget: 0,
    ...project
  });

  // Update form when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: '',
        description: '',
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: '',
        endDate: '',
        departmentId: '',
        managerId: '',
        budget: 0,
        ...project
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BilingualInput
            name="name"
            label={t('project.name')}
            contentKey={project?.id ? `project_name_${project.id}` : 'project_name_new'}
            initialValue={formData.name}
            required
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <BilingualTextarea
            name="description"
            label={t('project.description')}
            contentKey={project?.id ? `project_desc_${project.id}` : 'project_desc_new'}
            initialValue={formData.description}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="status-label">{t('project.status')}</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label={t('project.status')}
            >
              <MenuItem value="PLANNING">{t('projectStatus.PLANNING')}</MenuItem>
              <MenuItem value="IN_PROGRESS">{t('projectStatus.IN_PROGRESS')}</MenuItem>
              <MenuItem value="ON_HOLD">{t('projectStatus.ON_HOLD')}</MenuItem>
              <MenuItem value="COMPLETED">{t('projectStatus.COMPLETED')}</MenuItem>
              <MenuItem value="CANCELLED">{t('projectStatus.CANCELLED')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="priority-label">{t('project.priority')}</InputLabel>
            <Select
              labelId="priority-label"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label={t('project.priority')}
            >
              <MenuItem value="LOW">{t('projectPriority.LOW')}</MenuItem>
              <MenuItem value="MEDIUM">{t('projectPriority.MEDIUM')}</MenuItem>
              <MenuItem value="HIGH">{t('projectPriority.HIGH')}</MenuItem>
              <MenuItem value="CRITICAL">{t('projectPriority.CRITICAL')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('project.startDate')}
            name="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('project.endDate')}
            name="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="department-label">{t('project.department')}</InputLabel>
            <Select
              labelId="department-label"
              name="departmentId"
              value={formData.departmentId || ''}
              onChange={handleChange}
              label={t('project.department')}
            >
              {departments?.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="manager-label">{t('project.projectManager')}</InputLabel>
            <Select
              labelId="manager-label"
              name="managerId"
              value={formData.managerId || ''}
              onChange={handleChange}
              label={t('project.projectManager')}
            >
              <MenuItem value="">{t('project.unassigned')}</MenuItem>
              {users?.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('project.budget')}
            name="budget"
            type="number"
            value={formData.budget || 0}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {project?.id ? t('common.update') : t('common.create')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectForm; 