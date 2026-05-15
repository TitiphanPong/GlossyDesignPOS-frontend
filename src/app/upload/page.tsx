'use client';

import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import * as React from 'react';
import FilePreviewList from './components/FilePreviewList';
import SecurityNoticeCard from './components/SecurityNoticeCard';
import UploadDropzone from './components/UploadDropzone';
import UploadSuccessDialog from './components/UploadSuccessDialog';
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES, formatFileSize, isValidUploadFile } from './helpers';
import { JOB_TYPES, type JobType, type UploadApiResponse, type UploadFormValues, type UploadValidationError } from './types';

const SECURITY_BADGES = ['PDPA Friendly', 'Secure Upload', 'Private Storage'];

const DEFAULT_FORM: UploadFormValues = {
  customerName: '',
  phone: '',
  note: '',
  jobType: 'Document Printing',
};

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error('Missing NEXT_PUBLIC_API_URL. Please configure your environment variable.');
  }
  return base;
}

export default function UploadPage() {
  const [form, setForm] = React.useState<UploadFormValues>(DEFAULT_FORM);
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<UploadValidationError[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [uploadResult, setUploadResult] = React.useState<UploadApiResponse | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const totalSize = React.useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  const formErrors = React.useMemo(() => {
    const next: UploadValidationError[] = [];
    if (!form.customerName.trim()) next.push({ id: 'customerName', message: 'Customer name is required.' });
    if (!form.phone.trim()) next.push({ id: 'phone', message: 'Phone is required.' });
    if (form.phone.trim() && !/^\d+$/.test(form.phone.trim())) {
      next.push({ id: 'phoneDigits', message: 'Phone should contain only numbers.' });
    }
    if (form.phone.trim() && form.phone.trim().length < 9) {
      next.push({ id: 'phoneMin', message: 'Phone should be at least 9 digits.' });
    }
    if (files.length === 0) next.push({ id: 'files', message: 'Please add at least 1 file.' });
    return next;
  }, [files, form.customerName, form.phone]);

  const canSubmit = formErrors.length === 0 && !isUploading;

  const setField = <K extends keyof UploadFormValues>(key: K, value: UploadFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pushError = (message: string) => {
    setApiError(message);
  };

  const validateAndFilterFiles = (inputFiles: File[]) => {
    const validFiles: File[] = [];
    for (const file of inputFiles) {
      if (!isValidUploadFile(file)) {
        pushError(`Invalid file type: ${file.name}. Allowed: ${ACCEPTED_EXTENSIONS.join(', ').toUpperCase()}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        pushError(`File too large: ${file.name}. Maximum is ${formatFileSize(MAX_FILE_SIZE_BYTES)} per file.`);
        continue;
      }
      validFiles.push(file);
    }
    return validFiles;
  };

  const appendFiles = (incoming: File[]) => {
    setApiError(null);
    const validated = validateAndFilterFiles(incoming);
    setFiles((prev) => {
      const map = new Map<string, File>();
      for (const file of prev) map.set(`${file.name}-${file.lastModified}-${file.size}`, file);
      for (const file of validated) map.set(`${file.name}-${file.lastModified}-${file.size}`, file);
      return Array.from(map.values());
    });
  };

  const onInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    appendFiles(selected);
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    appendFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const handleRemoveFile = (target: File) => {
    setFiles((prev) => prev.filter((file) => !(file.name === target.name && file.lastModified === target.lastModified)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(formErrors);
    setApiError(null);
    if (formErrors.length > 0) return;

    try {
      setIsUploading(true);
      setProgress(0);

      const createPayload = (fileFieldName: 'files' | 'files[]') => {
        const body = new FormData();
        body.append('customerName', form.customerName.trim());
        body.append('phone', form.phone.trim());
        body.append('note', form.note.trim());
        body.append('jobType', form.jobType);
        for (const file of files) body.append(fileFieldName, file);
        return body;
      };

      const requestConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (uploadEvent: { total?: number; loaded: number }) => {
          if (!uploadEvent.total) return;
          const nextProgress = Math.round((uploadEvent.loaded / uploadEvent.total) * 100);
          setProgress(nextProgress);
        },
      };

      let response;
      try {
        response = await axios.post<UploadApiResponse>(`${getApiBaseUrl()}/uploads`, createPayload('files'), requestConfig);
      } catch (firstError) {
        if (axios.isAxiosError(firstError) && String(firstError.response?.data?.message ?? '').includes('Unexpected field')) {
          response = await axios.post<UploadApiResponse>(`${getApiBaseUrl()}/uploads`, createPayload('files[]'), requestConfig);
        } else {
          throw firstError;
        }
      }

      setUploadResult(response.data);
      setFiles([]);
      setForm(DEFAULT_FORM);
      setErrors([]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          pushError(String(error.response.data.message));
        } else if (error.code === 'ERR_NETWORK') {
          pushError('Network error while uploading. Please try again.');
        } else {
          pushError('Upload failure. Please retry.');
        }
      } else {
        pushError('Unexpected error happened during upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 7 },
        background:
          'radial-gradient(circle at 10% 20%, rgba(147,197,253,0.38), transparent 40%), radial-gradient(circle at 85% 10%, rgba(196,181,253,0.35), transparent 35%), linear-gradient(180deg, #f8fbff, #f5f5ff)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 7,
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 25px 70px rgba(15, 23, 42, 0.14)',
              border: '1px solid rgba(255,255,255,0.7)',
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}>
                Secure Print File Upload
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload your print files securely without sending through chat applications.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {SECURITY_BADGES.map((badge) => (
                  <Chip key={badge} label={badge} variant="outlined" sx={{ borderRadius: 99, bgcolor: 'white' }} />
                ))}
              </Stack>
            </Stack>
          </Paper>

          {apiError && <Alert severity="error">{apiError}</Alert>}
          {errors.length > 0 && (
            <Alert severity="warning">
              {errors.map((error) => (
                <Box key={error.id}>{error.message}</Box>
              ))}
            </Alert>
          )}

          <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5}>
                <Paper sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 6, boxShadow: '0 18px 50px rgba(15,23,42,0.1)' }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Customer Information
                    </Typography>
                    <TextField
                      label="Customer Name"
                      value={form.customerName}
                      onChange={(event) => setField('customerName', event.target.value)}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Phone"
                      value={form.phone}
                      onChange={(event) => setField('phone', event.target.value.replace(/\s/g, ''))}
                      required
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel id="job-type-label">Job Type</InputLabel>
                      <Select
                        labelId="job-type-label"
                        value={form.jobType}
                        label="Job Type"
                        onChange={(event) => setField('jobType', event.target.value as JobType)}
                      >
                        {JOB_TYPES.map((jobType) => (
                          <MenuItem key={jobType} value={jobType}>
                            {jobType}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Note (Optional)"
                      value={form.note}
                      onChange={(event) => setField('note', event.target.value)}
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Stack>
                </Paper>

                <Paper sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 6, boxShadow: '0 18px 50px rgba(15,23,42,0.1)' }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Upload Files
                    </Typography>
                    <UploadDropzone
                      isDragOver={isDragOver}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault();
                        setIsDragOver(false);
                      }}
                      onDrop={handleDrop}
                      onBrowseClick={() => fileInputRef.current?.click()}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      onChange={onInputFileChange}
                      accept={ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Allowed: {ACCEPTED_EXTENSIONS.join(', ').toUpperCase()} • Max {formatFileSize(MAX_FILE_SIZE_BYTES)} per file
                    </Typography>
                    <FilePreviewList files={files} uploadProgress={progress} onRemoveFile={handleRemoveFile} />
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2.5} sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
                <Paper sx={{ p: 3, borderRadius: 6, boxShadow: '0 18px 50px rgba(15,23,42,0.1)' }}>
                  <Stack spacing={1.4}>
                    <Typography variant="h6" fontWeight={700}>
                      Upload Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Files: <strong>{files.length}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Size: <strong>{formatFileSize(totalSize)}</strong>
                    </Typography>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      variant="contained"
                      disabled={!canSubmit}
                      sx={{ mt: 1, py: 1.5, borderRadius: 999, fontWeight: 700, fontSize: '1rem' }}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Files'}
                    </Button>
                  </Stack>
                </Paper>
                <SecurityNoticeCard />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <UploadSuccessDialog
        open={Boolean(uploadResult)}
        uploadId={uploadResult?.uploadId ?? ''}
        orderCode={uploadResult?.orderCode ?? ''}
        onUploadMore={() => setUploadResult(null)}
      />
    </Box>
  );
}
