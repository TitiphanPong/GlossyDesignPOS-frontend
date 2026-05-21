'use client';

import { Alert, Box, Card, CardActions, CardContent, Skeleton, Stack, Typography } from '@mui/material';
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
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}>
        {['dashboard-kpi-1', 'dashboard-kpi-2', 'dashboard-kpi-3', 'dashboard-kpi-4'].map(key => (
          <DashboardCard key={key} sx={{ p: 2.25 }}>
            <Stack spacing={1.2}>
              <Skeleton variant="text" width="42%" height={18} />
              <Skeleton variant="text" width="64%" height={34} />
              <Skeleton variant="rounded" height={16} width="56%" />
            </Stack>
          </DashboardCard>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}>
        <Stack spacing={3}>
          <DashboardCard sx={{ p: 2.25 }}>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="28%" height={28} />
              <Skeleton variant="text" width="44%" height={18} />
              <Skeleton variant="rounded" height={260} />
            </Stack>
          </DashboardCard>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}>
            {['dashboard-panel-1', 'dashboard-panel-2'].map(key => (
              <DashboardCard key={key} sx={{ p: 2.25 }}>
                <Stack spacing={1.3}>
                  <Skeleton variant="text" width="38%" height={26} />
                  <Skeleton variant="rounded" height={140} />
                </Stack>
              </DashboardCard>
            ))}
          </Box>
        </Stack>

        <Stack spacing={3}>
          {['dashboard-side-1', 'dashboard-side-2', 'dashboard-side-3'].map(key => (
            <DashboardCard key={key} sx={{ p: 2.25 }}>
              <Stack spacing={1.4}>
                <Skeleton variant="text" width="44%" height={26} />
                <Skeleton variant="rounded" height={key === 'dashboard-side-1' ? 210 : 120} />
              </Stack>
            </DashboardCard>
          ))}
        </Stack>
      </Box>

      <DashboardCard sx={{ p: 2.25 }}>
        <Stack spacing={1.4}>
          <Skeleton variant="text" width="24%" height={26} />
          <Skeleton variant="text" width="36%" height={18} />
          {['dashboard-row-1', 'dashboard-row-2', 'dashboard-row-3', 'dashboard-row-4'].map(key => (
            <Skeleton key={key} variant="rounded" height={46} />
          ))}
        </Stack>
      </DashboardCard>
    </Stack>
  );
}

export function ProductGridLoadingState({ count = 8 }: Readonly<{ count?: number }>) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(140px, 1fr))', sm: 'repeat(3, minmax(180px, 1fr))', xl: 'repeat(4, minmax(180px, 1fr))' } }}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={`product-skeleton-${index}`} variant="outlined" sx={{ ...interactiveCardSx, borderRadius: 3.5, borderColor: '#E5EBF5', boxShadow: '0 10px 22px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
          <Skeleton variant="rectangular" width="100%" height={210} />
          <CardContent sx={{ pb: 1.1, px: 1.7, pt: 1.6 }}>
            <Stack spacing={1}>
              <Skeleton width="78%" height={26} />
              <Skeleton width="42%" />
            </Stack>
          </CardContent>
          <CardActions sx={{ p: 1.5, pt: 0.1 }}>
            <Skeleton variant="rounded" width="100%" height={38} />
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

export function InvoiceLoadingState() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Skeleton variant="text" width={220} height={52} />
          <Skeleton variant="rounded" width={170} height={40} />
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {['invoice-copy-1', 'invoice-copy-2'].map(key => (
            <Card key={key} sx={{ p: 2.2, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="48%" height={34} />
                <Skeleton variant="text" width="36%" />
                <Skeleton variant="text" width="44%" />
                <Skeleton variant="text" width="34%" />
                <Skeleton variant="rounded" height={198} />
                <Skeleton variant="text" width="42%" />
                <Skeleton variant="text" width="36%" />
                <Skeleton variant="text" width="52%" height={30} />
              </Stack>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
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

