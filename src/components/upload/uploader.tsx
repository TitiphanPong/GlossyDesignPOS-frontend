'use client';

import * as React from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { getSignedUrl, uploadFile, type UploadResponse } from '@/lib/upload-api';
import {
  QUICK_UPLOADER_EXTENSIONS,
  QUICK_UPLOADER_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  buildAcceptAttribute,
  formatFileSize,
  validateUploadFile,
} from '@/app/upload/helpers';
import { openSignedUrlWithRetry } from '@/app/upload/upload-flow';

const ACCEPT_ATTRIBUTE = buildAcceptAttribute(QUICK_UPLOADER_EXTENSIONS);

export default function Uploader() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [opening, setOpening] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<UploadResponse | null>(null);
  const requestIdRef = React.useRef(0);
  const defaultUploadPayload = React.useMemo(
    () => ({
      customerName: 'Walk-in Customer',
      phone: '0000000000',
      jobType: 'Other',
      note: 'Uploaded from quick uploader',
    }),
    []
  );

  const envError = React.useMemo(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return 'Missing NEXT_PUBLIC_API_URL. Please configure environment variables before uploading files.';
    }
    return null;
  }, []);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validation = validateUploadFile(file, {
      acceptedExtensions: QUICK_UPLOADER_EXTENSIONS,
      acceptedMimeTypes: QUICK_UPLOADER_MIME_TYPES,
      maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    });

    if (!validation.valid && (validation.reason === 'extension' || validation.reason === 'mime')) {
      setSelectedFile(null);
      setErrorMessage(`Unsupported file type. Allowed: ${QUICK_UPLOADER_EXTENSIONS.join(', ').toUpperCase()}`);
      return;
    }

    if (!validation.valid && validation.reason === 'size') {
      setSelectedFile(null);
      setErrorMessage('File size exceeds 8MB. Please select a smaller file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading || envError) return;

    clearMessages();
    setUploading(true);
    const requestId = ++requestIdRef.current;

    try {
      const uploaded = await uploadFile(selectedFile, defaultUploadPayload);
      if (requestId !== requestIdRef.current) return;

      setUploadedFile(uploaded);
      setSuccessMessage('Upload completed successfully.');
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      if (requestId === requestIdRef.current) {
        setUploading(false);
      }
    }
  };

  const handleOpenFile = async () => {
    if (!uploadedFile || opening || envError) return;

    clearMessages();
    setOpening(true);
    const requestId = ++requestIdRef.current;

    try {
      await openSignedUrlWithRetry({
        id: uploadedFile.id,
        getSignedUrl,
        openWindow: signedUrl => window.open(signedUrl, '_blank', 'noopener,noreferrer'),
      });
      if (requestId !== requestIdRef.current) return;
      setSuccessMessage('Opened file with signed URL.');
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : 'Could not open file.');
    } finally {
      if (requestId === requestIdRef.current) {
        setOpening(false);
      }
    }
  };

  const disableActions = Boolean(envError) || uploading || opening;

  return (
    <Stack spacing={2.5}>
      {envError && <Alert severity="error">{envError}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Box>
        <input type="file" accept={ACCEPT_ATTRIBUTE} onChange={handleFileChange} disabled={disableActions} />
      </Box>

      {selectedFile && (
        <Box>
          <Typography variant="body2">Selected: {selectedFile.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Size: {formatFileSize(selectedFile.size)}
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || disableActions}>
          {uploading ? <CircularProgress size={18} color="inherit" /> : 'Upload File'}
        </Button>
        <Button variant="outlined" onClick={handleOpenFile} disabled={!uploadedFile || disableActions}>
          {opening ? <CircularProgress size={18} color="inherit" /> : 'Open File'}
        </Button>
      </Stack>

      {uploadedFile && (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Metadata
          </Typography>
          <Typography variant="body2">id: {uploadedFile.id}</Typography>
          <Typography variant="body2">originalName: {uploadedFile.originalName}</Typography>
          <Typography variant="body2">size: {uploadedFile.size}</Typography>
          <Typography variant="body2">mimeType: {uploadedFile.mimeType}</Typography>
          <Typography variant="body2">createdAt: {uploadedFile.createdAt}</Typography>
        </Box>
      )}
    </Stack>
  );
}
