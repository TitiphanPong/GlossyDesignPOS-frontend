'use client';

import { Box, Typography } from '@mui/material';
import { getCartItemDetailLines } from './cartFieldConfigs';
import type { CartItem } from './customerDisplayTypes';

type CartItemDetailsProps = Readonly<{ item: CartItem }>;

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString('th-TH');
}

export default function CartItemDetails({ item }: CartItemDetailsProps) {
  const detailLines = getCartItemDetailLines(item);

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.065)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        transition: 'background 0.2s',
        '&:hover': { background: 'rgba(255,255,255,0.065)' },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: { xs: '0.92rem', md: '1.05rem' }, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </Typography>
        {detailLines.map(line => (
          <Typography
            key={line}
            sx={{
              fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.38)',
              mt: 0.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {line}
          </Typography>
        ))}
        {item.note ? (
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.48)',
              mt: 0.45,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.note}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>ร— {item.qty}</Typography>
        <Typography sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, fontWeight: 700, color: '#00E5FF', mt: 0.15 }}>เธฟ{formatMoney(item.totalPrice)}</Typography>
      </Box>
    </Box>
  );
}
