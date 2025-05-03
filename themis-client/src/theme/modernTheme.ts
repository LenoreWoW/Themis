import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { enUS, arSA } from '@mui/material/locale';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

// Create a theme instance for each mode and language
const getTheme = (mode: 'light' | 'dark', direction: 'ltr' | 'rtl') => {
  let theme = createTheme(
    {
      palette: {
        mode,
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2',
          contrastText: '#ffffff',
        },
        error: {
          main: '#f44336',
          light: '#e57373',
          dark: '#d32f2f',
        },
        warning: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        info: {
          main: '#03a9f4',
          light: '#4fc3f7',
          dark: '#0288d1',
        },
        success: {
          main: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
        },
        neutral: {
          main: '#64748B',
          light: '#94A3B8',
          dark: '#334155',
          contrastText: '#ffffff',
        },
        background: {
          default: mode === 'light' ? '#f8fafc' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
          secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)',
        },
        divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      },
      direction,
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ].join(','),
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
        },
        h3: {
          fontWeight: 700,
          fontSize: '1.75rem',
        },
        h4: {
          fontWeight: 700,
          fontSize: '1.5rem',
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
        },
        h6: {
          fontWeight: 600,
          fontSize: '1rem',
        },
        subtitle1: {
          fontWeight: 500,
          fontSize: '1rem',
        },
        subtitle2: {
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 16px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: mode === 'light' ? '0 6px 20px rgba(0, 0, 0, 0.1)' : '0 6px 20px rgba(0, 0, 0, 0.5)',
              },
            },
            contained: {
              boxShadow: mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
            },
            outlined: {
              borderWidth: 1.5,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'light' 
                ? '0 2px 12px 0 rgba(0, 0, 0, 0.05)'
                : '0 2px 12px 0 rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: mode === 'light' 
                  ? '0 8px 24px 0 rgba(0, 0, 0, 0.1)'
                  : '0 8px 24px 0 rgba(0, 0, 0, 0.3)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
            elevation1: {
              boxShadow: mode === 'light' 
                ? '0 2px 12px 0 rgba(0, 0, 0, 0.05)'
                : '0 2px 12px 0 rgba(0, 0, 0, 0.2)',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: mode === 'light'
                ? '1px solid rgba(0, 0, 0, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            },
            head: {
              fontWeight: 600,
              backgroundColor: mode === 'light'
                ? 'rgba(0, 0, 0, 0.02)'
                : 'rgba(255, 255, 255, 0.02)',
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:last-child td': {
                borderBottom: 0,
              },
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? 'rgba(0, 0, 0, 0.02)'
                  : 'rgba(255, 255, 255, 0.02)',
              },
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              fontSize: '1.25rem',
              fontWeight: 600,
            },
          },
        },
      },
    },
    direction === 'rtl' ? arSA : enUS
  );

  theme = responsiveFontSizes(theme);

  return theme;
};

export const lightTheme = getTheme('light', 'ltr');
export const darkTheme = getTheme('dark', 'ltr');
export const lightThemeRTL = getTheme('light', 'rtl');
export const darkThemeRTL = getTheme('dark', 'rtl');

export default getTheme; 