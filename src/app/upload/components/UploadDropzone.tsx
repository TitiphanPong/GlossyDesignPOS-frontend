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
}: UploadDropzoneProps) {
  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.01 }}
      animate={{
        boxShadow: isDragOver
          ? '0 30px 80px rgba(33, 150, 243, 0.26)'
          : '0 18px 50px rgba(15, 23, 42, 0.12)',
      }}
      transition={{ duration: 0.2 }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onBrowseClick}
      sx={{
        borderRadius: 6,
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : 'rgba(148, 163, 184, 0.35)',
        p: { xs: 3, md: 5 },
        cursor: 'pointer',
        background: isDragOver
          ? 'linear-gradient(145deg, rgba(59,130,246,0.16), rgba(124,58,237,0.16))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.88))',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <CloudUploadRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          Drag and drop your files here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse from your device
        </Typography>
      </Stack>
    </Box>
  );
}
