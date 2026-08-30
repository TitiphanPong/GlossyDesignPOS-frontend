'use client';

import * as React from 'react';
import { createExcelCompatibleCsv, downloadCsvFile } from '@/lib/csv';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import axios from 'axios';
import JobTimelineCard, { type JobTimelineCardItem } from '../components/JobTimelineCard';
import GlossyDetailDrawer from '@/components/drawers/GlossyDetailDrawer';
import { getApiBaseUrl, isMissingApiBaseError } from '../../../lib/api';
import { normalizeRecord, type StorageRow, type StorageStatus, type UploadApiRecord } from './normalizers';
import {
  applyStorageRowPatch,
  buildPersistedNote,
  getBulkMutationTargetIds,
  rowContainsAnySourceId,
  toEditableStorageStatus,
  toPersistedUploadStatus,
  toStructuredStage,
  type SortType,
  type StorageRowPatch,
} from './storageData';
import StorageOverview, { type StorageStats } from './StorageOverview';
import StorageToolbar from './StorageToolbar';
import StorageTable from './StorageTable';
import { EMPTY_DATE_RANGE, type ReportDateRangeValue } from '../components/ReportFilterPanel';

const endpointCandidates = ['/uploads'];
const EMPTY_STORAGE_STATS: StorageStats = {
  waiting: 0,
  pending: 0,
  completed: 0,
  totalFiles: 0,
  uploadedToday: 0,
};
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function summarizeLoadedRows(rows: readonly StorageRow[]): StorageStats {
  const today = new Date(Date.now() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
  return rows.reduce<StorageStats>(
    (summary, row) => {
      summary[row.status] += 1;
      summary.totalFiles += row.files.length;
      const createdAt = new Date(row.uploadDate);
      if (!Number.isNaN(createdAt.getTime()) && new Date(createdAt.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10) === today) {
        summary.uploadedToday += 1;
      }
      return summary;
    },
    { ...EMPTY_STORAGE_STATS }
  );
}

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

function pickFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return <ImageRoundedIcon sx={{ color: '#2A6BF6', fontSize: 18 }} />;
  if (ext === 'pdf') return <DescriptionRoundedIcon sx={{ color: '#E5484D', fontSize: 18 }} />;
  return <InsertDriveFileRoundedIcon sx={{ color: '#6D7B8A', fontSize: 18 }} />;
}

function toCsv(rows: StorageRow[]) {
  const headers = ['วันที่อัปโหลด', 'ชื่อลูกค้า', 'LINE Display Name', 'เบอร์โทร', 'LINE User ID', 'ประเภทงาน', 'สถานะ', 'หมายเหตุ'];
  const body = rows.map(row => [formatDate(row.uploadDate), row.customerName, row.lineDisplayName, row.phone, row.lineId, row.jobType, storageStatusLabel(row.status), row.notes]);
  return createExcelCompatibleCsv([headers, ...body]);
}

export default function StoragePage() {
  // NOSONAR: page orchestration is intentionally colocated.
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
  const [dateRange, setDateRange] = React.useState<ReportDateRangeValue>(EMPTY_DATE_RANGE);
  const [linkStatusFilter, setLinkStatusFilter] = React.useState<'all' | 'linked' | 'unlinked'>('all');
  const [orderReferenceFilter, setOrderReferenceFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortType>('newest');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalRows, setTotalRows] = React.useState(0);
  const [stats, setStats] = React.useState<StorageStats>(EMPTY_STORAGE_STATS);
  const deferredSearch = React.useDeferredValue(search.trim());

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState<StorageRow | null>(null);

  const [drawerStatus, setDrawerStatus] = React.useState<StorageStatus>('waiting');
  const [drawerNotes, setDrawerNotes] = React.useState('');
  const [drawerOrderReference, setDrawerOrderReference] = React.useState('');
  const [linkSaving, setLinkSaving] = React.useState(false);

  const [rowMenuAnchor, setRowMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [rowMenuId, setRowMenuId] = React.useState<string | null>(null);
  const focusedUploadRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusedUploadId = params.get('focus')?.trim();
    const orderReference = params.get('order')?.trim();
    if (focusedUploadId) {
      focusedUploadRef.current = focusedUploadId;
      setSearch(focusedUploadId);
    }
    if (orderReference) {
      setOrderReferenceFilter(orderReference);
      setLinkStatusFilter('linked');
    }
  }, []);

  const fetchUploads = React.useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setMissingApiBase(false);

    try {
      const base = getApiBaseUrl();
      let loaded = false;

      for (const endpoint of endpointCandidates) {
        try {
          const response = await axios.get(`${base}${endpoint}`, {
            params: {
              page: page + 1,
              limit: rowsPerPage,
              ...(deferredSearch ? { q: deferredSearch } : {}),
              ...(statusFilter !== 'all' ? { storageStatus: statusFilter } : {}),
              ...(jobTypeFilter !== 'all' ? { jobType: jobTypeFilter } : {}),
              ...(dateRange.startDate ? { dateFrom: dateRange.startDate.format('YYYY-MM-DD') } : {}),
              ...(dateRange.endDate ? { dateTo: dateRange.endDate.format('YYYY-MM-DD') } : {}),
              ...(linkStatusFilter !== 'all' ? { linkStatus: linkStatusFilter } : {}),
              ...(orderReferenceFilter ? { orderReference: orderReferenceFilter } : {}),
              sort: sortBy,
            },
          });
          const payload = response.data as unknown;

          let list: unknown[] = [];
          let total: number | null = null;
          let responseStats: StorageStats | null = null;
          if (Array.isArray(payload)) {
            list = payload;
            total = payload.length;
          } else {
            const paginatedPayload = payload as {
              data?: unknown[];
              total?: unknown;
              summary?: Partial<StorageStats>;
            };
            const nested = paginatedPayload?.data;
            if (Array.isArray(nested)) list = nested;
            if (typeof paginatedPayload.total === 'number') total = paginatedPayload.total;
            const summary = paginatedPayload.summary;
            if (
              summary &&
              typeof summary.waiting === 'number' &&
              typeof summary.pending === 'number' &&
              typeof summary.completed === 'number' &&
              typeof summary.totalFiles === 'number' &&
              typeof summary.uploadedToday === 'number'
            ) {
              responseStats = {
                waiting: summary.waiting,
                pending: summary.pending,
                completed: summary.completed,
                totalFiles: summary.totalFiles,
                uploadedToday: summary.uploadedToday,
              };
            }
          }

          const normalized = list.filter((item): item is UploadApiRecord => typeof item === 'object' && item !== null).map(normalizeRecord);
          const resolvedTotal = total ?? normalized.length;
          const maxPage = Math.max(0, Math.ceil(resolvedTotal / rowsPerPage) - 1);
          if (page > maxPage) {
            setPage(maxPage);
            loaded = true;
            break;
          }

          setRows(normalized);
          setTotalRows(resolvedTotal);
          setStats(responseStats ?? summarizeLoadedRows(normalized));
          setLastSyncedAt(new Date());
          loaded = true;
          break;
        } catch {
          // Continue to next candidate endpoint.
        }
      }

      if (!loaded) {
        setRows([]);
        setTotalRows(0);
        setStats(EMPTY_STORAGE_STATS);
        setErrorMessage('ไม่สามารถโหลดข้อมูลจาก API ได้ กรุณาตรวจสอบ endpoint /uploads');
      }
    } catch (error) {
      setRows([]);
      setTotalRows(0);
      setStats(EMPTY_STORAGE_STATS);
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setErrorMessage('ไม่สามารถโหลดข้อมูลจาก API ได้ กรุณาตรวจสอบ endpoint /uploads');
      }
    } finally {
      setLoading(false);
    }
  }, [dateRange, deferredSearch, jobTypeFilter, linkStatusFilter, orderReferenceFilter, page, rowsPerPage, sortBy, statusFilter]);

  React.useEffect(() => {
    setPage(0);
  }, [dateRange, deferredSearch, jobTypeFilter, linkStatusFilter, orderReferenceFilter, sortBy, statusFilter]);

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

  const filteredRows = rows;

  const rowsById = React.useMemo(() => new Map(rows.map(row => [row.id, row])), [rows]);

  React.useEffect(() => {
    const focusedUploadId = focusedUploadRef.current;
    if (!focusedUploadId) return;
    const focusedRow = rows.find(row => row.sourceIds.includes(focusedUploadId));
    if (!focusedRow) return;
    setActiveRecord(focusedRow);
    setDrawerStatus(toEditableStorageStatus(focusedRow.status));
    setDrawerNotes(focusedRow.notes);
    setDrawerOrderReference(focusedRow.linkedOrderNumber ?? '');
    setDrawerOpen(true);
    focusedUploadRef.current = null;
  }, [rows]);

  const selectedIdSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedRows = React.useMemo(() => {
    return filteredRows.filter(row => selectedIdSet.has(row.id));
  }, [filteredRows, selectedIdSet]);

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
    downloadCsvFile(csv, `storage-export-${new Date().toISOString().slice(0, 10)}.csv`);
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
      await fetchUploads();
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
  }, [applyRowPatch, fetchUploads, persistUploadMutation, rowsById, selectedIds, trackPersistingIds]);

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
      await fetchUploads();
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
  }, [fetchUploads, persistUploadMutation, removeRows, rowsById, selectedIds, trackPersistingIds]);

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
    setDrawerOrderReference(row.linkedOrderNumber ?? '');
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
            note: buildPersistedNote(drawerNotes),
            statusNote: drawerNotes.trim() || undefined,
            batchId: activeRecord.batchId,
            stage: toStructuredStage(nextStatus),
          })
        )
      );
      applyRowPatch(targetIds, { status: nextStatus, notes: drawerNotes });
      setActionMessage({ severity: 'success', text: 'บันทึกสถานะและหมายเหตุเรียบร้อยแล้ว' });
      await fetchUploads();
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
  }, [activeRecord, applyRowPatch, drawerNotes, drawerStatus, fetchUploads, persistUploadMutation, trackPersistingIds]);

  const handleOrderLink = React.useCallback(
    async (unlink = false) => {
      if (!activeRecord) return;
      const orderReference = unlink ? null : drawerOrderReference.trim();
      if (!unlink && !orderReference) {
        setActionMessage({ severity: 'error', text: 'กรุณาระบุเลขที่ Order ก่อนเชื่อมไฟล์' });
        return;
      }

      setLinkSaving(true);
      setActionMessage(null);
      try {
        const base = getApiBaseUrl();
        const response = await axios.patch(`${base}/uploads/link-order`, {
          uploadIds: activeRecord.sourceIds,
          orderReference,
        });
        const result = response.data as { linkedOrderId?: string | null; linkedOrderNumber?: string | null };
        setActiveRecord(current =>
          current
            ? {
                ...current,
                linkedOrderId: result.linkedOrderId ?? undefined,
                linkedOrderNumber: result.linkedOrderNumber ?? undefined,
              }
            : current
        );
        setDrawerOrderReference(result.linkedOrderNumber ?? '');
        setActionMessage({
          severity: 'success',
          text: result.linkedOrderId ? `เชื่อมไฟล์กับ ${result.linkedOrderNumber ?? 'Order'} แล้ว` : 'ยกเลิกการเชื่อมไฟล์กับ Order แล้ว',
        });
        await fetchUploads();
      } catch (error) {
        if (isMissingApiBaseError(error)) {
          setMissingApiBase(true);
        } else {
          setActionMessage({ severity: 'error', text: getRequestErrorMessage(error, 'ไม่สามารถเชื่อมไฟล์กับ Order ได้') });
        }
      } finally {
        setLinkSaving(false);
      }
    },
    [activeRecord, drawerOrderReference, fetchUploads]
  );

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
        <StorageOverview
          stats={stats}
          lastSyncedAt={lastSyncedAt}
          missingApiBase={missingApiBase}
          errorMessage={errorMessage}
          actionMessage={actionMessage}
          selectedCount={selectedRows.length}
          onRefresh={() => void fetchUploads()}
          onExport={exportFiltered}
          onDownloadSelected={downloadSelected}
        />

        <StorageToolbar
          search={search}
          statusFilter={statusFilter}
          dateRange={dateRange}
          sortBy={sortBy}
          linkStatusFilter={linkStatusFilter}
          orderReferenceFilter={orderReferenceFilter}
          selectedCount={selectedRows.length}
          bulkUpdating={bulkUpdating}
          bulkDeleting={bulkDeleting}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateRange}
          onSortChange={setSortBy}
          onLinkStatusChange={setLinkStatusFilter}
          onOrderReferenceChange={setOrderReferenceFilter}
          onDownloadSelected={downloadSelected}
          onBulkStatus={() => void handleBulkStatus()}
          onBulkDelete={() => void handleBulkDelete()}
        />

        <StorageTable
          rows={filteredRows}
          loading={loading}
          totalRows={totalRows}
          selectedIds={selectedIds}
          allCurrentSelected={allCurrentSelected}
          page={page}
          rowsPerPage={rowsPerPage}
          onToggleSelectAll={toggleSelectAll}
          onRowSelectionChange={handleRowSelectionChange}
          onOpenRow={openDrawer}
          onDownloadRow={handleDownloadRowFiles}
          onCopyFirstFileLink={row => void handleCopyFirstFileLink(row)}
          onOpenRowMenu={openRowMenu}
          onPageChange={nextPage => {
            setSelectedIds([]);
            setPage(nextPage);
          }}
          onRowsPerPageChange={nextRowsPerPage => {
            setSelectedIds([]);
            setRowsPerPage(nextRowsPerPage);
            setPage(0);
          }}
        />
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
                  await fetchUploads();
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

      <GlossyDetailDrawer
        mobile={isMobile}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="รายละเอียดงานพิมพ์"
        subtitle={activeRecord ? `ลูกค้า : ${activeRecord.customerName}` : undefined}
        footer={
          activeRecord ? (
            <>
              <Divider />
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 1.5, sm: 1.8 },
                  borderTop: '1px solid #E8EFF8',
                  bgcolor: 'rgba(255, 255, 255, 0.96)',
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
                      minHeight: 46,
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
            </>
          ) : undefined
        }>
        {activeRecord ? (
          <Stack spacing={isCompactDrawer ? 1.35 : 1.6}>
            <Card sx={{ borderRadius: 4, border: '1px solid #DCE8FA', boxShadow: 'none', bgcolor: '#FBFDFF' }}>
              <CardContent>
                <Stack spacing={1.3}>
                  <Stack direction="row" alignItems="center" spacing={1.35}>
                    <Avatar
                      src={activeRecord.linePictureUrl}
                      alt={activeRecord.lineDisplayName === '-' ? activeRecord.customerName : activeRecord.lineDisplayName}
                      sx={{ width: 52, height: 52, bgcolor: '#EAFBF0', color: '#087A3E', fontSize: 18, fontWeight: 900 }}>
                      {Array.from(activeRecord.lineDisplayName === '-' ? activeRecord.customerName : activeRecord.lineDisplayName)[0] ?? '?'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>ข้อมูลลูกค้าและ LINE</Typography>
                      <Typography noWrap sx={{ mt: 0.2, maxWidth: 300, color: activeRecord.lineDisplayName === '-' ? '#94A3B8' : '#087A3E', fontSize: 12.5, fontWeight: 700 }}>
                        LINE: {activeRecord.lineDisplayName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box>
                    <Typography sx={{ color: '#64748B', fontSize: 12 }}>ชื่อลูกค้า</Typography>
                    <Typography sx={{ mt: 0.2, color: '#0F172A', fontWeight: 750 }}>{activeRecord.customerName}</Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: '#64748B', fontSize: 12 }}>เบอร์โทร</Typography>
                      <Typography sx={{ mt: 0.2, color: '#334155' }}>{activeRecord.phone}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: '#64748B', fontSize: 12 }}>LINE User ID</Typography>
                      <Typography sx={{ mt: 0.2, color: '#334155', fontSize: 12.5, overflowWrap: 'anywhere' }}>{activeRecord.lineId}</Typography>
                    </Box>
                  </Stack>
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
                    <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>รายละเอียดงาน</Typography>
                  </Stack>
                  <Typography sx={{ color: '#334155' }}>วันที่อัปโหลด : {formatDate(activeRecord.uploadDate)}</Typography>
                  <Typography sx={{ color: '#334155' }}>ประเภทงาน : {activeRecord.jobType}</Typography>
                  <Typography sx={{ color: '#334155' }}>รหัสรับไฟล์ : {activeRecord.intakeCode || '-'}</Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: '1px solid #DCE8FA', boxShadow: 'none', bgcolor: '#F9FBFF' }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>เชื่อมกับ Order</Typography>
                    <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 12.5 }}>การเชื่อมนี้เป็นงานเจ้าหน้าที่เท่านั้น และไม่เปลี่ยนรหัสรับไฟล์ของลูกค้า</Typography>
                  </Box>
                  <TextField
                    size="small"
                    fullWidth
                    label="เลขที่ Order / Order ID"
                    value={drawerOrderReference}
                    onChange={event => setDrawerOrderReference(event.target.value)}
                    disabled={linkSaving}
                    placeholder="เช่น ORD-0101"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#FFFFFF' } }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      disabled={linkSaving || !drawerOrderReference.trim()}
                      onClick={() => void handleOrderLink(false)}
                      sx={{ flex: 1, borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
                      {activeRecord.linkedOrderId ? 'เปลี่ยน Order ที่เชื่อม' : 'เชื่อมกับ Order'}
                    </Button>
                    {activeRecord.linkedOrderId ? (
                      <Button variant="outlined" color="error" disabled={linkSaving} onClick={() => void handleOrderLink(true)} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
                        ยกเลิกการเชื่อม
                      </Button>
                    ) : null}
                  </Stack>
                  <Typography sx={{ color: activeRecord.linkedOrderId ? '#18794E' : '#8A95A7', fontSize: 12.5, fontWeight: 700 }}>
                    {activeRecord.linkedOrderId ? `เชื่อมอยู่กับ ${activeRecord.linkedOrderNumber ?? activeRecord.linkedOrderId}` : 'ยังไม่เชื่อมกับ Order'}
                  </Typography>
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
        ) : null}
      </GlossyDetailDrawer>
    </Box>
  );
}
