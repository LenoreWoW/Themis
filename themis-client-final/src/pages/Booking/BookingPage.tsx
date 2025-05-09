import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format, isSameDay } from 'date-fns';
import axios from 'axios';

// Create an API service instance without auth headers for public access
const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AvailabilitySlot {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  service_type: 'built-in' | 'external';
  external_link: string | null;
  user_name: string;
}

interface BookingFormData {
  name: string;
  email: string;
  notes: string;
}

const BookingPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [hostData, setHostData] = useState<{ name: string; email: string; } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  
  // Fetch available slots
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserData = async () => {
      try {
        const response = await publicApi.get(`/users/${userId}/public`);
        setHostData(response.data);
      } catch (error) {
        console.error('Error fetching host data:', error);
        setError('Could not find the requested user');
      }
    };
    
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        const response = await publicApi.get(`/booking/slots?userId=${userId}`);
        setAvailableSlots(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setError('Failed to load available slots');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    fetchAvailableSlots();
  }, [userId]);
  
  // Get available dates with at least one slot
  const availableDates = [...new Set(
    availableSlots.map(slot => 
      format(new Date(slot.start_time), 'yyyy-MM-dd')
    )
  )];
  
  // Get slots for selected date
  const slotsForSelectedDate = availableSlots.filter(slot => 
    isSameDay(new Date(slot.start_time), selectedDate)
  );
  
  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setSelectedSlot(null);
    }
  };
  
  // Handle slot selection
  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setActiveStep(1);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validate form data
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' && 
      formData.email.trim() !== '' && 
      /\S+@\S+\.\S+/.test(formData.email)
    );
  };
  
  // Open booking confirmation dialog
  const handleBookingConfirm = () => {
    setConfirmDialogOpen(true);
  };
  
  // Submit booking
  const handleBookingSubmit = async () => {
    if (!selectedSlot) return;
    
    try {
      setLoading(true);
      const response = await publicApi.post('/booking/book', {
        slot_id: selectedSlot.id,
        name: formData.name,
        email: formData.email,
        notes: formData.notes
      });
      
      setBookingDetails(response.data);
      setBookingComplete(true);
      setActiveStep(2);
      setConfirmDialogOpen(false);
    } catch (error: any) {
      console.error('Error booking slot:', error);
      if (error.response?.status === 409) {
        setError('This slot has already been booked. Please select another time.');
        setActiveStep(0);
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const steps = ['Select a time', 'Your information', 'Confirmation'];
  
  if (loading && !error && availableSlots.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ pt: 8, pb: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
        >
          Return to Homepage
        </Button>
      </Container>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Book a Meeting with {hostData?.name || 'User'}
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Select a Date
                </Typography>
                <DateCalendar 
                  value={selectedDate}
                  onChange={handleDateChange}
                  // Disable dates without available slots
                  shouldDisableDate={(date) => 
                    !availableDates.includes(format(date, 'yyyy-MM-dd'))
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Available Time Slots
                </Typography>
                
                {slotsForSelectedDate.length === 0 ? (
                  <Alert severity="info">
                    No available time slots for the selected date. Please select another date.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {slotsForSelectedDate.map((slot) => (
                      <Grid item xs={12} sm={6} key={slot.id}>
                        <Card 
                          variant={selectedSlot?.id === slot.id ? 'outlined' : 'elevation'}
                          sx={{
                            cursor: 'pointer',
                            border: selectedSlot?.id === slot.id ? '2px solid #1976d2' : 'none',
                            '&:hover': {
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <CardContent>
                            <Typography variant="h6">
                              {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {slot.service_type === 'built-in' 
                                ? 'Built-in video meeting' 
                                : 'External meeting link'
                              }
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
          
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formData.name.trim() === ''}
                    helperText={formData.name.trim() === '' ? 'Name is required' : ''}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formData.email.trim() === '' || !/\S+@\S+\.\S+/.test(formData.email)}
                    helperText={
                      formData.email.trim() === '' 
                        ? 'Email is required' 
                        : !/\S+@\S+\.\S+/.test(formData.email) 
                          ? 'Invalid email format' 
                          : ''
                    }
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes (Optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    placeholder="Add any details or questions for the meeting"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!isFormValid()}
                  onClick={handleBookingConfirm}
                >
                  Confirm Booking
                </Button>
              </Box>
            </Box>
          )}
          
          {activeStep === 2 && bookingComplete && bookingDetails && (
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>
                Your booking is confirmed!
              </Typography>
              
              <Box sx={{ my: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {format(new Date(bookingDetails.time.start), 'MMMM d, yyyy')}
                      <br />
                      {format(new Date(bookingDetails.time.start), 'h:mm a')} - {format(new Date(bookingDetails.time.end), 'h:mm a')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Host
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {bookingDetails.host.name}
                      <br />
                      {bookingDetails.host.email}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  {bookingDetails.meeting_link && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Meeting Link
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <a href={bookingDetails.meeting_link} target="_blank" rel="noopener noreferrer">
                          {bookingDetails.meeting_link}
                        </a>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <Typography variant="body1" paragraph>
                A confirmation email has been sent to {formData.email} with all the details.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                Return to Homepage
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Your Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to book a meeting with {hostData?.name} on:
            <br /><br />
            <strong>Date:</strong> {selectedSlot && format(new Date(selectedSlot.start_time), 'MMMM d, yyyy')}
            <br />
            <strong>Time:</strong> {selectedSlot && `${format(new Date(selectedSlot.start_time), 'h:mm a')} - ${format(new Date(selectedSlot.end_time), 'h:mm a')}`}
            <br /><br />
            Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBookingSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingPage; 