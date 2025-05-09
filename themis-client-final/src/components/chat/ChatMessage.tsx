import React from 'react';
import { Box, Typography, Avatar, IconButton, Paper, Tooltip, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { ChatMessage as ChatMessageType } from '../../types/ChatTypes';
import { formatDistanceToNow } from 'date-fns';
import SystemMessage from './SystemMessage';

const PREFIX = 'ChatMessage';
const classes = {
  root: `${PREFIX}-root`,
  messageBubble: `${PREFIX}-messageBubble`,
  messageHeader: `${PREFIX}-messageHeader`,
  messageSender: `${PREFIX}-messageSender`,
  messageTime: `${PREFIX}-messageTime`,
  messageBody: `${PREFIX}-messageBody`,
  messageActions: `${PREFIX}-messageActions`,
  edited: `${PREFIX}-edited`,
  ownMessage: `${PREFIX}-ownMessage`,
  avatar: `${PREFIX}-avatar`,
  deletedMessage: `${PREFIX}-deletedMessage`,
  fileAttachment: `${PREFIX}-fileAttachment`,
  fileIcon: `${PREFIX}-fileIcon`,
  fileInfo: `${PREFIX}-fileInfo`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`& .${classes.messageBubble}`]: {
    flex: 1,
    marginLeft: theme.spacing(1),
  },
  [`& .${classes.messageHeader}`]: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  [`& .${classes.messageSender}`]: {
    fontWeight: 500,
    marginRight: theme.spacing(1),
  },
  [`& .${classes.messageTime}`]: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  [`& .${classes.messageBody}`]: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  [`& .${classes.messageActions}`]: {
    display: 'flex',
    visibility: 'hidden',
    '$root:hover &': {
      visibility: 'visible',
    },
  },
  [`& .${classes.edited}`]: {
    fontSize: '0.75rem',
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
  },
  [`&.${classes.ownMessage}`]: {
    flexDirection: 'row-reverse',
    '& $messageBubble': {
      marginLeft: 0,
      marginRight: theme.spacing(1),
    },
  },
  [`& .${classes.avatar}`]: {
    width: 36,
    height: 36,
    background: theme.palette.primary.main,
  },
  [`& .${classes.deletedMessage}`]: {
    fontStyle: 'italic',
    color: theme.palette.text.disabled,
  },
  [`& .${classes.fileAttachment}`]: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  [`& .${classes.fileIcon}`]: {
    marginRight: theme.spacing(1),
  },
  [`& .${classes.fileInfo}`]: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
}));

interface ChatMessageProps {
  message: ChatMessageType;
  currentUser: any;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, currentUser, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isOwnMessage = message.sender.id === currentUser?.id;
  
  // Check if this is a system message and render the SystemMessage component
  if (message.isSystemMessage) {
    return <SystemMessage message={message} currentUser={currentUser} />;
  }
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    onEdit(message.id);
    handleMenuClose();
  };
  
  const handleDelete = () => {
    onDelete(message.id);
    handleMenuClose();
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return date;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };
  
  return (
    <Root className={`${classes.root} ${isOwnMessage ? classes.ownMessage : ''}`}>
      <Avatar className={classes.avatar}>
        {getInitials(message.sender.firstName, message.sender.lastName)}
      </Avatar>
      
      <Box className={classes.messageBubble}>
        <Box className={classes.messageHeader}>
          <Typography variant="subtitle2" className={classes.messageSender}>
            {message.sender.firstName} {message.sender.lastName}
          </Typography>
          
          <Typography variant="caption" className={classes.messageTime}>
            {formatTime(message.createdAt)}
          </Typography>
          
          {message.isEdited && (
            <Typography variant="caption" className={classes.edited}>
              (edited)
            </Typography>
          )}
          
          {isOwnMessage && (
            <Box className={classes.messageActions} ml={1}>
              <Tooltip title="More actions">
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                  <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
        
        {message.isDeleted ? (
          <Typography variant="body2" className={classes.deletedMessage}>
            This message has been deleted.
          </Typography>
        ) : (
          <>
            <Typography variant="body1" className={classes.messageBody}>
              {message.body}
            </Typography>
            
            {message.fileUrl && (
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Paper className={classes.fileAttachment} elevation={0}>
                  <Box className={classes.fileInfo}>
                    {message.fileType && (
                      <Typography variant="caption">
                        {message.fileType} - {formatFileSize(message.fileSize)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </a>
            )}
          </>
        )}
      </Box>
    </Root>
  );
};

export default ChatMessageComponent; 