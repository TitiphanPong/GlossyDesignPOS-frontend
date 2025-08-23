'use client';

import { Box, Typography } from '@mui/material';

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        textAlign: 'center',
        fontSize: 14,
        color: 'text.secondary',
      }}
    >
      <Typography>Copyright © Glossy Design 2025.</Typography>
    </Box>
  );
}
