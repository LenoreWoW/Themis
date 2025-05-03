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
  InputAdornment,
  Modal
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ProjectStatus, User, ProjectPriority, ProjectTemplateType } from '../../types';
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
import { v4 as uuidv4 } from 'uuid';
import { getTemplatePreviewPath, getTemplateDescription } from '../../utils/imagePlaceholders';

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
    client: '',
    teamMembers: [] as string[],
    priority: ProjectPriority.MEDIUM,
    templateType: ProjectTemplateType.DEFAULT
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateType | null>(null);

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
    
    if (!formData.departmentId) {
      errors.departmentId = t('validation.required');
    }
    
    if (!formData.projectManagerId) {
      errors.projectManagerId = t('validation.required');
    }
    
    if (!formData.client.trim()) {
      errors.client = t('validation.required');
    }
    
    if (formData.startDate > formData.endDate) {
      errors.endDate = t('validation.endDateAfterStart');
    }
    
    if (formData.budget < 0) {
      errors.budget = t('validation.invalidNumber');
    }
    
    if (!formData.templateType) {
      errors.templateType = 'Please select a project template';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find the selected project manager
      const selectedProjectManager = users.find(u => u.id === formData.projectManagerId);
      const selectedDepartment = departments.find(d => d.id === formData.departmentId);
      
      // Create project data
      const projectData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        department: selectedDepartment,
        budget: formData.budget,
        actualCost: 0,
        projectManager: selectedProjectManager,
        teamMembers: formData.teamMembers,
        client: formData.client,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: formData.templateType
      };
      
      // First, clear localStorage to avoid any inconsistencies
      localStorage.removeItem('themis_projects');
      
      const projectResponse = await api.projects.createProject(projectData, token || '');
      
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
      
      // Check if we have a project response with data
      if (projectResponse.data) {
        // Force update localStorage before proceeding
        const existingProjects = JSON.parse(localStorage.getItem('themis_projects') || '[]');
        localStorage.setItem('themis_projects', JSON.stringify([
          ...existingProjects,
          { ...projectResponse.data, templateType: formData.templateType }
        ]));
        
        onProjectAdded(projectResponse.data as Project);
        onClose();
      } else {
        throw new Error('No project data returned from API');
      }
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

  // Handle template selection with preview
  const handleTemplateSelect = (templateType: ProjectTemplateType) => {
    setFormData(prev => ({ ...prev, templateType }));
    setSelectedTemplate(templateType);
  };

  // Handle template preview
  const handlePreviewOpen = (templateType: ProjectTemplateType) => {
    setSelectedTemplate(templateType);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        key="add-project-dialog"
      >
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
                <Typography variant="subtitle1" gutterBottom>
                  Project Template
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select a template to customize your project dashboard and workflow
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: 2, 
                    flex: 1 
                  }}>
                    {/* Default Template - Only display this one */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderColor: formData.templateType === ProjectTemplateType.DEFAULT ? 'primary.main' : 'divider',
                        borderWidth: formData.templateType === ProjectTemplateType.DEFAULT ? 2 : 1,
                        bgcolor: formData.templateType === ProjectTemplateType.DEFAULT ? 'primary.light' : 'background.paper',
                        color: formData.templateType === ProjectTemplateType.DEFAULT ? 'primary.contrastText' : 'text.primary',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => handleTemplateSelect(ProjectTemplateType.DEFAULT)}
                    >
                      <BusinessIcon fontSize="large" />
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Default</Typography>
                      <Typography variant="caption" display="block">Standard project view</Typography>
                      <Button 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewOpen(ProjectTemplateType.DEFAULT);
                        }}
                      >
                        Preview
                      </Button>
                    </Paper>
                    
                    {/* Template Coming Soon Notice */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>More Templates</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Coming Soon
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Template Preview and Information */}
                  {formData.templateType && (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        flex: 1,
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {formData.templateType === ProjectTemplateType.DEFAULT ? 'Default Template' : 
                         formData.templateType === ProjectTemplateType.ERP ? 'ERP Template' :
                         formData.templateType === ProjectTemplateType.MARKETING ? 'Marketing Template' :
                         formData.templateType === ProjectTemplateType.FINANCE ? 'Finance Template' :
                         formData.templateType === ProjectTemplateType.SUPPLY_CHAIN ? 'Supply Chain Template' :
                         formData.templateType === ProjectTemplateType.WEBSITE ? 'Website Template' :
                         'Infrastructure Template'}
                      </Typography>
                      <Box 
                        sx={{ 
                          width: '100%',
                          height: '150px',
                          borderRadius: 1,
                          mb: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={() => handlePreviewOpen(formData.templateType)}
                      >
                        <Box
                          component="img"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          src={getTemplatePreviewPath(formData.templateType)}
                          alt={`${formData.templateType} Template Preview`}
                          data-placeholder-id={`template-placeholder-${formData.templateType}`}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.6)', 
                            color: 'common.white', 
                            p: 1, 
                            borderRadius: 1 
                          }}
                        >
                          Click to enlarge
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {getTemplateDescription(formData.templateType)}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 2 }}
                        onClick={() => handlePreviewOpen(formData.templateType)}
                      >
                        View Full Preview
                      </Button>
                    </Paper>
                  )}
                </Box>
                
                {formErrors.templateType && (
                  <FormHelperText error>{formErrors.templateType}</FormHelperText>
                )}
              </GridItem>
              
              <GridItem xs={12}>
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

      {/* Template Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={handlePreviewClose}
        aria-labelledby="template-preview-modal"
        aria-describedby="template-preview-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '70%' },
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'auto'
        }}>
          <Typography id="template-preview-modal" variant="h6" component="h2">
            {selectedTemplate === ProjectTemplateType.DEFAULT ? 'Default Template' : 
             selectedTemplate === ProjectTemplateType.ERP ? 'ERP Template' :
             selectedTemplate === ProjectTemplateType.MARKETING ? 'Marketing Template' :
             selectedTemplate === ProjectTemplateType.FINANCE ? 'Finance Template' :
             selectedTemplate === ProjectTemplateType.SUPPLY_CHAIN ? 'Supply Chain Template' :
             selectedTemplate === ProjectTemplateType.WEBSITE ? 'Website Template' :
             'Infrastructure Template'} Preview
          </Typography>
          
          <Divider />

          <Box sx={{ 
            width: '100%', 
            minHeight: '300px',
            padding: 2,
            backgroundColor: 'action.hover',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <Box
              component="img"
              sx={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
              src={selectedTemplate ? getTemplatePreviewPath(selectedTemplate) : '/assets/images/templates/default_template.png'}
              alt="Template Preview"
              data-placeholder-id={selectedTemplate ? `template-placeholder-${selectedTemplate}` : 'template-placeholder-default'}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = '/assets/images/placeholder.png';
              }}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              This is a preview of how your project will be structured with this template
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mt: 2 }}>
            {selectedTemplate ? getTemplateDescription(selectedTemplate) : ''}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handlePreviewClose}>
              Close
            </Button>
            {selectedTemplate && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setFormData(prev => ({ ...prev, templateType: selectedTemplate }));
                  handlePreviewClose();
                }}
              >
                Select This Template
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default AddProjectDialog; 