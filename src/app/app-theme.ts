import { createTheme } from '@mui/material/styles';
import { UI_FONT_FAMILY } from './font-tokens';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2B62EE',
      dark: '#1D4ED8',
      light: '#EAF1FF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101828',
      secondary: '#667085',
    },
    divider: '#E6EDF8',
  },
  typography: {
    fontFamily: UI_FONT_FAMILY,
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
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
  },
});
