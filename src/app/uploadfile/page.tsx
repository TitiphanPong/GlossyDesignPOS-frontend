// ModernUploadPage.tsx
'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import LiquidProgress from './components/LiquidProgress';
import Loader from './components/uploadloader';
import FilePreview from './components/FilePreview';

export default function ModernUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<string>('นามบัตร');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const categories = ['นามบัตร', 'ตรายาง', 'ถ่ายเอกสาร & ปริ้นงาน', 'สติ๊กเกอร์', 'อื่นๆ'];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRemoveFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('category', category);
    formData.append('customerName', customerName);
    formData.append('phone', phone || '-');
    formData.append('note', note || '-');

    try {
      setUploading(true);
      setProgress(0);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setSnackbar({ open: true, message: 'อัปโหลดสำเร็จ 🎉', severity: 'success' });
      setFiles([]);
      setCustomerName('');
      setPhone('');
      setNote('');
    } catch {
      setSnackbar({ open: true, message: 'อัปโหลดล้มเหลว ❌', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f6f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: isMobile ? 1 : 3,
      }}>
      <Card
        sx={{
          width: '100%',
          maxWidth: isMobile ? '95%' : isTablet ? 600 : 700,
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f9f9ff 100%)',
        }}>
        <CardContent sx={{ p: isMobile ? 2 : 4, mt: 2 }}>
          <Box textAlign="center" mb={isMobile ? 2 : 4}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
              📂 อัพโหลดไฟล์งานพิมพ์
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </Typography>
          </Box>

          {uploading ? (
            <Box textAlign="center" my={3}>
              <LiquidProgress progress={progress} />
              <Typography variant="body2" mt={2}>
                กำลังอัพโหลด...
              </Typography>
            </Box>
          ) : (
            <Box
              {...getRootProps()}
              sx={{
                height: 300,
                borderRadius: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <input {...getInputProps()} />
              <Loader />
              <Typography mt={1}>{isDragActive ? 'ปล่อยไฟล์ได้เลย...' : 'ลากไฟล์มาที่นี่ หรือคลิกเพื่อเลือก'}</Typography>
            </Box>
          )}

          {files.length > 0 && (
            <List dense sx={{ mt: 2 }}>
              {files.map((f, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  }>
                  {FilePreview(f)}
                  <ListItemText
                    sx={{
                      ml: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    primary={f.name}
                    secondary={`${(f.size / 1024).toFixed(1)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Stack spacing={2} mt={3}>
            <FormControl fullWidth>
              <InputLabel id="category-label">ประเภทงาน</InputLabel>
              <Select labelId="category-label" value={category} label="ประเภทงาน" onChange={e => setCategory(e.target.value)}>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="ชื่อลูกค้า" value={customerName} onChange={e => setCustomerName(e.target.value)} fullWidth size={isMobile ? 'small' : 'medium'} />
            <TextField label="เบอร์โทรศัพท์" value={phone} onChange={e => setPhone(e.target.value)} fullWidth size={isMobile ? 'small' : 'medium'} />
            <TextField label="Note" value={note} onChange={e => setNote(e.target.value)} fullWidth multiline rows={isMobile ? 2 : 3} size={isMobile ? 'small' : 'medium'} />
          </Stack>

          <Button variant="contained" fullWidth sx={{ mt: 4, py: isMobile ? 1 : 1.5, borderRadius: '12px' }} onClick={handleUpload} disabled={files.length === 0 || !customerName}>
            {uploading ? `Uploading... ${progress}%` : '🚀 อัพโหลดไฟล์'}
          </Button>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
