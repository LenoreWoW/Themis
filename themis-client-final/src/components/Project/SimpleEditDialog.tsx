import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import { ProjectStatus } from '../../types';

type FieldType = 'status' | 'cost';

interface SimpleEditDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fieldType: FieldType;
  value: string | number;
  onChange: (value: string | number) => void;
  onSave: () => void;
}

const SimpleEditDialog: React.FC<SimpleEditDialogProps> = ({
  open,
  onClose,
  title,
  fieldType,
  value,
  onChange,
  onSave
}) => {
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };
  
  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(event.target.value);
    if (!isNaN(numValue) || event.target.value === '') {
      onChange(event.target.value === '' ? 0 : numValue);
    }
  };
  
  // Helper function to get status label
  const getStatusLabel = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'Planning';
      case ProjectStatus.IN_PROGRESS:
        return 'In Progress';
      case ProjectStatus.ON_HOLD:
        return 'On Hold';
      case ProjectStatus.COMPLETED:
        return 'Completed';
      case ProjectStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {fieldType === 'status' ? (
            <FormControl fullWidth>
              <InputLabel id="status-edit-label">Status</InputLabel>
              <Select
                labelId="status-edit-label"
                value={value as string}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value={ProjectStatus.PLANNING}>{getStatusLabel(ProjectStatus.PLANNING)}</MenuItem>
                <MenuItem value={ProjectStatus.IN_PROGRESS}>{getStatusLabel(ProjectStatus.IN_PROGRESS)}</MenuItem>
                <MenuItem value={ProjectStatus.ON_HOLD}>{getStatusLabel(ProjectStatus.ON_HOLD)}</MenuItem>
                <MenuItem value={ProjectStatus.COMPLETED}>{getStatusLabel(ProjectStatus.COMPLETED)}</MenuItem>
                <MenuItem value={ProjectStatus.CANCELLED}>{getStatusLabel(ProjectStatus.CANCELLED)}</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Actual Cost"
              type="number"
              fullWidth
              value={value}
              onChange={handleCostChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleEditDialog; 