'use client';

import { alpha, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { glossyDesignTokens } from '@/theme/glossy-design-tokens';
import { adminSurface, commonButtonSx } from './adminUi';
import type { ReactNode } from 'react';
import { formatAdminHeaderDate, type AdminHeaderDate } from '@/lib/admin-header-date';

type AdminHeroHeaderProps = {
  title: string;
  description: ReactNode;
  lastSyncedAt: AdminHeaderDate;
  /** Low-emphasis helpers such as refresh/reload/check actions. */
  utilityActions?: ReactNode;
  /** Navigation, export, print, or other secondary actions. */
  secondaryActions?: ReactNode;
  /** The single highest-priority create/download/save action. */
  primaryAction?: ReactNode;
  /** @deprecated Prefer utilityActions / secondaryActions / primaryAction. */
  actions?: ReactNode;
  notice?: ReactNode;
  mb?: number;
};

export const heroUtilityButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  bgcolor: 'background.default',
  color: 'text.secondary',
  textTransform: 'none',
  '&:hover': {
    bgcolor: 'primary.light',
    color: 'primary.dark',
  },
} satisfies SxProps<Theme>;

export const heroSecondaryButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  borderColor: 'divider',
  bgcolor: 'background.paper',
  color: 'text.primary',
  textTransform: 'none',
  '&:hover': {
    borderColor: 'primary.light',
    bgcolor: 'background.default',
  },
} satisfies SxProps<Theme>;

/** @deprecated Use heroSecondaryButtonSx for new hero actions. */
export const heroOutlineButtonSx = heroSecondaryButtonSx;

export const heroPrimaryButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  textTransform: 'none',
  bgcolor: 'primary.main',
  boxShadow: `0 14px 28px ${alpha(glossyDesignTokens.action.primary, 0.28)}`,
  '&:hover': { bgcolor: 'primary.dark' },
} satisfies SxProps<Theme>;

export default function AdminHeroHeader({
  title,
  description,
  lastSyncedAt,
  utilityActions,
  secondaryActions,
  primaryAction,
  actions,
  notice,
  mb = 2.5,
}: Readonly<AdminHeroHeaderProps>) {
  const { lastSynced, thaiDate } = formatAdminHeaderDate(lastSyncedAt);
  const hasStructuredActions = Boolean(utilityActions || secondaryActions || primaryAction);
  const legacyActions = hasStructuredActions ? null : actions;
  return (
    <Card
      sx={{
        borderRadius: adminSurface.heroRadius,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: adminSurface.cardShadow,
        background: `linear-gradient(145deg, ${glossyDesignTokens.surface.card} 0%, ${glossyDesignTokens.surface.raised} 100%)`,
        mb,
      }}>
      <CardContent sx={{ p: { xs: 2.1, md: 2.8 } }}>
        {notice ? <Box sx={{ mb: 2.2 }}>{notice}</Box> : null}

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
          <Box sx={{ flex: 1, minHeight: { md: 110 } }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>{title}</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: { xs: 14, md: 16 } }}>{description}</Typography>
            <Typography sx={{ mt: 1, color: glossyDesignTokens.text.secondary, fontSize: 12.5 }}>อัปเดตล่าสุด {lastSynced}</Typography>
            <Typography sx={{ mt: 0.5, color: glossyDesignTokens.text.secondary, fontSize: 12.5 }}>{thaiDate}</Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent={{ xs: 'stretch', md: 'flex-end' }}
            sx={{
              minHeight: { md: 110 },
              width: { xs: '100%', md: 'auto' },
              flexWrap: 'wrap',
              '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
            }}>
            {utilityActions ? <Box sx={{ display: 'contents' }}>{utilityActions}</Box> : null}
            {secondaryActions ? <Box sx={{ display: 'contents' }}>{secondaryActions}</Box> : null}
            {primaryAction ? <Box sx={{ display: 'contents' }}>{primaryAction}</Box> : null}
            {legacyActions ? <Box sx={{ display: 'contents' }}>{legacyActions}</Box> : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
