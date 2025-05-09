import React, { useEffect } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatPanel from '../components/chat/ChatPanel';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PREFIX = 'ChatPage';
const classes = {
  root: `${PREFIX}-root`,
  pageTitle: `${PREFIX}-pageTitle`,
  chatContainer: `${PREFIX}-chatContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    height: 'calc(100vh - 64px)', // Subtract the app bar height
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.pageTitle}`]: {
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.chatContainer}`]: {
    flexGrow: 1,
    display: 'flex',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
}));

const ChatPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Update document title
  useEffect(() => {
    document.title = 'Chat & Announcements | Themis';
    return () => {
      document.title = 'Themis';
    };
  }, []);
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Root className={classes.root}>
      <Container maxWidth="xl">
        <Typography variant="h4" className={classes.pageTitle}>
          Chat & Announcements
        </Typography>
        
        <Paper className={classes.chatContainer}>
          <ChatPanel />
        </Paper>
      </Container>
    </Root>
  );
};

export default ChatPage; 