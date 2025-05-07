import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Tooltip, Paper, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage as ChatMessageType } from '../../types/ChatTypes';
import { User } from '../../types';
import ReactMarkdown from 'react-markdown';

const PREFIX = 'ChatMessage';
const classes = {
  root: `${PREFIX}-root`,
  messageContent: `${PREFIX}-messageContent`,
  avatar: `${PREFIX}-avatar`,
  messageHeader: `${PREFIX}-messageHeader`,
  timestamp: `${PREFIX}-timestamp`,
  username: `${PREFIX}-username`,
  edited: `${PREFIX}-edited`,
  attachment: `${PREFIX}-attachment`,
  deleted: `${PREFIX}-deleted`,
  menuButton: `${PREFIX}-menuButton`,
  markdownContainer: `${PREFIX}-markdownContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      [`& .${classes.menuButton}`]: {
        visibility: 'visible',
      },
    },
  },
  [`& .${classes.messageContent}`]: {
    marginLeft: theme.spacing(2),
    width: '100%',
    wordBreak: 'break-word',
  },
  [`& .${classes.avatar}`]: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  [`& .${classes.messageHeader}`]: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  [`& .${classes.timestamp}`]: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1),
  },
  [`& .${classes.username}`]: {
    fontWeight: 500,
  },
  [`& .${classes.edited}`]: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1),
    fontStyle: 'italic',
  },
  [`& .${classes.attachment}`]: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    maxWidth: '300px',
  },
  [`& .${classes.deleted}`]: {
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  [`& .${classes.menuButton}`]: {
    visibility: 'hidden',
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  [`& .${classes.markdownContainer}`]: {
    '& p': {
      margin: 0,
    },
    '& code': {
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0.25, 0.5),
      fontFamily: 'monospace',
    },
    '& pre': {
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1),
      overflow: 'auto',
    },
  },
}));

interface ChatMessageProps {
  message: ChatMessageType;
  currentUser: User | null;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(message.id);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(message.id);
  };

  // Calculate if this message can be edited/deleted (only by sender within 5 minutes)
  const canModify = currentUser?.id === message.senderId && 
    Date.now() - new Date(message.createdAt).getTime() < 5 * 60 * 1000;

  const getFileIcon = () => {
    // Logic for displaying different file type icons
    return <AttachFileIcon />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <Root className={classes.root}>
      <Avatar className={classes.avatar}>
        {getInitials(message.sender.firstName, message.sender.lastName)}
      </Avatar>
      
      <Box className={classes.messageContent}>
        <Box className={classes.messageHeader}>
          <Typography variant="body2" className={classes.username}>
            {message.sender.firstName} {message.sender.lastName}
          </Typography>
          <Typography variant="caption" className={classes.timestamp}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </Typography>
          {message.isEdited && (
            <Typography variant="caption" className={classes.edited}>
              (edited)
            </Typography>
          )}
        </Box>

        {message.isDeleted ? (
          <Typography variant="body2" className={classes.deleted}>
            This message has been deleted.
          </Typography>
        ) : (
          <>
            <Box className={classes.markdownContainer}>
              <ReactMarkdown>
                {message.body}
              </ReactMarkdown>
            </Box>

            {message.fileUrl && (
              <Paper variant="outlined" className={classes.attachment}>
                {getFileIcon()}
                <Box ml={1}>
                  <Link href={message.fileUrl} target="_blank" rel="noopener">
                    {message.fileUrl.split('/').pop()}
                  </Link>
                  {message.fileSize && (
                    <Typography variant="caption" display="block">
                      {formatFileSize(message.fileSize)}
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}
          </>
        )}
      </Box>

      {canModify && !message.isDeleted && (
        <>
          <IconButton
            size="small"
            className={classes.menuButton}
            onClick={handleMenuClick}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
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
        </>
      )}
    </Root>
  );
};

export default ChatMessageComponent; 