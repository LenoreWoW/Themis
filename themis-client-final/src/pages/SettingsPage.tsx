import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  FormGroup,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  AccessTime as TimeIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import SchedulerService from '../services/SchedulerService';
import logger from '../utils/logger';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const SettingsPage = () => {
  const { isDarkMode, setThemeMode } = useTheme();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [languageValue, setLanguageValue] = useState(localStorage.getItem('pmsLanguage') || 'en');
  const [tabValue, setTabValue] = useState(0);
  
  // Daily Brief settings
  const [dailyBriefEnabled, setDailyBriefEnabled] = useState<boolean>(true);
  const [dailyBriefTime, setDailyBriefTime] = useState<string>('08:00');
  const [showAllProjects, setShowAllProjects] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load Daily Brief settings from localStorage
    const storedEnabled = localStorage.getItem('dailyBriefEnabled');
    const storedTime = localStorage.getItem('dailyBriefTime');
    const storedShowAll = localStorage.getItem('dailyBriefShowAllProjects');
    
    if (storedEnabled !== null) {
      setDailyBriefEnabled(storedEnabled === 'true');
    }
    
    if (storedTime !== null) {
      setDailyBriefTime(storedTime);
    }
    
    if (storedShowAll !== null) {
      setShowAllProjects(storedShowAll === 'true');
    }
  }, []);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value;
    setLanguageValue(newLanguage);
    localStorage.setItem('pmsLanguage', newLanguage);
    i18n.changeLanguage(newLanguage);
    
    // Set document direction based on language
    if (newLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = newLanguage;
    }
    
    // Reload the page to apply direction changes properly
    window.location.reload();
  };

  const handleSaveSettings = async () => {
    try {
      // Save daily brief settings
      localStorage.setItem('dailyBriefEnabled', dailyBriefEnabled.toString());
      localStorage.setItem('dailyBriefTime', dailyBriefTime);
      localStorage.setItem('dailyBriefShowAllProjects', showAllProjects.toString());
      
      // Update the scheduler if needed
      if (dailyBriefEnabled) {
        const schedulerService = SchedulerService.getInstance();
        schedulerService.updateDailyBriefTime(dailyBriefTime);
      }
      
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      logger.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };
  
  const handleDailyBriefTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDailyBriefTime(event.target.value);
  };
  
  const handleSendTestDailyBrief = async () => {
    try {
      const schedulerService = SchedulerService.getInstance();
      await schedulerService.forceSendDailyBrief();
      setSuccessMessage('Test Daily Brief sent successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      logger.error('Error sending test Daily Brief:', error);
      setErrorMessage('Failed to send test Daily Brief');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('Settings')}
      </Typography>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="settings tabs">
            <Tab label={t('General')} {...a11yProps(0)} />
            <Tab label={t('Notifications')} {...a11yProps(1)} />
            <Tab label={t('Daily Brief')} {...a11yProps(2)} />
            <Tab label={t('Advanced')} {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={t('Appearance')} />
                <CardContent>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch checked={isDarkMode} onChange={toggleTheme} />}
                      label={t('Dark Mode')}
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={t('Language')} />
                <CardContent>
                  <FormControl fullWidth>
                    <InputLabel id="language-select-label">{t('Language')}</InputLabel>
                    <Select
                      labelId="language-select-label"
                      id="language-select"
                      value={languageValue}
                      label={t('Language')}
                      onChange={handleLanguageChange}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ar">العربية</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader title={t('Notification Preferences')} />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('Email Notifications')}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('In-App Notifications')}
                />
                <FormControlLabel
                  control={<Switch />}
                  label={t('SMS Notifications')}
                />
              </FormGroup>
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              title={t('Daily Brief Preferences')} 
              action={
                <Tooltip title={t('Send Test Daily Brief')}>
                  <IconButton onClick={handleSendTestDailyBrief}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}
              
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={dailyBriefEnabled} 
                      onChange={(e) => setDailyBriefEnabled(e.target.checked)} 
                    />
                  }
                  label={t('Enable Daily Brief')}
                />
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <InputLabel htmlFor="daily-brief-time">{t('Delivery Time')}</InputLabel>
                  <TextField
                    id="daily-brief-time"
                    type="time"
                    value={dailyBriefTime}
                    onChange={handleDailyBriefTimeChange}
                    disabled={!dailyBriefEnabled}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <Typography variant="caption" color="textSecondary">
                    {t('Time is in 24-hour format')}
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showAllProjects} 
                      onChange={(e) => setShowAllProjects(e.target.checked)}
                      disabled={!dailyBriefEnabled}
                    />
                  }
                  label={t('Show tasks from all projects (not just mine)')}
                />
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    {t('Save Preferences')}
                  </Button>
                </Box>
              </FormGroup>
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6">
            {t('Advanced Settings')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('Advanced settings are only available to administrators')}
          </Typography>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default SettingsPage; 