import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FlagIcon from '@mui/icons-material/Flag';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Check if user is already logged in
  const isAuthenticated = localStorage.getItem('projectCollector_token');
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user changes input
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock authentication - in real app, this would make an API call
      setTimeout(() => {
        // For demo purposes, allow any login except empty fields
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }
        
        // Store token in localStorage - in real app, this would be a JWT from server
        localStorage.setItem('projectCollector_token', 'demo-token');
        localStorage.setItem('projectCollector_user', JSON.stringify({
          email: formData.email,
          name: 'Demo User',
          role: 'PROJECT_MANAGER'
        }));
        
        setLoading(false);
        navigate('/projects');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
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
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <FlagIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography component="h1" variant="h5" color="primary">
              Themis Project Collector
            </Typography>
          </Box>
          
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              mb: 4,
              width: '100%',
            }}
          >
            <LockOutlinedIcon sx={{ mr: 1 }} />
            <Typography component="h2" variant="h6">
              Sign in
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  Use your organization credentials to log in
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 