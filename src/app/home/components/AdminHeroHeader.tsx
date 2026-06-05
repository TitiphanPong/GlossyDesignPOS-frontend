'use client';

import { Badge, Box, Card, CardContent, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { commonButtonSx } from './adminUi';
import type { ReactNode } from 'react';

type AdminHeroHeaderProps = {
  title: string;
  description: ReactNode;
  lastSynced: string;
  thaiDate: string;
  actions?: ReactNode;
  notice?: ReactNode;
  mb?: number;
};

export const heroOutlineButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  borderColor: '#D7E3F4',
  bgcolor: '#FFFFFF',
  color: '#2A4365',
  textTransform: 'none',
} satisfies SxProps<Theme>;

export const heroPrimaryButtonSx = {
  ...commonButtonSx,
  borderRadius: 3,
  textTransform: 'none',
  bgcolor: '#2B62EE',
  boxShadow: '0 14px 28px rgba(43, 98, 238, 0.34)',
} satisfies SxProps<Theme>;

export const heroIconButtonSx: SxProps<Theme> = {
  borderRadius: 3,
  border: '1px solid #DFE8F5',
  bgcolor: '#FFFFFF',
  width: 44,
  height: 44,
  boxShadow: '0 10px 20px rgba(12, 56, 110, 0.08)',
};

export default function AdminHeroHeader({ title, description, lastSynced, thaiDate, actions, notice, mb = 2.5 }: Readonly<AdminHeroHeaderProps>) {
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
            <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>{title}</Typography>
            <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>{description}</Typography>
            <Typography sx={{ mt: 1, color: '#94A3B8', fontSize: 12.5 }}>อัปเดตล่าสุด {lastSynced}</Typography>
            <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 12.5 }}>{thaiDate}</Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ minHeight: { md: 110 } }}>
            <Tooltip title="Notifications">
              <IconButton sx={heroIconButtonSx}>
                <Badge color="error" variant="dot">
                  <NotificationsRoundedIcon sx={{ color: '#2A4365' }} />
                </Badge>
              </IconButton>
            </Tooltip>
            {actions}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
