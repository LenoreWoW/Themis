import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  VideocamOutlined as VideoIcon,
  ChatOutlined as ChatIcon,
  ScreenShareOutlined as ScreenShareIcon,
  People as PeopleIcon,
  Event as EventIcon,
  PersonAdd as InviteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import LocalStorageService, { Meeting } from '../services/LocalStorageService';
import { v4 as uuidv4 } from 'uuid';

const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinMeetingDialogOpen, setIsJoinMeetingDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  
  // Form state for creating a new meeting
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    startTime: new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour from now
    endTime: new Date(Date.now() + 120 * 60 * 1000), // Default to 2 hours from now
    participants: [] as string[] // Array of user IDs
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Mock meeting room state
  const [inMeeting, setInMeeting] = useState(false);
  const [meetingRoomData, setMeetingRoomData] = useState({
    activeParticipants: [] as User[],
    chatMessages: [] as { sender: User, message: string, timestamp: string }[],
    screenSharing: false
  });
  
  // Fetch meetings and available users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get meetings from localStorage
        setTimeout(() => {
          // Mock available users
          const mockUsers: User[] = [
            {
              id: '101',
              username: 'alice.johnson',
              firstName: 'Alice',
              lastName: 'Johnson',
              role: 'PROJECT_MANAGER',
              email: 'alice@example.com',
              department: 'IT',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as User,
            {
              id: '102',
              username: 'bob.smith',
              firstName: 'Bob',
              lastName: 'Smith',
              role: 'ADMIN',
              email: 'bob@example.com',
              department: 'Engineering',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as User,
            {
              id: '103',
              username: 'carol.williams',
              firstName: 'Carol',
              lastName: 'Williams',
              role: 'SUB_PMO',
              email: 'carol@example.com',
              department: 'PMO',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as User
          ];
          
          setAvailableUsers(mockUsers);
          
          // Get meetings from localStorage
          const storedMeetings = LocalStorageService.getMeetings();
          
          // If there are no meetings in localStorage, initialize with default meetings
          if (storedMeetings.length === 0) {
            // Initialize with default meetings
            const defaultMeetings: Meeting[] = [
              {
                id: '1',
                title: 'Sprint Planning',
                description: 'Plan tasks for the next sprint',
                startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
                endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour duration
                organizer: {
                  id: '1',
                  username: 'admin',
                  firstName: 'Admin',
                  lastName: 'User',
                  email: 'admin@example.com',
                  role: 'ADMIN',
                  department: 'IT',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as User,
                participants: mockUsers.slice(0, 2),
                isActive: false,
                meetingLink: 'https://meet.example.com/sprint-planning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '2',
                title: 'Project Status Review',
                description: 'Review the current status of the Digital Transformation project',
                startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
                endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1 hour duration
                organizer: {
                  id: '1',
                  username: 'admin',
                  firstName: 'Admin',
                  lastName: 'User',
                  email: 'admin@example.com',
                  role: 'ADMIN',
                  department: 'IT',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as User,
                participants: mockUsers.slice(0, 2),
                isActive: false,
                meetingLink: 'https://meet.example.com/project-status',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];
            
            // Save default meetings to localStorage
            LocalStorageService.saveMeetings(defaultMeetings);
            setMeetings(defaultMeetings);
          } else {
            // Use stored meetings
            setMeetings(storedMeetings);
          }
          
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeetingData({
      ...meetingData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Handle participant selection
  const handleParticipantsChange = (event: SelectChangeEvent<string[]>) => {
    setMeetingData({
      ...meetingData,
      participants: event.target.value as string[]
    });
  };
  
  // Handle start time change
  const handleStartTimeChange = (date: Date | null) => {
    if (date) {
      setMeetingData({
        ...meetingData,
        startTime: date,
        // Also update end time to be one hour after start time if start time changed
        endTime: new Date(date.getTime() + 60 * 60 * 1000)
      });
    }
  };
  
  // Handle end time change
  const handleEndTimeChange = (date: Date | null) => {
    if (date) {
      setMeetingData({
        ...meetingData,
        endTime: date
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!meetingData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!meetingData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (meetingData.participants.length === 0) {
      errors.participants = 'At least one participant is required';
    }
    
    if (meetingData.startTime >= meetingData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle create meeting
  const handleCreateMeeting = () => {
    if (!validateForm()) return;
    
    // Create a new meeting object
    const newMeeting: Meeting = {
      id: uuidv4(), // Generate a unique ID
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.startTime.toISOString(),
      endTime: meetingData.endTime.toISOString(),
      organizer: user as User,
      participants: meetingData.participants.map(
        id => availableUsers.find(u => u.id === id)
      ).filter(u => u !== undefined) as User[],
      isActive: false,
      meetingLink: `https://meet.example.com/${meetingData.title.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the new meeting to state
    setMeetings([...meetings, newMeeting]);
    
    // Save to localStorage
    LocalStorageService.addMeeting(newMeeting);
    
    // Reset form and close dialog
    setMeetingData({
      title: '',
      description: '',
      startTime: new Date(Date.now() + 60 * 60 * 1000),
      endTime: new Date(Date.now() + 120 * 60 * 1000),
      participants: []
    });
    setIsCreateDialogOpen(false);
  };
  
  // Handle join meeting
  const handleJoinMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsJoinMeetingDialogOpen(true);
  };
  
  // Handle entering the meeting room
  const handleEnterMeetingRoom = () => {
    if (selectedMeeting) {
      // Update the meeting status in state
      const updatedMeetings = meetings.map(m => 
        m.id === selectedMeeting.id ? { ...m, isActive: true } : m
      );
      setMeetings(updatedMeetings);
      
      // Update in localStorage
      LocalStorageService.updateMeeting(selectedMeeting.id, { isActive: true });
      
      setInMeeting(true);
      setIsJoinMeetingDialogOpen(false);
    }
  };
  
  // Handle leaving the meeting
  const handleLeaveMeeting = () => {
    if (selectedMeeting) {
      // Update the meeting status in state
      const updatedMeetings = meetings.map(m => 
        m.id === selectedMeeting.id ? { ...m, isActive: false } : m
      );
      setMeetings(updatedMeetings);
      
      // Update in localStorage
      LocalStorageService.updateMeeting(selectedMeeting.id, { isActive: false });
      
      setInMeeting(false);
      setSelectedMeeting(null);
    }
  };
  
  // Check if a meeting is upcoming (within 15 minutes of start time)
  const isUpcoming = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes <= 15;
  };
  
  // Check if a meeting is active (between start and end time)
  const isMeetingActive = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    return now >= startTime && now <= endTime;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Render the meeting room UI
  const renderMeetingRoom = () => {
    if (!selectedMeeting) return null;
    
    return (
      <Box sx={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, bgcolor: '#121212', zIndex: 9999, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="white">
            {selectedMeeting.title}
          </Typography>
          <Button variant="contained" color="error" onClick={handleLeaveMeeting}>
            Leave Meeting
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 'calc(100% - 64px)', gap: 2 }}>
          {/* Video Area */}
          <Box sx={{ flex: { xs: '1', md: '2' } }}>
            <Paper sx={{ p: 2, height: '100%', bgcolor: '#1e1e1e' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" color="white">
                    Video stream would appear here in a real application.
                    This would be implemented with WebRTC or a similar technology.
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <IconButton color="primary">
                    <VideoIcon />
                  </IconButton>
                  <IconButton color="primary">
                    <ScreenShareIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Box>
          
          {/* Participants and Chat */}
          <Box sx={{ flex: { xs: '1', md: '1' } }}>
            <Paper sx={{ p: 2, height: '100%', bgcolor: '#1e1e1e' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" color="white" sx={{ mb: 2 }}>
                  Participants ({meetingRoomData.activeParticipants.length})
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {meetingRoomData.activeParticipants.map(participant => (
                    <Box key={participant.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PeopleIcon sx={{ color: 'white', mr: 1 }} />
                      <Typography color="white">
                        {participant.firstName} {participant.lastName}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                
                <Typography variant="h6" color="white" sx={{ mb: 2 }}>
                  Chat
                </Typography>
                
                <Box sx={{ flex: 1, mb: 2, overflow: 'auto' }}>
                  {meetingRoomData.chatMessages.length === 0 ? (
                    <Typography color="gray" variant="body2">
                      No messages yet
                    </Typography>
                  ) : (
                    meetingRoomData.chatMessages.map((msg, idx) => (
                      <Box key={idx} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="white" fontWeight="bold">
                          {msg.sender.firstName} {msg.sender.lastName}
                        </Typography>
                        <Typography variant="body2" color="white">
                          {msg.message}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
                
                <TextField
                  variant="outlined"
                  placeholder="Type a message..."
                  fullWidth
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    }
                  }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };
  
  // If in a meeting, show the meeting room UI
  if (inMeeting) {
    return renderMeetingRoom();
  }
  
  // Render meeting cards
  const renderMeetingCard = (meeting: Meeting, isPast: boolean = false) => (
    <Card sx={{ mb: 2, opacity: isPast ? 0.8 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            {meeting.title}
          </Typography>
          
          {!isPast && isUpcoming(meeting) && (
            <Chip 
              label="Starting Soon" 
              color="warning" 
              size="small" 
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {meeting.description}
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <EventIcon fontSize="small" color={isPast ? "action" : "primary"} />
          <Typography variant="body2" color={isPast ? "text.secondary" : "text.primary"}>
            {formatDate(meeting.startTime)} - {formatDate(meeting.endTime)}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <PeopleIcon fontSize="small" color={isPast ? "action" : "primary"} />
          <Typography variant="body2" color={isPast ? "text.secondary" : "text.primary"}>
            {meeting.participants.length + 1} participants
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        {isPast ? (
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<ChatIcon />}
          >
            View Notes
          </Button>
        ) : (
          <>
            <Button 
              size="small" 
              variant="contained" 
              disabled={!isMeetingActive(meeting)}
              onClick={() => handleJoinMeeting(meeting)}
              startIcon={<VideoIcon />}
            >
              {isMeetingActive(meeting) ? 'Join Now' : 'Not Started'}
            </Button>
            <Button 
              size="small" 
              startIcon={<InviteIcon />}
            >
              Invite
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1">
            Meetings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule and join virtual meetings with your team
          </Typography>
        </div>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Schedule Meeting
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upcoming Meetings
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            {meetings.filter(m => new Date(m.startTime) > new Date()).length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', width: '100%' }}>
                <Typography color="text.secondary">
                  No upcoming meetings scheduled
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                {meetings
                  .filter(m => new Date(m.startTime) > new Date())
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map(meeting => (
                    <Box key={meeting.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(33.333% - 16px)' } }}>
                      {renderMeetingCard(meeting)}
                    </Box>
                  ))
                }
              </Box>
            )}
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Past Meetings
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {meetings.filter(m => new Date(m.endTime) < new Date()).length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', width: '100%' }}>
                <Typography color="text.secondary">
                  No past meetings
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                {meetings
                  .filter(m => new Date(m.endTime) < new Date())
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // Most recent first
                  .map(meeting => (
                    <Box key={meeting.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(33.333% - 16px)' } }}>
                      {renderMeetingCard(meeting, true)}
                    </Box>
                  ))
                }
              </Box>
            )}
          </Box>
        </>
      )}
      
      {/* Create Meeting Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule a New Meeting</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Meeting Title"
              name="title"
              value={meetingData.title}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />
            
            <TextField
              label="Description"
              name="description"
              value={meetingData.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              error={!!formErrors.description}
              helperText={formErrors.description}
              required
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DateTimePicker
                    label="Start Time"
                    value={meetingData.startTime}
                    onChange={handleStartTimeChange}
                    disablePast
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <DateTimePicker
                    label="End Time"
                    value={meetingData.endTime}
                    onChange={handleEndTimeChange}
                    disablePast
                    minDateTime={new Date(meetingData.startTime.getTime() + 5 * 60 * 1000)} // Min 5 minutes after start
                    sx={{ width: '100%' }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!formErrors.participants}
              required
            >
              <InputLabel id="participants-label">Participants</InputLabel>
              <Select
                labelId="participants-label"
                id="participants"
                multiple
                value={meetingData.participants}
                onChange={handleParticipantsChange}
                input={<OutlinedInput label="Participants" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((userId) => {
                      const user = availableUsers.find(u => u.id === userId);
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
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={meetingData.participants.indexOf(user.id) > -1} />
                    <ListItemText 
                      primary={`${user.firstName} ${user.lastName}`} 
                      secondary={`${user.role} - ${user.department}`} 
                    />
                  </MenuItem>
                ))}
              </Select>
              {formErrors.participants && (
                <FormHelperText>{formErrors.participants}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateMeeting}
          >
            Schedule Meeting
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Join Meeting Dialog */}
      <Dialog open={isJoinMeetingDialogOpen} onClose={() => setIsJoinMeetingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Meeting</DialogTitle>
        <DialogContent>
          {selectedMeeting && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedMeeting.title}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedMeeting.description}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  When you join the meeting, your camera and microphone will be enabled.
                  You can disable them after joining.
                </Typography>
              </Alert>
              
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Participants:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {[selectedMeeting.organizer, ...selectedMeeting.participants].map(participant => (
                  <Chip 
                    key={participant.id} 
                    label={`${participant.firstName} ${participant.lastName}`} 
                    size="small" 
                    avatar={<Avatar>{participant.firstName[0]}</Avatar>}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsJoinMeetingDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEnterMeetingRoom}
            color="primary"
            startIcon={<VideoIcon />}
          >
            Join Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingsPage; 