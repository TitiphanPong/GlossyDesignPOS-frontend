'use client';

import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import * as React from 'react';

interface UploadDropzoneProps {
  isDragOver: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onBrowseClick: () => void;
}

export default function UploadDropzone({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowseClick,
}: Readonly<UploadDropzoneProps>) {
  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.008 }}
      animate={{
        boxShadow: isDragOver
          ? '0 26px 64px rgba(108, 77, 255, 0.24)'
          : '0 12px 34px rgba(15, 23, 42, 0.10)',
      }}
      transition={{ duration: 0.2 }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onBrowseClick}
      sx={{
        borderRadius: 5,
        border: '2px dashed',
        borderColor: isDragOver ? '#6C4DFF' : 'rgba(148, 163, 184, 0.35)',
        p: { xs: 3.5, md: 5.5 },
        cursor: 'pointer',
        background: isDragOver
          ? 'linear-gradient(145deg, rgba(108,77,255,0.15), rgba(14,165,233,0.15))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(246,248,255,0.92))',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <CloudUploadRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          เธญเธฑเธเนเธซเธฅเธ”เนเธเธฅเนเธเธฒเธเธเธญเธเธเธธเธ“เธ—เธตเนเธเธตเน
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เธฅเธฒเธเนเธฅเธฐเธงเธฒเธเนเธเธฅเนเนเธ”เนเธเธเนเธ—เนเธเน€เธฅเนเธ•/เธเธญเธกเธเธดเธงเน€เธ•เธญเธฃเน เธซเธฃเธทเธญเนเธ•เธฐเน€เธเธทเนเธญเน€เธฅเธทเธญเธเนเธเธฅเนเธเธฒเธเธกเธทเธญเธ–เธทเธญ
        </Typography>
      </Stack>
    </Box>
  );
}

