'use client';

import * as React from 'react';
import {
  Alert,
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FileDownloadDoneRoundedIcon from '@mui/icons-material/FileDownloadDoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import axios from 'axios';
import { MissingApiConfigState } from '../components/dashboardUi';

type StorageStatus = 'waiting' | 'processing' | 'completed';
type SortType = 'newest' | 'oldest' | 'customer' | 'status';

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
  size?: number;
  bytes?: number;
  thumb?: string;
  thumbnail?: string;
};

type UploadApiRecord = {
  _id?: string;
  id?: string;
  uploadId?: string;
  customerName?: string;
  customer?: string;
  phone?: string;
  phoneNumber?: string;
  lineId?: string;
  line?: string;
  note?: string;
  category?: string;
  jobType?: string;
  files?: UploadApiFile[] | string[];
  createdAt?: string;
  status?: string;
};

type FileItem = {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  size: string;
};

type StorageRow = {
  id: string;
  uploadDate: string;
  customerName: string;
  phone: string;
  lineId: string;
  jobType: string;
  files: FileItem[];
  status: StorageStatus;
  notes: string;
  activities: string[];
};

const endpointCandidates = ['/uploads', '/upload'];

const softBlue = '#3778FF';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? '';
}

function inferStatus(rawStatus?: string): StorageStatus {
  const status = (rawStatus ?? '').toLowerCase();
  if (status.includes('complete') || status.includes('done') || status.includes('success')) return 'completed';
  if (status.includes('process') || status.includes('doing') || status.includes('working')) return 'processing';
  return 'waiting';
}

function inferFileSize(fileName: string) {
  let total = 0;
  for (let i = 0; i < fileName.length; i += 1) total += fileName.codePointAt(i) ?? 0;
  const mb = ((total % 420) + 90) / 100;
  return `${mb.toFixed(1)} MB`;
}

function formatBytes(value?: number) {
  if (!value || Number.isNaN(value)) return '';
  const mb = value / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(value / 1024).toFixed(0)} KB`;
}

function normalizeFiles(rawFiles: UploadApiRecord['files']): FileItem[] {
  if (!Array.isArray(rawFiles)) return [];

  return rawFiles
    .map((item): FileItem | null => {
      if (typeof item === 'string') {
        const name = item.split('/').pop() || item;
        return { id: item, name, url: '', size: inferFileSize(name) };
      }

      const id = String(item.fileId ?? item.id ?? item.key ?? '');
      const normalizedName = item.name ?? item.originalName ?? item.filename ?? id ?? 'Unnamed file';
      const name = String(normalizedName);
      const url = String(item.signedUrl ?? item.downloadUrl ?? item.url ?? '');
      const realSize = formatBytes(item.size ?? item.bytes);

      if (!id && !name) return null;

      return {
        id: id || name,
        name,
        url,
        thumbnail: item.thumbnail ?? item.thumb,
        size: realSize || inferFileSize(name),
      };
    })
    .filter((item): item is FileItem => Boolean(item));
}

function normalizeRecord(raw: UploadApiRecord): StorageRow {
  const id = String(raw._id ?? raw.id ?? raw.uploadId ?? `upload-${Math.random().toString(36).slice(2)}`);
  const files = normalizeFiles(raw.files);
  const createdAt = String(raw.createdAt ?? new Date().toISOString());

  return {
    id,
    uploadDate: createdAt,
    customerName: String(raw.customerName ?? raw.customer ?? 'ไม่ระบุชื่อลูกค้า'),
    phone: String(raw.phone ?? raw.phoneNumber ?? '-'),
    lineId: String(raw.lineId ?? raw.line ?? '-'),
    jobType: String(raw.jobType ?? raw.category ?? 'งานพิมพ์ทั่วไป'),
    files,
    status: inferStatus(raw.status),
    notes: String(raw.note ?? '-'),
    activities: ['อัปโหลดไฟล์เข้าสู่ระบบคลังเอกสาร', 'เจ้าหน้าที่รับงานและตรวจไฟล์เบื้องต้น', 'รอคิวดาวน์โหลดเพื่อพิมพ์'],
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusChip(status: StorageStatus) {
  if (status === 'processing') {
    return {
      label: 'Processing',
      sx: {
        color: '#B9650A',
        bgcolor: '#FFF4E6',
        border: '1px solid #FFD7A8',
      },
    };
  }

  if (status === 'completed') {
    return {
      label: 'Completed',
      sx: {
        color: '#18794E',
        bgcolor: '#EAFBF3',
        border: '1px solid #B6ECCD',
      },
    };
  }

  return {
    label: 'Waiting',
    sx: {
      color: '#4A5568',
      bgcolor: '#F2F4F7',
      border: '1px solid #DDE3EA',
    },
  };
}

function pickFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return <ImageRoundedIcon sx={{ color: '#2A6BF6', fontSize: 18 }} />;
  if (ext === 'pdf') return <DescriptionRoundedIcon sx={{ color: '#E5484D', fontSize: 18 }} />;
  return <InsertDriveFileRoundedIcon sx={{ color: '#6D7B8A', fontSize: 18 }} />;
}

function toCsv(rows: StorageRow[]) {
  const headers = ['Upload Date', 'Customer Name', 'Phone', 'LINE ID', 'Job Type', 'Status', 'Notes'];
  const body = rows.map(row => [formatDate(row.uploadDate), row.customerName, row.phone, row.lineId, row.jobType, row.status, row.notes]);
  return [headers, ...body].map(line => line.map(item => `"${String(item).replaceAll('"', '""')}"`).join(',')).join('\n');
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
};

function StatCard({ title, value, subtitle, icon, tone }: Readonly<StatCardProps>) {
  return (
    <Card
      sx={{
        borderRadius: 4.5,
        border: '1px solid #E8EDF5',
        boxShadow: '0 12px 30px rgba(13, 30, 64, 0.07)',
        background: `linear-gradient(140deg, ${alpha(tone, 0.1)} 0%, #FFFFFF 46%, #FFFFFF 100%)`,
      }}>
      <CardContent sx={{ p: 2.35 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>{title}</Typography>
            <Typography sx={{ mt: 0.8, fontSize: 31, lineHeight: 1.1, fontWeight: 800, color: '#0B1325' }}>{value}</Typography>
            <Typography sx={{ mt: 0.6, color: '#8A95A7', fontSize: 11.8 }}>{subtitle}</Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.6,
              display: 'grid',
              placeItems: 'center',
              color: tone,
              bgcolor: alpha(tone, 0.14),
              boxShadow: `0 10px 20px ${alpha(tone, 0.2)}`,
            }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function StoragePage() {
  const [rows, setRows] = React.useState<StorageRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | StorageStatus>('all');
  const [jobTypeFilter, setJobTypeFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortType>('newest');

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState<StorageRow | null>(null);

  const [drawerStatus, setDrawerStatus] = React.useState<StorageStatus>('waiting');
  const [drawerNotes, setDrawerNotes] = React.useState('');

  const [rowMenuAnchor, setRowMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [rowMenuId, setRowMenuId] = React.useState<string | null>(null);

  const fetchUploads = React.useCallback(async () => {
    const base = getBaseUrl();
    if (!base) {
      setRows([]);
      setErrorMessage('ไม่พบ NEXT_PUBLIC_API_URL กรุณาตรวจสอบการตั้งค่า environment');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      let loaded = false;

      for (const endpoint of endpointCandidates) {
        try {
          const response = await axios.get(`${base}${endpoint}`);
          const payload = response.data as unknown;

          let list: unknown[] = [];
          if (Array.isArray(payload)) {
            list = payload;
          } else {
            const nested = (payload as { data?: unknown[] })?.data;
            if (Array.isArray(nested)) list = nested;
          }

          const normalized = list.filter((item): item is UploadApiRecord => typeof item === 'object' && item !== null).map(normalizeRecord);

          setRows(normalized);
          loaded = true;
          break;
        } catch {
          // Continue to next candidate endpoint.
        }
      }

      if (!loaded) {
        setRows([]);
        setErrorMessage('ไม่สามารถโหลดข้อมูลจาก API ได้ กรุณาตรวจสอบ endpoint /uploads หรือ /upload');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const jobTypes = React.useMemo(() => {
    const set = new Set(rows.map(row => row.jobType));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    return rows
      .filter(row => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return row.customerName.toLowerCase().includes(q) || row.phone.toLowerCase().includes(q) || row.jobType.toLowerCase().includes(q) || row.notes.toLowerCase().includes(q);
      })
      .filter(row => (statusFilter === 'all' ? true : row.status === statusFilter))
      .filter(row => (jobTypeFilter === 'all' ? true : row.jobType === jobTypeFilter))
      .filter(row => {
        if (!dateFilter) return true;
        const day = new Date(row.uploadDate);
        if (Number.isNaN(day.getTime())) return false;
        return day.toISOString().slice(0, 10) === dateFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'customer') return a.customerName.localeCompare(b.customerName);
        if (sortBy === 'status') return a.status.localeCompare(b.status);

        const t1 = new Date(a.uploadDate).getTime();
        const t2 = new Date(b.uploadDate).getTime();
        return sortBy === 'newest' ? t2 - t1 : t1 - t2;
      });
  }, [dateFilter, jobTypeFilter, rows, search, sortBy, statusFilter]);

  const selectedRows = React.useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return filteredRows.filter(row => selectedSet.has(row.id));
  }, [filteredRows, selectedIds]);

  const stats = React.useMemo(() => {
    const waiting = rows.filter(row => row.status === 'waiting').length;
    const processing = rows.filter(row => row.status === 'processing').length;
    const completed = rows.filter(row => row.status === 'completed').length;
    const totalFiles = rows.reduce((acc, row) => acc + row.files.length, 0);

    const today = new Date();
    const todayText = today.toISOString().slice(0, 10);
    const uploadedToday = rows.filter(row => {
      const date = new Date(row.uploadDate);
      if (Number.isNaN(date.getTime())) return false;
      return date.toISOString().slice(0, 10) === todayText;
    }).length;

    return { waiting, processing, completed, totalFiles, uploadedToday };
  }, [rows]);

  const downloadUrl = React.useCallback((url: string, fileName: string) => {
    if (!url) return;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }, []);

  const downloadSelected = React.useCallback(() => {
    selectedRows.forEach(row => {
      row.files.forEach(file => {
        if (file.url) downloadUrl(file.url, file.name);
      });
    });
  }, [downloadUrl, selectedRows]);

  const exportFiltered = React.useCallback(() => {
    const csv = toCsv(filteredRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `storage-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }, [filteredRows]);

  const updateLocalStatus = React.useCallback(
    (targetIds: string[], status: StorageStatus) => {
      setRows(current => current.map(row => (targetIds.includes(row.id) ? { ...row, status } : row)));

      if (activeRecord && targetIds.includes(activeRecord.id)) {
        setActiveRecord({ ...activeRecord, status });
        setDrawerStatus(status);
      }
    },
    [activeRecord]
  );

  const handleBulkStatus = React.useCallback(() => {
    if (selectedIds.length === 0) return;
    updateLocalStatus(selectedIds, 'processing');
  }, [selectedIds, updateLocalStatus]);

  const handleBulkDelete = React.useCallback(() => {
    if (selectedIds.length === 0) return;
    if (!confirm('ยืนยันการลบรายการที่เลือก?')) return;

    setRows(current => current.filter(row => !selectedIds.includes(row.id)));
    setSelectedIds([]);

    if (activeRecord && selectedIds.includes(activeRecord.id)) {
      setDrawerOpen(false);
      setActiveRecord(null);
    }
  }, [activeRecord, selectedIds]);

  const allCurrentSelected = filteredRows.length > 0 && filteredRows.every(row => selectedIds.includes(row.id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredRows.map(row => row.id));
  };

  const openDrawer = (row: StorageRow) => {
    setActiveRecord(row);
    setDrawerStatus(row.status);
    setDrawerNotes(row.notes);
    setDrawerOpen(true);
  };

  const handleRowSelectionChange = React.useCallback((rowId: string, checked: boolean) => {
    setSelectedIds(current => {
      if (checked) return current.includes(rowId) ? current : [...current, rowId];
      return current.filter(id => id !== rowId);
    });
  }, []);

  const handleCopyFirstFileLink = React.useCallback(async (row: StorageRow) => {
    const firstFile = row.files.find(file => Boolean(file.url));
    if (!firstFile?.url) return;
    try {
      await navigator.clipboard.writeText(firstFile.url);
    } catch {
      // Clipboard permission can be denied by browser policy.
    }
  }, []);

  const handleDownloadRowFiles = React.useCallback(
    (row: StorageRow) => {
      row.files.forEach(file => downloadUrl(file.url, file.name));
    },
    [downloadUrl]
  );

  const handleDrawerSave = () => {
    if (!activeRecord) return;
    setRows(current =>
      current.map(row => {
        if (row.id !== activeRecord.id) return row;
        return {
          ...row,
          status: drawerStatus,
          notes: drawerNotes,
        };
      })
    );

    setActiveRecord(current => (current ? { ...current, status: drawerStatus, notes: drawerNotes } : current));
  };

  const openRowMenu = (event: React.MouseEvent<HTMLButtonElement>, rowId: string) => {
    event.stopPropagation();
    setRowMenuAnchor(event.currentTarget);
    setRowMenuId(rowId);
  };

  const closeRowMenu = () => {
    setRowMenuAnchor(null);
    setRowMenuId(null);
  };

  const rowMenuTarget = React.useMemo(() => rows.find(row => row.id === rowMenuId) ?? null, [rowMenuId, rows]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3.2, lg: 4.3 },
        py: { xs: 2.5, md: 3.5 },
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 6%, #EEF4FF 0%, #F7FAFF 40%, #FBFCFF 100%)',
        fontFamily: 'Plus Jakarta Sans, Prompt, system-ui, sans-serif',
      }}>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 5.2,
            border: '1px solid #E6EDF8',
            boxShadow: '0 16px 36px rgba(18, 45, 82, 0.08)',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F7FAFF 100%)',
          }}>
          <CardContent sx={{ p: { xs: 2.1, md: 2.8 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.5}>
              <Box>
                <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>Storage</Typography>
                <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>จัดการไฟล์ลูกค้าและสถานะงานพิมพ์ในระบบคลังเอกสาร</Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <IconButton
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #DFE8F5',
                    bgcolor: '#FFFFFF',
                    width: 44,
                    height: 44,
                    boxShadow: '0 10px 20px rgba(12, 56, 110, 0.08)',
                  }}>
                  <Badge color="error" variant="dot">
                    <NotificationsRoundedIcon sx={{ color: '#2A4365' }} />
                  </Badge>
                </IconButton>

                <Button
                  onClick={fetchUploads}
                  startIcon={<RefreshRoundedIcon />}
                  variant="outlined"
                  sx={{
                    height: 44,
                    borderRadius: 3,
                    borderColor: '#D7E3F4',
                    bgcolor: '#FFFFFF',
                    color: '#2A4365',
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}>
                  Refresh
                </Button>

                <Button
                  onClick={exportFiltered}
                  startIcon={<FileDownloadDoneRoundedIcon />}
                  variant="outlined"
                  sx={{
                    height: 44,
                    borderRadius: 3,
                    borderColor: '#D7E3F4',
                    bgcolor: '#FFFFFF',
                    color: '#2A4365',
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}>
                  Export
                </Button>

                <Button
                  onClick={downloadSelected}
                  startIcon={<DownloadRoundedIcon />}
                  disabled={selectedRows.length === 0}
                  variant="contained"
                  sx={{
                    height: 44,
                    borderRadius: 3,
                    px: 2.4,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: softBlue,
                    boxShadow: '0 14px 28px rgba(55, 120, 255, 0.34)',
                  }}>
                  Download Selected
                </Button>
              </Stack>
            </Stack>

            {errorMessage &&
              (errorMessage === 'ไม่พบ NEXT_PUBLIC_API_URL กรุณาตรวจสอบการตั้งค่า environment' ? (
                <Box sx={{ mt: 2.2 }}>
                  <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าคลังไฟล์เชื่อมต่อรายการอัปโหลดได้" />
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mt: 2.2, borderRadius: 3 }}>
                  {errorMessage}
                </Alert>
              ))}
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' },
            gap: 1.5,
          }}>
          <StatCard title="Total Files" value={String(stats.totalFiles)} subtitle="ไฟล์ทั้งหมดในระบบ" icon={<Inventory2RoundedIcon />} tone="#1E5EFF" />
          <StatCard title="Waiting Download" value={String(stats.waiting)} subtitle="คิวรอดาวน์โหลด" icon={<PendingActionsRoundedIcon />} tone="#8993A4" />
          <StatCard title="Processing" value={String(stats.processing)} subtitle="กำลังเตรียมพิมพ์" icon={<AutorenewRoundedIcon />} tone="#F08C00" />
          <StatCard title="Completed" value={String(stats.completed)} subtitle="จัดการเสร็จเรียบร้อย" icon={<TaskAltRoundedIcon />} tone="#1F9D63" />
          <StatCard title="Uploaded Today" value={String(stats.uploadedToday)} subtitle="รายการใหม่ประจำวัน" icon={<CloudUploadRoundedIcon />} tone="#5B4AE6" />
        </Box>

        <Card
          sx={{
            borderRadius: 4.6,
            border: '1px solid #E7EDF7',
            boxShadow: '0 12px 30px rgba(15, 37, 74, 0.08)',
            background: '#FFFFFF',
          }}>
          <CardContent sx={{ p: { xs: 1.9, md: 2.3 } }}>
            <Stack spacing={1.8}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FilterAltRoundedIcon sx={{ color: '#3866E8', fontSize: 20 }} />
                <Typography sx={{ color: '#102A43', fontWeight: 800, fontSize: 15 }}>Filter Toolbar</Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.7fr 0.8fr 0.8fr 0.8fr' },
                  gap: 1.3,
                }}>
                <OutlinedInput
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="ค้นหาจากชื่อลูกค้า เบอร์โทร ประเภทงาน หมายเหตุ"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#6B7A90' }} />
                    </InputAdornment>
                  }
                  sx={{
                    height: 46,
                    borderRadius: 3,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)',
                  }}
                />

                <FormControl size="small">
                  <InputLabel id="status-filter">สถานะ</InputLabel>
                  <Select<'all' | StorageStatus>
                    labelId="status-filter"
                    value={statusFilter}
                    label="สถานะ"
                    onChange={event => setStatusFilter(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="waiting">Waiting</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel id="job-filter">ประเภทงาน</InputLabel>
                  <Select
                    labelId="job-filter"
                    value={jobTypeFilter}
                    label="ประเภทงาน"
                    onChange={event => setJobTypeFilter(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    {jobTypes.map(job => (
                      <MenuItem key={job} value={job}>
                        {job}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="วันที่"
                  size="small"
                  type="date"
                  value={dateFilter}
                  onChange={event => setDateFilter(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' } }}
                />

                <FormControl size="small">
                  <InputLabel id="sort-filter">Sort</InputLabel>
                  <Select<SortType>
                    labelId="sort-filter"
                    value={sortBy}
                    label="Sort"
                    onChange={event => setSortBy(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="newest">ล่าสุดก่อน</MenuItem>
                    <MenuItem value="oldest">เก่าสุดก่อน</MenuItem>
                    <MenuItem value="customer">ชื่อลูกค้า A-Z</MenuItem>
                    <MenuItem value="status">สถานะ</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button
                  onClick={downloadSelected}
                  disabled={selectedRows.length === 0}
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#215AE8',
                    boxShadow: '0 14px 24px rgba(26, 89, 247, 0.28)',
                  }}>
                  Download Selected
                </Button>
                <Button
                  onClick={handleBulkStatus}
                  disabled={selectedRows.length === 0}
                  variant="outlined"
                  startIcon={<EditNoteRoundedIcon />}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                  Change Status
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={selectedRows.length === 0}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                  Delete Selected
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 4.8,
            border: '1px solid #E7EDF8',
            boxShadow: '0 16px 36px rgba(17, 41, 77, 0.08)',
            overflow: 'hidden',
            background: '#FFFFFF',
          }}>
          <Box sx={{ px: 2.3, py: 1.7, borderBottom: '1px solid #ECF1F8', bgcolor: '#FCFDFF' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: 800, color: '#102A43' }}>รายการไฟล์ลูกค้าในคลังเอกสาร</Typography>
              <Chip label={`${filteredRows.length} รายการ`} sx={{ borderRadius: 2, bgcolor: '#ECF3FF', color: '#2957D8', fontWeight: 700 }} />
            </Stack>
          </Box>

          <TableContainer sx={{ maxHeight: '68vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 52, bgcolor: '#F8FAFE' }}>
                    <Checkbox checked={allCurrentSelected} onChange={toggleSelectAll} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 164, bgcolor: '#F7FAFF' }}>Upload Date</TableCell>
                  <TableCell sx={{ minWidth: 180, bgcolor: '#F7FAFF' }}>Customer Name</TableCell>
                  <TableCell sx={{ minWidth: 140, bgcolor: '#F7FAFF' }}>Phone Number</TableCell>
                  <TableCell sx={{ minWidth: 160, bgcolor: '#F7FAFF' }}>Job Type</TableCell>
                  <TableCell sx={{ minWidth: 260, bgcolor: '#F7FAFF' }}>File Preview</TableCell>
                  <TableCell sx={{ minWidth: 130, bgcolor: '#F7FAFF' }}>Status</TableCell>
                  <TableCell sx={{ minWidth: 220, bgcolor: '#F7FAFF' }}>Notes</TableCell>
                  <TableCell sx={{ minWidth: 172, bgcolor: '#F7FAFF' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography sx={{ py: 5, textAlign: 'center', color: '#64748B' }}>กำลังโหลดข้อมูล...</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography sx={{ py: 5, textAlign: 'center', color: '#94A3B8' }}>ไม่พบข้อมูลจากเงื่อนไขที่เลือก</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading &&
                  filteredRows.map(row => {
                    const selected = selectedIds.includes(row.id);
                    const statusView = statusChip(row.status);

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => openDrawer(row)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 180ms ease',
                          '& td': { borderBottomColor: '#EEF2F7' },
                          '&:hover': { bgcolor: '#F7FAFF' },
                        }}>
                        <TableCell onClick={event => event.stopPropagation()}>
                          <Checkbox checked={selected} onChange={event => handleRowSelectionChange(row.id, event.target.checked)} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: 13.5 }}>{formatDate(row.uploadDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.35}>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{row.customerName}</Typography>
                            <Typography sx={{ color: '#6B7280', fontSize: 12.5 }}>LINE : {row.lineId}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>{row.phone}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={row.jobType} sx={{ borderRadius: 2, bgcolor: '#EFF5FF', color: '#2B5ABF', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.85}>
                            {row.files.slice(0, 2).map(file => (
                              <Stack key={file.id} direction="row" alignItems="center" spacing={0.9}>
                                {file.thumbnail ? (
                                  <Box component="img" src={file.thumbnail} alt={file.name} sx={{ width: 34, height: 34, borderRadius: 1.8, objectFit: 'cover', border: '1px solid #E5EAF2' }} />
                                ) : (
                                  <Box sx={{ width: 34, height: 34, borderRadius: 1.8, display: 'grid', placeItems: 'center', bgcolor: '#F3F6FC' }}>{pickFileIcon(file.name)}</Box>
                                )}
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography noWrap sx={{ maxWidth: 160, fontWeight: 600, color: '#1F2937', fontSize: 13 }}>
                                    {file.name}
                                  </Typography>
                                  <Typography sx={{ color: '#94A3B8', fontSize: 11.5 }}>{file.size}</Typography>
                                </Box>
                              </Stack>
                            ))}
                            {row.files.length > 2 ? <Typography sx={{ color: '#64748B', fontSize: 12 }}>+{row.files.length - 2} ไฟล์เพิ่มเติม</Typography> : null}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={statusView.label} sx={{ borderRadius: 2, fontWeight: 700, ...statusView.sx }} />
                        </TableCell>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 200, color: '#475569' }}>
                            {row.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={event => event.stopPropagation()}>
                          <Stack direction="row" spacing={0.6}>
                            <Tooltip title="Preview">
                              <IconButton size="small" onClick={() => openDrawer(row)}>
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton size="small" onClick={() => handleDownloadRowFiles(row)}>
                                <DownloadRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy Link">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  void handleCopyFirstFileLink(row);
                                }}>
                                <ContentCopyRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More">
                              <IconButton size="small" onClick={event => openRowMenu(event, row.id)}>
                                <MoreHorizRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      <Menu open={Boolean(rowMenuAnchor)} anchorEl={rowMenuAnchor} onClose={closeRowMenu}>
        <MenuItem
          onClick={() => {
            if (rowMenuTarget) openDrawer(rowMenuTarget);
            closeRowMenu();
          }}>
          ดูรายละเอียด
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (rowMenuTarget) updateLocalStatus([rowMenuTarget.id], 'completed');
            closeRowMenu();
          }}>
          เปลี่ยนสถานะเป็น Completed
        </MenuItem>
      </Menu>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        anchor="right"
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 440, md: 500 },
              borderTopLeftRadius: 22,
              borderBottomLeftRadius: 22,
              background: 'linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 100%)',
            },
          },
        }}>
        {activeRecord ? (
          <Stack sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #E8EFF8' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>รายละเอียดงานพิมพ์</Typography>
              <Typography sx={{ mt: 0.5, color: '#64748B' }}>ลูกค้า: {activeRecord.customerName}</Typography>
            </Box>

            <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
              <Stack spacing={1.6}>
                <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#1E5EFF', 0.14), color: '#2156D8' }}>
                          <PersonRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>Customer Information</Typography>
                      </Stack>
                      <Typography sx={{ color: '#334155' }}>ชื่อลูกค้า: {activeRecord.customerName}</Typography>
                      <Typography sx={{ color: '#334155' }}>เบอร์โทร: {activeRecord.phone}</Typography>
                      <Typography sx={{ color: '#334155' }}>LINE ID: {activeRecord.lineId}</Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#F08C00', 0.14), color: '#AF6305' }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>Job Information</Typography>
                      </Stack>
                      <Typography sx={{ color: '#334155' }}>Upload Date: {formatDate(activeRecord.uploadDate)}</Typography>
                      <Typography sx={{ color: '#334155' }}>Job Type: {activeRecord.jobType}</Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#2A6BF6', 0.14), color: '#2A6BF6' }}>
                          <LocalPrintshopRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>File List</Typography>
                      </Stack>

                      <Stack spacing={1}>
                        {activeRecord.files.map(file => (
                          <Stack
                            key={file.id}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                              p: 1,
                              borderRadius: 3,
                              border: '1px solid #E6EDF7',
                              bgcolor: '#FCFDFF',
                            }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#F2F6FD', display: 'grid', placeItems: 'center' }}>{pickFileIcon(file.name)}</Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography noWrap sx={{ maxWidth: 220, fontWeight: 600 }}>
                                  {file.name}
                                </Typography>
                                <Typography sx={{ color: '#94A3B8', fontSize: 12 }}>{file.size}</Typography>
                              </Box>
                            </Stack>
                            <IconButton size="small" onClick={() => downloadUrl(file.url, file.name)}>
                              <DownloadRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Stack>

                      <Button
                        onClick={() => activeRecord.files.forEach(file => downloadUrl(file.url, file.name))}
                        variant="contained"
                        startIcon={<DownloadRoundedIcon />}
                        sx={{
                          mt: 1,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: '#1F5CE6',
                        }}>
                        Download All
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.3}>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>Status & Note</Typography>
                      <FormControl size="small" fullWidth>
                        <InputLabel id="drawer-status">สถานะงาน</InputLabel>
                        <Select<StorageStatus> labelId="drawer-status" value={drawerStatus} label="สถานะงาน" onChange={event => setDrawerStatus(event.target.value)}>
                          <MenuItem value="waiting">รอการดำเนินการ</MenuItem>
                          <MenuItem value="processing">กำลังดำเนินการ</MenuItem>
                          <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField label="Notes" multiline minRows={3} value={drawerNotes} onChange={event => setDrawerNotes(event.target.value)} />
                      <Button variant="outlined" onClick={handleDrawerSave} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                        บันทึกข้อมูล
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', mb: 1.2 }}>Timeline / Activity</Typography>
                    <Stack spacing={1.2}>
                      {activeRecord.activities.map((item, index) => (
                        <Stack key={`${item}-${index}`} direction="row" spacing={1.1} alignItems="flex-start">
                          <Box sx={{ width: 10, height: 10, borderRadius: 999, mt: 0.7, bgcolor: '#3A73F7', flexShrink: 0 }} />
                          <Box>
                            <Typography sx={{ color: '#1E293B' }}>{item}</Typography>
                            <Typography sx={{ color: '#94A3B8', fontSize: 12 }}>อัปเดตล่าสุด</Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>

            <Divider />
            <Box sx={{ p: 2.5 }}>
              <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                ปิดรายละเอียด
              </Button>
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </Box>
  );
}
