import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container,
  useTheme as useMuiTheme,
  Switch,
  FormControlLabel
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { themeMode, toggleThemeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';

  return (
    <AppBar position="static" sx={{ backgroundColor: muiTheme.palette.primary.main }}>
      <Container maxWidth="lg">
        <Toolbar>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <FlagIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Themis Project Collector
            </Typography>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/projects"
              sx={{ mr: 1 }}
            >
              My Projects
            </Button>
            
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects/new')}
              sx={{ 
                mr: 2,
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              New Project
            </Button>

            {/* Theme Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleThemeMode}
                  icon={<Brightness7Icon />}
                  checkedIcon={<Brightness4Icon />}
                  sx={{ ml: 1 }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {isDarkMode ? 'Dark' : 'Light'}
                </Typography>
              }
              labelPlacement="start"
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 