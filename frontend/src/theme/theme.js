import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4FD1C5',       // Primary
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2C7A7B',       // Secondary
      contrastText: '#ffffff',
    },
    background: {
      default: '#E6FFFA',    // Tertiary
      paper: '#ffffff',
    },
    text: {
      primary: '#1A202C',    // Neutral
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: '"Work Sans", "Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 16,
        },
      },
    },
  },
})

export default theme
