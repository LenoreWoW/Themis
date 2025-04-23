import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  FormHelperText,
  IconButton,
  Grid,
  useTheme,
  Autocomplete,
  OutlinedInput,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { DatePicker as MuiDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import { Project, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import WorkflowForm, { WorkflowAction } from '../shared/WorkflowForm';
import { ApprovalStatus } from '../../context/AuthContext';
import api from '../../services/api';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export enum ChangeRequestType {
  SCHEDULE = 'SCHEDULE',
  SCOPE = 'SCOPE',
  BUDGET = 'BUDGET',
  RESOURCE = 'RESOURCE',
  CLOSURE = 'CLOSURE',
  OTHER = 'OTHER',
}

// Simple hook to fetch users
const useFetchAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (authUser) {
          // In a real app, you would fetch from the API
          // For now, we'll use mock data
          const mockUsers = [
            { id: 'pm-1', firstName: 'John', lastName: 'Smith', role: 'PROJECT_MANAGER' },
            { id: 'pm-2', firstName: 'Jane', lastName: 'Doe', role: 'PROJECT_MANAGER' },
            { id: 'pm-3', firstName: 'Robert', lastName: 'Johnson', role: 'PROJECT_MANAGER' }
          ] as User[];
          
          setUsers(mockUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [authUser]);

  return { users };
};

// Define validation schema
const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().required('Change request type is required'),
  impact: yup.string().required('Impact assessment is required'),
  justification: yup.string().required('Justification is required'),
  alternatives: yup.string().required('Alternatives consideration is required'),
  newEndDate: yup.date().nullable().when('type', {
    is: ChangeRequestType.SCHEDULE,
    then: (schema) => schema.required('New end date is required for timeline extension')
  }),
  newCost: yup.number().nullable().when('type', {
    is: ChangeRequestType.BUDGET,
    then: (schema) => schema.required('New cost is required for budget change')
  }),
  newManager: yup.string().nullable().when('type', {
    is: ChangeRequestType.RESOURCE,
    then: (schema) => schema.required('New project manager is required for delegation')
  }),
  newScope: yup.string().nullable().when('type', {
    is: ChangeRequestType.SCOPE,
    then: (schema) => schema.required('New scope is required for scope change')
  })
});

interface ChangeRequestDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSubmitted: () => void;
  changeRequestType?: string | null;
}

interface ChangeRequestFormData {
  title: string;
  description: string;
  type: ChangeRequestType;
  impact: string;
  justification: string;
  alternatives: string;
  newEndDate: Date | null;
  newCost: string;
  newScopeDescription: string;
  newProjectManagerId: string;
  closureReason: string;
  attachments: File[];
}

const ChangeRequestDialog: React.FC<ChangeRequestDialogProps> = ({
  open,
  onClose,
  projectId,
  onSubmitted,
  changeRequestType = null,
}) => {
  const { user } = useAuth();
  const { users } = useFetchAllUsers();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set initial type based on prop, or default to SCHEDULE
  const initialType = changeRequestType as ChangeRequestType || ChangeRequestType.SCHEDULE;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: initialType,
    newEndDate: null as Date | null,
    newCost: '',
    newScopeDescription: '',
    newProjectManagerId: '',
    closureReason: '',
    attachments: [] as File[],
  });

  // Reset form when dialog opens/closes or type changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: getDefaultTitle(initialType),
        description: '',
        type: initialType,
        newEndDate: null,
        newCost: '',
        newScopeDescription: '',
        newProjectManagerId: '',
        closureReason: '',
        attachments: [],
      });
      setError(null);
    }
  }, [open, initialType]);
  
  // Generate default title based on request type
  const getDefaultTitle = (type: ChangeRequestType) => {
    switch (type) {
      case ChangeRequestType.SCHEDULE:
        return 'Request to Extend Project Timeline';
      case ChangeRequestType.BUDGET:
        return 'Request to Modify Project Budget';
      case ChangeRequestType.SCOPE:
        return 'Request to Change Project Scope';
      case ChangeRequestType.RESOURCE:
        return 'Request to Change Project Manager';
      case ChangeRequestType.CLOSURE:
        return 'Request to Close Project';
      default:
        return 'Change Request';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, newEndDate: date });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFormData({ ...formData, attachments: Array.from(event.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validationErrors = await validateForm();
      if (validationErrors) {
        setError(validationErrors);
        setLoading(false);
        return;
      }

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Create a new request in local data
      const changeRequest = {
        id: `cr-${Date.now()}`,
        projectId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: 'PENDING',
        requestedById: user?.id || '',
        requestedByName: `${user?.firstName} ${user?.lastName}`,
        requestedDate: new Date().toISOString(),
        // Add specific fields based on type
        details: {
          ...(formData.type === ChangeRequestType.SCHEDULE && { newEndDate: formData.newEndDate }),
          ...(formData.type === ChangeRequestType.BUDGET && { newCost: formData.newCost }),
          ...(formData.type === ChangeRequestType.SCOPE && { newScopeDescription: formData.newScopeDescription }),
          ...(formData.type === ChangeRequestType.RESOURCE && { newProjectManagerId: formData.newProjectManagerId }),
        },
        attachments: formData.attachments.map(file => ({ name: file.name, size: file.size })),
      };

      // Save to localStorage (mock)
      const existingRequests = JSON.parse(localStorage.getItem('changeRequests') || '[]');
      localStorage.setItem('changeRequests', JSON.stringify([...existingRequests, changeRequest]));

      // Create audit log entry
      const auditLogEntry = {
        id: `audit-${Date.now()}`,
        projectId,
        action: 'CHANGE_REQUEST_SUBMITTED',
        description: getAuditLogDescription(formData.type, formData.title),
        userId: user?.id || '',
        userName: `${user?.firstName} ${user?.lastName}`,
        timestamp: new Date().toISOString(),
      };
      const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      localStorage.setItem('auditLogs', JSON.stringify([...existingLogs, auditLogEntry]));

      onSubmitted();
      onClose();
    } catch (err) {
      setError('Failed to submit change request. Please try again.');
      console.error('Error submitting change request:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = async () => {
    try {
      // Base validation schema
      let validationSchema = yup.object().shape({
        title: yup.string().required('Title is required'),
        description: yup.string().required('Description is required'),
        type: yup.string().required('Change request type is required'),
      });

      // Add additional validation based on type
      switch (formData.type) {
        case ChangeRequestType.SCHEDULE:
          validationSchema = validationSchema.shape({
            newEndDate: yup.date()
              .nullable()
              .required('New end date is required')
              .min(new Date(), 'End date cannot be in the past'),
          });
          break;
        case ChangeRequestType.BUDGET:
          validationSchema = validationSchema.shape({
            newCost: yup.number()
              .required('New cost is required')
              .min(0, 'Cost must be greater than or equal to 0'),
          });
          break;
        case ChangeRequestType.SCOPE:
          validationSchema = validationSchema.shape({
            newScopeDescription: yup.string().required('New scope description is required'),
          });
          break;
        case ChangeRequestType.RESOURCE:
          validationSchema = validationSchema.shape({
            newProjectManagerId: yup.string().required('New project manager is required'),
          });
          break;
        case ChangeRequestType.CLOSURE:
          validationSchema = validationSchema.shape({
            newEndDate: yup.date()
              .nullable()
              .required('Closure date is required')
              .min(new Date(), 'Closure date cannot be in the past'),
            closureReason: yup.string().required('Reason for closure is required'),
          });
          break;
      }

      await validationSchema.validate(formData, { abortEarly: false });
      return null;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return err.errors.join(', ');
      }
      return 'Validation failed';
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.type) {
      case ChangeRequestType.SCHEDULE:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MuiDatePicker
              label="New End Date"
              value={formData.newEndDate}
              onChange={handleDateChange}
              minDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  required: true,
                  error: !!error && error.includes('date')
                }
              }}
            />
          </LocalizationProvider>
        );
      case ChangeRequestType.BUDGET:
        return (
          <TextField
            name="newCost"
            label="New Budget Cost"
            type="number"
            value={formData.newCost}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={!!error && error.includes('cost')}
          />
        );
      case ChangeRequestType.SCOPE:
        return (
          <TextField
            name="newScopeDescription"
            label="New Scope Description"
            value={formData.newScopeDescription}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            required
            error={!!error && error.includes('scope')}
          />
        );
      case ChangeRequestType.RESOURCE:
        return (
          <FormControl fullWidth margin="normal" required error={!!error && error.includes('manager')}>
            <InputLabel id="new-project-manager-label">New Project Manager</InputLabel>
            <Select
              labelId="new-project-manager-label"
              id="newProjectManagerId"
              name="newProjectManagerId"
              value={formData.newProjectManagerId}
              onChange={handleChange}
              label="New Project Manager"
            >
              {users
                .filter(user => user.role === 'PROJECT_MANAGER' || user.role === 'MAIN_PMO')
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        );
      case ChangeRequestType.CLOSURE:
        return (
          <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MuiDatePicker
                label="Requested Closure Date"
                value={formData.newEndDate}
                onChange={handleDateChange}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    required: true,
                    error: !!error && error.includes('date')
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              name="closureReason"
              label="Reason for Closure"
              value={formData.closureReason || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              required
              error={!!error && error.includes('reason')}
            />
          </>
        );
      default:
        return null;
    }
  };

  // Helper to get descriptive audit log message
  const getAuditLogDescription = (type: ChangeRequestType, title: string): string => {
    switch (type) {
      case ChangeRequestType.SCHEDULE:
        return `Submitted a schedule extension request: ${title}`;
      case ChangeRequestType.BUDGET:
        return `Submitted a budget change request: ${title}`;
      case ChangeRequestType.SCOPE:
        return `Submitted a scope change request: ${title}`;
      case ChangeRequestType.RESOURCE:
        return `Submitted a project delegation request: ${title}`;
      case ChangeRequestType.CLOSURE:
        return `Submitted a project closure request: ${title}`;
      default:
        return `Submitted a change request: ${title}`;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Submit Change Request
        {formData.type && (
          <Typography variant="caption" display="block" color="textSecondary">
            Type: {formData.type.replace('_', ' ')}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} id="change-request-form">
          <TextField
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!error && error.includes('Title')}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="change-request-type-label">Change Request Type</InputLabel>
            <Select
              labelId="change-request-type-label"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Change Request Type"
            >
              <MenuItem value={ChangeRequestType.SCHEDULE}>Extend Project</MenuItem>
              <MenuItem value={ChangeRequestType.BUDGET}>Change Project Cost</MenuItem>
              <MenuItem value={ChangeRequestType.SCOPE}>Change Project Scope</MenuItem>
              <MenuItem value={ChangeRequestType.RESOURCE}>Delegate Project</MenuItem>
              <MenuItem value={ChangeRequestType.CLOSURE}>Close Project</MenuItem>
              <MenuItem value={ChangeRequestType.OTHER}>Other Change</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            required
            error={!!error && error.includes('Description')}
          />
          
          {renderAdditionalFields()}
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<AttachFileIcon />}
              sx={{ mr: 1 }}
            >
              Attach Files
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>
            {formData.attachments.length > 0 && (
              <Typography variant="body2" color="textSecondary">
                {formData.attachments.length} file(s) selected
              </Typography>
            )}
          </Box>
          
          {formData.attachments.length > 0 && (
            <List dense sx={{ mt: 1 }}>
              {formData.attachments.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="change-request-form"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRequestDialog; 