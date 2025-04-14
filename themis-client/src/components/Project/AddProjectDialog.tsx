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
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ProjectStatus, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../../services/api';

interface Department {
  id: string;
  name: string;
}

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
  onProjectAdded: () => void;
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
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default to 90 days from now
    status: ProjectStatus.PLANNING,
    projectManagerId: '',
    budget: 0,
    goalsLink: '',
    teamMembers: [] as string[] // Add teamMembers array to store selected user IDs
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
    
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
      setProjectData(prev => ({ ...prev, [name]: value === '' ? 0 : numValue }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setProjectData(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setProjectData(prev => ({ ...prev, endDate: date }));
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
    setProjectData(prev => ({
      ...prev,
      teamMembers: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!projectData.name.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (!projectData.departmentId) {
      errors.departmentId = 'Department is required';
    }
    
    if (!projectData.projectManagerId) {
      errors.projectManagerId = 'Project manager is required';
    }
    
    if (projectData.startDate > projectData.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (projectData.budget < 0) {
      errors.budget = 'Budget cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Create project first
      const projectResponse = await api.projects.createProject({
        ...projectData,
        startDate: projectData.startDate.toISOString(),
        endDate: projectData.endDate.toISOString(),
        // Include team members in the project creation
        teamMembers: projectData.teamMembers
      }, token || '') as ApiResponse<ProjectResponse>;
      
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
      
      onProjectAdded();
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
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={projectData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={projectData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth error={!!formErrors.departmentId}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="departmentId"
                  value={projectData.departmentId}
                  label="Department"
                  onChange={handleSelectChange}
                  required
                >
                  {departments.map(department => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.departmentId && <FormHelperText>{formErrors.departmentId}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={projectData.status}
                  label="Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={ProjectStatus.PLANNING}>Planning</MenuItem>
                  <MenuItem value={ProjectStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={ProjectStatus.ON_HOLD}>On Hold</MenuItem>
                  <MenuItem value={ProjectStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={ProjectStatus.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={projectData.startDate}
                onChange={handleStartDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
              
              <DatePicker
                label="End Date"
                value={projectData.endDate}
                onChange={handleEndDateChange}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: !!formErrors.endDate,
                    helperText: formErrors.endDate
                  } 
                }}
              />
            </Box>
            
            <FormControl fullWidth error={!!formErrors.projectManagerId}>
              <InputLabel>Project Manager</InputLabel>
              <Select
                name="projectManagerId"
                value={projectData.projectManagerId}
                label="Project Manager"
                onChange={handleSelectChange}
                required
              >
                {getProjectManagers().map(pm => (
                  <MenuItem key={pm.id} value={pm.id}>
                    {pm.firstName} {pm.lastName} ({pm.username})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.projectManagerId && <FormHelperText>{formErrors.projectManagerId}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="team-members-label">Team Members</InputLabel>
              <Select
                labelId="team-members-label"
                id="team-members"
                multiple
                value={projectData.teamMembers}
                onChange={handleTeamMembersChange}
                input={<OutlinedInput label="Team Members" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((userId) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <Chip 
                          key={userId} 
                          label={user ? `${user.firstName} ${user.lastName}` : userId} 
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={projectData.teamMembers.indexOf(user.id) > -1} />
                    <ListItemText 
                      primary={`${user.firstName} ${user.lastName}`} 
                      secondary={user.role}
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select team members who will work on this project</FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="number"
              value={projectData.budget}
              onChange={handleNumberInputChange}
              InputProps={{ startAdornment: '$' }}
              error={!!formErrors.budget}
              helperText={formErrors.budget}
            />
            
            <TextField
              fullWidth
              label="Goals Link (Optional)"
              name="goalsLink"
              value={projectData.goalsLink}
              onChange={handleInputChange}
              placeholder="https://..."
            />
            
            {/* File Attachments */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Attachments
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Supported file types: PDF, Word, Excel, Images, Text (Max 10MB per file)
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
                  Click to select files or drag and drop files here
                </Typography>
              </Paper>
              
              {attachmentErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <AlertTitle>Error uploading files</AlertTitle>
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
            </Box>
          </Stack>
        </LocalizationProvider>
        
        {formErrors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formErrors.submit}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={24} /> : null}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectDialog; 