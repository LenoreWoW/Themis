import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTestAuth } from '../context/TestAuthContext';
import { TEST_USER_ROLES } from '../context/TestAuthContext';

// Component descriptions to explain roles during testing
const ROLE_DESCRIPTIONS = {
  [TEST_USER_ROLES.ADMIN]: 'Full access to all system features including user management and settings',
  [TEST_USER_ROLES.PROJECT_MANAGER]: 'Can create and manage projects, approve workflows, and assign tasks',
  [TEST_USER_ROLES.TEAM_LEAD]: 'Can create tasks, assign them to team members, and review completed work',
  [TEST_USER_ROLES.DEVELOPER]: 'Can view assigned tasks and update their status',
  [TEST_USER_ROLES.STAKEHOLDER]: 'Can view project status and approve high-level decisions',
  [TEST_USER_ROLES.GUEST]: 'Limited view access to public projects and reports'
};

function Login({ onLoginSuccess }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { loginWithTestUser, isTestUser } = useTestAuth();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [selectedRole, setSelectedRole] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    if (isTestUser) {
      navigate('/dashboard');
    }
  }, [isTestUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (testMode && !selectedRole) {
      setError(t('Please select a role for testing'));
      return;
    }
    
    try {
      if (testMode) {
        // Login with test user role
        loginWithTestUser(selectedRole, credentials.email);
        
        // Call onLoginSuccess prop if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // For real authentication (not implemented yet)
        console.log('Regular login with:', credentials);
        setError(t('Regular login not implemented yet. Please use test mode.'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || t('An error occurred during login'));
    }
  };

  const handleToggleTestMode = () => {
    setTestMode(!testMode);
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {t('auth.loginToThemis')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.centralizedWorkspace')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required={!testMode}
                  placeholder="user@example.com"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.password')}
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required={!testMode}
                  placeholder="••••••••"
                  disabled={testMode}
                />
              </Grid>
              
              {testMode && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="role-select-label">{t('Test Role')}</InputLabel>
                    <Select
                      labelId="role-select-label"
                      id="role-select"
                      value={selectedRole}
                      label={t('Test Role')}
                      onChange={handleRoleChange}
                    >
                      {Object.entries(TEST_USER_ROLES).map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {key.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {selectedRole && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, pl: 1 }}>
                      {ROLE_DESCRIPTIONS[selectedRole]}
                    </Typography>
                  )}
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 1 }}
                >
                  {t('auth.signin')}
                </Button>
              </Grid>
            </Grid>
          </form>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('OR')}
              </Typography>
            </Divider>
            
            <Button 
              variant={testMode ? "contained" : "outlined"} 
              color={testMode ? "success" : "primary"}
              onClick={handleToggleTestMode}
              fullWidth
            >
              {testMode ? t('Testing Mode Active') : t('Enable Testing Mode')}
            </Button>
            
            {testMode && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                {t('Select a role to test different user workflows')}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              size="small"
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
            >
              {i18n.language === 'en' ? t('language.arabic') : t('language.english')}
            </Button>
            
            <Button size="small">
              {t('auth.forgot')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login; 