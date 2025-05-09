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
    
    if (!username || !password) {
      setError(t('auth.usernamePasswordRequired'));
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
      
      // Dispatch custom event to initialize services
      window.dispatchEvent(new Event('themis:login'));
      
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
      // Use empty password for test accounts
      login(email, 'password').then(() => {
        // Dispatch custom event to initialize services
        window.dispatchEvent(new Event('themis:login'));
        
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
          
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: '12px',
              width: '100%',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                textAlign: 'center',
                fontWeight: 500 
              }}
            >
              {t('auth.signIn')}
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label={t('auth.email')}
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              
              <TextField
                fullWidth
                label={t('auth.password')}
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ 
                  py: 1.5,
                  mt: 1,
                  bgcolor: '#8A1538',
                  '&:hover': {
                    bgcolor: '#6e0020',
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.login')}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCredentialsOpen}
                sx={{ 
                  mt: 1,
                  py: 1.5,
                  color: '#8A1538',
                  borderColor: '#8A1538',
                  '&:hover': {
                    borderColor: '#6e0020',
                    bgcolor: 'rgba(138, 21, 56, 0.04)'
                  }
                }}
              >
                <Typography sx={{fontWeight: 'bold'}}>
                  {t('auth.testAccounts')}
                </Typography>
              </Button>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 3, 
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              {t('auth.forgotPassword')}
            </Typography>
          </Paper>
          
          <Dialog 
            open={credentialsOpen} 
            onClose={handleCredentialsClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              bgcolor: '#8A1538', 
              color: 'white',
              pb: 2 
            }}>
              <Typography variant="h6" fontWeight="bold">
                {t('auth.testAccounts')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {t('auth.clickToLogin')}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <List sx={{ pt: 0 }}>
                {testAccounts.map((account, index) => (
                  <React.Fragment key={account.email}>
                    <ListItemButton 
                      onClick={() => handleAccountSelect(account.email)}
                      sx={{ 
                        p: 2,
                        '&:hover': {
                          bgcolor: 'rgba(138, 21, 56, 0.08)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography fontWeight="medium" color="primary">
                            {account.role}
                          </Typography>
                        }
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" component="span" color="text.primary">
                              {account.email}
                            </Typography>
                            <Typography variant="body2" component="span" color="text.secondary" sx={{ display: 'block' }}>
                              {account.department}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                    {index < testAccounts.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCredentialsClose} color="primary">
                {t('common.cancel')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage; 