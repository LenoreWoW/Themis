import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Error as ErrorIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          padding: 3,
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            maxWidth: 500,
            width: '100%',
          }}
        >
          <ErrorIcon 
            color="error" 
            sx={{ fontSize: 80, mb: 2 }} 
          />
          
          <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: { xs: '4rem', md: '6rem' } }}>
            404
          </Typography>
          
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={handleGoHome}
            size="large"
          >
            Back to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 