'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { commonButtonSx } from './adminUi';
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
  bgcolor: '#F4F7FB',
  color: '#475467',
  textTransform: 'none',
  '&:hover': {
    bgcolor: '#EAF0F7',
  },
} satisfies SxProps<Theme>;

export const heroSecondaryButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  borderColor: '#D7E3F4',
  bgcolor: '#FFFFFF',
  color: '#2A4365',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#B9CBE5',
    bgcolor: '#F8FAFD',
  },
} satisfies SxProps<Theme>;

/** @deprecated Use heroSecondaryButtonSx for new hero actions. */
export const heroOutlineButtonSx = heroSecondaryButtonSx;

export const heroPrimaryButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  textTransform: 'none',
  bgcolor: '#2B62EE',
  boxShadow: '0 14px 28px rgba(43, 98, 238, 0.34)',
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
        borderRadius: 5.6,
        border: '1px solid #E6EDF8',
        boxShadow: '0 20px 45px rgba(18, 45, 82, 0.08)',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F7FAFF 100%)',
        mb,
      }}>
      <CardContent sx={{ p: { xs: 2.1, md: 2.8 } }}>
        {notice ? <Box sx={{ mb: 2.2 }}>{notice}</Box> : null}

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
          <Box sx={{ flex: 1, minHeight: { md: 110 } }}>
            <Typography sx={{ color: '#101828', fontWeight: 700, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>{title}</Typography>
            <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>{description}</Typography>
            <Typography sx={{ mt: 1, color: '#94A3B8', fontSize: 12.5 }}>อัปเดตล่าสุด {lastSynced}</Typography>
            <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 12.5 }}>{thaiDate}</Typography>
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
