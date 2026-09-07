'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from './app-theme';

export default function AppThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <ThemeProvider theme={appTheme}>{children}</ThemeProvider>;
}
