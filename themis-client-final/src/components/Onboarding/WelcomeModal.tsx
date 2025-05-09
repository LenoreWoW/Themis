import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTour } from '../../context/TourContext';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { startTour } = useTour();
  const [willStartTour, setWillStartTour] = useState(false);
  const theme = useTheme();
  
  // Configure primary color based on Qatar's flag
  const qatarMaroon = '#8A1538';
  
  const handleStartTour = () => {
    setWillStartTour(true);
    startTour();
    onClose();
  };
  
  const handleSkipTour = () => {
    // Mark the tutorial as completed in localStorage
    localStorage.setItem('tutorial_complete', 'true');
    onClose();
  };
  
  // Get the user's first name for personalized greeting
  const userName = user?.firstName || '';
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="welcome-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: '4px solid #6C1D45', // Qatar's flag color (maroon)
          borderRadius: '8px',
          p: 1
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -24,
          left: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: qatarMaroon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: theme.shadows[3]
        }}
      >
        <SchoolIcon fontSize="medium" />
      </Box>
      
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight="bold" color="#6C1D45">
          {t('welcome.title', { name: userName })}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <DialogContentText>
            {t('welcome.message', 'Welcome to Themis - your enterprise Project Portfolio Management solution. We are delighted to have you on board.')}
          </DialogContentText>
          
          <DialogContentText>
            {t('welcome.tour', 'Would you like to take a quick guided tour to familiarize yourself with the key features of the system?')}
          </DialogContentText>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={handleSkipTour} color="primary">
          {t('welcome.skip', 'Skip Tour')}
        </Button>
        <Button 
          onClick={handleStartTour} 
          variant="contained" 
          color="primary" 
          autoFocus
          sx={{ 
            bgcolor: '#6C1D45',
            '&:hover': {
              bgcolor: '#8A2454'
            }
          }}
        >
          {t('welcome.startTour', 'Start Tour')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeModal; 