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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FileDownloadDoneRoundedIcon from '@mui/icons-material/FileDownloadDoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
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
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import axios from 'axios';
import JobTimelineCard, { type JobTimelineCardItem } from '../components/JobTimelineCard';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import { getApiBaseUrl, isMissingApiBaseError } from '../../../lib/api';
import { groupStorageRows, normalizeRecord, type StorageRow, type StorageStatus, type UploadApiRecord } from './normalizers';

type SortType = 'newest' | 'oldest' | 'customer' | 'status';

type StorageRowPatch = {
  status?: StorageStatus;
  notes?: string;
};

const endpointCandidates = ['/uploads', '/upload'];

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function readErrorMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();

  if (Array.isArray(value)) {
    const messages = value.map(readErrorMessage).filter((item): item is string => Boolean(item));
    return messages.length > 0 ? messages.join(', ') : null;
  }

  if (value && typeof value === 'object') {
    const objectValue = value as { message?: unknown; error?: unknown };
    return readErrorMessage(objectValue.message) ?? readErrorMessage(objectValue.error);
  }

  return null;
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return readErrorMessage(error.response?.data) ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function isMissingMutationEndpoint(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  const message = readErrorMessage(error.response?.data) ?? error.message ?? '';
  return status === 404 && /cannot\s+(patch|delete)\s+\/uploads?/i.test(message);
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

function formatLastSynced(date: Date | null) {
  if (!date) return '-';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatThaiFullDate(date: Date | null) {
  if (!date) return 'ไม่มีวันที่';
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

function storageStatusLabel(status: StorageStatus) {
  if (status === 'pending') return 'รอดำเนินการ';
  if (status === 'completed') return 'เสร็จสิ้น';
  return 'รอดาวน์โหลด';
}

function getStorageStatusPresentation(status: StorageStatus) {
  if (status === 'pending') {
    return {
      label: storageStatusLabel(status),
      description: 'กำลังตรวจสอบไฟล์และเตรียมลำดับงานพิมพ์',
      accent: '#1E5EFF',
      border: '#BFDBFE',
      softBg: '#F6FAFF',
      gradient: 'linear-gradient(135deg, #F6FAFF 0%, #EEF6FF 100%)',
      icon: <LocalPrintshopRoundedIcon sx={{ fontSize: 28 }} />,
    };
  }

  if (status === 'completed') {
    return {
      label: storageStatusLabel(status),
      description: 'ดำเนินการครบถ้วนและพร้อมใช้งานในขั้นตอนถัดไป',
      accent: '#10B981',
      border: '#A7F3D0',
      softBg: '#ECFDF5',
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #F4FFF9 100%)',
      icon: <Inventory2RoundedIcon sx={{ fontSize: 28 }} />,
    };
  }

  return {
    label: storageStatusLabel(status),
    description: 'ไฟล์อยู่ในคิวรอหยิบไปดำเนินการและตรวจสอบต่อ',
    accent: '#F59E0B',
    border: '#FED7AA',
    softBg: '#FFF7E8',
    gradient: 'linear-gradient(135deg, #FFF7E8 0%, #FFFDF7 100%)',
    icon: <AccessTimeRoundedIcon sx={{ fontSize: 28 }} />,
  };
}

function statusChip(status: StorageStatus) {
  if (status === 'pending') {
    return {
      label: storageStatusLabel(status),
      sx: {
        color: '#9A5B00',
        bgcolor: '#FFF1DB',
        border: '1px solid #F6C97A',
      },
    };
  }

  if (status === 'completed') {
    return {
      label: storageStatusLabel(status),
      sx: {
        color: '#0F6B46',
        bgcolor: '#E8F8EF',
        border: '1px solid #9EDCBD',
      },
    };
  }

  return {
    label: storageStatusLabel(status),
    sx: {
      color: '#475467',
      bgcolor: '#F5F7FA',
      border: '1px solid #D8E0EA',
    },
  };
}

function buildStorageTimelineItems(record: StorageRow): JobTimelineCardItem[] {
  let activeIndex = 0;

  if (record.status === 'pending') {
    activeIndex = 1;
  } else if (record.status === 'completed') {
    activeIndex = 2;
  }
  const titles = ['อัปโหลดไฟล์เข้าสู่ระบบคลังเอกสาร', 'เจ้าหน้าที่รับงานและตรวจไฟล์เบื้องต้น', 'รอคิวดาวน์โหลดเพื่อพิมพ์'] as const;
  const subtitles = [
    activeIndex === 0 ? 'อัปเดตล่าสุดในระบบ' : 'บันทึกไว้ในลำดับงานก่อนหน้า',
    activeIndex === 1 ? 'กำลังตรวจสอบไฟล์และเตรียมดำเนินการ' : 'บันทึกไว้ในลำดับงานก่อนหน้า',
    activeIndex === 2 ? 'ดำเนินการครบตามขั้นตอนและพร้อมใช้งาน' : 'บันทึกไว้ในลำดับงานก่อนหน้า',
  ] as const;
  const icons = [
    <CloudUploadRoundedIcon key="upload" sx={{ fontSize: 18 }} />,
    <TaskAltRoundedIcon key="check" sx={{ fontSize: 18 }} />,
    <LocalPrintshopRoundedIcon key="print" sx={{ fontSize: 18 }} />,
  ] as const;

  return titles.map((title, index) => ({
    id: `${record.id}-timeline-${index}`,
    title,
    subtitle: subtitles[index],
    icon: icons[index],
    active: index === activeIndex,
    pillLabel: index === activeIndex ? 'ล่าสุด' : `ขั้นตอน ${index + 1}`,
  }));
}

function toPersistedUploadStatus(status: StorageStatus): 'pending' | 'completed' {
  return status === 'completed' ? 'completed' : 'pending';
}

function toEditableStorageStatus(status: StorageStatus): StorageStatus {
  return status;
}

function jobTypeChipSx(jobType: string) {
  const normalized = jobType.toLowerCase();

  if (normalized.includes('sticker')) {
    return {
      color: '#8A3FFC',
      bgcolor: '#F3E8FF',
      border: '1px solid #D9B8FF',
    };
  }

  if (normalized.includes('banner') || normalized.includes('vinyl')) {
    return {
      color: '#9A3412',
      bgcolor: '#FFF1E8',
      border: '1px solid #F8C9B0',
    };
  }

  if (normalized.includes('business') || normalized.includes('namecard')) {
    return {
      color: '#0F5B7A',
      bgcolor: '#E7F6FD',
      border: '1px solid #B8E4F7',
    };
  }

  if (normalized.includes('packaging') || normalized.includes('binding')) {
    return {
      color: '#166534',
      bgcolor: '#ECFDF3',
      border: '1px solid #BBE7D0',
    };
  }

  return {
    color: '#334155',
    bgcolor: '#EEF2FF',
    border: '1px solid #CFD8F6',
  };
}

function pickFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return <ImageRoundedIcon sx={{ color: '#2A6BF6', fontSize: 18 }} />;
  if (ext === 'pdf') return <DescriptionRoundedIcon sx={{ color: '#E5484D', fontSize: 18 }} />;
  return <InsertDriveFileRoundedIcon sx={{ color: '#6D7B8A', fontSize: 18 }} />;
}

function buildPersistedNote(note: string, batchId?: string, status?: StorageStatus) {
  const trimmed = note.trim();
  let stageMarker = '';

  if (status === 'pending') {
    stageMarker = '[[stage:pending]]';
  } else if (status === 'waiting') {
    stageMarker = '[[stage:waiting-download]]';
  }

  const markers = [batchId ? `[[batch:${batchId}]]` : '', stageMarker].filter(Boolean).join('\n');
  if (!markers) return trimmed;
  return trimmed ? `${trimmed}\n\n${markers}` : markers;
}

function rowContainsAnySourceId(row: Pick<StorageRow, 'sourceIds'>, targetIds: string[]): boolean {
  return row.sourceIds.some(sourceId => targetIds.includes(sourceId));
}

function applyStorageRowPatch(row: StorageRow, patch: StorageRowPatch): StorageRow {
  return {
    ...row,
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
  };
}

function getBulkMutationTargetIds(selectedIds: string[], rowsById: Map<string, StorageRow>): string[] {
  return Array.from(new Set(selectedIds.flatMap(rowId => rowsById.get(rowId)?.sourceIds ?? [rowId])));
}

function matchesStorageSearch(row: StorageRow, query: string): boolean {
  if (!query) {
    return true;
  }

  return row.customerName.toLowerCase().includes(query) || row.phone.toLowerCase().includes(query) || row.jobType.toLowerCase().includes(query) || row.notes.toLowerCase().includes(query);
}

function matchesStorageDateFilter(uploadDate: string, dateFilter: string): boolean {
  if (!dateFilter) {
    return true;
  }

  const day = new Date(uploadDate);
  if (Number.isNaN(day.getTime())) {
    return false;
  }

  return day.toISOString().slice(0, 10) === dateFilter;
}

function compareStorageRows(a: StorageRow, b: StorageRow, sortBy: SortType): number {
  if (sortBy === 'customer') return a.customerName.localeCompare(b.customerName);
  if (sortBy === 'status') return a.status.localeCompare(b.status);

  const t1 = new Date(a.uploadDate).getTime();
  const t2 = new Date(b.uploadDate).getTime();
  return sortBy === 'newest' ? t2 - t1 : t1 - t2;
}

function toStructuredStage(status?: StorageStatus): 'waiting-download' | 'pending' | 'completed' | undefined {
  if (status === 'waiting') return 'waiting-download';
  if (status === 'pending') return 'pending';
  if (status === 'completed') return 'completed';
  return undefined;
}

function toCsv(rows: StorageRow[]) {
  const headers = ['วันที่อัปโหลด', 'ชื่อลูกค้า', 'เบอร์โทร', 'LINE ID', 'ประเภทงาน', 'สถานะ', 'หมายเหตุ'];
  const body = rows.map(row => [formatDate(row.uploadDate), row.customerName, row.phone, row.lineId, row.jobType, storageStatusLabel(row.status), row.notes]);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompactDrawer = useMediaQuery(theme.breakpoints.down('lg'));

  const [rows, setRows] = React.useState<StorageRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [actionMessage, setActionMessage] = React.useState<{ severity: 'success' | 'error'; text: string } | null>(null);
  const [persistingIds, setPersistingIds] = React.useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);
  const [drawerSaving, setDrawerSaving] = React.useState(false);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | StorageStatus>('all');
  const [jobTypeFilter] = React.useState('all');
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
    setLoading(true);
    setErrorMessage(null);
    setMissingApiBase(false);

    try {
      const base = getApiBaseUrl();
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

          const normalized = groupStorageRows(list.filter((item): item is UploadApiRecord => typeof item === 'object' && item !== null).map(normalizeRecord));

          setRows(normalized);
          setLastSyncedAt(new Date());
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
    } catch (error) {
      setRows([]);
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setErrorMessage('ไม่สามารถโหลดข้อมูลจาก API ได้ กรุณาตรวจสอบ endpoint /uploads หรือ /upload');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const trackPersistingIds = React.useCallback((targetIds: string[], active: boolean) => {
    setPersistingIds(current => {
      const next = new Set(current);
      targetIds.forEach(id => {
        if (active) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return Array.from(next);
    });
  }, []);

  const applyRowPatch = React.useCallback(
    (targetIds: string[], patch: StorageRowPatch) => {
      setRows(current =>
        current.map(row => {
          if (!rowContainsAnySourceId(row, targetIds)) return row;
          return applyStorageRowPatch(row, patch);
        })
      );

      setActiveRecord(current => {
        if (current?.sourceIds == null || !rowContainsAnySourceId(current, targetIds)) return current;
        return applyStorageRowPatch(current, patch);
      });

      if (activeRecord?.sourceIds != null && rowContainsAnySourceId(activeRecord, targetIds) && patch.status) {
        setDrawerStatus(patch.status);
      }

      if (activeRecord?.sourceIds != null && rowContainsAnySourceId(activeRecord, targetIds) && patch.notes !== undefined) {
        setDrawerNotes(patch.notes);
      }
    },
    [activeRecord]
  );

  const removeRows = React.useCallback(
    (targetIds: string[]) => {
      setRows(current => current.filter(row => !rowContainsAnySourceId(row, targetIds)));
      setSelectedIds(current => current.filter(id => !targetIds.includes(id)));

      if (activeRecord?.sourceIds != null && rowContainsAnySourceId(activeRecord, targetIds)) {
        setDrawerOpen(false);
        setActiveRecord(null);
      }
    },
    [activeRecord]
  );

  const persistUploadMutation = React.useCallback(async (rowId: string, method: 'patch' | 'delete', payload?: Record<string, unknown>) => {
    const base = getApiBaseUrl();
    let lastError: unknown = null;
    const normalizedPayload =
      method === 'patch' && payload
        ? {
            ...payload,
            ...(typeof payload.status === 'string' ? { status: toPersistedUploadStatus(payload.status as StorageStatus) } : {}),
          }
        : payload;

    for (const endpoint of endpointCandidates) {
      try {
        const url = `${base}${endpoint}/${encodeURIComponent(rowId)}`;
        if (method === 'patch') {
          await axios.patch(url, normalizedPayload);
        } else {
          await axios.delete(url);
        }
        return;
      } catch (error) {
        if (!isMissingMutationEndpoint(error)) {
          throw error;
        }
        lastError = error;
      }
    }

    throw lastError ?? new Error('storage_request_failed');
  }, []);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return rows
      .filter(row => matchesStorageSearch(row, normalizedQuery))
      .filter(row => (statusFilter === 'all' ? true : row.status === statusFilter))
      .filter(row => (jobTypeFilter === 'all' ? true : row.jobType === jobTypeFilter))
      .filter(row => matchesStorageDateFilter(row.uploadDate, dateFilter))
      .sort((a, b) => compareStorageRows(a, b, sortBy));
  }, [dateFilter, jobTypeFilter, rows, search, sortBy, statusFilter]);

  const rowsById = React.useMemo(() => new Map(rows.map(row => [row.id, row])), [rows]);
  const selectedIdSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedRows = React.useMemo(() => {
    return filteredRows.filter(row => selectedIdSet.has(row.id));
  }, [filteredRows, selectedIdSet]);

  const stats = React.useMemo(() => {
    const today = new Date();
    const todayText = today.toISOString().slice(0, 10);
    let waiting = 0;
    let pending = 0;
    let completed = 0;
    let totalFiles = 0;
    let uploadedToday = 0;

    rows.forEach(row => {
      if (row.status === 'waiting') waiting += 1;
      if (row.status === 'pending') pending += 1;
      if (row.status === 'completed') completed += 1;
      totalFiles += row.files.length;

      const date = new Date(row.uploadDate);
      if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === todayText) {
        uploadedToday += 1;
      }
    });

    return { waiting, pending, completed, totalFiles, uploadedToday };
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

  const handleBulkStatus = React.useCallback(async () => {
    if (selectedIds.length === 0) return;

    const targetIds = getBulkMutationTargetIds(selectedIds, rowsById);
    const nextStatus: StorageStatus = 'pending';
    setActionMessage(null);
    setBulkUpdating(true);
    trackPersistingIds(targetIds, true);

    try {
      const results = await Promise.allSettled(targetIds.map(rowId => persistUploadMutation(rowId, 'patch', { status: nextStatus })));
      const succeeded = targetIds.filter((_, index) => results[index]?.status === 'fulfilled');
      const failed = targetIds.length - succeeded.length;

      if (succeeded.length > 0) {
        applyRowPatch(succeeded, { status: nextStatus });
      }

      if (failed > 0) {
        setActionMessage({
          severity: 'error',
          text: `อัปเดตสถานะสำเร็จ ${succeeded.length} จาก ${targetIds.length} รายการ กรุณาลองใหม่สำหรับรายการที่ยังไม่สำเร็จ`,
        });
      } else {
        setActionMessage({ severity: 'success', text: `อัปเดตสถานะ ${targetIds.length} รายการแล้ว` });
      }
    } catch (error) {
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setActionMessage({ severity: 'error', text: getRequestErrorMessage(error, 'ไม่สามารถอัปเดตสถานะงานได้') });
      }
    } finally {
      trackPersistingIds(targetIds, false);
      setBulkUpdating(false);
    }
  }, [applyRowPatch, persistUploadMutation, rowsById, selectedIds, trackPersistingIds]);

  const handleBulkDelete = React.useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('ยืนยันการลบรายการที่เลือก?')) return;

    const targetIds = getBulkMutationTargetIds(selectedIds, rowsById);
    setActionMessage(null);
    setBulkDeleting(true);
    trackPersistingIds(targetIds, true);

    try {
      const results = await Promise.allSettled(targetIds.map(rowId => persistUploadMutation(rowId, 'delete')));
      const succeeded = targetIds.filter((_, index) => results[index]?.status === 'fulfilled');
      const failed = targetIds.length - succeeded.length;

      if (succeeded.length > 0) {
        removeRows(succeeded);
      }

      if (failed > 0) {
        setActionMessage({
          severity: 'error',
          text: `ลบสำเร็จ ${succeeded.length} จาก ${targetIds.length} รายการ กรุณาลองใหม่สำหรับรายการที่ยังไม่สำเร็จ`,
        });
      } else {
        setActionMessage({ severity: 'success', text: `ลบ ${targetIds.length} รายการแล้ว` });
      }
    } catch (error) {
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setActionMessage({ severity: 'error', text: getRequestErrorMessage(error, 'ไม่สามารถลบรายการที่เลือกได้') });
      }
    } finally {
      trackPersistingIds(targetIds, false);
      setBulkDeleting(false);
    }
  }, [persistUploadMutation, removeRows, rowsById, selectedIds, trackPersistingIds]);

  const allCurrentSelected = React.useMemo(() => filteredRows.length > 0 && filteredRows.every(row => selectedIdSet.has(row.id)), [filteredRows, selectedIdSet]);

  const toggleSelectAll = React.useCallback(() => {
    if (allCurrentSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredRows.map(row => row.id));
  }, [allCurrentSelected, filteredRows]);

  const openDrawer = (row: StorageRow) => {
    setActiveRecord(row);
    setDrawerStatus(toEditableStorageStatus(row.status));
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

  const handleDrawerSave = React.useCallback(async () => {
    if (!activeRecord) return;
    const targetIds = activeRecord.sourceIds;
    const nextStatus = toEditableStorageStatus(drawerStatus);
    setActionMessage(null);
    setDrawerSaving(true);
    trackPersistingIds(targetIds, true);

    try {
      await Promise.all(
        targetIds.map(rowId =>
          persistUploadMutation(rowId, 'patch', {
            status: nextStatus,
            note: buildPersistedNote(drawerNotes, activeRecord.batchId, nextStatus),
            statusNote: drawerNotes.trim() || undefined,
            batchId: activeRecord.batchId,
            stage: toStructuredStage(nextStatus),
          })
        )
      );
      applyRowPatch(targetIds, { status: nextStatus, notes: drawerNotes });
      setActionMessage({ severity: 'success', text: 'บันทึกสถานะและหมายเหตุเรียบร้อยแล้ว' });
    } catch (error) {
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setActionMessage({ severity: 'error', text: getRequestErrorMessage(error, 'ไม่สามารถบันทึกสถานะและหมายเหตุได้') });
      }
    } finally {
      trackPersistingIds(targetIds, false);
      setDrawerSaving(false);
    }
  }, [activeRecord, applyRowPatch, drawerNotes, drawerStatus, persistUploadMutation, trackPersistingIds]);

  const openRowMenu = (event: React.MouseEvent<HTMLButtonElement>, rowId: string) => {
    event.stopPropagation();
    setRowMenuAnchor(event.currentTarget);
    setRowMenuId(rowId);
  };

  const closeRowMenu = () => {
    setRowMenuAnchor(null);
    setRowMenuId(null);
  };

  const rowMenuTarget = React.useMemo(() => (rowMenuId ? (rowsById.get(rowMenuId) ?? null) : null), [rowMenuId, rowsById]);
  const drawerStatusView = activeRecord ? getStorageStatusPresentation(drawerStatus) : null;
  const drawerNoteLength = drawerNotes === '-' ? 0 : drawerNotes.length;
  const drawerBusy = Boolean(activeRecord && (drawerSaving || activeRecord.sourceIds.some(sourceId => persistingIds.includes(sourceId))));

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3.2, lg: 4.3 },
        py: { xs: 2.5, md: 3.5 },
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 6%, #EEF4FF 0%, #F7FAFF 40%, #FBFCFF 100%)',
        fontFamily: 'var(--font-sans), "Prompt", "Noto Sans Thai", sans-serif',
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
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
              <Box sx={{ flex: 1, minHeight: { md: 110 } }}>
                <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>Storage</Typography>
                <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>จัดการไฟล์ลูกค้าและสถานะงานพิมพ์ในระบบคลังเอกสาร</Typography>
                <Typography sx={{ mt: 1, color: '#94A3B8', fontSize: 12.5 }}>อัปเดตล่าสุด {formatLastSynced(lastSyncedAt)}</Typography>
                <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 12.5 }}>{formatThaiFullDate(lastSyncedAt)}</Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ minHeight: { md: 110 } }}>
                <IconButton
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #DFE8F5',
                    bgcolor: '#FFFFFF',
                    width: 44,
                    height: 44,
                    boxShadow: '0 10px 20px rgba(12, 56, 110, 0.08)',
                  }}>
                  <Badge
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#E5484D',
                        boxShadow: '0 0 0 2px #FFFFFF',
                      },
                    }}>
                    <NotificationsRoundedIcon sx={{ color: '#2A4365' }} />
                  </Badge>
                </IconButton>

                <Button
                  onClick={fetchUploads}
                  startIcon={<RefreshRoundedIcon />}
                  variant="outlined"
                  sx={{
                    minHeight: 40,
                    borderRadius: 3,
                    borderColor: '#D7E3F4',
                    bgcolor: '#FFFFFF',
                    color: '#2A4365',
                    px: 1.8,
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
                    minHeight: 40,
                    borderRadius: 3,
                    borderColor: '#D7E3F4',
                    bgcolor: '#FFFFFF',
                    color: '#2A4365',
                    px: 1.8,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}>
                  Export
                </Button>

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
                  ดาวน์โหลดที่เลือก
                </Button>
              </Stack>
            </Stack>

            {missingApiBase ? (
              <Box sx={{ mt: 2.2 }}>
                <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าคลังไฟล์เชื่อมต่อรายการอัปโหลดได้" />
              </Box>
            ) : null}

            {errorMessage ? (
              <Alert severity="warning" sx={{ mt: 2.2, borderRadius: 3 }}>
                {errorMessage}
              </Alert>
            ) : null}

            {actionMessage ? (
              <Alert severity={actionMessage.severity} sx={{ mt: 2.2, borderRadius: 3 }}>
                {actionMessage.text}
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' },
            gap: 1.5,
          }}>
          {' '}
          <StatCard title="ไฟล์ทั้งหมด" value={String(stats.totalFiles)} subtitle="จำนวนไฟล์ทั้งหมด" icon={<Inventory2RoundedIcon />} tone="#1E5EFF" />
          <StatCard title="รอดาวน์โหลด" value={String(stats.waiting)} subtitle="ไฟล์ที่รอดาวน์โหลด" icon={<PendingActionsRoundedIcon />} tone="#8993A4" />
          <StatCard title="รอดำเนินการ" value={String(stats.pending)} subtitle="รายการที่รับงานแล้ว" icon={<AutorenewRoundedIcon />} tone="#F08C00" />
          <StatCard title="เสร็จสิ้น" value={String(stats.completed)} subtitle="รายการที่จัดการเรียบร้อย" icon={<TaskAltRoundedIcon />} tone="#1F9D63" />
          <StatCard title="อัปโหลดวันนี้" value={String(stats.uploadedToday)} subtitle="รายการใหม่วันนี้" icon={<CloudUploadRoundedIcon />} tone="#5B4AE6" />
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
                {/* <FilterAltRoundedIcon sx={{ color: '#3866E8', fontSize: 20 }} /> */}
                {/* <Typography sx={{ color: '#102A43', fontWeight: 800, fontSize: 15 }}>Filter Toolbar</Typography> */}
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.7fr) repeat(3, minmax(180px, 0.8fr))' },
                  alignItems: 'end',
                  gap: 1.25,
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
                    minWidth: 0,
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
                    <MenuItem value="waiting">รอดาวน์โหลด</MenuItem>
                    <MenuItem value="pending">รอดำเนินการ</MenuItem>
                    <MenuItem value="completed">เสร็จสิ้น</MenuItem>
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
                  <InputLabel id="sort-filter">เรียงลำดับ</InputLabel>
                  <Select<SortType>
                    labelId="sort-filter"
                    value={sortBy}
                    label="เรียงลำดับ"
                    onChange={event => setSortBy(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="newest">ล่าสุดก่อน</MenuItem>
                    <MenuItem value="oldest">เก่าสุดก่อน</MenuItem>
                    <MenuItem value="customer">ชื่อลูกค้า A-Z</MenuItem>
                    <MenuItem value="status">สถานะ</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2} useFlexGap alignItems={{ xs: 'stretch', lg: 'center' }} justifyContent="space-between">
                <Typography sx={{ ml: 1, fontSize: 12.5, color: '#7B8797', fontWeight: 500 }}>เลือกหลายรายการเพื่อดาวน์โหลด อัปเดตสถานะ หรือลบออกจากรายการ</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
                  <Button
                    onClick={downloadSelected}
                    disabled={selectedRows.length === 0}
                    variant="contained"
                    startIcon={<DownloadRoundedIcon />}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      minWidth: { sm: 156 },
                      bgcolor: '#215AE8',
                      boxShadow: '0 14px 24px rgba(26, 89, 247, 0.28)',
                    }}>
                    ดาวน์โหลดที่เลือก
                  </Button>
                  <Button
                    onClick={() => {
                      void handleBulkStatus();
                    }}
                    disabled={selectedRows.length === 0 || bulkUpdating || bulkDeleting}
                    variant="outlined"
                    startIcon={<EditNoteRoundedIcon />}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, minWidth: { sm: 180 } }}>
                    {bulkUpdating ? 'กำลังอัปเดต...' : 'ตั้งเป็นรอดำเนินการ'}
                  </Button>
                  <Button
                    onClick={() => {
                      void handleBulkDelete();
                    }}
                    disabled={selectedRows.length === 0 || bulkDeleting || bulkUpdating}
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, minWidth: { sm: 132 } }}>
                    {bulkDeleting ? 'กำลังลบ...' : 'ลบที่เลือก'}
                  </Button>
                </Stack>
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
              <Typography sx={{ fontWeight: 800, color: '#102A43' }}>รายการไฟล์</Typography>
              <Chip
                label={`${filteredRows.length} รายการ`}
                sx={{
                  borderRadius: 2.5,
                  bgcolor: '#EEF4FF',
                  color: '#1D4ED8',
                  border: '1px solid #C7D8FE',
                  fontWeight: 800,
                }}
              />
            </Stack>
          </Box>

          <TableContainer sx={{ maxHeight: '68vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 52, bgcolor: '#F8FAFE' }}>
                    <Checkbox checked={allCurrentSelected} onChange={toggleSelectAll} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 164, bgcolor: '#F7FAFF' }}>วันที่อัปโหลด</TableCell>
                  {/* Legacy customer contact columns kept out of the table for now:
                  <TableCell sx={{ minWidth: 180, bgcolor: '#F7FAFF' }}>Customer Name</TableCell>
                  <TableCell sx={{ minWidth: 140, bgcolor: '#F7FAFF' }}>Phone Number</TableCell>
                  */}
                  <TableCell sx={{ minWidth: 160, bgcolor: '#F7FAFF' }}>ประเภทงาน</TableCell>
                  <TableCell sx={{ minWidth: 260, bgcolor: '#F7FAFF' }}>ตัวอย่างไฟล์</TableCell>
                  <TableCell sx={{ minWidth: 130, bgcolor: '#F7FAFF' }}>สถานะ</TableCell>
                  <TableCell sx={{ minWidth: 220, bgcolor: '#F7FAFF' }}>หมายเหตุ</TableCell>
                  <TableCell sx={{ minWidth: 172, bgcolor: '#F7FAFF' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography sx={{ py: 5, textAlign: 'center', color: '#64748B' }}>กำลังโหลดข้อมูล...</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState compact icon={<SearchRoundedIcon fontSize="small" />} eyebrow="Storage" title="ไม่พบไฟล์งานที่อัปโหลด" subtitle="กรุณาคลิกปุ่ม Refresh อีกครั้งเพื่อโหลดข้อมูลใหม่" />
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
                        {/* Legacy customer contact cells kept out of the table for now:
                        <TableCell>
                          <Stack spacing={0.35}>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{row.customerName}</Typography>
                            <Typography sx={{ color: '#6B7280', fontSize: 12.5 }}>LINE : {row.lineId}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>{row.phone}</Typography>
                        </TableCell>
                        */}
                        <TableCell>
                          <Chip label={row.jobType} sx={{ borderRadius: 2.5, fontWeight: 700, ...jobTypeChipSx(row.jobType) }} />
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
                          <Chip label={statusView.label} sx={{ borderRadius: 2.5, fontWeight: 800, ...statusView.sx }} />
                        </TableCell>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 200, color: '#475569' }}>
                            {row.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={event => event.stopPropagation()}>
                          <Stack direction="row" spacing={0.6}>
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton size="small" onClick={() => openDrawer(row)}>
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ดาวน์โหลด">
                              <IconButton size="small" onClick={() => handleDownloadRowFiles(row)}>
                                <DownloadRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="คัดลอกลิงก์">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  void handleCopyFirstFileLink(row);
                                }}>
                                <ContentCopyRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ตัวเลือกเพิ่มเติม">
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
            if (rowMenuTarget) {
              void (async () => {
                const targetIds = rowMenuTarget.sourceIds;
                setActionMessage(null);
                trackPersistingIds(targetIds, true);

                try {
                  await Promise.all(targetIds.map(rowId => persistUploadMutation(rowId, 'patch', { status: 'completed' })));
                  applyRowPatch(targetIds, { status: 'completed' });
                  setActionMessage({ severity: 'success', text: 'อัปเดตสถานะรายการแล้ว' });
                } catch (error) {
                  if (isMissingApiBaseError(error)) {
                    setMissingApiBase(true);
                  } else {
                    setActionMessage({ severity: 'error', text: getRequestErrorMessage(error, 'ไม่สามารถอัปเดตสถานะรายการได้') });
                  }
                } finally {
                  trackPersistingIds(targetIds, false);
                }
              })();
            }
            closeRowMenu();
          }}>
          เปลี่ยนสถานะเป็นเสร็จสิ้น
        </MenuItem>
      </Menu>

      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : { sm: 420, md: 480, lg: 560 },
              maxHeight: isMobile ? '94vh' : '100vh',
              height: isMobile ? 'min(94vh, 860px)' : '100%',
              borderTopLeftRadius: isMobile ? 18 : 22,
              borderTopRightRadius: isMobile ? 18 : 0,
              borderBottomLeftRadius: isMobile ? 0 : 22,
              borderBottomRightRadius: 0,
              background: 'linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 100%)',
              overflow: 'hidden',
            },
          },
        }}>
        {activeRecord ? (
          <Stack sx={{ height: '100%' }}>
            <Box
              sx={{
                px: { xs: 2, sm: 2.5, md: 3 },
                py: { xs: 1.8, sm: 2.2 },
                borderBottom: '1px solid #E8EFF8',
                bgcolor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
              }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>รายละเอียดงานพิมพ์</Typography>
              <Typography sx={{ mt: 0.5, color: '#64748B' }}>ลูกค้า : {activeRecord.customerName}</Typography>
            </Box>

            <Box
              sx={{
                px: { xs: 2, sm: 2.5, md: 3 },
                py: { xs: 2, sm: 2.3 },
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
              }}>
              <Stack spacing={isCompactDrawer ? 1.35 : 1.6}>
                {/* <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
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
                </Card> */}

                <Card sx={{ borderRadius: 4, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#F08C00', 0.14), color: '#AF6305' }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>รายละเอียดงาน</Typography>
                      </Stack>
                      <Typography sx={{ color: '#334155' }}>วันที่อัปโหลด : {formatDate(activeRecord.uploadDate)}</Typography>
                      <Typography sx={{ color: '#334155' }}>ประเภทงาน : {activeRecord.jobType}</Typography>
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
                        <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>ไฟล์งาน</Typography>
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
                          width: { xs: '100%', sm: 'auto' },
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: '#1F5CE6',
                        }}>
                        ดาวน์โหลดทั้งหมด
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    borderRadius: '24px',
                    border: '1px solid #E2ECF8',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
                    bgcolor: '#FFFFFF',
                    overflow: 'hidden',
                  }}>
                  <CardContent sx={{ p: { xs: '18px !important', sm: '20px !important' } }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.25}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '14px',
                              bgcolor: '#EEF6FF',
                              color: '#1E5EFF',
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                            }}>
                            <FactCheckRoundedIcon sx={{ fontSize: 22 }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, color: '#16233B', fontSize: { xs: 17, sm: 18 }, lineHeight: 1.2 }}>สถานะการดำเนินงาน</Typography>
                            <Typography sx={{ color: '#7A8CA5', fontSize: 13, mt: 0.2 }}>อัปเดตความคืบหน้าของงานพิมพ์</Typography>
                          </Box>
                        </Stack>
                      </Stack>

                      {drawerStatusView ? (
                        <Box
                          sx={{
                            borderRadius: '18px',
                            px: 2,
                            py: 2,
                            border: `1px solid ${drawerStatusView.border}`,
                            background: drawerStatusView.gradient,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1.5,
                          }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '16px',
                              bgcolor: alpha(drawerStatusView.accent, 0.1),
                              color: drawerStatusView.accent,
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                              boxShadow: `inset 0 0 0 1px ${alpha(drawerStatusView.accent, 0.08)}`,
                            }}>
                            {React.cloneElement(drawerStatusView.icon, { sx: { fontSize: 26 } })}
                          </Box>

                          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontWeight: 800, color: drawerStatusView.accent, fontSize: { xs: 18, sm: 20 }, lineHeight: 1.15 }}>{drawerStatusView.label}</Typography>
                            <Typography sx={{ color: '#334155', fontSize: 13.5, lineHeight: 1.45 }}>{drawerStatusView.description}</Typography>
                          </Stack>
                        </Box>
                      ) : null}

                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: 700, color: '#16233B', fontSize: 15 }}>
                          เปลี่ยนสถานะ{' '}
                          <Box component="span" sx={{ color: '#EF4444' }}>
                            *
                          </Box>
                        </Typography>
                        <FormControl fullWidth>
                          <Select<StorageStatus>
                            value={drawerStatus}
                            onChange={event => setDrawerStatus(event.target.value)}
                            displayEmpty
                            input={
                              <OutlinedInput
                                startAdornment={
                                  <InputAdornment position="start" sx={{ mr: 1.5 }}>
                                    <SyncRoundedIcon sx={{ color: '#1E5EFF', fontSize: 20 }} />
                                  </InputAdornment>
                                }
                              />
                            }
                            renderValue={value => (
                              <Stack direction="row" alignItems="center" spacing={1.1}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '999px',
                                    bgcolor: getStorageStatusPresentation(value).accent,
                                    boxShadow: `0 0 0 4px ${alpha(getStorageStatusPresentation(value).accent, 0.12)}`,
                                  }}
                                />
                                <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{storageStatusLabel(value)}</Typography>
                              </Stack>
                            )}
                            sx={{
                              height: 52,
                              borderRadius: '14px',
                              bgcolor: '#FFFFFF',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8E4F5', borderWidth: 1.5 },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BFD3F3' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1E5EFF', borderWidth: 2 },
                              '& .MuiSelect-select': { display: 'flex', alignItems: 'center', py: 1.1, fontSize: 15, fontWeight: 600, color: '#1A2740' },
                              '& .MuiSvgIcon-root.MuiSelect-icon': { fontSize: 24, color: '#6B7C99', right: 12 },
                            }}>
                            <MenuItem value="waiting">รอดาวน์โหลด</MenuItem>
                            <MenuItem value="pending">รอดำเนินการ</MenuItem>
                            <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: 700, color: '#16233B', fontSize: 15 }}>บันทึกเพิ่มเติม</Typography>
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            placeholder="เพิ่มรายละเอียดเกี่ยวกับสถานะงาน..."
                            value={drawerNotes}
                            onChange={event => setDrawerNotes(event.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                minHeight: 120,
                                alignItems: 'flex-start',
                                borderRadius: '16px',
                                bgcolor: '#FFFFFF',
                                pr: 2,
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                                '& fieldset': { borderColor: '#D1DBEA', borderWidth: 1.5 },
                                '&:hover fieldset': { borderColor: '#BFD3F3' },
                                '&.Mui-focused fieldset': { borderColor: '#1E5EFF', borderWidth: 2 },
                              },
                              '& .MuiInputBase-inputMultiline': {
                                px: 0,
                                py: 0,
                                fontSize: 14,
                                color: '#22314B',
                              },
                              '& .MuiInputBase-input::placeholder': {
                                color: '#A0AEC0',
                                opacity: 1,
                              },
                            }}
                          />
                          <Typography
                            sx={{
                              position: 'absolute',
                              right: 18,
                              bottom: 14,
                              color: '#8194B2',
                              fontSize: 13,
                              pointerEvents: 'none',
                            }}>
                            {drawerNoteLength} / 500
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <JobTimelineCard items={buildStorageTimelineItems(activeRecord)} subtitle="ลำดับการรับงานและอัปเดตความคืบหน้าของไฟล์งาน" />
              </Stack>
            </Box>

            <Divider />
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                px: { xs: 2, sm: 2.5, md: 3 },
                py: { xs: 2, sm: 2.2 },
                borderTop: '1px solid #E8EFF8',
                bgcolor: 'rgba(248, 250, 255, 0.96)',
                backdropFilter: 'blur(10px)',
              }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.2} alignItems={{ sm: 'stretch' }} sx={{ width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    void handleDrawerSave();
                  }}
                  disabled={drawerBusy}
                  startIcon={<SaveRoundedIcon />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    flex: 1,
                    minHeight: 46,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 15.5,
                    background: 'linear-gradient(135deg, #1E5EFF 0%, #4778FF 100%)',
                    boxShadow: '0 12px 28px rgba(30, 94, 255, 0.24)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1A56EB 0%, #3F71FF 100%)',
                      boxShadow: '0 14px 30px rgba(30, 94, 255, 0.28)',
                    },
                    '&.Mui-disabled': {
                      color: '#FFFFFF',
                      opacity: 0.72,
                    },
                  }}>
                  {drawerSaving ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    flex: { sm: '0 0 140px' },
                    minHeight: 48,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#D7E3F4',
                    color: '#33517A',
                    bgcolor: '#FFFFFF',
                  }}>
                  ปิดรายละเอียด
                </Button>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </Box>
  );
}
