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

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [adIdentifier, setAdIdentifier] = useState('');
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
    
    if (!adIdentifier.trim()) {
      setError(t('auth.enterActiveDirectoryId'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await login(adIdentifier);
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
    setAdIdentifier(email);
    setCredentialsOpen(false);
  };

  const testAccounts = [
    { role: 'Admin', email: 'john.smith@acme.com' },
    { role: 'Project Manager', email: 'sarah.johnson@acme.com' },
    { role: 'Department Director', email: 'emma.garcia@acme.com' },
    { role: 'Executive', email: 'robert.taylor@acme.com' },
    { role: 'Developer', email: 'michael.chen@acme.com' }
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
              {t('auth.welcomeToThemis')}
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
                src="/logo512.png"
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
              src="/assets/images/LogoClickUP.png"
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
            {t('auth.loginToThemis')}
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 4 }}
          >
            {t('auth.signInWithAD')}
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
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="adIdentifier"
              label={t('auth.activeDirectoryId')}
              name="adIdentifier"
              autoComplete="username"
              autoFocus
              value={adIdentifier}
              onChange={(e) => setAdIdentifier(e.target.value)}
              disabled={isLoading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
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
                mt: 3, 
                mb: 2, 
                height: 56, 
                borderRadius: '8px',
                backgroundColor: '#8A1538',
                '&:hover': {
                  backgroundColor: '#6E0020',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.signin')
              )}
            </Button>
          </Box>
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Test Credentials Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleCredentialsOpen}
            sx={{
              mt: 3,
              height: 48,
              borderRadius: '8px',
              borderColor: '#8A1538',
              color: '#8A1538',
              '&:hover': {
                borderColor: '#6E0020',
                backgroundColor: 'rgba(138, 21, 56, 0.04)',
              }
            }}
          >
            {t('auth.testCredentials')}
          </Button>

          {/* Test Credentials Dialog */}
          <Dialog 
            open={credentialsOpen} 
            onClose={handleCredentialsClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: '#8A1538', color: 'white' }}>
              {t('auth.testCredentials')}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                {t('auth.useTheseAccounts')}
              </Typography>
              <List sx={{ pt: 0 }}>
                {testAccounts.map((account, index) => (
                  <React.Fragment key={account.email}>
                    <ListItemButton onClick={() => handleAccountSelect(account.email)}>
                      <ListItemText 
                        primary={account.role} 
                        secondary={account.email}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItemButton>
                    {index < testAccounts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCredentialsClose} sx={{ color: '#8A1538' }}>
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