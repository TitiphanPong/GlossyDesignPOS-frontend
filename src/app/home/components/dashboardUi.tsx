'use client';

import { Alert, Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { interactiveCardSx, sectionTitleSx, topActionBarSx, uiCardSx } from './adminUi';

export function DashboardCard({ children, interactive = false, sx = {} }: Readonly<{ children: ReactNode; interactive?: boolean; sx?: object }>) {
  return <Card sx={{ ...(interactive ? interactiveCardSx : uiCardSx), ...sx }}>{children}</Card>;
}

export function SectionHeader({ title, subtitle, right }: Readonly<{ title: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.2}>
      <Box>
        <Typography sx={sectionTitleSx}>{title}</Typography>
        {subtitle ? <Typography variant="body2" color="text.secondary">{subtitle}</Typography> : null}
      </Box>
      {right}
    </Stack>
  );
}

export function SearchToolbar({ children }: Readonly<{ children: ReactNode }>) {
  return <Card sx={topActionBarSx}>{children}</Card>;
}

export function EmptyState({
  title,
  subtitle,
  icon,
  eyebrow = 'No results',
  compact = false,
  sx = {},
}: Readonly<{
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  eyebrow?: string;
  compact?: boolean;
  sx?: object;
}>) {
  return (
    <Box
      sx={{
        py: compact ? 4 : 6,
        px: compact ? 2.5 : 3,
        textAlign: 'center',
        borderRadius: compact ? 3 : 4,
        border: '1px dashed #D9E3F2',
        background: 'linear-gradient(180deg, #FCFDFF 0%, #F7FAFF 100%)',
        ...sx,
      }}>
      {icon ? (
        <Box
          sx={{
            width: compact ? 44 : 54,
            height: compact ? 44 : 54,
            mx: 'auto',
            mb: 1.5,
            display: 'grid',
            placeItems: 'center',
            borderRadius: compact ? 2.5 : 3,
            bgcolor: '#EAF1FF',
            color: '#2957D8',
          }}>
          {icon}
        </Box>
      ) : null}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#5B7BE2',
        }}>
        {eyebrow}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 440, mx: 'auto' }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}

export function LoadingState() {
  return (
    <Stack spacing={1.25} sx={{ p: 2.25 }}>
      <Skeleton variant="rounded" height={30} width="40%" />
      <Skeleton variant="rounded" height={52} />
      <Skeleton variant="rounded" height={52} />
      <Skeleton variant="rounded" height={52} />
    </Stack>
  );
}

export function MissingApiConfigState({
  title = 'ไม่พบการตั้งค่า API',
  subtitle = 'กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อเชื่อมต่อข้อมูลจากระบบหลังบ้าน',
}: Readonly<{ title?: string; subtitle?: string }>) {
  return (
    <Alert severity="warning" sx={{ borderRadius: 3, alignItems: 'flex-start' }}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {subtitle}
      </Typography>
    </Alert>
  );
}

