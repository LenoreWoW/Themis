import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FilePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  open,
  onClose,
  fileUrl,
  fileName,
  fileType
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load file preview');
  };

  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');

  const renderFilePreview = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (isImage) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }}
          onLoad={handleLoad}
          onError={handleError}
        />
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0`}
          title={fileName}
          width="100%"
          height="70vh"
          onLoad={handleLoad}
          onError={handleError}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          controls
          autoPlay
          style={{ maxWidth: '100%', maxHeight: '70vh' }}
          onLoadedData={handleLoad}
          onError={handleError}
        >
          <source src={fileUrl} type={fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
          <audio
            controls
            autoPlay
            onLoadedData={handleLoad}
            onError={handleError}
          >
            <source src={fileUrl} type={fileType} />
            Your browser does not support the audio tag.
          </audio>
        </Box>
      );
    }

    // For other file types, just provide a download link
    setLoading(false);
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          padding: 3
        }}
      >
        <Typography variant="body1" gutterBottom>
          Preview not available for this file type ({fileType})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 2 }}
        >
          Download File
        </Button>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>
          {fileName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {renderFilePreview()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePreviewDialog; 