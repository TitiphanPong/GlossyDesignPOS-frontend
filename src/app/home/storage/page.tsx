'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded';
import axios from 'axios';
import AdminPageContainer from '../components/AdminPageContainer';

type StatusType = 'completed' | 'pending';

type UploadApiFile = {
  fileId?: string;
  id?: string;
  key?: string;
  name?: string;
  originalName?: string;
  filename?: string;
  downloadUrl?: string;
  url?: string;
  signedUrl?: string;
};

type UploadApiRecord = {
  _id?: string;
  id?: string;
  uploadId?: string;
  customerName?: string;
  customer?: string;
  phone?: string;
  phoneNumber?: string;
  note?: string;
  category?: string;
  jobType?: string;
  files?: UploadApiFile[] | string[];
  createdAt?: string;
  status?: string;
};

type UploadedFile = {
  fileId: string;
  name: string;
  url: string;
};

type UploadRecord = {
  _id: string;
  customerName: string;
  phone: string;
  note: string;
  category: string;
  files: UploadedFile[];
  createdAt: string;
  status: StatusType;
};

const endpointCandidates = ['/uploads', '/upload'];

const extIconMap: Record<string, React.ReactNode> = {
  pdf: <DescriptionRoundedIcon color="error" fontSize="small" />,
  png: <ImageRoundedIcon color="primary" fontSize="small" />,
  jpg: <ImageRoundedIcon color="primary" fontSize="small" />,
  jpeg: <ImageRoundedIcon color="primary" fontSize="small" />,
  gif: <ImageRoundedIcon color="primary" fontSize="small" />,
  webp: <ImageRoundedIcon color="primary" fontSize="small" />,
  zip: <ArchiveRoundedIcon sx={{ color: '#f59e0b' }} fontSize="small" />,
  rar: <ArchiveRoundedIcon sx={{ color: '#f59e0b' }} fontSize="small" />,
  xls: <GridOnRoundedIcon color="success" fontSize="small" />,
  xlsx: <GridOnRoundedIcon color="success" fontSize="small" />,
  csv: <GridOnRoundedIcon color="success" fontSize="small" />,
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? '';
}

function getExt(name: string) {
  return (name.split('.').pop() ?? '').toLowerCase();
}

function getFileIcon(name: string) {
  return extIconMap[getExt(name)] ?? <InsertDriveFileRoundedIcon color="disabled" fontSize="small" />;
}

function normalizeFiles(rawFiles: UploadApiRecord['files']): UploadedFile[] {
  if (!Array.isArray(rawFiles)) return [];

  return rawFiles
    .map((item): UploadedFile | null => {
      if (typeof item === 'string') {
        const name = item.split('/').pop() || item;
        return { fileId: item, name, url: '' };
      }

      const fileId = String(item.fileId ?? item.id ?? item.key ?? '');
      const normalizedName = item.name ?? item.originalName ?? item.filename ?? fileId ?? 'Unnamed file';
      const name = String(normalizedName);
      const url = String(item.signedUrl ?? item.downloadUrl ?? item.url ?? '');
      if (!fileId && !name) return null;
      return { fileId: fileId || name, name, url };
    })
    .filter((item): item is UploadedFile => Boolean(item));
}

function normalizeRecord(raw: UploadApiRecord): UploadRecord {
  const id = String(raw._id ?? raw.id ?? raw.uploadId ?? `upload-${Math.random().toString(36).slice(2)}`);
  const status = raw.status === 'completed' ? 'completed' : 'pending';

  return {
    _id: id,
    customerName: String(raw.customerName ?? raw.customer ?? '-'),
    phone: String(raw.phone ?? raw.phoneNumber ?? '-'),
    note: String(raw.note ?? ''),
    category: String(raw.category ?? raw.jobType ?? 'Other'),
    files: normalizeFiles(raw.files),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    status,
  };
}

export default function StoragePage() {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<UploadRecord[]>([]);
  const [search, setSearch] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<UploadRecord | null>(null);
  const [customerName, setCustomerName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [status, setStatus] = React.useState<StatusType>('pending');

  const fetchUploads = React.useCallback(async () => {
    const base = getBaseUrl();
    if (!base) {
      setErrorMessage('Missing NEXT_PUBLIC_API_URL');
      setRows([]);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      let loaded = false;

      for (const endpoint of endpointCandidates) {
        try {
          const res = await axios.get(`${base}${endpoint}`);
          const payload = res.data as unknown;
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray((payload as { data?: unknown[] })?.data)
              ? (payload as { data: unknown[] }).data
              : [];

          const normalized = list
            .filter((item): item is UploadApiRecord => typeof item === 'object' && item !== null)
            .map(normalizeRecord);

          setRows(normalized);
          loaded = true;
          break;
        } catch {
          // Try next endpoint
        }
      }

      if (!loaded) {
        setRows([]);
        setErrorMessage('Unable to load records from API. Please verify /uploads or /upload endpoint.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleEdit = (record: UploadRecord) => {
    setEditingRecord(record);
    setCustomerName(record.customerName);
    setPhone(record.phone);
    setStatus(record.status);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingRecord) return;
    const base = getBaseUrl();
    if (!base) return;

    const payload = { customerName, phone, status };
    const candidates = endpointCandidates.map((path) => `${base}${path}/${editingRecord._id}`);

    for (const url of candidates) {
      try {
        await axios.patch(url, payload);
        setEditOpen(false);
        fetchUploads();
        return;
      } catch {
        // try next candidate
      }
    }

    setErrorMessage('Unable to update this record with current API paths.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบรายการนี้?')) return;
    const base = getBaseUrl();
    if (!base) return;

    const candidates = endpointCandidates.map((path) => `${base}${path}/${id}`);

    for (const url of candidates) {
      try {
        await axios.delete(url);
        fetchUploads();
        return;
      } catch {
        // try next candidate
      }
    }

    setErrorMessage('Unable to delete this record with current API paths.');
  };

  const filteredRows = rows.filter((row) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return row.customerName.toLowerCase().includes(q)
      || row.phone.toLowerCase().includes(q)
      || row.category.toLowerCase().includes(q)
      || row.note.toLowerCase().includes(q);
  });

  const columns: GridColDef[] = [
    {
      field: 'customerName',
      headerName: 'ชื่อลูกค้า',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => <Typography fontWeight={600}>{String(params.value || '-')}</Typography>,
    },
    {
      field: 'phone',
      headerName: 'เบอร์โทร',
      minWidth: 140,
      flex: 0.8,
    },
    {
      field: 'category',
      headerName: 'ประเภทงาน',
      minWidth: 150,
      flex: 0.9,
      renderCell: (params) => <Chip size="small" label={String(params.value || 'Other')} variant="outlined" />,
    },
    {
      field: 'files',
      headerName: 'ไฟล์จาก S3',
      minWidth: 300,
      flex: 1.6,
      sortable: false,
      renderCell: (params: GridRenderCellParams<UploadedFile[]>) => {
        const files = params.value ?? [];
        if (files.length === 0) return <Typography color="text.secondary">ไม่มีไฟล์</Typography>;

        return (
          <Stack direction="row" spacing={0.8} sx={{ overflowX: 'auto', py: 0.5 }}>
            {files.slice(0, 4).map((file: UploadedFile) => (
              <Tooltip key={`${file.fileId}-${file.name}`} title={file.name}>
                {file.url ? (
                  <Button
                    size="small"
                    variant="outlined"
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={getFileIcon(file.name)}
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{ textTransform: 'none', maxWidth: 170 }}>
                    <Typography noWrap variant="caption">{file.name}</Typography>
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled
                    startIcon={getFileIcon(file.name)}
                    sx={{ textTransform: 'none', maxWidth: 170 }}>
                    <Typography noWrap variant="caption">{file.name}</Typography>
                  </Button>
                )}
              </Tooltip>
            ))}
            {files.length > 4 && <Chip size="small" label={`+${files.length - 4}`} />}
          </Stack>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'วันที่',
      minWidth: 160,
      flex: 0.9,
      renderCell: (params) => {
        const value = String(params.value || '');
        const date = new Date(value);
        return <Typography variant="body2">{Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('th-TH')}</Typography>;
      },
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      minWidth: 140,
      flex: 0.8,
      renderCell: (params) =>
        params.value === 'completed'
          ? <Chip label="เสร็จสิ้น" size="small" color="success" icon={<CheckCircleIcon />} />
          : <Chip label="รอดำเนินการ" size="small" color="warning" icon={<HourglassEmptyIcon />} />,
    },
    {
      field: 'note',
      headerName: 'หมายเหตุ',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => <Typography noWrap>{String(params.value || '-')}</Typography>,
    },
    {
      field: 'actions',
      headerName: 'จัดการ',
      minWidth: 110,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(String(params.row._id))}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageContainer title="ไฟล์ลูกค้า (Storage)">
      <Stack spacing={2}>
        {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

        <Card sx={{ p: 2.2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} justifyContent="space-between">
            <TextField
              size="small"
              placeholder="ค้นหาจากชื่อลูกค้า เบอร์โทร ประเภทงาน..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ width: { xs: '100%', sm: 360 } }}
            />
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUploads} disabled={loading}>
              Refresh
            </Button>
          </Stack>
        </Card>

        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          {loading && <LinearProgress />}
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid        
              rows={filteredRows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
              sx={{ border: 'none' }}
            />
          </Box>
        </Card>
      </Stack>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ m: 0, p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>แก้ไขข้อมูลลูกค้า</Typography>
            <IconButton onClick={() => setEditOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="ชื่อลูกค้า" fullWidth value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            <TextField label="เบอร์โทร" fullWidth value={phone} onChange={(event) => setPhone(event.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="status-label">สถานะ</InputLabel>
              <Select labelId="status-label" value={status} label="สถานะ" onChange={(event) => setStatus(event.target.value as StatusType)}>
                <MenuItem value="pending">รอดำเนินการ</MenuItem>
                <MenuItem value="completed">เสร็จสิ้น</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}
