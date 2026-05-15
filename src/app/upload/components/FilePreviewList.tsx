'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { formatFileSize, getFileIcon, getFileTypeLabel } from '../helpers';

interface FilePreviewListProps {
  files: File[];
  uploadProgress: number;
  onRemoveFile: (targetFile: File) => void;
}

export default function FilePreviewList({ files, uploadProgress, onRemoveFile }: FilePreviewListProps) {
  if (files.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: 5,
          p: 3,
          textAlign: 'center',
          border: '1px solid rgba(148,163,184,0.25)',
          bgcolor: 'rgba(255,255,255,0.65)',
        }}
      >
        <Typography color="text.secondary">No files selected yet</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{ height: 8, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.26)' }}
        />
      )}

      {files.map((file) => (
        <Box
          key={`${file.name}-${file.lastModified}`}
          component={motion.div}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            p: 1.5,
            borderRadius: 4,
            border: '1px solid rgba(148,163,184,0.25)',
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36 }}>{getFileIcon(file.name)}</Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getFileTypeLabel(file.name)} | {formatFileSize(file.size)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => onRemoveFile(file)} aria-label={`remove-${file.name}`}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Stack>
  );
}

