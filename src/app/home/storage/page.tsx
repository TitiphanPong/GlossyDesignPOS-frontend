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
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';

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

interface FolderUsage {
  size: number;
  sizeGB: string;
  sizeMB: string;
}

const getIconPathByExtension = (ext: string) => {
  const extMap: Record<string, string> = {
    pdf: 'icons/pdf.png',
    txt: 'icons/txt.png',
    png: 'icons/png.png',
    jpeg: 'icons/png.png',
    jpg: 'icons/png.png',
    ai: 'icons/illustrator.png',
    psd: 'icons/photoshop.png',
    xls: 'icons/excel.png',
    xlsx: 'icons/excel.png',
    xslm: 'icons/excel.png',
    csv: 'icons/excel.png',
    doc: 'icons/docxWord.png',
    docx: 'icons/docxWord.png',
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

  // Google Drive Usage Section

  const [quota, setQuota] = React.useState<{
    limit: number;
    usage: number;
    usageInDrive: number;
    usageInDriveTrash: number;
  } | null>(null);

  const [folderUsage, setFolderUsage] = React.useState<Record<string, FolderUsage>>({});

  const [usageByCategory, setUsageByCategory] = React.useState<any>({});

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

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

  const handleEdit = (record: UploadRecord) => {
    setEditingRecord(record);
    setCustomerName(record.customerName);
    setPhone(record.phone);
    setStatus(record.status as 'completed' | 'pending');
    setEditOpen(true);
  };

  const fetchQuota = async () => {
    try {
      const [quotaRes, folderRes] = await Promise.all([axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upload/quota`), axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upload/quota/folders`)]);
      setQuota(quotaRes.data);
      setFolderUsage(folderRes.data);
    } catch (err) {
      console.error('❌ Error fetching quota', err);
    }
  };

  const fetchFolderQuota = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upload/quota/folders`);
      setUsageByCategory(res.data);
    } catch (err) {
      console.error('❌ Error fetching folder usage', err);
    }
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

  React.useEffect(() => {
    fetchUploads();
    fetchFolderQuota();
    fetchQuota();
  }, []);

  const pieData = Object.entries(folderUsage).map(([name, data]) => ({
    name,
    value: Number((data.size / 1024 ** 2).toFixed(2)), // ✅ บังคับให้เป็น number
  }));

  const COLORS = ['#8884d8', '#ff8042', '#ffc658', '#82ca9d', '#00c49f'];

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
      renderCell: params => <Chip size="small" icon={getCategoryIcon(params.value)} label={params.value} color={getCategoryColor(params.value)} />,
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
                  <Link href={previewUrl} target="_blank" rel="noopener noreferrer" underline="none">
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
                  <Typography variant="caption" noWrap maxWidth={50} textAlign="center" sx={{ mt: 0.5 }}>
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
      renderCell: (params: any) => new Date(params.value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
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
    return row.customerName.toLowerCase().includes(q) || row.category.toLowerCase().includes(q) || row.phone.includes(q);
  });

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ p: 4 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }} // responsive
          spacing={2}
          sx={{ flex: 1, alignItems: 'stretch', justifyContent: 'space-between' }}>
          {/* Left: All Folders */}
          <Card sx={{ flex: '2 1 500px', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={700} padding={1}>
                  All Folders
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {Object.entries(folderUsage).map(([name, data], i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid #eee',
                      borderRadius: 2,
                      bgcolor: '#fafafa',
                    }}>
                    <Stack>
                      <Typography fontWeight={700}>📁 {name}</Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {(data.size / 1024 ** 2).toFixed(2)} MB
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {data.sizeGB}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Right: Storage Details */}
          <Card sx={{ flex: '1 1 300px', borderRadius: 2, textAlign: 'center', p: 2 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom mt={3}>
              Storage Details
            </Typography>

            {quota && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}>
                <PieChart width={260} height={260}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  {/* ✅ ตรงกลาง (ข้อความ dynamic ตาม hover) */}
                  <foreignObject x="80" y="100" width="100" height="100">
                    <Box
                      sx={{
                        textAlign: 'center',
                        pointerEvents: 'none',
                      }}>
                      {activeIndex !== null ? (
                        <>
                          <Typography fontWeight={700}>{pieData[activeIndex].name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pieData[activeIndex].value} MB
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography fontWeight={700}>Storage</Typography>
                          <Typography variant="body2" color="text.secondary">
                            พื้นที่ข้อมูลรวม
                          </Typography>
                        </>
                      )}
                    </Box>
                  </foreignObject>
                </PieChart>
              </Box>
            )}

            {quota && (
              <>
                <Typography fontWeight={700}>
                  ใช้ไป {(quota.usage / 1024 ** 3).toFixed(2)} GB / ทั้งหมด {(quota.limit / 1024 ** 3).toFixed(2)} GB
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Free Space: {((quota.limit - quota.usage) / 1024 ** 3).toFixed(2)} GB
                </Typography>
              </>
            )}
          </Card>
        </Stack>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 250 }} />
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUploads}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box
          sx={{
            minWidth: 1000,
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
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
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
            <TextField label="ชื่อลูกค้า" fullWidth value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <TextField label="เบอร์โทร" fullWidth value={phone} onChange={e => setPhone(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="status-label">สถานะ</InputLabel>
              <Select labelId="status-label" value={status} onChange={e => setStatus(e.target.value as 'completed' | 'pending')}>
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
