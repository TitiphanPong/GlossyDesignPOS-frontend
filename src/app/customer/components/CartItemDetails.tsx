'use client';

import { Typography, Box, Paper, Stack } from '@mui/material';
import { cartFieldConfigs } from './cartFieldConfigs';

type CartItem = {
  name: string;
  category?: string;
  qty: number;
  totalPrice: number;
  fullPayment?: boolean;
  deposit?: number;
  remaining?: number;
  [key: string]: any; // dynamic fields
};

export default function CartItemDetails({ item }: { item: CartItem }) {
  const fields = cartFieldConfigs[item.category || ''] || [];

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: '#fafafa' }}>
      <Stack spacing={1}>
        <Typography variant="h5" fontWeight="bold">
          {item.name} × {item.qty} ชิ้น
        </Typography>
        <Typography variant="h5" color="primary" fontWeight="bold">
          {Math.round(item.totalPrice).toLocaleString('th-TH')} บาท
        </Typography>

        {fields.map(({ key, label, format }) =>
          item[key] ? (
            <Typography key={key} variant="body2" color="text.secondary">
              {label}: {format ? format(item[key]) : item[key]}
            </Typography>
          ) : null
        )}

        {item.note && (
          <Typography variant="body2" color="text.secondary">
            ✏️ {item.note}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
