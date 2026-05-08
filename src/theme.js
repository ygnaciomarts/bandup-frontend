import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: '#282d35',
      light: '#3a4150',
      dark: '#1a1e24',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc454d',
      light: '#e8696f',
      dark: '#b8363d',
      contrastText: '#fff',
    },
    error: {
      main: '#dc454d',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#22c55e',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#282d35',
      secondary: '#6b7280',
    },
    divider: '#e5e5e5',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, letterSpacing: '-0.03em' },
    h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, letterSpacing: '-0.02em' },
    h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.015em' },
    h4: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' },
    h5: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' },
    h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
    body1: {},
    body2: {},
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.03em' },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 28px',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'none',
          transition: 'background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
          '&:active': { transform: 'scale(0.97)' },
        },
        containedSecondary: {
          background: '#dc454d',
          color: '#fff',
          '&:hover': { background: '#b8363d' },
        },
        containedPrimary: {
          background: '#282d35',
          color: '#fff',
          '&:hover': { background: '#3a4150' },
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: '#282d35',
          color: '#282d35',
          '&:hover': {
            borderWidth: '1.5px',
            background: '#282d35',
            color: '#fff',
          },
        },
        outlinedSecondary: {
          borderColor: '#dc454d',
          color: '#dc454d',
          '&:hover': {
            borderWidth: '1.5px',
            background: '#dc454d',
            color: '#fff',
          },
        },
        text: {
          color: '#282d35',
          '&:hover': {
            background: 'rgba(40,45,53,0.04)',
          },
        },
        sizeSmall: {
          padding: '6px 18px',
          fontSize: '0.78rem',
        },
        sizeLarge: {
          padding: '10px 32px',
          fontSize: '0.88rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid #e5e5e5',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: '#282d35',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
        },
        colorSecondary: {
          background: '#dc454d',
          color: '#fff',
          border: 'none',
        },
        outlined: {
          background: 'rgba(40,45,53,0.04)',
          borderColor: 'rgba(40,45,53,0.2)',
          color: '#282d35',
          backdropFilter: 'blur(4px)',
        },
        outlinedSecondary: {
          background: 'rgba(220,69,77,0.06)',
          borderColor: 'rgba(220,69,77,0.3)',
          color: '#dc454d',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme
