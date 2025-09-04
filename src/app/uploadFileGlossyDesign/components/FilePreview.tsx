'use client';

import React from 'react';
import { Avatar } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

const FilePreview = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (file.type.startsWith('image/')) {
    return (
      <Avatar variant="rounded" src={URL.createObjectURL(file)} alt={file.name} sx={{ width: 50, height: 50 }} />
    );
  }

  if (ext === 'pdf') {
    return <Avatar sx={{ bgcolor: '#f44336', width: 50, height: 50 }}><PictureAsPdfIcon /></Avatar>;
  }

  if (ext === 'doc' || ext === 'docx') {
    return <Avatar sx={{ bgcolor: '#1976d2', width: 50, height: 50 }}><DescriptionIcon /></Avatar>;
  }

  if (ext === 'xls' || ext === 'xlsx') {
    return <Avatar sx={{ bgcolor: '#2e7d32', width: 50, height: 50 }}><TableChartIcon /></Avatar>;
  }

  if (ext === 'txt') {
    return <Avatar sx={{ bgcolor: '#616161', width: 50, height: 50 }}><TextSnippetIcon /></Avatar>;
  }

  return <Avatar sx={{ bgcolor: '#9e9e9e', width: 50, height: 50 }}><InsertDriveFileIcon /></Avatar>;
};

export default FilePreview;
