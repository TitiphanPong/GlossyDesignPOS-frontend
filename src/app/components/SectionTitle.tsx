import * as React from 'react';
import { Stack, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function SectionTitle({ label, title, desc }: Readonly<{ label: string; title: string; desc: string }>) {
  return (
    <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
      <Chip
        label={label}
        sx={{
          fontWeight: 800,
          color: '#4f46e5',
          bgcolor: alpha('#ffffff', 0.64),
          border: `1px solid ${alpha('#6366f1', 0.2)}`,
          borderRadius: 999,
          backdropFilter: 'blur(10px)',
        }}
      />
      <Typography
        sx={{
          fontSize: { xs: 34, md: 50 },
          fontWeight: 900,
          letterSpacing: -1.2,
          background: 'linear-gradient(90deg, #0f172a, #334155)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
        {desc}
      </Typography>
    </Stack>
  );
}
