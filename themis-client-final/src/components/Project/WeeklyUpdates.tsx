import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  AttachFile as AttachmentIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  DescriptionOutlined as DocIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Attachment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';

// Hidden input for file upload
const Input = styled('input')({
  display: 'none',
});

interface WeeklyUpdatesProps {
  projectId: string;
}

// Helper to get the current week number and year
const getCurrentWeekInfo = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000; // milliseconds in a week
  const weekNumber = Math.floor(diff / oneWeek) + 1;
  return { weekNumber, weekYear: now.getFullYear() };
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// Helper to get icon based on file type
const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <PdfIcon color="error" />;
  if (fileType.includes('image')) return <ImageIcon color="primary" />;
  if (fileType.includes('word') || fileType.includes('document')) return <DocIcon color="info" />;
  return <FileIcon color="action" />;
};

// Define WeeklyUpdate type locally until it's exported from the types file
interface WeeklyUpdate {
  id: string;
  projectId: string;
  content: string;
  weekNumber: number;
  weekYear: number;
  attachments: Attachment[];
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const WeeklyUpdates: React.FC<WeeklyUpdatesProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState<{
    content: string;
    files: File[];
  }>({
    content: '',
    files: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingUpdate, setUploadingUpdate] = useState(false);

  // Fetch weekly updates
  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, you would fetch from an API
        // Mocking some updates for now
        setTimeout(() => {
          const mockUpdates: WeeklyUpdate[] = [
            {
              id: '1',
              projectId,
              content: 'Completed initial requirements gathering and stakeholder interviews. Planning phase is on track.',
              weekNumber: 12,
              weekYear: 2023,
              attachments: [
                {
                  id: '1',
                  name: 'Requirements Document',
                  filename: 'requirements.pdf',
                  type: 'application/pdf',
                  size: 1024 * 1024,
                  url: 'https://example.com/requirements.pdf',
                  uploadedBy: {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe'
                  },
                  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                  updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                }
              ],
              author: {
                id: '1',
                firstName: 'John',
                lastName: 'Doe'
              },
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              projectId,
              content: 'Started development of core features. Team is working on database design and API endpoints.',
              weekNumber: 13,
              weekYear: 2023,
              attachments: [],
              author: {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith'
              },
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          setUpdates(mockUpdates);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching weekly updates:', err);
        setError('Failed to load weekly updates. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUpdates();
  }, [projectId]);

  // Open file input when attachment button is clicked
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewUpdate(prev => ({
        ...prev,
        files: [...prev.files, ...selectedFiles]
      }));
    }
  };

  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setNewUpdate(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Open dialog to add new update
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setNewUpdate({
      content: '',
      files: [],
    });
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Submit new update
  const handleSubmitUpdate = async () => {
    if (!newUpdate.content.trim()) return;
    
    setUploadingUpdate(true);
    
    try {
      // In a real app, you would send this to an API
      // Mocking the creation of a new update
      setTimeout(() => {
        const currentWeekInfo = getCurrentWeekInfo();
        
        // Create attachments from files
        const newAttachments: Attachment[] = newUpdate.files.map((file, index) => ({
          id: `new-${index}`,
          name: file.name,
          filename: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedBy: {
            id: user?.id || '0',
            firstName: user?.firstName || 'Unknown',
            lastName: user?.lastName || 'User'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        // Create new update object
        const createdUpdate: WeeklyUpdate = {
          id: `new-${Date.now()}`,
          projectId,
          content: newUpdate.content,
          weekNumber: currentWeekInfo.weekNumber,
          weekYear: currentWeekInfo.weekYear,
          attachments: newAttachments,
          author: {
            id: user?.id || '0',
            firstName: user?.firstName || 'Unknown',
            lastName: user?.lastName || 'User'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to updates list
        setUpdates(prev => [createdUpdate, ...prev]);
        setUploadingUpdate(false);
        setIsDialogOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error creating update:', err);
      setUploadingUpdate(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Weekly Updates</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Update
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      ) : updates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No weekly updates yet. Create the first one!
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {updates.map(update => (
            <Box key={update.id}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar>
                      {update.author.firstName.charAt(0)}{update.author.lastName.charAt(0)}
                    </Avatar>
                  }
                  title={`Week ${update.weekNumber}, ${update.weekYear}`}
                  subheader={`${update.author.firstName} ${update.author.lastName} - ${formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}`}
                />
                <CardContent>
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {update.content}
                  </Typography>
                  
                  {update.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachments:</Typography>
                      <List dense>
                        {update.attachments.map((attachment: Attachment) => (
                          <ListItem 
                            key={attachment.id}
                            secondaryAction={
                              <IconButton edge="end" aria-label="download">
                                <DownloadIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              {getFileIcon(attachment.type)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={attachment.name} 
                              secondary={formatFileSize(attachment.size)} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Weekly Update</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Update Content"
              multiline
              rows={6}
              fullWidth
              value={newUpdate.content}
              onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Describe this week's progress, accomplishments, and any issues or risks..."
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ mb: 2 }}>
              <Input
                ref={fileInputRef}
                accept="*/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachmentIcon />}
                onClick={handleAttachmentClick}
              >
                Attach Files
              </Button>
            </Box>
            
            {newUpdate.files.length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({newUpdate.files.length})
                </Typography>
                <List dense>
                  {newUpdate.files.map((file, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name} 
                        secondary={formatFileSize(file.size)} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploadingUpdate}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitUpdate}
            variant="contained"
            disabled={!newUpdate.content.trim() || uploadingUpdate}
            startIcon={uploadingUpdate ? <CircularProgress size={24} /> : null}
          >
            {uploadingUpdate ? 'Submitting...' : 'Submit Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyUpdates; 