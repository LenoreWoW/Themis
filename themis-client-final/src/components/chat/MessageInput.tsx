import React, { useState, useRef, ChangeEvent } from 'react';
import { Box, TextField, IconButton, Paper, Tooltip, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  Code as CodeIcon,
  InsertDriveFile as FileIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { ChatChannel } from '../../types/ChatTypes';

const PREFIX = 'MessageInput';
const classes = {
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
  iconButton: `${PREFIX}-iconButton`,
  sendButton: `${PREFIX}-sendButton`,
  formatActions: `${PREFIX}-formatActions`,
  formatButton: `${PREFIX}-formatButton`,
  emojiPickerContainer: `${PREFIX}-emojiPickerContainer`,
  filePreview: `${PREFIX}-filePreview`,
  disabledMessage: `${PREFIX}-disabledMessage`,
  documentList: `${PREFIX}-documentList`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.input}`]: {
    flexGrow: 1,
  },
  [`& .${classes.iconButton}`]: {
    padding: 10,
  },
  [`& .${classes.sendButton}`]: {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  [`& .${classes.formatActions}`]: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.formatButton}`]: {
    padding: 4,
  },
  [`& .${classes.emojiPickerContainer}`]: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    zIndex: 1000,
  },
  [`& .${classes.filePreview}`]: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.disabledMessage}`]: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  [`& .${classes.documentList}`]: {
    maxHeight: 300,
  },
}));

interface MessageInputProps {
  channel: ChatChannel;
  canPost: boolean;
  onSendMessage: (message: string, file?: File) => Promise<void>;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  channel,
  canPost,
  onSendMessage,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareDocumentOpen, setShareDocumentOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;
    
    try {
      setIsSending(true);
      await onSendMessage(message, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setIsEmojiPickerVisible(false);
  };

  const insertFormatting = (format: 'bold' | 'italic' | 'code') => {
    const textArea = document.querySelector(
      `#message-input-${channel.id}`
    ) as HTMLTextAreaElement;
    
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      default:
        return;
    }
    
    const newMessage = 
      message.substring(0, start) + 
      formattedText + 
      message.substring(end);
    
    setMessage(newMessage);
    
    // Focus back to textarea after formatting
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(
        start + formattedText.length, 
        start + formattedText.length
      );
    }, 0);
  };

  const handleOpenShareDocument = async () => {
    try {
      setLoadingDocuments(true);
      // Fetch documents from API
      const response = await fetch('/api/documents');
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
      setShareDocumentOpen(true);
    }
  };

  const handleCloseShareDocument = () => {
    setShareDocumentOpen(false);
  };

  const handleShareDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/documents/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          channelId: channel.id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add a message with the shared document reference
        const documentMessage = `Shared document: ${documents.find(doc => doc.id === documentId)?.name || 'Document'}`;
        await onSendMessage(documentMessage);
        handleCloseShareDocument();
      } else {
        console.error('Failed to share document');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  if (!canPost) {
    return (
      <Root className={classes.root}>
        <Paper className={classes.disabledMessage} variant="outlined">
          You don't have permission to post in this channel. 
          {channel.isArchived && ' This channel is archived.'}
        </Paper>
      </Root>
    );
  }

  return (
    <Root className={classes.root}>
      <Box className={classes.formatActions}>
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton
            className={classes.formatButton}
            size="small"
            onClick={() => insertFormatting('bold')}
          >
            <BoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Italic (Ctrl+I)">
          <IconButton
            className={classes.formatButton}
            size="small"
            onClick={() => insertFormatting('italic')}
          >
            <ItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Code (Ctrl+K)">
          <IconButton
            className={classes.formatButton}
            size="small"
            onClick={() => insertFormatting('code')}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Box flexGrow={1} />
        
        <Tooltip title="Share Document">
          <IconButton
            className={classes.formatButton}
            size="small"
            onClick={handleOpenShareDocument}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Attach File">
          <IconButton
            className={classes.formatButton}
            size="small"
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Emoji">
          <IconButton
            className={classes.formatButton}
            size="small"
            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
          >
            <EmojiIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {selectedFile && (
        <Box className={classes.filePreview}>
          <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
          <Box flexGrow={1}>{selectedFile.name}</Box>
          <Button size="small" onClick={() => setSelectedFile(null)}>
            Remove
          </Button>
        </Box>
      )}
      
      <Box display="flex" alignItems="flex-end">
        <TextField
          id={`message-input-${channel.id}`}
          className={classes.input}
          multiline
          maxRows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          fullWidth
          disabled={isSending}
          InputProps={{
            sx: { paddingRight: 0 },
          }}
        />
        
        <IconButton
          className={classes.sendButton}
          onClick={handleSendMessage}
          disabled={(!message.trim() && !selectedFile) || isSending}
        >
          {isSending ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
      
      {isEmojiPickerVisible && (
        <Box className={classes.emojiPickerContainer}>
          <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={450} />
        </Box>
      )}
      
      {/* Share Document Dialog */}
      <Dialog open={shareDocumentOpen} onClose={handleCloseShareDocument} maxWidth="sm" fullWidth>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          {loadingDocuments ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : documents.length === 0 ? (
            <Box p={2}>
              <Typography>No documents available to share</Typography>
            </Box>
          ) : (
            <List className={classes.documentList}>
              {documents.map((doc) => (
                <ListItem 
                  button 
                  key={doc.id} 
                  onClick={() => handleShareDocument(doc.id)}
                >
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={doc.name} 
                    secondary={doc.updatedAt ? `Last updated: ${new Date(doc.updatedAt).toLocaleString()}` : ''} 
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDocument}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </Root>
  );
};

export default MessageInput; 