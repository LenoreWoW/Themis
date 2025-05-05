import { createTheme, Direction } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { PaletteMode } from '@mui/material';

// Qatar flag colors
const qatarMaroon = {
  main: '#8A1538',
  light: '#A43A59',
  dark: '#6E0020',
};

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
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 4,
          },
          containedPrimary: {
            color: '#FFFFFF',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
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
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1e1e1e',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${mode === 'light' ? grey[300] : grey[800]}`,
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#F1E2E5' : grey[900],
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? '#F1E2E5' : grey[900],
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              color: '#FFFFFF',
            }),
          },
          colorPrimary: {
            color: '#FFFFFF',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: mode === 'light' ? '#D9C0C7' : '#4A2A32',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: qatarMaroon.main,
              '& + .MuiSwitch-track': {
                backgroundColor: qatarMaroon.light,
              },
            },
          },
        },
      },
    },
  });
};

// Default theme direction (LTR) and mode (light)
const theme = createAppTheme('ltr', 'light');

export { createAppTheme };
export default theme; 