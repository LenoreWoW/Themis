import React, { useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChatMessage as ChatMessageType } from '../../types/ChatTypes';
import { User } from '../../types';
import ChatMessage from './ChatMessage';
import { formatDate } from '../../utils/dateUtils';

const PREFIX = 'ChatMessageList';

const classes = {
  root: `${PREFIX}-root`,
  messagesList: `${PREFIX}-messagesList`,
  emptyState: `${PREFIX}-emptyState`,
  loading: `${PREFIX}-loading`,
  dateHeader: `${PREFIX}-dateHeader`,
  divider: `${PREFIX}-divider`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  [`& .${classes.messagesList}`]: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
  },
  [`& .${classes.emptyState}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: theme.palette.text.secondary,
  },
  [`& .${classes.loading}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  [`& .${classes.dateHeader}`]: {
    padding: theme.spacing(1, 0),
    textAlign: 'center',
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    margin: theme.spacing(2, 0),
  },
  [`& .${classes.divider}`]: {
    margin: theme.spacing(1, 0),
  },
}));

interface ChatMessageListProps {
  messages: ChatMessageType[];
  loading: boolean;
  currentUser: User | null;
  onEditMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onActionComplete?: (messageId: string, actionType: string) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  loading,
  currentUser,
  onEditMessage,
  onDeleteMessage,
  onActionComplete,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const groupMessagesByDate = (messages: ChatMessageType[]) => {
    const groups: { [key: string]: ChatMessageType[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups);
  };

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress />
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1">No messages yet. Start the conversation!</Typography>
      </Box>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Root className={classes.root}>
      <Box className={classes.messagesList}>
        {groupedMessages.map(([date, msgs], groupIndex) => (
          <React.Fragment key={date}>
            <Typography variant="overline" className={classes.dateHeader}>
              {formatDate(new Date(date))}
            </Typography>
            {msgs.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUser={currentUser}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            ))}
            {groupIndex < groupedMessages.length - 1 && <Divider className={classes.divider} />}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </Box>
    </Root>
  );
};

export default ChatMessageList; 