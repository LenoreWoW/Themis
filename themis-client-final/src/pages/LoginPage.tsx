import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginWithAuth0 } from '../services/auth';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError(t('auth.enterUsername'));
      return;
    }
    
    // For 'admin' username, we don't need to check password
    if (username.toLowerCase() !== 'admin' && !password.trim()) {
      setError(t('auth.enterPassword'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', username);
      
      // Handle test accounts with a simplified flow
      if (username.toLowerCase() === 'admin' || 
          username === 'john.smith@acme.com' || 
          username === 'sarah.johnson@acme.com' || 
          username === 'emma.garcia@acme.com' || 
          username === 'robert.taylor@acme.com' || 
          username === 'david.wilson@acme.com' || 
          username === 'jessica.brown@acme.com' || 
          username === 'michael.chen@acme.com') {
        
        console.log('Using test account flow for:', username);
      }
      
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.authFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsOpen = () => {
    setCredentialsOpen(true);
  };

  const handleCredentialsClose = () => {
    setCredentialsOpen(false);
  };

  const handleAccountSelect = (email: string) => {
    setUsername(email);
    setCredentialsOpen(false);
    
    // Automatically login with test account
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Auto-logging in with test account:', email);
      login(email, '').then(() => {
        navigate('/');
      }).catch(err => {
        console.error('Auto-login error:', err);
        setError(t('auth.authFailed'));
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Auto-login setup error:', err);
      setError(t('auth.authFailed'));
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { role: 'Admin', email: 'john.smith@acme.com', department: 'IT Department' },
    { role: 'Project Manager', email: 'sarah.johnson@acme.com', department: 'Digital Transformation' },
    { role: 'Department Director', email: 'emma.garcia@acme.com', department: 'Finance Department' },
    { role: 'Executive', email: 'robert.taylor@acme.com', department: 'Executive Office' },
    { role: 'Main PMO', email: 'david.wilson@acme.com', department: 'IT Department' },
    { role: 'Sub PMO', email: 'jessica.brown@acme.com', department: 'Digital Transformation' },
    { role: 'Developer', email: 'michael.chen@acme.com', department: 'Development Department' }
  ];
  
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8f8f8 0%, #e6e6e6 100%)',
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            flex: '1 1 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(138, 21, 56, 0.9) 0%, rgba(110, 0, 32, 0.9) 100%)',
              zIndex: 1,
            }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              color: 'white',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
              {t('auth.welcome')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 'normal' }}>
              {t('auth.centralizedWorkspace')}
            </Typography>
            <Paper
              elevation={10}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '4px solid white',
              }}
            >
              <Box
                component="img"
                src="/Finallogo.jpg"
                alt={t('auth.projectManagement')}
                sx={{
                  width: '100%',
                  height: 'auto',
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </Paper>
          </Box>
        </Box>
      )}
      
      <Box
        sx={{
          flex: isMobile ? '1 1 100%' : '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          background: '#ffffff',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '450px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box 
              component="img"
              src="/Finallogo.jpg"
              alt={t('app.title')}
              sx={{ 
                height: 80,
                objectFit: 'contain'
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                mt: 2, 
                color: '#8A1538',
                fontWeight: 600 
              }}
            >
              {t('app.title')}
            </Typography>
          </Box>
          
          <Typography 
            component="h1" 
            variant="h4" 
            fontWeight="bold" 
            align="center"
            sx={{ mb: 1 }}
          >
            {t('auth.loginTitle')}
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.primary" 
            sx={{ mb: 4 }}
          >
            {t('auth.signIn')}
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3, 
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label={t('auth.username')}
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
              InputProps={{
                style: { color: 'black' }
              }}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
              InputProps={{
                style: { color: 'black' }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isLoading}
              sx={{ 
                py: 1.5,
                mb: 2,
                borderRadius: '8px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.signIn')}
            </Button>
          </form>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={handleCredentialsOpen}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1
              }}
            >
              {t('auth.testAccounts')}
            </Button>
          </Box>
          
          <Dialog 
            open={credentialsOpen} 
            onClose={handleCredentialsClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{t('auth.testAccounts')}</DialogTitle>
            <DialogContent>
              <List>
                {testAccounts.map((account, index) => (
                  <React.Fragment key={account.email}>
                    <ListItemButton onClick={() => handleAccountSelect(account.email)}>
                      <ListItemText 
                        primary={`${account.role} (${account.email})`} 
                        secondary={account.department} 
                      />
                    </ListItemButton>
                    {index < testAccounts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCredentialsClose}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage; 