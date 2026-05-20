'use client';

import { Box, Typography, Avatar, IconButton, Button, InputBase, Badge } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function pad(n: number) { return n.toString().padStart(2, '0'); }

export default function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now
    ? `วัน${DAYS_TH[now.getDay()]}ที่ ${now.getDate()} ${MONTHS_TH[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}`
    : '';
  const timeStr = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : '';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {/* ── Greeting ── */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ color: '#1a1035', letterSpacing: '-0.4px', lineHeight: 1.3 }}
        >
          สวัสดี 👋 วันนี้ร้านของคุณดูยอดเยี่ยมมาก
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5, fontWeight: 500 }}>
          {dateStr}
          {timeStr && (
            <>
              {' · '}
              <Box
                component="span"
                sx={{
                  fontVariantNumeric: 'tabular-nums',
                  background: 'linear-gradient(90deg, #6C4DFF, #8A5CFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                {timeStr}
              </Box>
            </>
          )}
        </Typography>
      </Box>

      {/* ── Right actions ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '14px',
            px: 2,
            py: 0.8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            border: '1.5px solid rgba(108,77,255,0.1)',
            gap: 1,
            minWidth: 230,
          }}
        >
          <SearchRoundedIcon sx={{ color: '#C4B5FD', fontSize: 18 }} />
          <InputBase
            placeholder="ค้นหาออเดอร์, ลูกค้า..."
            sx={{ fontSize: 13.5, flex: 1, '& input': { p: 0, color: '#374151' } }}
          />
        </Box>

        {/* Notification bell */}
        <IconButton
          sx={{
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            borderRadius: '12px',
            width: 42,
            height: 42,
            transition: 'all 0.2s',
            '&:hover': { background: '#F5F0FF', transform: 'scale(1.05)' },
          }}
        >
          <Badge
            badgeContent={3}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16, right: -1, top: -1 } }}
          >
            <NotificationsNoneRoundedIcon sx={{ color: '#6C4DFF', fontSize: 20 }} />
          </Badge>
        </IconButton>

        {/* Avatar */}
        <Avatar
          sx={{
            background: 'linear-gradient(135deg, #6C4DFF, #A87CFF)',
            width: 42,
            height: 42,
            boxShadow: '0 4px 14px rgba(108,77,255,0.3)',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 6px 20px rgba(108,77,255,0.5)' },
          }}
        >
          G
        </Avatar>

        {/* New Order CTA */}
        <Button
          component={Link}
          href="/pos"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{
            background: 'linear-gradient(135deg, #6C4DFF 0%, #8A5CFF 100%)',
            borderRadius: '13px',
            px: 2.5,
            py: 1.15,
            fontWeight: 700,
            fontSize: 13.5,
            letterSpacing: '0.15px',
            boxShadow: '0 4px 18px rgba(108,77,255,0.38)',
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a3de8 0%, #7a4de8 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 28px rgba(108,77,255,0.52)',
            },
          }}
        >
          สร้างออเดอร์ใหม่
        </Button>
      </Box>
    </Box>
  );
}
