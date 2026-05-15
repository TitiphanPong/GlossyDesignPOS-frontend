'use client';

import * as React from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { getSignedUrl, uploadFile, type UploadResponse } from '@/lib/upload-api';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'ai', 'psd', 'zip'];
const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/postscript',
  'image/vnd.adobe.photoshop',
  'application/zip',
  'application/x-zip-compressed',
]);

function getFileExtension(fileName: string): string {
  const ext = fileName.split('.').pop();
  return (ext ?? '').toLowerCase();
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB`;
}

function isAllowedFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(ext)) return false;
  if (!file.type) return true;
  return ACCEPTED_MIME_TYPES.has(file.type);
}

export default function Uploader() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [opening, setOpening] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<UploadResponse | null>(null);
  const requestIdRef = React.useRef(0);

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

    if (!isAllowedFile(file)) {
      setSelectedFile(null);
      setErrorMessage(`Unsupported file type. Allowed: ${ACCEPTED_EXTENSIONS.join(', ').toUpperCase()}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setErrorMessage('File size exceeds 100MB. Please select a smaller file.');
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
      const uploaded = await uploadFile(selectedFile);
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

  const openSignedUrlWithRetry = async (id: string) => {
    let retryCount = 0;

    while (retryCount < 2) {
      const signed = await getSignedUrl(id);
      const openedWindow = window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
      if (openedWindow) {
        return;
      }

      retryCount += 1;
      if (retryCount >= 2) {
        throw new Error('Unable to open file automatically. Please allow popups and try again.');
      }
    }
  };

  const handleOpenFile = async () => {
    if (!uploadedFile || opening || envError) return;

    clearMessages();
    setOpening(true);
    const requestId = ++requestIdRef.current;

    try {
      await openSignedUrlWithRetry(uploadedFile.id);
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
        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.zip" onChange={handleFileChange} disabled={disableActions} />
      </Box>

      {selectedFile && (
        <Box>
          <Typography variant="body2">Selected: {selectedFile.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Size: {formatBytes(selectedFile.size)}
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
