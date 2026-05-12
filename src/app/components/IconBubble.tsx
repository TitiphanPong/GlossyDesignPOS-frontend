import * as React from 'react';
import { Box } from '@mui/material';

export function IconBubble({ children, small = false }: React.PropsWithChildren<{ small?: boolean }>) {
  return (
    <Box
      sx={{
        width: small ? 42 : 54,
        height: small ? 42 : 54,
        borderRadius: 4,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background: 'linear-gradient(135deg, #2563eb, #9333ea, #ec4899)',
        boxShadow: `0 12px 28px #7c3aed47`,
        '& svg': { fontSize: small ? 22 : 28 },
      }}>
      {children}
    </Box>
  );
}
