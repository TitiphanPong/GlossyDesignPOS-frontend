'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { transitionDuration, transitionEasing } from './transition.config';

export default function PageTransition({ routeKey, children }: Readonly<{ routeKey: string; children: ReactNode }>) {
  return (
    <Box
      key={routeKey}
      className="app-page-enter"
      sx={{
        flex: 1,
        minWidth: 0,
        '@keyframes appPageEnter': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: `appPageEnter ${transitionDuration.page}ms ${transitionEasing.enter} both`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}>
      {children}
    </Box>
  );
}
