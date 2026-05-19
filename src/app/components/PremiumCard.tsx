import * as React from 'react';
import { Card } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function PremiumCard({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 6,
        p: 3,
        bgcolor: alpha('#ffffff', 0.68),
        backdropFilter: 'blur(16px)',
        border: `1px solid ${alpha('#ffffff', 0.82)}`,
        boxShadow: `0 14px 36px ${alpha('#6366f1', 0.12)}`,
        transition: '0.28s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 24px 58px ${alpha('#6366f1', 0.2)}`,
        },
      }}>
      {children}
    </Card>
  );
}
