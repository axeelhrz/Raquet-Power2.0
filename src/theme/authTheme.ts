import { createTheme } from '@mui/material/styles';
import '@fontsource/plus-jakarta-sans/300.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

declare module '@mui/material/styles' {
  interface Palette {
    primaryGradient: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
  }

  interface PaletteOptions {
    primaryGradient?: string;
    cardBg?: string;
    textPrimary?: string;
    textSecondary?: string;
  }
}

const authTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2F6DFB',
      dark: '#295FE1',
      light: '#6AA6FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#475569',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    primaryGradient: 'linear-gradient(90deg, #2F6DFB 0%, #6AA6FF 100%)',
    cardBg: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
      dark: '#DC2626',
    },
    success: {
      main: '#10B981',
      light: '#F0FDF4',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FFFBEB',
      dark: '#D97706',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:640px)': {
        fontSize: '2.25rem',
      },
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#64748B',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          minHeight: 48,
          fontWeight: 600,
          fontSize: '0.9375rem',
          textTransform: 'none',
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(90deg, #2F6DFB 0%, #6AA6FF 100%)',
          boxShadow: '0 4px 12px rgba(47, 109, 251, 0.15)',
          '&:hover': {
            background: 'linear-gradient(90deg, #295FE1 0%, #5B9AFF 100%)',
            boxShadow: '0 8px 20px rgba(47, 109, 251, 0.25)',
          },
          '&:disabled': {
            background: '#E2E8F0',
            color: '#94A3B8',
            transform: 'none',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#475569',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderColor: '#CBD5E1',
            backgroundColor: '#F8FAFC',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2F6DFB',
              borderWidth: 2,
            },
            '&.Mui-focused': {
              transform: 'scale(1.01)',
              boxShadow: '0 0 0 4px rgba(47, 109, 251, 0.08)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748B',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#2F6DFB',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '14px 16px',
            fontSize: '0.9375rem',
            '&::placeholder': {
              color: '#94A3B8',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
          backdropFilter: 'blur(6px)',
          background: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#CBD5E1',
          '&.Mui-checked': {
            color: '#2F6DFB',
          },
          '&:hover': {
            backgroundColor: 'rgba(47, 109, 251, 0.04)',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: '0.875rem',
          color: '#475569',
          fontWeight: 500,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#2F6DFB',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#295FE1',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          color: '#991B1B',
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          color: '#166534',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
        },
      },
    },
  },
});

export default authTheme;