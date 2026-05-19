'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface UploadSuccessDialogProps {
  open: boolean;
  uploadId: string;
  orderCode: string;
  onUploadMore: () => void;
}

export default function UploadSuccessDialog({ open, uploadId, orderCode, onUploadMore }: Readonly<UploadSuccessDialogProps>) {
  return (
    <Dialog open={open} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogContent sx={{ p: 3.5 }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Box component={motion.div} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 66, color: '#16A34A' }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            เธชเนเธเนเธเธฅเนเธชเธณเน€เธฃเนเธเนเธฅเนเธง
          </Typography>
          <Stack spacing={0.5} sx={{ width: '100%', p: 2, borderRadius: 4, bgcolor: 'rgba(15,23,42,0.04)' }}>
            <Typography variant="body2">
              เธฃเธซเธฑเธชเธญเธฑเธเนเธซเธฅเธ”: <strong>{uploadId}</strong>
            </Typography>
            <Typography variant="body2">
              เธฃเธซเธฑเธชเธเธฒเธ: <strong>{orderCode}</strong>
            </Typography>
          </Stack>
          <Stack width="100%" spacing={1.2}>
            <Button variant="contained" onClick={onUploadMore}>
              เธญเธฑเธเนเธซเธฅเธ”เนเธเธฅเนเน€เธเธดเนเธก
            </Button>
            <Button component={Link} href="/" variant="outlined">
              เธเธฅเธฑเธเธซเธเนเธฒเธซเธฅเธฑเธ
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

