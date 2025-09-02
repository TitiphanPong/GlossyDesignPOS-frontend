'use client';

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DescriptionIcon from '@mui/icons-material/Description';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface UploadedFile {
  fileId: string;
  name: string;
  downloadUrl: string;
}

interface UploadRecord {
  _id: string;
  customerName: string;
  phone: string;
  note: string;
  category: string;
  files: UploadedFile[];
  createdAt: string;
  status: string; // pending | completed
}

export default function UploadedFilesPage() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ สำหรับ Modal Confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await axios.get<UploadRecord[]>('http://localhost:3001/upload');
      setUploads(res.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching uploads', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'นามบัตร':
        return 'primary';
      case 'ตรายาง':
        return 'secondary';
      case 'ถ่ายเอกสาร & ปริ้นงาน':
        return 'success';
      case 'สติ๊กเกอร์':
        return 'warning';
      default:
        return 'default';
    }
  };

  // ✅ กดยืนยันเสร็จสิ้น
  const handleConfirmComplete = async () => {
    if (!selectedId) return;
    try {
      await axios.patch(`http://localhost:3001/upload/${selectedId}/complete`);
      fetchUploads();
      setConfirmOpen(false);
      setSelectedId(null);
    } catch (err) {
      console.error('❌ Error updating status', err);
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          p: 3,
          borderRadius: '16px',
          background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          📂 รายการไฟล์ที่ลูกค้าอัปโหลด
        </Typography>
      </Box>

      {/* Action Bar */}
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <RefreshIcon
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          }
          onClick={fetchUploads}
          disabled={loading}
        >
          {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)',
              }}
            >
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ลูกค้า</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เบอร์โทร</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ประเภทงาน</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ไฟล์</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>การจัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  ❌ ไม่มีข้อมูลอัปโหลด
                </TableCell>
              </TableRow>
            ) : (
              uploads.map((upload, idx) => (
                <TableRow
                  key={upload._id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? '#f9f9ff' : '#ffffff',
                    '&:hover': { backgroundColor: '#eef3ff', transition: '0.3s' },
                  }}
                >
                  <TableCell>{upload.customerName}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      {upload.phone}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<WorkIcon />}
                      label={upload.category}
                      color={getCategoryColor(upload.category)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {upload.files.map((file) => {
                        const fileId = file.fileId;
                        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;

                        return (
                          <Box
                            key={file.fileId}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              '&:hover': { backgroundColor: '#f5f5f5' },
                            }}
                          >
                            <Link href={previewUrl} target="_blank" rel="noopener">
                              <img
                                src={thumbnailUrl}
                                alt={file.name}
                                style={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  flexShrink: 0,
                                }}
                              />
                            </Link>
                            <Typography variant="body2" noWrap>
                              {file.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(upload.createdAt).toLocaleString('th-TH', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    {upload.status === 'completed' ? (
                      <Chip
                        label="เสร็จสิ้น"
                        color="success"
                        icon={<CheckCircleIcon />}
                      />
                    ) : (
                      <Chip
                        label="ยังไม่ดำเนินการ"
                        color="warning"
                        icon={<HourglassEmptyIcon />}
                        onClick={() => {
                          setSelectedId(upload._id);
                          setConfirmOpen(true);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Confirm */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>ยืนยันการดำเนินการ</DialogTitle>
        <DialogContent>
          <Typography>คุณต้องการทำเครื่องหมายว่า <b>เสร็จสิ้น</b> ใช่หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            ยกเลิก
          </Button>
          <Button onClick={handleConfirmComplete} color="success" variant="contained">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
