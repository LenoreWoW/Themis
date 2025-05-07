import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';
import { handleAuth0Authentication } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const Auth0CallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Process the Auth0 authentication response
    const processAuth = async () => {
      try {
        // Handle Auth0 authentication redirect
        const authResponse = await handleAuth0Authentication();
        
        // If authentication was successful, redirect to dashboard
        if (authResponse.success) {
          navigate('/');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processAuth();
  }, [navigate, isAuthenticated]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500
        }}
      >
        {error ? (
          <>
            <Typography variant="h5" color="error" gutterBottom>
              Authentication Error
            </Typography>
            <Typography variant="body1" align="center">
              {error}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Redirecting to login page...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h5" sx={{ mt: 3 }}>
              Logging you in...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we authenticate your account
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Auth0CallbackPage; 