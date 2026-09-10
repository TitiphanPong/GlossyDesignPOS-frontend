'use client';

import * as React from 'react';
import { alpha, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { glossyDesignTokens } from '@/theme/glossy-design-tokens';

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
        border: `1px solid ${glossyDesignTokens.border.default}`,
        boxShadow: `0 14px 32px ${alpha(glossyDesignTokens.brand.ink, 0.07)}`,
        background: `linear-gradient(135deg, ${alpha(tone, 0.11)} 0%, ${glossyDesignTokens.surface.card} 50%, ${glossyDesignTokens.surface.raised} 100%)`,
        backdropFilter: 'blur(6px)',
      }}>
      <CardContent sx={{ p: 2.2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: glossyDesignTokens.text.secondary, fontWeight: 700, fontSize: 12.7 }}>{title}</Typography>
            <Typography sx={{ mt: 0.75, fontWeight: 800, fontSize: 28, color: glossyDesignTokens.text.primary, lineHeight: 1.1 }}>{value}</Typography>
            {subtitle && <Typography sx={{ mt: 0.5, color: glossyDesignTokens.text.secondary, fontSize: 11.8 }}>{subtitle}</Typography>}
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
