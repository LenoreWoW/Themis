import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import api from '../../services/api';

interface AvailabilitySlot {
  id?: string;
  start_time: Date;
  end_time: Date;
  service_type: 'built-in' | 'external';
  external_link: string;
  recurring: boolean;
  recurrence_rule?: string;
}

const DEFAULT_SLOT: AvailabilitySlot = {
  start_time: new Date(new Date().setHours(9, 0, 0, 0)),
  end_time: new Date(new Date().setHours(10, 0, 0, 0)),
  service_type: 'built-in',
  external_link: '',
  recurring: false
};

const BookingSettings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editSlot, setEditSlot] = useState<AvailabilitySlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch user's availability slots
  useEffect(() => {
    if (user) {
      loadSlots();
    }
  }, [user]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/booking/slots?userId=${user?.id}`);
      
      // Convert string dates to Date objects
      const formattedSlots = response.data.map((slot: any) => ({
        ...slot,
        start_time: new Date(slot.start_time),
        end_time: new Date(slot.end_time)
      }));
      
      setSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading availability slots:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load your availability slots',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    setEditSlot(DEFAULT_SLOT);
    setDialogOpen(true);
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditSlot(slot);
    setDialogOpen(true);
  };

  const handleDeleteSlot = async (id?: string) => {
    if (!id) return;
    
    try {
      await api.delete(`/booking/slots/${id}`);
      setSlots(slots.filter(slot => slot.id !== id));
      setSnackbar({
        open: true,
        message: 'Availability slot deleted successfully',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      
      // Handle the case where slot has bookings
      if (error.response?.status === 400 && error.response?.data?.bookingCount) {
        setSnackbar({
          open: true,
          message: `Cannot delete slot with ${error.response.data.bookingCount} existing bookings`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete availability slot',
          severity: 'error'
        });
      }
    }
  };

  const handleSaveSlot = async () => {
    if (!editSlot) return;
    
    try {
      const payload = {
        slots: [{
          ...editSlot,
          start_time: editSlot.start_time.toISOString(),
          end_time: editSlot.end_time.toISOString(),
          overwrite: !!editSlot.id // If editing an existing slot, overwrite it
        }]
      };
      
      const response = await api.post('/booking/slots', payload);
      
      // Update the local state
      if (editSlot.id) {
        // Updating existing slot
        setSlots(slots.map(slot => 
          slot.id === editSlot.id ? {
            ...response.data[0],
            start_time: new Date(response.data[0].start_time),
            end_time: new Date(response.data[0].end_time)
          } : slot
        ));
      } else {
        // Adding new slot
        setSlots([
          ...slots,
          {
            ...response.data[0],
            start_time: new Date(response.data[0].start_time),
            end_time: new Date(response.data[0].end_time)
          }
        ]);
      }
      
      setSnackbar({
        open: true,
        message: 'Availability slot saved successfully',
        severity: 'success'
      });
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving slot:', error);
      
      // Handle conflict errors
      if (error.response?.status === 409) {
        setSnackbar({
          open: true,
          message: 'This time slot conflicts with an existing availability slot',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to save availability slot',
          severity: 'error'
        });
      }
    }
  };

  const copyBookingLink = () => {
    const link = `${window.location.origin}/booking/${user?.id}`;
    navigator.clipboard.writeText(link);
    
    setSnackbar({
      open: true,
      message: 'Booking link copied to clipboard',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Scheduling & Booking Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Your Booking Link</Typography>
          <Button 
            variant="outlined" 
            startIcon={<CopyIcon />}
            onClick={copyBookingLink}
          >
            Copy Booking Link
          </Button>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          value={`${window.location.origin}/booking/${user?.id}`}
          InputProps={{
            readOnly: true,
          }}
          helperText="Share this link with others to let them book meetings with you"
        />
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Availability Slots</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddSlot}
          >
            Add New Slot
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : slots.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography color="textSecondary">
              You haven't set up any availability slots yet. Add slots to let people book meetings with you.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {slots.map((slot) => (
              <Grid item xs={12} key={slot.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {format(slot.start_time, 'MMM dd, yyyy')} {' • '}
                      {format(slot.start_time, 'h:mm a')} - {format(slot.end_time, 'h:mm a')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {slot.service_type === 'built-in' 
                        ? 'Built-in Themis meeting' 
                        : `External meeting: ${slot.external_link}`}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit slot">
                      <IconButton
                        size="small"
                        onClick={() => handleEditSlot(slot)}
                        aria-label="edit"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete slot">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSlot(slot.id)}
                        aria-label="delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Slot Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editSlot?.id ? 'Edit Availability Slot' : 'Add New Availability Slot'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Start Time"
                  value={editSlot?.start_time}
                  onChange={(newValue) => {
                    if (newValue && editSlot) {
                      setEditSlot({
                        ...editSlot,
                        start_time: newValue
                      });
                    }
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      margin: 'normal'
                    } 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="End Time"
                  value={editSlot?.end_time}
                  onChange={(newValue) => {
                    if (newValue && editSlot) {
                      setEditSlot({
                        ...editSlot,
                        end_time: newValue
                      });
                    }
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      margin: 'normal'
                    } 
                  }}
                />
              </Grid>
            </LocalizationProvider>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editSlot?.service_type === 'external'}
                    onChange={(e) => {
                      if (editSlot) {
                        setEditSlot({
                          ...editSlot,
                          service_type: e.target.checked ? 'external' : 'built-in'
                        });
                      }
                    }}
                  />
                }
                label="Use External Meeting Link"
              />
            </Grid>
            
            {editSlot?.service_type === 'external' && (
              <Grid item xs={12}>
                <TextField
                  label="External Meeting Link"
                  fullWidth
                  value={editSlot.external_link}
                  onChange={(e) => {
                    if (editSlot) {
                      setEditSlot({
                        ...editSlot,
                        external_link: e.target.value
                      });
                    }
                  }}
                  placeholder="https://zoom.us/j/123456789"
                  helperText="Enter your Zoom, Teams, or other meeting link"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editSlot?.recurring || false}
                    onChange={(e) => {
                      if (editSlot) {
                        setEditSlot({
                          ...editSlot,
                          recurring: e.target.checked
                        });
                      }
                    }}
                  />
                }
                label="Recurring Slot (repeats weekly)"
                disabled={true}
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Recurring slots feature coming soon
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveSlot} 
            variant="contained" 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingSettings; 