import { createTheme, Direction } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { PaletteMode } from '@mui/material';

// Qatar flag colors - standardized palette
const qatarMaroon = {
  main: '#8A1538',
  light: '#A43A59',
  dark: '#6E0020',
  // Additional shades for consistent UI elements
  100: '#F1E2E5',
  200: '#D9C0C7',
  300: '#C09EA9', 
  400: '#A77C8B',
  500: '#8A1538', // Main color
  600: '#78112F',
  700: '#650E26',
  800: '#52091E',
  900: '#400515'
};

// Spacing constants
const SPACING_UNIT = 8;

// Create a theme instance with direction and mode support
const createAppTheme = (direction: Direction, mode: PaletteMode = 'light') => {
  return createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: qatarMaroon.main,
        light: qatarMaroon.light,
        dark: qatarMaroon.dark,
        ...(mode === 'dark' && {
          main: qatarMaroon.light,
          light: '#B55A76',
          dark: qatarMaroon.main,
        }),
      },
      secondary: {
        main: '#FFFFFF',
        light: '#FFFFFF',
        dark: '#E0E0E0',
        ...(mode === 'dark' && {
          main: '#E0E0E0',
          light: '#FFFFFF',
          dark: '#C0C0C0',
        }),
      },
      background: {
        default: mode === 'light' ? '#F8F8F8' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#FFFFFF',
        secondary: mode === 'light' ? '#666666' : '#CCCCCC',
      },
    },
    typography: {
      fontFamily: direction === 'rtl'
        ? '"Cairo", "Roboto", "Helvetica", "Arial", sans-serif'
        : '"Roboto", "Helvetica", "Arial", sans-serif',
      // Standardized type scale
      fontSize: 14, // Base font size
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
        letterSpacing: '0em',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        letterSpacing: '0em',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '0.0075em',
      },
      body1: {
        fontSize: '1rem',
        letterSpacing: '0.00938em',
      },
      body2: {
        fontSize: '0.875rem',
        letterSpacing: '0.01071em',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.00714em',
      },
    },
    spacing: SPACING_UNIT,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          'html, body': {
            height: '100%',
            margin: 0,
            padding: 0,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: `${SPACING_UNIT}px ${SPACING_UNIT * 2}px`,
            transition: 'all 0.2s ease-in-out',
            fontWeight: 500,
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          containedPrimary: {
            color: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
          outlinedPrimary: {
            borderWidth: 1.5,
          },
          sizeSmall: {
            padding: `${SPACING_UNIT/2}px ${SPACING_UNIT}px`,
            fontSize: '0.8125rem',
          },
          sizeLarge: {
            padding: `${SPACING_UNIT}px ${SPACING_UNIT * 3}px`,
            fontSize: '1rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(0, 0, 0, 0.08)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: SPACING_UNIT * 2,
            borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`,
          },
          title: {
            fontSize: '1.125rem',
            fontWeight: 500,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: SPACING_UNIT * 3,
            '&:last-child': {
              paddingBottom: SPACING_UNIT * 3,
            },
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: SPACING_UNIT * 2,
            borderTop: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 1px 4px rgba(0, 0, 0, 0.08)'
              : '0 1px 4px rgba(0, 0, 0, 0.15)',
          },
          elevation2: {
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0, 0, 0, 0.08)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
          elevation3: {
            boxShadow: mode === 'light'
              ? '0 4px 12px rgba(0, 0, 0, 0.08)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
            backgroundColor: mode === 'light' ? qatarMaroon.main : '#1a1a1a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? qatarMaroon.main : qatarMaroon.dark,
            color: '#FFFFFF',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: `${SPACING_UNIT * 1.5}px ${SPACING_UNIT * 2}px`,
            borderBottom: `1px solid ${mode === 'light' ? grey[300] : grey[800]}`,
            fontSize: '0.875rem',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? qatarMaroon[100] : grey[900],
            color: mode === 'light' ? qatarMaroon[900] : '#FFFFFF',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? qatarMaroon[100] : grey[900],
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
            fontSize: '0.75rem',
            height: 24,
            ...(mode === 'dark' && {
              color: '#FFFFFF',
            }),
          },
          colorPrimary: {
            color: '#FFFFFF',
          },
          sizeSmall: {
            height: 20,
            fontSize: '0.6875rem',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 8,
            borderRadius: 4,
          },
          colorPrimary: {
            backgroundColor: mode === 'light' ? qatarMaroon[200] : qatarMaroon[900],
          },
          bar: {
            borderRadius: 4,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minWidth: 120,
            padding: SPACING_UNIT * 1.5,
            transition: 'all 0.2s',
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: SPACING_UNIT * 3,
            fontSize: '1.25rem',
            fontWeight: 600,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: SPACING_UNIT * 3,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: `${SPACING_UNIT}px ${SPACING_UNIT * 3}px ${SPACING_UNIT * 3}px`,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            margin: `${SPACING_UNIT * 2}px 0`,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          input: {
            padding: `${SPACING_UNIT * 1.5}px ${SPACING_UNIT * 2}px`,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: SPACING_UNIT,
            paddingBottom: SPACING_UNIT,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            padding: `${SPACING_UNIT/2}px ${SPACING_UNIT}px`,
            borderRadius: 4,
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            color: mode === 'light' ? '#FFFFFF' : '#000000',
          },
        },
      },
    },
  });
};

export default createAppTheme; 