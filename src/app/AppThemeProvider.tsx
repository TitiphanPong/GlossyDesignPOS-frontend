'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { glossyCssVariables } from '@/theme/glossy-design-tokens';
import { appTheme } from './app-theme';

export default function AppThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider theme={appTheme}>
      <GlobalStyles styles={{ ':root': glossyCssVariables }} />
      {children}
    </ThemeProvider>
  );
}
