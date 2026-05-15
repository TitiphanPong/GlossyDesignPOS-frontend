'use client';

import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { adminSurface } from './adminUi';

interface AdminPageContainerProps {
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export default function AdminPageContainer({ title, subtitle, headerActions, children }: Readonly<AdminPageContainerProps>) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
        pb: 6,
        maxWidth: adminSurface.pageMaxWidth,
        mx: 'auto',
      }}>
      {title && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {headerActions}
        </Stack>
      )}

      {children}
    </Box>
  );
}
