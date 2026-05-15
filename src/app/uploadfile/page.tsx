'use client';

import * as React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Uploader from '@/components/upload/uploader';

export default function UploadFilePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f9', p: { xs: 2, md: 4 } }}>
      <Card sx={{ maxWidth: 720, mx: 'auto', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            File Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload one file to the backend and open it using a short-lived signed URL.
          </Typography>
          <Uploader />
        </CardContent>
      </Card>
    </Box>
  );
}
