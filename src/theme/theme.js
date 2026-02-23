import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066ff', // Bright blue from design
      light: '#4b9fd5',
      dark: '#0052cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#0f172a',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#0f172a',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          color: '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderRadius: '12px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        }
      }
    }
  },
});

export default theme;
