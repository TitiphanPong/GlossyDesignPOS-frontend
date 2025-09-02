'use client';

import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<string>('นามบัตร');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const categories = ['นามบัตร', 'ตรายาง', 'ถ่ายเอกสาร & ปริ้นงาน', 'สติ๊กเกอร์'];
  const steps = ['เลือกไฟล์', 'กรอกข้อมูล', 'ตรวจสอบข้อมูล'];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  // ✅ เลือกไฟล์หลายไฟล์และ append
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]); // เพิ่มไฟล์ใหม่เข้า list เดิม
    }
  };

  // ✅ ลบไฟล์ออกจาก list
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('category', category);
    formData.append('customerName', customerName);
    formData.append('phone', phone);
    formData.append('note', note);

    try {
      setUploading(true);
      setProgress(0);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      alert('Upload Success!');
    } catch (err) {
      alert('Upload Failed!');
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
          maxWidth: isMobile ? '95%' : isTablet ? 600 : 500,
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f9f9ff 100%)',
        }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {/* Card Header */}
          <Box textAlign="center" mt={3} mb={4}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
              อัพโหลดไฟล์งานพิมพ์
            </Typography>
            <Typography variant="body2" color="text.secondary">
              กรุณาอัพโหลดไฟล์ที่ต้องการ พร้อมกรอกข้อมูลลูกค้าให้ครบถ้วนก่อนส่ง
            </Typography>
          </Box>
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box mt={2}>
            {activeStep === 0 && (
              <Stack spacing={2}>
                <Typography variant="h6">📂 เลือกไฟล์</Typography>
                <Button
                  component="label"
                  fullWidth
                  sx={{
                    border: '2px dashed #bbb',
                    borderRadius: '16px',
                    py: isMobile ? 2 : 4,
                    bgcolor: '#fafafa',
                    textTransform: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': { bgcolor: '#f5f5f5', borderColor: '#6c63ff' },
                  }}>
                  <CloudUploadIcon sx={{ fontSize: 36, color: '#666' }} />
                  <Typography variant="body1">
                    คลิกเพื่อเลือกไฟล์ (สามารถเลือกได้หลายไฟล์)
                  </Typography>
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </Button>

                {/* ✅ รายการไฟล์ที่เลือก */}
                {files.length > 0 && (
                  <List dense>
                    {files.map((f, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        }>
                        <ListItemIcon>
                          <InsertDriveFileIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={f.name} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={2}>
                <Typography variant="h6">📝 กรอกข้อมูลลูกค้า</Typography>
                <FormControl fullWidth>
                  <InputLabel id="category-label">ประเภทงาน</InputLabel>
                  <Select
                    labelId="category-label"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    label="ประเภทงาน">
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="ชื่อลูกค้า"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="เบอร์โทรศัพท์"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={1}>
                <Typography variant="h6">✅ ตรวจสอบข้อมูล</Typography>
                {files.length > 0 ? (
                  <List dense>
                    {files.map((f, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InsertDriveFileIcon color="action" />
                        </ListItemIcon>
                        <ListItemText primary={f.name} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">ยังไม่ได้เลือกไฟล์</Typography>
                )}
                <Typography>ชื่อลูกค้า: {customerName || '-'}</Typography>
                <Typography>เบอร์โทร: {phone || '-'}</Typography>
                <Typography>ประเภท: {category}</Typography>

                {/* Progress Bar */}
                {uploading && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" textAlign="center" mt={1} color="text.secondary">
                      กำลังอัพโหลด... {progress}%
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Box>

          {/* Stepper Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              ย้อนกลับ
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={files.length === 0 || !customerName || !phone || uploading}>
                {uploading ? `Uploading... ${progress}%` : 'อัพโหลด'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && files.length === 0) || (activeStep === 1 && !customerName)
                }>
                ถัดไป
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
