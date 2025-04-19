import { createTheme, Direction } from '@mui/material/styles';
import { blue, orange, grey } from '@mui/material/colors';
import { PaletteMode } from '@mui/material';

// Create a theme instance with direction and mode support
const createAppTheme = (direction: Direction, mode: PaletteMode = 'light') => {
  return createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: blue[700],
        light: blue[400],
        dark: blue[900],
        ...(mode === 'dark' && {
          main: blue[400],
          light: blue[300],
          dark: blue[600],
        }),
      },
      secondary: {
        main: orange[500],
        light: orange[300],
        dark: orange[700],
        ...(mode === 'dark' && {
          main: orange[400],
          light: orange[300],
          dark: orange[700],
        }),
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#aaaaaa',
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
            backgroundColor: mode === 'light' ? blue[700] : '#1a1a1a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
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
            backgroundColor: mode === 'light' ? grey[100] : grey[900],
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? grey[100] : grey[900],
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              color: grey[100],
            }),
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