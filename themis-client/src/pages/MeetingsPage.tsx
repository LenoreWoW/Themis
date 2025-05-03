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
import { User, UserRole, MeetingStatus } from '../types';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import LocalStorageService, { Meeting } from '../services/LocalStorageService';
import { v4 as uuidv4 } from 'uuid';

// Extended meeting interface to include status
interface ExtendedMeeting extends Meeting {
  status?: MeetingStatus;
}

const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<ExtendedMeeting[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinMeetingDialogOpen, setIsJoinMeetingDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<ExtendedMeeting | null>(null);
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
    screenSharing: false,
    audioEnabled: true,
    participants: [] as { 
      user: User, 
      speaking: boolean,
      audioEnabled: boolean,
      videoEnabled: boolean
    }[]
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
              role: UserRole.PROJECT_MANAGER,
              email: 'alice@example.com',
              department: {
                id: '1',
                name: 'IT',
                description: 'Information Technology Department',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '102',
              username: 'bob.smith',
              firstName: 'Bob',
              lastName: 'Smith',
              role: UserRole.ADMIN,
              email: 'bob@example.com',
              department: {
                id: '2',
                name: 'Engineering',
                description: 'Engineering Department',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '103',
              username: 'carol.williams',
              firstName: 'Carol',
              lastName: 'Williams',
              role: UserRole.SUB_PMO,
              email: 'carol@example.com',
              department: {
                id: '3',
                name: 'PMO',
                description: 'Project Management Office',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          
          setAvailableUsers(mockUsers);
          
          // Get meetings from localStorage
          const storedMeetings = LocalStorageService.getMeetings();
          
          // If there are no meetings in localStorage, initialize with default meetings
          if (storedMeetings.length === 0) {
            // Initialize with default meetings
            const mockOrganizer: User = {
              id: '1',
              username: 'admin',
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              role: UserRole.ADMIN,
              department: {
                id: '1',
                name: 'IT',
                description: 'Information Technology Department',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const mockMeetings: ExtendedMeeting[] = [
              {
                id: '1',
                title: 'Sprint Planning',
                description: 'Weekly sprint planning meeting',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
                location: 'Virtual',
                organizer: mockOrganizer,
                participants: mockUsers.slice(0, 2),
                attendees: [],
                isActive: false,
                status: MeetingStatus.SCHEDULED,
                meetingLink: 'https://meet.example.com/sprint-planning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '2',
                title: 'Project Status Update',
                description: 'Monthly project status review',
                date: new Date(Date.now() + 30 * 60 * 1000).toLocaleDateString(),
                startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
                location: 'Conference Room A',
                organizer: mockOrganizer,
                participants: mockUsers.slice(0, 2),
                attendees: [],
                isActive: false,
                status: MeetingStatus.SCHEDULED,
                meetingLink: 'https://meet.example.com/project-status',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];
            
            // Save to localStorage
            LocalStorageService.saveMeetings(mockMeetings);
            setMeetings(mockMeetings);
          } else {
            // Convert the stored meetings to ExtendedMeeting type with proper status
            const convertedMeetings: ExtendedMeeting[] = storedMeetings.map(meeting => ({
              ...meeting,
              status: meeting.status as MeetingStatus || MeetingStatus.SCHEDULED
            }));
            setMeetings(convertedMeetings);
          }
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Failed to load meetings');
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
    
    // Create a new meeting with the form data
    const newMeeting: ExtendedMeeting = {
      id: uuidv4(),
      title: meetingData.title,
      description: meetingData.description,
      date: meetingData.startTime.toLocaleDateString(),
      startTime: meetingData.startTime.toISOString(),
      endTime: meetingData.endTime.toISOString(),
      location: 'Virtual',
      organizer: user as User,
      participants: availableUsers.filter(u => meetingData.participants.includes(u.id)),
      attendees: [],
      isActive: false,
      status: MeetingStatus.SCHEDULED,
      meetingLink: `https://meet.example.com/${meetingData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the meeting to state
    setMeetings([...meetings, newMeeting]);
    
    // Save to localStorage
    LocalStorageService.addMeeting(newMeeting);
    
    // Reset form
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
    // Convert Meeting to ExtendedMeeting
    const extendedMeeting: ExtendedMeeting = {
      ...meeting,
      status: meeting.status as MeetingStatus || MeetingStatus.SCHEDULED
    };
    
    setSelectedMeeting(extendedMeeting);
    
    // Update meeting status to IN_PROGRESS if not already
    if (extendedMeeting.status !== MeetingStatus.IN_PROGRESS) {
      const updatedMeeting = {
        ...extendedMeeting,
        status: MeetingStatus.IN_PROGRESS
      };
      
      // Update in state
      const updatedMeetings = meetings.map(m => 
        m.id === meeting.id ? updatedMeeting : m
      );
      setMeetings(updatedMeetings);
      
      // Update in localStorage
      LocalStorageService.updateMeeting(meeting.id, { 
        status: MeetingStatus.IN_PROGRESS as unknown as string 
      });
      setSelectedMeeting(updatedMeeting);
    }
    
    setIsJoinMeetingDialogOpen(true);
  };
  
  // Handle entering the meeting room
  const handleEnterMeetingRoom = () => {
    if (!selectedMeeting) return;
    
    // Set the meeting as active
    const updatedMeeting = { 
      ...selectedMeeting,
      isActive: true 
    };
    
    // Update the meeting status in state
    const updatedMeetings = meetings.map(m => 
      m.id === selectedMeeting.id ? updatedMeeting : m
    );
    setMeetings(updatedMeetings);
    
    // Update in localStorage
    LocalStorageService.updateMeeting(selectedMeeting.id, { isActive: true });
    
    // Setup initial meeting room state with the current user
    const currentUserAsParticipant = user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as User : null;
    
    // Add current user to active participants if they're not already included
    const activeParticipants = currentUserAsParticipant ? 
      [currentUserAsParticipant] : [];
    
    // Initialize the meeting room with the current user
    setMeetingRoomData({
      activeParticipants,
      chatMessages: [],
      screenSharing: false,
      audioEnabled: true,
      participants: currentUserAsParticipant ? [{ 
        user: currentUserAsParticipant, 
        speaking: false,
        audioEnabled: true,
        videoEnabled: true
      }] : []
    });
    
    // Enter the meeting
    setInMeeting(true);
    setIsJoinMeetingDialogOpen(false);
    
    // Simulate other participants joining after a delay (for demo purposes)
    if (selectedMeeting.participants && selectedMeeting.participants.length > 0) {
      const delay = 2000; // 2 seconds delay
      
      // Add other participants one by one with delays
      selectedMeeting.participants.forEach((participant, index) => {
        if (participant.id !== (currentUserAsParticipant?.id || '')) {
          setTimeout(() => {
            setMeetingRoomData(prev => {
              // Generate a random speaking status occasionally
              const isSpeaking = Math.random() > 0.7;
              
              return {
                ...prev,
                activeParticipants: [...prev.activeParticipants, participant],
                participants: [
                  ...prev.participants, 
                  { 
                    user: participant, 
                    speaking: isSpeaking,
                    audioEnabled: true,
                    videoEnabled: true 
                  }
                ],
                chatMessages: [
                  ...prev.chatMessages,
                  {
                    sender: { 
                      id: 'system', 
                      firstName: 'System', 
                      lastName: '', 
                      role: UserRole.ADMIN 
                    } as User,
                    message: `${participant.firstName} ${participant.lastName} has joined the meeting`,
                    timestamp: new Date().toISOString()
                  }
                ]
              };
            });
            
            // Simulate random speaking patterns
            startSpeakingSimulation(participant.id);
            
          }, delay + (index * 1500)); // Stagger entries by 1.5 seconds
        }
      });
    }
  };
  
  // Simulate participants speaking
  const startSpeakingSimulation = (participantId: string) => {
    const simulateSpeaking = () => {
      // Only continue if we're still in the meeting
      if (!inMeeting) return;
      
      // Random chance this participant starts/stops speaking
      const isSpeaking = Math.random() > 0.5;
      
      setMeetingRoomData(prev => {
        const updatedParticipants = prev.participants.map(p => 
          p.user.id === participantId 
            ? { ...p, speaking: isSpeaking && p.audioEnabled } 
            : p
        );
        
        return {
          ...prev,
          participants: updatedParticipants
        };
      });
      
      // Schedule next speaking state change
      const nextChangeTime = 1000 + Math.random() * 3000; // 1-4 seconds
      setTimeout(simulateSpeaking, nextChangeTime);
    };
    
    // Start the simulation
    setTimeout(simulateSpeaking, 1000 + Math.random() * 2000);
  };
  
  // Toggle audio
  const handleToggleAudio = () => {
    if (!user) return;
    
    setMeetingRoomData(prev => {
      const updatedParticipants = prev.participants.map(p => 
        p.user.id === user.id 
          ? { ...p, audioEnabled: !p.audioEnabled, speaking: false } 
          : p
      );
      
      return {
        ...prev,
        audioEnabled: !prev.audioEnabled,
        participants: updatedParticipants
      };
    });
  };
  
  // Handle leaving the meeting
  const handleLeaveMeeting = () => {
    if (!selectedMeeting) return;
    
    // If the meeting is ending (all participants leaving), update status to COMPLETED
    const shouldComplete = selectedMeeting.organizer.id === user?.id;
    
    // Update the meeting status in state
    const updatedMeetings = meetings.map(m => {
      if (m.id === selectedMeeting.id) {
        return { 
          ...m, 
          isActive: false,
          status: shouldComplete ? MeetingStatus.COMPLETED : m.status
        };
      }
      return m;
    });
    
    setMeetings(updatedMeetings);
    
    // Update in localStorage
    LocalStorageService.updateMeeting(selectedMeeting.id, { 
      isActive: false,
      status: shouldComplete ? MeetingStatus.COMPLETED : selectedMeeting.status 
    });
    
    // Exit the meeting
    setInMeeting(false);
    setSelectedMeeting(null);
    
    // Clear meeting room data
    setMeetingRoomData({
      activeParticipants: [],
      chatMessages: [],
      screenSharing: false,
      audioEnabled: true,
      participants: []
    });
  };
  
  // Handle sending a chat message
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !user) return;
    
    const newMessage = {
      sender: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      } as User,
      message,
      timestamp: new Date().toISOString()
    };
    
    setMeetingRoomData(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMessage]
    }));
  };
  
  // Toggle screen sharing
  const handleToggleScreenSharing = () => {
    setMeetingRoomData(prev => ({
      ...prev,
      screenSharing: !prev.screenSharing
    }));
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
    
    // Find current user's meeting state
    const currentParticipant = user ? meetingRoomData.participants.find(p => p.user.id === user.id) : undefined;
    const audioEnabled = currentParticipant?.audioEnabled ?? true;
    
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
                {meetingRoomData.screenSharing ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    mb: 2,
                    bgcolor: '#0a0a0a', 
                    border: '1px solid #333',
                    borderRadius: 1,
                    p: 2
                  }}>
                    <Typography variant="h6" color="white" align="center">
                      Screen sharing is active
                      <Box component="div" sx={{ mt: 2 }}>
                        <img 
                          src="/demo-screen-share.png" 
                          alt="Shared screen" 
                          style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            console.log('Image failed to load - this is expected in dev environment');
                          }}
                        />
                      </Box>
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex',
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    alignItems: 'center', 
                    mb: 2,
                    gap: 2
                  }}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: meetingRoomData.activeParticipants.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                        md: meetingRoomData.activeParticipants.length > 3 ? 'repeat(3, 1fr)' : 
                            meetingRoomData.activeParticipants.length > 1 ? 'repeat(2, 1fr)' : '1fr'
                      },
                      gap: 2,
                      width: '100%'
                    }}>
                      {meetingRoomData.activeParticipants.length === 0 ? (
                        <Box sx={{ 
                          height: '200px', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          bgcolor: '#333',
                          borderRadius: 1
                        }}>
                          <Typography color="white">Waiting for participants...</Typography>
                        </Box>
                      ) : (
                        meetingRoomData.participants.map(participant => {
                          const isSpeaking = participant.speaking && participant.audioEnabled;
                          return (
                            <Box 
                              key={participant.user.id}
                              sx={{ 
                                height: '200px', 
                                bgcolor: '#333',
                                borderRadius: 1, 
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: isSpeaking ? '2px solid #4caf50' : '2px solid transparent',
                                transition: 'border-color 0.3s ease'
                              }}
                            >
                              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                {!participant.audioEnabled && (
                                  <Box 
                                    sx={{ 
                                      bgcolor: 'rgba(0,0,0,0.5)', 
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Typography 
                                      component="span" 
                                      sx={{ 
                                        color: 'red', 
                                        fontSize: '1.2rem',
                                        lineHeight: 1
                                      }}
                                    >
                                      🔇
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    bgcolor: isSpeaking ? '#4caf50' : 'primary.main', 
                                    fontSize: '2rem',
                                    transition: 'background-color 0.3s ease',
                                    border: isSpeaking ? '3px solid white' : 'none'
                                  }}
                                >
                                  {participant.user.firstName?.[0]}{participant.user.lastName?.[0]}
                                </Avatar>
                              </Box>
                              <Typography color="white" align="center">
                                {participant.user.firstName} {participant.user.lastName}
                                {participant.user.id === user?.id && " (You)"}
                                {participant.user.id === selectedMeeting?.organizer.id && " (Host)"}
                              </Typography>
                              {isSpeaking && (
                                <Box 
                                  sx={{ 
                                    position: 'absolute', 
                                    bottom: 40, 
                                    left: 0, 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: 'center' 
                                  }}
                                >
                                  <Box sx={{ 
                                    display: 'flex', 
                                    gap: 0.5, 
                                    alignItems: 'flex-end', 
                                    height: 20 
                                  }}>
                                    {[...Array(5)].map((_, i) => (
                                      <Box 
                                        key={i} 
                                        sx={{ 
                                          width: 4, 
                                          bgcolor: '#4caf50', 
                                          height: `${Math.random() * 20}px`, 
                                          borderRadius: 1,
                                          animation: 'soundwave 0.5s infinite'
                                        }} 
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <IconButton 
                    color={audioEnabled ? "primary" : "error"}
                    onClick={handleToggleAudio}
                  >
                    {audioEnabled ? (
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-423.076q-42.435 0-72.258-29.823-29.823-29.823-29.823-72.257v-205.001q0-42.435 29.823-72.257 29.823-29.823 72.258-29.823 42.434 0 72.256 29.823 29.823 29.822 29.823 72.257v205.001q0 42.434-29.823 72.257-29.822 29.823-72.256 29.823Zm0-60q17.308 0 28.731-11.423 11.423-11.423 11.423-28.73v-207.542q0-17.308-11.423-28.731-11.423-11.423-28.731-11.423-17.307 0-28.73 11.423-11.422 11.423-11.422 28.731v205.001q0 17.307 11.423 28.73 11.422 11.423 28.729 11.423ZM229.923-480q0 98.308 65.385 170.307 65.384 72 160.615 85.616v60.923q-123.077-14.155-207.039-103.346-83.961-89.192-83.961-213.5 0-124.846 83.961-213.5Q333.846-783.152 456.923-797.23v60.922q-95.23 13.539-160.615 85.539-65.385 72-65.385 170.769ZM480-129.999q-138.153 0-235.076-96.923-96.923-96.923-96.923-235.077 0-138.153 96.923-235.077 96.923-96.923 235.076-96.923t235.077 96.923q96.923 96.924 96.923 235.077 0 138.154-96.923 235.077Q618.153-129.999 480-129.999Zm0-59.923q113.539 0 194.616-81.078 81.077-81.077 81.077-194.615 0-113.539-81.077-194.616-81.077-81.077-194.616-81.077-113.538 0-194.615 81.077-81.077 81.077-81.077 194.616 0 113.538 81.077 194.615Q366.462-189.922 480-189.922Zm0-290.077Z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="m763.923-49.23-59.154-59.23q-44 31.923-94.769 49.153-50.77 17.23-105.77 17.23-138.69 0-235.614-96.923-96.923-96.923-96.923-235.077 0-56.308 17.693-107.808 17.692-51.5 51.077-95.731L169.23-648.539q-43.846 58.847-66.538 127.808-22.692 68.962-22.692 144.769 0 66.308 19.308 127.654 19.307 61.346 53.615 114.231l-49.538 49.539-42.924-42.924 698.538-698.538 42.924 42.924-49.538 49.539q52.693 32.692 91.615 78 38.923 45.307 58.154 99.23L177.846-520q7.539-43 45.154-76.39 37.615-33.39 82.769-33.39h12.77l42.692-42.769v-27.067q0-17.308 11.422-28.731 11.423-11.423 28.731-11.423 17.307 0 28.73 11.423 11.422 11.423 11.422 28.731v34.457l120 120v22.151q0 42.434-29.823 72.257-29.822 29.823-72.256 29.823h-31.23l329.692 329.77-34 57.307Zm62.231-204.309-59.385-59.384q11.923-33.308 17.308-67.192 5.384-33.885 5.384-69.885 0-66.246-19.346-127.621-19.346-61.375-53.692-114.225l49.538-49.539 42.924 42.924-40.616 40.847q27.385 41.462 42.462 88.654t15.077 99.191q0 53.077-12.654 103.269-12.655 50.193-37.001 91.771v22.19ZM480-306.155q13.461 0 23.654-10.192 10.192-10.193 10.192-23.653v-58L423.846-488V-335q0 13.46 10.193 23.653Q444.23-301.154 457.692-301.154H480Z"/>
                      </svg>
                    )}
                  </IconButton>
                  <IconButton color="primary">
                    <VideoIcon />
                  </IconButton>
                  <IconButton 
                    color={meetingRoomData.screenSharing ? "secondary" : "primary"}
                    onClick={handleToggleScreenSharing}
                  >
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
                
                <Box sx={{ mb: 2, maxHeight: '150px', overflow: 'auto' }}>
                  {meetingRoomData.activeParticipants.length === 0 ? (
                    <Typography color="gray" variant="body2">
                      No participants yet
                    </Typography>
                  ) : (
                    meetingRoomData.participants.map(participant => {
                      const isSpeaking = participant.speaking && participant.audioEnabled;
                      return (
                        <Box key={participant.user.id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: isSpeaking ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                        }}>
                          <Avatar sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1, 
                            fontSize: '0.875rem',
                            bgcolor: isSpeaking ? '#4caf50' : 'primary.main'
                          }}>
                            {participant.user.firstName?.[0]}{participant.user.lastName?.[0]}
                          </Avatar>
                          <Typography color="white" sx={{ flex: 1 }}>
                            {participant.user.firstName} {participant.user.lastName}
                            {participant.user.id === user?.id && " (You)"}
                            {participant.user.id === selectedMeeting?.organizer.id && " (Host)"}
                          </Typography>
                          {isSpeaking && (
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 0.5, 
                              alignItems: 'flex-end', 
                              height: 16,
                              mr: 1
                            }}>
                              {[...Array(3)].map((_, i) => (
                                <Box 
                                  key={i} 
                                  sx={{ 
                                    width: 3, 
                                    bgcolor: '#4caf50', 
                                    height: `${5 + Math.random() * 11}px`, 
                                    borderRadius: 1,
                                    animation: 'soundwave 0.5s infinite'
                                  }} 
                                />
                              ))}
                            </Box>
                          )}
                          {!participant.audioEnabled && (
                            <Box 
                              sx={{ 
                                color: 'red', 
                                fontSize: '1.2rem',
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              🔇
                            </Box>
                          )}
                        </Box>
                      );
                    })
                  )}
                </Box>
                
                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                
                <Typography variant="h6" color="white" sx={{ mb: 2 }}>
                  Chat
                </Typography>
                
                <Box sx={{ 
                  flex: 1, 
                  mb: 2, 
                  overflow: 'auto', 
                  bgcolor: 'rgba(0,0,0,0.2)', 
                  borderRadius: 1, 
                  p: 1 
                }}>
                  {meetingRoomData.chatMessages.length === 0 ? (
                    <Typography color="gray" variant="body2" sx={{ p: 1 }}>
                      No messages yet
                    </Typography>
                  ) : (
                    meetingRoomData.chatMessages.map((msg, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          mb: 1,
                          p: 1,
                          bgcolor: msg.sender.id === 'system' ? 'transparent' : 
                                  msg.sender.id === user?.id ? 'rgba(0,30,60,0.5)' : 'rgba(60,30,0,0.5)',
                          borderRadius: 1,
                          ml: msg.sender.id === user?.id ? 'auto' : 0,
                          mr: msg.sender.id === user?.id ? 0 : 'auto',
                          maxWidth: '80%'
                        }}
                      >
                        {msg.sender.id !== 'system' && (
                          <Typography variant="body2" color="white" fontWeight="bold">
                            {msg.sender.id === user?.id ? 'You' : `${msg.sender.firstName} ${msg.sender.lastName}`}
                          </Typography>
                        )}
                        <Typography 
                          variant="body2" 
                          color={msg.sender.id === 'system' ? 'gray' : 'white'}
                          fontStyle={msg.sender.id === 'system' ? 'italic' : 'normal'}
                        >
                          {msg.message}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
                
                <Box component="form" onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('chatMessage') as HTMLInputElement;
                  if (input) {
                    handleSendMessage(input.value);
                    input.value = '';
                  }
                }}>
                  <TextField
                    name="chatMessage"
                    variant="outlined"
                    placeholder="Type a message..."
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <Button 
                          type="submit" 
                          variant="contained" 
                          size="small" 
                          sx={{ ml: 1 }}
                        >
                          Send
                        </Button>
                      )
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      }
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        <style>{`
          @keyframes soundwave {
            0% { height: 5px; }
            50% { height: 15px; }
            100% { height: 5px; }
          }
        `}</style>
      </Box>
    );
  };
  
  // If in a meeting, show the meeting room UI
  if (inMeeting) {
    return renderMeetingRoom();
  }
  
  // Render meeting cards
  const renderMeetingCard = (meeting: ExtendedMeeting, isPast: boolean = false) => (
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
          
          {!isPast && isMeetingActive(meeting) && (
            <Chip 
              label="In Progress" 
              color="success" 
              size="small" 
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {meeting.description}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon fontSize="small" sx={{ mr: 1 }} />
            {formatDate(meeting.startTime)} - {formatDate(meeting.endTime)}
          </Typography>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Organizer
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
            {meeting.organizer.firstName[0]}
          </Avatar>
          <Typography variant="body2">
            {meeting.organizer.firstName} {meeting.organizer.lastName}
          </Typography>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Participants ({meeting.participants.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {meeting.participants.slice(0, 3).map(participant => (
            <Chip
              key={participant.id}
              size="small"
              avatar={<Avatar>{participant.firstName[0]}</Avatar>}
              label={`${participant.firstName} ${participant.lastName}`}
            />
          ))}
          {meeting.participants.length > 3 && (
            <Chip
              size="small"
              label={`+${meeting.participants.length - 3} more`}
            />
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        {!isPast && (
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<VideoIcon />}
            onClick={() => handleJoinMeeting(meeting)}
            disabled={!isUpcoming(meeting) && !isMeetingActive(meeting)}
          >
            Join Meeting
          </Button>
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
                      secondary={`${user.role} - ${user.department.name}`} 
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