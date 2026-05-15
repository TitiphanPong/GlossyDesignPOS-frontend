'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AdminPageContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AdminPageContainer({ title, subtitle, children }: Readonly<AdminPageContainerProps>) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        pb: 6,
        maxWidth: '1600px',
        mx: 'auto',
      }}>
      {title && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {children}
    </Box>
  );
}
