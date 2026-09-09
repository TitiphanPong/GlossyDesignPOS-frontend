import { createTheme } from '@mui/material/styles';
import { glossyDesignTokens } from '@/theme/glossy-design-tokens';
import { UI_FONT_FAMILY } from './font-tokens';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: glossyDesignTokens.action.primary,
      contrastText: glossyDesignTokens.text.inverse,
    },
    background: {
      default: glossyDesignTokens.surface.page,
      paper: glossyDesignTokens.surface.card,
    },
    text: {
      primary: glossyDesignTokens.text.primary,
      secondary: glossyDesignTokens.text.secondary,
    },
    divider: glossyDesignTokens.border.default,
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
