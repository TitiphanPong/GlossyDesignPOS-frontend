'use client';

import { Box, Typography } from '@mui/material';

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        px: 2,
        textAlign: 'center',
        color: 'text.secondary',
        fontSize: 14,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'background.paper',
      }}
    >
      <Typography>
        © {new Date().getFullYear()} Glossy Design | All rights reserved.
      </Typography>
    </Box>
  );
}
