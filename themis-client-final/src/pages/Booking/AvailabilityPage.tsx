import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Container,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { format, addMinutes, setHours, setMinutes, isBefore } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  service_type: 'built-in' | 'external';
  external_link?: string;
}

// Create simple API service for booking
const bookingApi = {
  getSlots: async (userId: string, token: string) => {
    // Use mock data instead of API call
    try {
      // Get stored slots or initialize with empty array
      const storedSlots = localStorage.getItem(`booking-slots-${userId}`);
      const slots = storedSlots ? JSON.parse(storedSlots) : [];
      
      // If no stored slots, create some initial mock slots for demo
      if (!slots || slots.length === 0) {
        const now = new Date();
        const mockSlots = [];
        
        // Create 5 mock slots spread over the next few days
        for (let i = 0; i < 5; i++) {
          const slotDate = new Date(now);
          slotDate.setDate(now.getDate() + Math.floor(i / 2)); // Spread over days
          slotDate.setHours(9 + i % 8, 0, 0, 0); // Hours from 9am to 5pm
          
          const endTime = new Date(slotDate);
          endTime.setMinutes(slotDate.getMinutes() + 30); // 30-minute slots
          
          mockSlots.push({
            id: `slot-${i}-${userId}`,
            start_time: slotDate.toISOString(),
            end_time: endTime.toISOString(),
            service_type: 'built-in'
          });
        }
        
        // Store the mock slots
        localStorage.setItem(`booking-slots-${userId}`, JSON.stringify(mockSlots));
        return mockSlots;
      }
      
      return slots;
    } catch (error) {
      console.error('Error in mock getSlots:', error);
      return [];
    }
  },
  
  createSlots: async (userId: string, date: string, slots: any[], token: string) => {
    // Use mock localStorage implementation
    try {
      // Get existing slots
      const storedSlots = localStorage.getItem(`booking-slots-${userId}`);
      const existingSlots = storedSlots ? JSON.parse(storedSlots) : [];
      
      // Create new slots with IDs
      const newSlots = slots.map((slot, index) => ({
        ...slot,
        id: `slot-${Date.now()}-${index}`
      }));
      
      // Combine existing and new slots
      const allSlots = [...existingSlots, ...newSlots];
      
      // Store updated slots
      localStorage.setItem(`booking-slots-${userId}`, JSON.stringify(allSlots));
      
      return newSlots;
    } catch (error) {
      console.error('Error in mock createSlots:', error);
      throw error;
    }
  },
  
  deleteSlot: async (slotId: string, token: string) => {
    // Use mock localStorage implementation
    try {
      // Get all user booking slots
      const allUserData = {};
      
      // Find which user has the slot
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('booking-slots-')) {
          const userId = key.replace('booking-slots-', '');
          const userSlots = localStorage.getItem(key);
          
          if (userSlots) {
            const slots = JSON.parse(userSlots);
            
            // Check if this user has the slot
            const slotIndex = slots.findIndex((s: any) => s.id === slotId);
            if (slotIndex >= 0) {
              // Remove the slot
              slots.splice(slotIndex, 1);
              
              // Update storage
              localStorage.setItem(key, JSON.stringify(slots));
              return { success: true };
            }
          }
        }
      }
      
      throw new Error('Slot not found');
    } catch (error) {
      console.error('Error in mock deleteSlot:', error);
      throw error;
    }
  }
};

const AvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilityEnabled, setAvailabilityEnabled] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(setHours(setMinutes(new Date(), 0), 9));
  const [endTime, setEndTime] = useState<Date | null>(setHours(setMinutes(new Date(), 0), 17));
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [bookingUrl, setBookingUrl] = useState<string>('');
  const [isAddingSlots, setIsAddingSlots] = useState<boolean>(false);

  // Fetch existing availability slots
  useEffect(() => {
    if (!user) return;
    
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        const data = await bookingApi.getSlots(user.id, token);
        
        if (data) {
          setSlots(data);
          setAvailabilityEnabled(data.length > 0);
          
          // Set booking URL
          const baseUrl = window.location.origin;
          setBookingUrl(`${baseUrl}/booking/${user.id}`);
        }
      } catch (error) {
        console.error('Error fetching availability slots:', error);
        setError('Failed to load your availability settings.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [user]);

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Generate time slots based on start time, end time, and duration
  const generateTimeSlots = () => {
    if (!startTime || !endTime || isBefore(endTime, startTime)) {
      setError('Invalid time range. End time must be after start time.');
      return;
    }
    
    setIsAddingSlots(true);
    
    try {
      const slots = [];
      let currentTime = new Date(startTime);
      
      while (isBefore(currentTime, endTime)) {
        const slotEnd = addMinutes(currentTime, slotDuration);
        
        if (isBefore(slotEnd, endTime) || slotEnd.getTime() === endTime.getTime()) {
          slots.push({
            start_time: currentTime.toISOString(),
            end_time: slotEnd.toISOString(),
            service_type: 'built-in',
          });
        }
        
        currentTime = slotEnd;
      }
      
      saveTimeSlots(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      setError('Failed to generate time slots. Please try again.');
      setIsAddingSlots(false);
    }
  };

  // Save generated time slots to the server
  const saveTimeSlots = async (newSlots: Omit<AvailabilitySlot, 'id'>[]) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token') || '';
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const data = await bookingApi.createSlots(user.id, formattedDate, newSlots, token);
      
      if (data) {
        // Update slots with newly created ones
        setSlots(prevSlots => [...prevSlots, ...data]);
        setAvailabilityEnabled(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error saving time slots:', error);
      setError('Failed to save your availability slots. Please try again.');
    } finally {
      setIsAddingSlots(false);
    }
  };

  // Delete a slot
  const deleteSlot = async (slotId: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await bookingApi.deleteSlot(slotId, token);
      
      // Remove the deleted slot from state
      setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId));
      
      if (slots.length <= 1) {
        setAvailabilityEnabled(false);
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      setError('Failed to delete the time slot. Please try again.');
    }
  };

  // Copy booking URL to clipboard
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(bookingUrl);
    // You could add a snackbar or toast notification here
  };

  // Get slots for the selected date
  const slotsForSelectedDate = slots.filter(slot => {
    const slotDate = new Date(slot.start_time);
    return (
      slotDate.getFullYear() === selectedDate.getFullYear() &&
      slotDate.getMonth() === selectedDate.getMonth() &&
      slotDate.getDate() === selectedDate.getDate()
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Manage Availability
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Set up your availability to allow team members to book meetings with you.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Booking Link
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                value={bookingUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title="Copy to clipboard">
                      <IconButton onClick={copyUrlToClipboard} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="textSecondary">
                Share this link with people who need to schedule meetings with you.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Typography variant="h6" gutterBottom>
                Select Date
              </Typography>
              <DateCalendar 
                value={selectedDate}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6">
                Set Available Hours for {format(selectedDate, 'MMMM d, yyyy')}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={availabilityEnabled}
                    onChange={(e) => setAvailabilityEnabled(e.target.checked)}
                  />
                }
                label="Enable Booking"
              />
            </Box>

            {availabilityEnabled && (
              <>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Start Time"
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="End Time"
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Slot Duration (minutes)"
                      type="number"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 15, max: 120, step: 15 } }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={generateTimeSlots}
                  disabled={isAddingSlots}
                  sx={{ mb: 4 }}
                >
                  {isAddingSlots ? 'Adding Slots...' : 'Add Availability Slots'}
                </Button>
                
                <Typography variant="h6" gutterBottom>
                  Available Slots for {format(selectedDate, 'MMMM d, yyyy')}
                </Typography>
                
                {slotsForSelectedDate.length > 0 ? (
                  <List>
                    {slotsForSelectedDate.map((slot) => (
                      <ListItem
                        key={slot.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={`${format(new Date(slot.start_time), 'h:mm a')} - ${format(
                            new Date(slot.end_time),
                            'h:mm a'
                          )}`}
                          secondary={slot.service_type === 'external' ? 'External Link' : 'Built-in Booking'}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => deleteSlot(slot.id)}
                            aria-label="delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No availability slots set for this date. Add slots to allow bookings.
                  </Alert>
                )}
              </>
            )}

            {!availabilityEnabled && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Enable booking to set your availability and allow others to schedule meetings with you.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AvailabilityPage; 