'use client';

import * as React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

export default function MuiProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#6C4DFF' },
          secondary: { main: '#0EA5E9' },
          background: { default: '#F5F7FB', paper: '#FFFFFF' },
          text: { primary: '#111827', secondary: '#6B7280' },
          divider: 'rgba(15,23,42,0.08)',
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: 'var(--font-sans), system-ui, -apple-system, "Segoe UI", Roboto',
          h1: { fontFamily: 'var(--font-head), var(--font-sans)' },
          h2: { fontFamily: 'var(--font-head), var(--font-sans)' },
          button: { textTransform: 'none', fontWeight: 600 },
          body2: { color: 'rgba(0, 0, 0, 1)' },
          subtitle2: { color: 'rgba(0, 0, 0, 1)' },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 8px 26px rgba(15,23,42,0.06)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                minHeight: 40,
                fontWeight: 700,
              },
              containedPrimary: {
                boxShadow: '0 10px 22px rgba(108,77,255,0.28)',
              },
            },
          },
          MuiTextField: {
            defaultProps: { size: 'small' },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                backgroundColor: '#fff',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
                border: '1px solid rgba(15,23,42,0.08)',
              },
            },
          },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}


