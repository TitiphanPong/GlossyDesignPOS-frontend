// app/providers.tsx (client) – set MUI theme
'use client';
import * as React from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

export default function MuiProviders({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'var(--font-sans), system-ui, -apple-system, "Segoe UI", Roboto',
          h1: { fontFamily: 'var(--font-head), var(--font-sans)' },
          h2: { fontFamily: 'var(--font-head), var(--font-sans)' },
          button: { textTransform: 'none', fontWeight: 600 },
          body2: {
            color: 'rgba(0, 0, 0, 1)', // ✅ บังคับ body2 เป็นสีดำ
          },
          subtitle2: {
            color: 'rgba(0, 0, 0, 1)', // ✅ บังคับ subtitle2 เป็นสีดำ
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
