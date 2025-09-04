// ✅ ปรับโค้ดให้ถูกต้องและสมบูรณ์ พร้อมแก้ dialog ให้ทำงานได้จริง

'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Stack,
  TextField,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbarContainer } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { m } from 'framer-motion';

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
  status: string;
}

const getIconPathByExtension = (ext: string) => {
  const extMap: Record<string, string> = {
    pdf: '/icons/pdf.png',
    txt: '/txt.png',
    png: '/png.png',
    jpeg: '/png.png',
    jpg: '/png.png',
    ai: '/illustrator.png',
    psd: '/photoshop.png',
    xls: '/excel.png',
    xlsx: '/excel.png',
    xslm: '/excel.png',
    csv: '/excel.png',
    doc: '/docxWord.png',
    docx: '/docxWord.png',
  };

  return extMap[ext.toLowerCase()] || 'https://cdn-icons-png.flaticon.com/512/337/337951.png';
};

export default function UploadedFilesPage() {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<UploadRecord[]>([]);
  const [search, setSearch] = React.useState('');
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<UploadRecord | null>(null);
  const [customerName, setCustomerName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [status, setStatus] = React.useState<'completed' | 'pending'>('pending');

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await axios.get<UploadRecord[]>(`${process.env.NEXT_PUBLIC_API_URL}/upload`);
      setRows(res.data);
    } catch (err) {
      console.error('❌ Error fetching uploads', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUploads();
  }, []);

  const handleEdit = (record: UploadRecord) => {
    setEditingRecord(record);
    setCustomerName(record.customerName);
    setPhone(record.phone);
    setStatus(record.status as 'completed' | 'pending');
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!editingRecord) return;
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/upload/${editingRecord._id}`, {
        customerName,
        phone,
        status,
      });
      setEditOpen(false);
      fetchUploads();
    } catch (err) {
      console.error('❌ Error saving update', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบรายการนี้?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/upload/${id}`);
      fetchUploads();
    } catch (err) {
      console.error('❌ Error deleting record', err);
    }
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'นามบัตร':
        return <span style={{ fontSize: '2rem' }}>🃏</span>;
      case 'ตรายาง':
        return <span style={{ fontSize: '2rem' }}>🕹️</span>;
      case 'ถ่ายเอกสาร & ปริ้นงาน':
        return <span style={{ fontSize: '2rem' }}>🖨️</span>;
      case 'สติ๊กเกอร์':
        return <span style={{ fontSize: '2rem' }}>🌠</span>;
      default:
        return <span style={{ fontSize: '2rem' }}>🗂️</span>;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'customerName',
      headerName: 'ชื่อลูกค้า',
      width: 250,
      renderCell: params => <Typography fontWeight={500}>{params.value}</Typography>,
    },

    {
      field: 'phone',
      headerName: 'เบอร์โทร',
      width: 160,
      renderCell: params => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography>{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'category',
      headerName: 'ประเภทงาน',
      width: 200,
      renderCell: params => (
        <Chip
          size="small"
          icon={getCategoryIcon(params.value)}
          label={params.value}
          color={getCategoryColor(params.value)}
        />
      ),
    },
    {
      field: 'files',
      headerName: 'ไฟล์',
      width: 400,
      renderCell: (params: any) => {
        const files = params?.value;
        if (!files || !Array.isArray(files) || files.length === 0) {
          return <Typography color="text.secondary">ไม่มีไฟล์</Typography>;
        }

        return (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'flex-start', // ✅ ชิดซ้าย
            }}>
            {files.map((file: any, index: number) => {
              const fileId = file?.fileId;
              const name = file?.name || '';
              if (!fileId) return null;

              const ext = name.split('.').pop() || '';
              const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
              const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    // flex: 1,
                    flexDirection: 'column',
                    alignItems: 'left',
                    width: 60,
                  }}>
                  <Link
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none">
                    <img
                      src={thumbnailUrl}
                      alt={name}
                      title={name}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = getIconPathByExtension(ext);
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        backgroundColor: '#f5f5f5',
                      }}
                    />
                  </Link>
                  <Typography
                    variant="caption"
                    noWrap
                    maxWidth={50}
                    textAlign="center"
                    sx={{ mt: 0.5 }}>
                    {name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'วันที่',
      width: 180,
      renderCell: (params: any) =>
        new Date(params.value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      width: 150,
      renderCell: params =>
        params.value === 'completed' ? (
          <Chip label="เสร็จสิ้น" size="small" color="success" icon={<CheckCircleIcon />} />
        ) : (
          <Chip label="รอดำเนินการ" size="small" color="warning" icon={<HourglassEmptyIcon />} />
        ),
    },
    {
      field: 'note',
      headerName: 'หมายเหตุ',
      width: 150,
      renderCell: params => <Typography fontWeight={500}>{params.value}</Typography>,
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: params => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredRows = rows.filter(row => {
    const q = search.toLowerCase();
    return (
      row.customerName.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q) ||
      row.phone.includes(q)
    );
  });

  return (
    <Box sx={{ p: 4, height: '100vh' }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 250 }}
        />
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUploads}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box
          sx={{
            minWidth: 1000,
            height: 'calc(100vh - 160px)',
            backgroundColor: 'white',
            borderRadius: 2,
          }}>
          <DataGrid
            rows={filteredRows}
            rowHeight={100}
            columns={columns}
            getRowId={row => row._id}
            loading={loading}
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeader': {
                justifyContent: 'flex-start', // หัวตารางชิดซ้าย
                textAlign: 'left',
                alignItems: 'center',
              },
              '& .MuiDataGrid-cell': {
                justifyContent: 'flex-start', // เซลล์ข้อมูลชิดซ้าย
                textAlign: 'left',
                alignContent: 'center',
              },
            }}
          />
        </Box>
      </Box>

      {/* ✅ Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              ✏️ แก้ไขข้อมูล
            </Typography>
            <IconButton onClick={() => setEditOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ชื่อลูกค้า"
              fullWidth
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
            <TextField
              label="เบอร์โทร"
              fullWidth
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="status-label">สถานะ</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                onChange={e => setStatus(e.target.value as 'completed' | 'pending')}>
                <MenuItem value="pending">🕒 รอดำเนินการ</MenuItem>
                <MenuItem value="completed">✅ เสร็จสิ้น</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ mb: 2, mr: 0 }}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ mb: 2, mr: 2 }}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
