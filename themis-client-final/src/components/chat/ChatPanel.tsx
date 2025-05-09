import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Divider, CircularProgress, Paper, IconButton, Toolbar, Badge, Tooltip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  People as PeopleIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { ChatChannel, ChatMessage, ChannelType, SystemMessageType } from '../../types/ChatTypes';
import { useAuth } from '../../hooks/useAuth';
import ChatSidebar from './ChatSidebar';
import MessageInput from './MessageInput';
import ChatMessageComponent from './ChatMessage';
import ChatService from '../../services/ChatService';
import { User, UserRole } from '../../types';

const PREFIX = 'ChatPanel';
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  messagesContainer: `${PREFIX}-messagesContainer`,
  messagesList: `${PREFIX}-messagesList`,
  loadingContainer: `${PREFIX}-loadingContainer`,
  channelHeader: `${PREFIX}-channelHeader`,
  channelInfo: `${PREFIX}-channelInfo`,
  channelName: `${PREFIX}-channelName`,
  channelDescription: `${PREFIX}-channelDescription`,
  channelActions: `${PREFIX}-channelActions`,
  archivedBanner: `${PREFIX}-archivedBanner`,
  mobileBackButton: `${PREFIX}-mobileBackButton`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  [`& .${classes.content}`]: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  [`& .${classes.messagesContainer}`]: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.messagesList}`]: {
    flexGrow: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(2, 0),
  },
  [`& .${classes.loadingContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  [`& .${classes.channelHeader}`]: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.channelInfo}`]: {
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.channelName}`]: {
    fontWeight: 500,
  },
  [`& .${classes.channelDescription}`]: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  [`& .${classes.channelActions}`]: {
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${classes.archivedBanner}`]: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  [`& .${classes.mobileBackButton}`]: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const ChatPanel: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [showChannelMembers, setShowChannelMembers] = useState<boolean>(false);
  const [channelMembers, setChannelMembers] = useState<{ id: string, firstName: string, lastName: string, role: string }[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(true);
  const [callLoading, setCallLoading] = useState(false);
  
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat and load channels
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        await ChatService.init();
        console.log("Fetching user channels...");
        const response = await ChatService.getUserChannels();
        console.log("Chat channel response:", response);
        
        if (response.success && response.data) {
          console.log(`Received ${response.data.length} channels:`, response.data);
          setChannels(response.data);
          
          // Select a default channel if available
          if (response.data.length > 0) {
            // Prefer non-archived channels
            const nonArchivedChannel = response.data.find(c => !c.isArchived);
            const defaultChannel = nonArchivedChannel || response.data[0];
            console.log("Setting default channel:", defaultChannel);
            setSelectedChannelId(defaultChannel.id);
          } else {
            console.warn("No channels available to display");
          }
        } else {
          console.error("Failed to get channels or empty response:", response);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      console.log("User authenticated, initializing chat...");
      initChat();
    }
    
    return () => {
      ChatService.disconnect();
    };
  }, [user]);
  
  // Load channel details and messages when channel is selected
  useEffect(() => {
    if (!selectedChannelId) return;
    
    const loadChannelData = async () => {
      try {
        setLoadingMessages(true);
        
        // Get channel details
        const channelResponse = await ChatService.getChannel(selectedChannelId);
        if (channelResponse.success && channelResponse.data) {
          setSelectedChannel(channelResponse.data);
          setCanPost(await ChatService.canUserPostToChannel(selectedChannelId));
        }
        
        // Get channel messages
        const messagesResponse = await ChatService.getChannelMessages(selectedChannelId);
        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
        
        // Mark channel as read
        await ChatService.markChannelAsRead(selectedChannelId);
        
        // Update unread counts
        setUnreadCounts(prev => {
          const newCounts = new Map(prev);
          newCounts.set(selectedChannelId, 0);
          return newCounts;
        });
        
        // Join channel for real-time updates
        await ChatService.joinChannel(selectedChannelId);
        
        // Get channel members
        const membersResponse = await ChatService.getChannelMembers(selectedChannelId);
        if (membersResponse.success && membersResponse.data) {
          setChannelMembers(membersResponse.data.map(member => member.user));
        }
        
        // On mobile, close the sidebar when a channel is selected
        if (window.innerWidth < 600) {
          setIsMobileSidebarOpen(false);
        }
      } catch (error) {
        console.error("Error loading channel data:", error);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadChannelData();
    
    // Set up message listener for this channel
    const messageListener = (message: ChatMessage) => {
      if (message.channelId === selectedChannelId) {
        setMessages(prev => {
          // Check if message already exists (update it)
          const messageIndex = prev.findIndex(m => m.id === message.id);
          if (messageIndex >= 0) {
            const newMessages = [...prev];
            newMessages[messageIndex] = message;
            return newMessages;
          }
          // Otherwise add it
          return [message, ...prev];
        });
      } else {
        // Update unread count for other channels
        setUnreadCounts(prev => {
          const newCounts = new Map(prev);
          const currentCount = newCounts.get(message.channelId) || 0;
          newCounts.set(message.channelId, currentCount + 1);
          return newCounts;
        });
      }
    };
    
    ChatService.addMessageListener(selectedChannelId, messageListener);
    
    return () => {
      ChatService.removeMessageListener(selectedChannelId, messageListener);
    };
  }, [selectedChannelId]);
  
  const handleSendMessage = async (body: string, file?: File) => {
    if (!selectedChannelId || (!body.trim() && !file)) return;
    
    try {
      let fileUrl = '';
      let fileType = '';
      let fileSize = 0;
      
      // Handle file upload if needed
      if (file) {
        // In a real implementation, you would upload the file to a server/S3 here
        // For now, we'll mock it
        fileUrl = URL.createObjectURL(file);
        fileType = file.type;
        fileSize = file.size;
      }
      
      await ChatService.sendMessage(selectedChannelId, body, fileUrl || undefined, fileType || undefined, fileSize || undefined);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleEditMessage = (messageId: string) => {
    // Find the message
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    // In a real implementation, you would show an edit dialog or in-place editor
    const newContent = prompt("Edit message:", message.body);
    if (newContent !== null && newContent !== message.body) {
      ChatService.updateMessage(messageId, newContent);
    }
  };
  
  const handleDeleteMessage = (messageId: string) => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this message?")) {
      ChatService.deleteMessage(messageId);
      
      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isDeleted: true } : m
      ));
    }
  };
  
  const handleNewChannel = () => {
    // In a real implementation, you would show a modal to create a new channel
    alert("Creating a new channel would show a modal here");
    // After creating, you would fetch the channels again or add the new one to the list
  };
  
  const handleSearchMessages = () => {
    // In a real implementation, you would show a search dialog
    alert("Searching messages would show a dialog here");
  };
  
  const getChannelDescription = () => {
    if (!selectedChannel) return '';
    
    switch (selectedChannel.type) {
      case ChannelType.General:
        return 'Company-wide announcements and news';
      case ChannelType.Department:
        return `Announcements for ${selectedChannel.department?.name || 'department'}`;
      case ChannelType.Project:
        return `Project discussions for ${selectedChannel.project?.name || selectedChannel.name}`;
      case ChannelType.DirectMessage:
        return 'Private conversation';
      default:
        return '';
    }
  };
  
  const handleStartCall = async () => {
    if (!selectedChannelId) return;
    
    try {
      setCallLoading(true);
      
      // Call the API to create a new call room
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannelId,
          initiatedBy: user?.id
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.roomId) {
        // Send a system message to the channel about the call
        const message = `${user?.firstName} ${user?.lastName} started a video call`;
        const payload = {
          type: SystemMessageType.Notification,
          title: 'Video Call Started',
          summary: `${user?.firstName} ${user?.lastName} started a video call`,
          metadata: {
            callId: data.roomId
          }
        };
        
        await ChatService.sendSystemMessage(
          selectedChannelId,
          message,
          payload
        );
        
        // Open the call in a new window/tab
        window.open(`/call/${data.roomId}`, '_blank');
      } else {
        console.error('Failed to create call room');
      }
    } catch (error) {
      console.error('Error starting call:', error);
    } finally {
      setCallLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }
  
  // If no channels are available, show a message
  if (!loading && channels.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" p={3}>
        <Typography variant="h6" gutterBottom>No Chat Channels Available</Typography>
        <Typography variant="body2" align="center" color="textSecondary">
          No chat channels are currently available. This feature may be under development.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Root className={classes.root}>
      {(isMobileSidebarOpen || window.innerWidth >= 600) && (
        <ChatSidebar
          channels={channels}
          selectedChannelId={selectedChannelId}
          unreadCounts={unreadCounts}
          loading={loading}
          onChannelSelect={setSelectedChannelId}
          onNewChannel={handleNewChannel}
          onSearchMessages={handleSearchMessages}
        />
      )}
      
      <Box className={classes.content}>
        {selectedChannel ? (
          <>
            <Box className={classes.channelHeader}>
              <Box display="flex" alignItems="center">
                <IconButton 
                  className={classes.mobileBackButton}
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <ArrowBackIcon />
                </IconButton>
                
                <Box className={classes.channelInfo}>
                  <Typography variant="h6" className={classes.channelName}>
                    {selectedChannel.name}
                    {selectedChannel.isArchived && ' (archived)'}
                  </Typography>
                  <Typography variant="body2" className={classes.channelDescription}>
                    {getChannelDescription()}
                  </Typography>
                </Box>
              </Box>
              
              <Box className={classes.channelActions}>
                <Tooltip title="Start a Video Call">
                  <Button
                    startIcon={<VideocamIcon />}
                    variant="outlined"
                    color="primary"
                    onClick={handleStartCall}
                    disabled={callLoading || selectedChannel.isArchived}
                    sx={{ mr: 1 }}
                  >
                    {callLoading ? 'Starting...' : 'Start Call'}
                  </Button>
                </Tooltip>
                <Tooltip title="Members">
                  <IconButton onClick={() => setShowChannelMembers(!showChannelMembers)}>
                    <Badge badgeContent={channelMembers.length} color="primary">
                      <PeopleIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Channel Info">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Search Messages">
                  <IconButton onClick={handleSearchMessages}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {selectedChannel.isArchived && (
              <Paper className={classes.archivedBanner} elevation={0}>
                This channel is archived. Messages are read-only.
              </Paper>
            )}
            
            <Box className={classes.messagesContainer}>
              {loadingMessages ? (
                <Box className={classes.loadingContainer}>
                  <CircularProgress />
                </Box>
              ) : (
                <div className={classes.messagesList} ref={messageRef}>
                  {messages.map(message => (
                    <ChatMessageComponent
                      key={message.id}
                      message={message}
                      currentUser={user}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                    />
                  ))}
                  
                  {messages.length === 0 && (
                    <Box p={2} textAlign="center">
                      <Typography variant="body2" color="textSecondary">
                        No messages yet. Be the first to send a message!
                      </Typography>
                    </Box>
                  )}
                </div>
              )}
            </Box>
            
            <MessageInput 
              channel={selectedChannel} 
              canPost={canPost && !selectedChannel.isArchived}
              onSendMessage={handleSendMessage}
              placeholder={`Message ${selectedChannel.name}`}
            />
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="body1" color="textSecondary">
              Select a channel to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Root>
  );
};

export default ChatPanel; 