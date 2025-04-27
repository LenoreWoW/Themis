import React, { createContext, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import useThemeMode from '../hooks/useThemeMode';

// Define the context type
const ThemeContext = createContext();

// Create the provider component
export const ThemeProvider = ({ children }) => {
  const themeHook = useThemeMode();
  
  // Create the MUI theme based on current mode
  const theme = createTheme({
    palette: {
      mode: themeHook.themeMode,
      primary: {
        main: '#8A1538', // Qatar flag color - maroon
      },
      secondary: {
        main: '#FFFFFF', // Qatar flag color - white
      },
      ...(themeHook.themeMode === 'light'
        ? {
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
          }
        : {
            background: {
              default: '#303030',
              paper: '#424242',
            },
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={themeHook}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Create a custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider; 