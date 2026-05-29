'use client';

import * as React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { Box, Card, CardContent, Stack, type SxProps, Typography, type Theme } from '@mui/material';

export type JobTimelineCardItem = {
  id: string;
  title: string;
  subtitle: string;
  pillLabel: string;
  icon: React.ReactNode;
  active?: boolean;
  meta?: string;
};

type JobTimelineCardProps = {
  items: readonly JobTimelineCardItem[];
  title?: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
  footerNote?: string;
};

const outerCardSx: SxProps<Theme> = {
  borderRadius: 4,
  border: '1px solid #DCE8F8',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)',
  boxShadow: '0 14px 32px rgba(15, 23, 42, 0.05)',
};

const stepCardSx: SxProps<Theme> = {
  borderRadius: 3,
  px: { xs: 1.5, sm: 1.75 },
  py: 1.7,
  boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
};

export default function JobTimelineCard({
  items,
  title = 'ไทม์ไลน์งาน',
  subtitle = 'ลำดับการรับงานและอัปเดตความคืบหน้าของไฟล์งาน',
  headerIcon,
  footerNote = 'ระบบจะอัปเดตความคืบหน้าให้อัตโนมัติในแต่ละขั้นตอน',
}: Readonly<JobTimelineCardProps>) {
  return (
    <Card sx={outerCardSx}>
      <CardContent sx={{ p: { xs: 2, sm: 2.25 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 3,
                bgcolor: '#EEF6FF',
                color: '#1E5EFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: 'inset 0 0 0 1px rgba(30, 94, 255, 0.06)',
                flexShrink: 0,
              }}>
              {headerIcon ?? <TimelineRoundedIcon sx={{ fontSize: 20 }} />}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{title}</Typography>
              <Typography sx={{ mt: 0.45, color: '#64748B', fontSize: 12.5, lineHeight: 1.6 }}>{subtitle}</Typography>
            </Box>
          </Stack>

          <Stack spacing={1.6}>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const isActive = Boolean(item.active);

              return (
                <Stack key={item.id} direction="row" spacing={1.4} alignItems="stretch">
                  <Box sx={{ width: 28, display: 'flex', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                    <Box
                      sx={{
                        mt: 0.8,
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        border: isActive ? '3px solid #B9D4FF' : '2px solid #D5DFEE',
                        bgcolor: isActive ? '#1E5EFF' : '#FFFFFF',
                        boxShadow: isActive ? '0 0 0 7px rgba(30, 94, 255, 0.12)' : 'none',
                        zIndex: 1,
                      }}
                    />
                    {!isLast ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 24,
                          bottom: -20,
                          width: 2,
                          borderRadius: 999,
                          bgcolor: '#D7E6F8',
                        }}
                      />
                    ) : null}
                  </Box>

                  <Box
                    sx={{
                      ...stepCardSx,
                      flex: 1,
                      border: isActive ? '1px solid #8BB8FF' : '1px solid #E4ECF7',
                      background: isActive ? 'linear-gradient(180deg, #F8FBFF 0%, #F1F7FF 100%)' : '#FFFFFF',
                    }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1.2} alignItems="flex-start">
                      <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 999,
                            bgcolor: isActive ? '#EAF3FF' : '#F8FAFC',
                            color: isActive ? '#1E5EFF' : '#7C8BA1',
                            border: isActive ? '1px solid #CFE0FF' : '1px solid #E7EDF5',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}>
                          {item.icon}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: 14.5, lineHeight: 1.45 }}>{item.title}</Typography>
                          <Typography sx={{ mt: 0.45, color: '#64748B', fontSize: 12.5, lineHeight: 1.55 }}>{item.subtitle}</Typography>
                          {item.meta ? <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 11.5 }}>{item.meta}</Typography> : null}
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          borderRadius: 999,
                          px: 1.1,
                          py: 0.45,
                          fontSize: 11,
                          fontWeight: 800,
                          color: isActive ? '#1D4ED8' : '#64748B',
                          bgcolor: isActive ? '#DBEAFE' : '#F1F5F9',
                          border: isActive ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                        {item.pillLabel}
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              );
            })}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              borderRadius: 3,
              bgcolor: '#F3F8FE',
              border: '1px solid #E1ECF8',
              px: 1.4,
              py: 1.15,
            }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#64748B', flexShrink: 0 }} />
            <Typography sx={{ color: '#64748B', fontSize: 12.5, lineHeight: 1.5 }}>{footerNote}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
