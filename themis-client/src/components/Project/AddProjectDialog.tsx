import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  FormHelperText,
  Typography,
  SelectChangeEvent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  OutlinedInput,
  Checkbox,
  ListItemAvatar,
  Alert,
  AlertTitle,
  ListItemIcon,
  CircularProgress,
  Grid,
  Divider,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ProjectStatus, User, ProjectPriority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { 
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { GridItem, GridContainer } from '../../components/common/MuiGridWrapper';
import { Project, Department } from '../../types';
import { mockProjects } from '../../services/mockData';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ProjectResponse {
  id: string;
  name: string;
  [key: string]: any;
}

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onProjectAdded: (project: Project) => void;
  departments: Department[];
  users: User[];
}

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain'
];

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ 
  open, 
  onClose, 
  onProjectAdded,
  departments,
  users
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    status: ProjectStatus.PLANNING,
    projectManagerId: '',
    budget: 0,
    goalsLink: '',
    teamMembers: [] as string[],
    client: '', // Add client field
    priority: ProjectPriority.MEDIUM
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) || value === '') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : numValue }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, endDate: date }));
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > FILE_SIZE_LIMIT) {
      return `File size exceeds ${FILE_SIZE_LIMIT / (1024 * 1024)}MB limit`;
    }
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported';
    }
    
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const errors: string[] = [];
      
      // Validate each file
      const validFiles = newFiles.filter((file, index) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
          return false;
        }
        return true;
      });
      
      setAttachments(prev => [...prev, ...validFiles]);
      setAttachmentErrors(errors);
      
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <DescriptionIcon color="error" />;
    } else if (fileType.includes('image')) {
      return <DescriptionIcon color="primary" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DescriptionIcon color="info" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <DescriptionIcon color="success" />;
    }
    return <DescriptionIcon />;
  };

  // Add handler for team members selection
  const handleTeamMembersChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      teamMembers: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = t('validation.required');
    }
    
    if (!formData.client.trim()) {
      errors.client = t('validation.required');
    }
    
    if (!formData.departmentId) {
      errors.departmentId = t('validation.required');
    }
    
    if (!formData.projectManagerId) {
      errors.projectManagerId = t('validation.required');
    }
    
    if (formData.startDate > formData.endDate) {
      errors.endDate = t('validation.endDateAfterStart');
    }
    
    if (formData.budget < 0) {
      errors.budget = t('validation.invalidNumber');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        client: formData.client.trim(), // Add client to the project data
        budget: formData.budget,
        teamMembers: formData.teamMembers,
        priority: formData.priority
      };
      
      const projectResponse = await api.projects.createProject(projectData, token || '') as ApiResponse<ProjectResponse>;
      
      // If we have attachments, upload them
      if (attachments.length > 0 && projectResponse.data?.id) {
        const projectId = projectResponse.data.id;
        const uploadPromises = attachments.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          return api.projects.uploadAttachment(projectId, formData, token || '');
        });
        
        await Promise.all(uploadPromises);
      }
      
      onProjectAdded(projectResponse.data as Project);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setFormErrors(prev => ({ 
        ...prev, 
        submit: 'Failed to create project. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProjectManagers = () => {
    return users.filter(user => 
      user.role === 'PROJECT_MANAGER' || 
      user.role === 'SUB_PMO' || 
      user.role === 'MAIN_PMO'
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight="bold">
          {t('project.addNew')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('project.fillDetails')}
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box component="form" noValidate autoComplete="off">
          <GridContainer spacing={3}>
            <GridItem xs={12}>
              <TextField
                label={t('project.name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                label={t('project.description')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={3}
                error={!!formErrors.description}
                helperText={formErrors.description}
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('project.startDate')}
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.startDate,
                      helperText: formErrors.startDate,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1.5 }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('project.endDate')}
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  minDate={formData.startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.endDate,
                      helperText: formErrors.endDate,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1.5 }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required
                error={!!formErrors.departmentId}
              >
                <InputLabel id="department-label">
                  {t('project.department')}
                </InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  label={t('project.department')}
                  onChange={handleSelectChange}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.departmentId && <FormHelperText>{formErrors.departmentId}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required
                error={!!formErrors.projectManagerId}
              >
                <InputLabel id="manager-label">
                  {t('project.projectManager')}
                </InputLabel>
                <Select
                  name="projectManagerId"
                  value={formData.projectManagerId}
                  label={t('project.projectManager')}
                  onChange={handleSelectChange}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  {getProjectManagers().map((pm) => (
                    <MenuItem key={pm.id} value={pm.id}>
                      {`${pm.firstName} ${pm.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.projectManagerId && <FormHelperText>{formErrors.projectManagerId}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                label={t('project.client')}
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.client}
                helperText={formErrors.client}
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                label={t('project.budget')}
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleNumberInputChange}
                fullWidth
                required
                error={!!formErrors.budget}
                helperText={formErrors.budget}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { borderRadius: 1.5 }
                }}
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">
                  {t('project.status')}
                </InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label={t('project.status')}
                  onChange={handleSelectChange}
                  required
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value={ProjectStatus.PLANNING}>{t('projectStatus.PLANNING')}</MenuItem>
                  <MenuItem value={ProjectStatus.IN_PROGRESS}>{t('projectStatus.IN_PROGRESS')}</MenuItem>
                  <MenuItem value={ProjectStatus.ON_HOLD}>{t('projectStatus.ON_HOLD')}</MenuItem>
                </Select>
              </FormControl>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">
                  {t('project.priority')}
                </InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label={t('project.priority')}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ProjectPriority }))}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <PriorityIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value={ProjectPriority.LOW}>{t('projectPriority.LOW')}</MenuItem>
                  <MenuItem value={ProjectPriority.MEDIUM}>{t('projectPriority.MEDIUM')}</MenuItem>
                  <MenuItem value={ProjectPriority.HIGH}>{t('projectPriority.HIGH')}</MenuItem>
                  <MenuItem value={ProjectPriority.CRITICAL}>{t('projectPriority.CRITICAL')}</MenuItem>
                </Select>
              </FormControl>
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                label={t('project.goalsLink')}
                name="goalsLink"
                value={formData.goalsLink}
                onChange={handleInputChange}
                fullWidth
                placeholder="https://..."
              />
            </GridItem>
            
            {/* File Attachments */}
            <GridItem xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t('project.attachments')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('project.supportedTypes')}
              </Typography>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              />
              
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }}
                onClick={handleFileUploadClick}
              >
                <CloudUploadIcon color="primary" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t('project.clickToSelect')}
                </Typography>
              </Paper>
              
              {attachmentErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <AlertTitle>{t('project.errorUploading')}</AlertTitle>
                  <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                    {attachmentErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              {attachments.length > 0 && (
                <List dense>
                  {attachments.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </GridItem>
          </GridContainer>
        </Box>
        
        {formErrors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formErrors.submit}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={24} /> : null}
        >
          {isSubmitting ? t('common.creating') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectDialog; 