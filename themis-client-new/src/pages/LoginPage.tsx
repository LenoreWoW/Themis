import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [adIdentifier, setAdIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adIdentifier.trim()) {
      setError('Please enter your Active Directory ID');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await login(adIdentifier);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please check your Active Directory ID or contact your administrator.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Themis Project Management System
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Sign in with your Active Directory ID
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="adIdentifier"
              label="Active Directory ID"
              name="adIdentifier"
              autoComplete="username"
              autoFocus
              value={adIdentifier}
              onChange={(e) => setAdIdentifier(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            If you don't have access, please contact your department director or the system administrator.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 