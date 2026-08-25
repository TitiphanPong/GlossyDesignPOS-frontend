'use client';

import * as React from 'react';
import { alpha, Box, Card, CardContent, Stack, Typography } from '@mui/material';

export type StatCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  tone: string;
  icon: React.ReactNode;
};

export default function StatCard({ title, value, subtitle, tone, icon }: Readonly<StatCardProps>) {
  return (
    <Card
      sx={{
        borderRadius: 4.5,
        border: '1px solid #E8EDF5',
        boxShadow: '0 14px 32px rgba(13, 30, 64, 0.07)',
        background: `linear-gradient(135deg, ${alpha(tone, 0.11)} 0%, #FFFFFF 50%, #FCFDFF 100%)`,
        backdropFilter: 'blur(6px)',
      }}>
      <CardContent sx={{ p: 2.2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 12.7 }}>{title}</Typography>
            <Typography sx={{ mt: 0.75, fontWeight: 800, fontSize: 28, color: '#0B1325', lineHeight: 1.1 }}>{value}</Typography>
            {subtitle && <Typography sx={{ mt: 0.5, color: '#8A95A7', fontSize: 11.8 }}>{subtitle}</Typography>}
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: tone,
              bgcolor: alpha(tone, 0.14),
              boxShadow: `0 10px 20px ${alpha(tone, 0.2)}`,
            }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
