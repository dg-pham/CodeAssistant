import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a theme instance
const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // sky-500
      light: '#e0f2fe', // sky-100
      dark: '#0369a1', // sky-700
    },
    secondary: {
      main: '#64748b', // slate-500
      light: '#f1f5f9', // slate-100
      dark: '#334155', // slate-700
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
    text: {
      primary: '#1e293b', // slate-800
      secondary: '#64748b', // slate-500
    },
    background: {
      default: '#f8fafc', // slate-50
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Create dark theme
const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0ea5e9', // sky-500
      light: '#075985', // sky-800
      dark: '#e0f2fe', // sky-100
    },
    secondary: {
      main: '#94a3b8', // slate-400
      light: '#334155', // slate-700
      dark: '#f1f5f9', // slate-100
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#94a3b8', // slate-400
    },
    background: {
      default: '#0f172a', // slate-900
      paper: '#1e293b', // slate-800
    },
  },
});

// Apply responsive font sizes
const theme = responsiveFontSizes(baseTheme);
const darkResponsiveTheme = responsiveFontSizes(darkTheme);

export { theme, darkResponsiveTheme as darkTheme };