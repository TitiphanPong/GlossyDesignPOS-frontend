import * as React from 'react';
import { Stack, Typography } from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

export function HeaderBar() {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
      <ReceiptLongRoundedIcon />
      <Typography variant="h5" color="black" fontWeight={800}>
        หน้าขาย (POS)
      </Typography>
    </Stack>
  );
}
