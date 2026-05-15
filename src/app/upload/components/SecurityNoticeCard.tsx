'use client';

import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import { Box, Chip, Stack, Typography } from '@mui/material';

const items = [
  'Files are securely stored in private infrastructure.',
  'Files are not publicly accessible.',
  'Files are used only for printing operations.',
  'Files may be automatically deleted after the retention period.',
];

export default function SecurityNoticeCard() {
  return (
    <Box
      sx={{
        borderRadius: 6,
        p: 3,
        background: 'linear-gradient(165deg, rgba(59,130,246,0.13), rgba(124,58,237,0.13))',
        border: '1px solid rgba(148,163,184,0.22)',
        boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <LockRoundedIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>
          Security Notice
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {items.map((item) => (
          <Chip
            key={item}
            icon={<VerifiedUserRoundedIcon />}
            label={item}
            variant="outlined"
            sx={{ justifyContent: 'flex-start', '& .MuiChip-label': { whiteSpace: 'normal' } }}
          />
        ))}
      </Stack>
    </Box>
  );
}
