import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  FormControl,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Visibility as VisibilityIcon,
  Translate as TranslateIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet, Routes, Route } from 'react-router-dom';
import Booking from './Booking';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
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

const SettingsIndex: React.FC = () => {
  const [value, setValue] = useState(0);
  const { isDarkMode, toggleThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();

  // Determine which tab should be active based on the URL
  React.useEffect(() => {
    if (location.pathname.includes('/settings/booking')) {
      setValue(1);
    } else {
      setValue(0);
    }
  }, [location]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    if (newValue === 0) {
      navigate('/settings');
    } else if (newValue === 1) {
      navigate('/settings/booking');
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Settings navigation items
  const settingsItems = [
    { 
      name: t('Profile'), 
      icon: <AccountIcon />, 
      onClick: () => navigate('/profile') 
    },
    { 
      name: t('Booking & Scheduling'), 
      icon: <CalendarIcon />, 
      onClick: () => navigate('/settings/booking') 
    },
    { 
      name: t('Notifications'), 
      icon: <NotificationsIcon />, 
      onClick: () => {} 
    },
    { 
      name: t('Appearance'), 
      icon: <PaletteIcon />, 
      onClick: () => {} 
    },
    { 
      name: t('Language'), 
      icon: <TranslateIcon />, 
      onClick: () => {} 
    },
    { 
      name: t('Privacy'), 
      icon: <VisibilityIcon />, 
      onClick: () => {} 
    },
    { 
      name: t('Security'), 
      icon: <SecurityIcon />, 
      onClick: () => {} 
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h4">{t('Settings')}</Typography>
      </Box>
      
      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('General')} {...a11yProps(0)} />
            <Tab label={t('Booking')} {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ 
            width: 240, 
            borderRight: `1px solid ${theme.palette.divider}`,
            display: { xs: 'none', sm: 'block' }
          }}>
            <List>
              {settingsItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton 
                    onClick={item.onClick}
                    selected={
                      (item.name === t('Booking & Scheduling') && location.pathname.includes('/settings/booking')) ||
                      (item.name === t('Profile') && location.pathname === '/profile')
                    }
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <TabPanel value={value} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('Theme')}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={isDarkMode} 
                            onChange={toggleThemeMode} 
                          />
                        }
                        label={t('Dark Mode')}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('Language')}
                      </Typography>
                      <Box display="flex" gap={2}>
                        <Box 
                          onClick={() => handleLanguageChange('en')}
                          sx={{ 
                            cursor: 'pointer', 
                            p: 2, 
                            border: '1px solid',
                            borderColor: i18n.language === 'en' ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            bgcolor: i18n.language === 'en' ? 'action.selected' : 'transparent'
                          }}
                        >
                          <Typography>English</Typography>
                        </Box>
                        <Box 
                          onClick={() => handleLanguageChange('ar')}
                          sx={{ 
                            cursor: 'pointer', 
                            p: 2, 
                            border: '1px solid',
                            borderColor: i18n.language === 'ar' ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            bgcolor: i18n.language === 'ar' ? 'action.selected' : 'transparent'
                          }}
                        >
                          <Typography>العربية</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={value} index={1}>
              <Booking />
            </TabPanel>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsIndex; 