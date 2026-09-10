'use client';

import '../globals.css';
import { AnimatePresence, motion } from 'framer-motion';
import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
import InsertDriveFileRounded from '@mui/icons-material/InsertDriveFileRounded';
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import StickyNote2Rounded from '@mui/icons-material/StickyNote2Rounded';
import TableChartRounded from '@mui/icons-material/TableChartRounded';
import ViewAgendaRounded from '@mui/icons-material/ViewAgendaRounded';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { closeLineLiffWindow, initializeLineUploadSession, type LineUploadSession } from '@/lib/line-liff';
import { uploadFile, type UploadPayload } from '@/lib/upload-api';
import {
  ACCEPTED_EXTENSIONS,
  buildAcceptAttribute,
  formatFileSize,
  getFileExtension,
  MAX_FILE_SIZE_LABEL,
  MAX_UPLOAD_BATCH_SIZE_BYTES,
  MAX_UPLOAD_BATCH_SIZE_LABEL,
  validateUploadFile,
} from './helpers';
import { createUploadQueueItems, openUploadedSignedUrl, uploadPendingFiles, type UploadQueueItem, type UploadStatus } from './upload-flow';

type Step = 1 | 2 | 3;
// Legacy upload flow kept 4 steps with a standalone customer-info phase:
// type Step = 1 | 2 | 3 | 4;

type JobOption = {
  id: string;
  label: string;
  icon: typeof DescriptionRounded;
};

type UploadFileItem = UploadQueueItem;

type UploadFieldErrors = {
  jobNote: string;
};

type FeedbackModalState =
  | {
      kind: 'success' | 'error';
      title: string;
      message: string;
      details?: string[];
    }
  | null;

const steps = ['รายละเอียดงาน', 'อัปโหลดไฟล์', 'ตรวจสอบและส่ง'];
// Legacy step labels before the UX simplification:
// const steps = ['ข้อมูลลูกค้า', 'รายละเอียดงาน', 'อัปโหลดไฟล์', 'ตรวจสอบและส่ง'];

const jobOptions: JobOption[] = [
  { id: 'document', label: 'ปริ้นเอกสาร', icon: DescriptionRounded },
  { id: 'namecard', label: 'นามบัตร', icon: PersonRounded },
  { id: 'sticker', label: 'สติกเกอร์', icon: StickyNote2Rounded },
  { id: 'banner', label: 'ป้าย / ไวนิล', icon: ViewAgendaRounded },
  { id: 'binding', label: 'เข้าเล่ม', icon: Inventory2Rounded },
  { id: 'other', label: 'อื่นๆ', icon: DescriptionRounded },
];

const uploadJobTypeMap: Record<string, UploadPayload['jobType']> = {
  document: 'Document Printing',
  namecard: 'Business Card',
  sticker: 'Sticker',
  banner: 'Vinyl Banner',
  poster: 'Poster',
  binding: 'Packaging',
  other: 'Other',
};

const ACCEPT_ATTRIBUTE = buildAcceptAttribute(ACCEPTED_EXTENSIONS);
const JOB_NOTE_MAX_LENGTH = 500;
const UPLOAD_PLACEHOLDER_CUSTOMER_NAME = 'Upload Customer';
const UPLOAD_PLACEHOLDER_PHONE = '0000000000';
// Legacy customer detail limits kept for the old standalone customer-info section:
// const CUSTOMER_NOTE_MAX_LENGTH = 500;

function fileIconByName(name: string) {
  const ext = getFileExtension(name);
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return ImageRounded;
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return TableChartRounded;
  if (ext === 'zip') return Inventory2Rounded;
  if (ext === 'ai' || ext === 'psd') return StickyNote2Rounded;
  if (ext === 'pdf' || ext === 'doc' || ext === 'docx') return DescriptionRounded;
  return InsertDriveFileRounded;
}

function glassCard(extra = '') {
  return `rounded-3xl border border-[var(--glossy-border-default)] bg-[var(--glossy-surface-card)] shadow-[0_18px_45px_var(--glossy-action-primary-soft)] backdrop-blur ${extra}`;
}

function getUploadStatusLabel(status: UploadStatus): string {
  if (status === 'uploaded') return 'อัปโหลดแล้ว';
  if (status === 'uploading') return 'กำลังอัปโหลด';
  if (status === 'error') return 'อัปโหลดไม่สำเร็จ';
  return 'รออัปโหลด';
}

function buildFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function getValidationError(file: File): string | null {
  const validation = validateUploadFile(file);
  if (!validation.valid && validation.reason === 'extension') {
    return `ไฟล์ ${file.name} ไม่รองรับนามสกุลนี้`;
  }

  if (!validation.valid && validation.reason === 'size') {
    return `ไฟล์ ${file.name} มีขนาดเกิน ${MAX_FILE_SIZE_LABEL}`;
  }

  return null;
}

function buildLegacyUploadNote(jobNote: string, batchId: string): string {
  const note = jobNote.trim();
  return note ? `${note}\n\n[[batch:${batchId}]]\n[[stage:waiting-download]]` : `[[batch:${batchId}]]\n[[stage:waiting-download]]`;
}

function createUploadBatchId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `batch-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getUploadFieldErrors(jobNote: string): UploadFieldErrors {
  return {
    jobNote: jobNote.length > JOB_NOTE_MAX_LENGTH ? `รายละเอียดงานยาวได้ไม่เกิน ${JOB_NOTE_MAX_LENGTH} ตัวอักษร` : '',
  };
}

function getUploadInputError(errors: UploadFieldErrors): { message: string; step: Step } | null {
  if (errors.jobNote) {
    return { message: errors.jobNote, step: 1 };
  }

  return null;
}

function getPrimaryActionLabel(isUploading: boolean): string {
  if (isUploading) return 'กำลังอัปโหลด...';
  return 'ส่งไฟล์';
}

type UploadFileRowProps = {
  readonly item: UploadFileItem;
  readonly disableActions: boolean;
  readonly onOpenFile: (item: UploadFileItem) => void;
  readonly onRemove: (id: string) => void;
  readonly statusPill: (status: UploadStatus) => ReactElement;
};

function UploadFileRow({ item, disableActions, onOpenFile, onRemove, statusPill }: UploadFileRowProps) {
  const Icon = fileIconByName(item.file.name);

  return (
    <motion.div layout className="rounded-2xl border border-[var(--glossy-border-default)] bg-[var(--glossy-surface-card)] px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--glossy-action-primary-soft)] p-2 text-[var(--glossy-action-primary)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--glossy-text-primary)]">{item.file.name}</p>
          <p className="text-xs text-[var(--glossy-text-secondary)]">{formatFileSize(item.file.size)}</p>
          {item.errorMessage ? <p className="mt-1 text-xs text-[var(--glossy-status-error)]">{item.errorMessage}</p> : null}
          {item.uploaded ? (
            <>
              <p className="mt-1 text-xs text-[var(--glossy-status-success)]">Upload ID: {item.uploaded.id}</p>
              <p className="mt-1 text-[11px] text-[var(--glossy-text-secondary)]">ลิงก์เปิดไฟล์ใช้ได้ประมาณ {Math.ceil(item.uploaded.expiresIn / 60)} นาทีหลังอัปโหลด</p>
            </>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {statusPill(item.status)}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenFile(item)}
              disabled={!item.uploaded || disableActions}
              className="rounded-lg p-1.5 text-[var(--glossy-text-secondary)] transition enabled:hover:bg-[var(--glossy-action-primary-soft)] enabled:hover:text-[var(--glossy-action-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`เปิดไฟล์ ${item.file.name}`}>
              <OpenInNewRounded className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={disableActions}
              className="rounded-lg p-1.5 text-[var(--glossy-text-secondary)] transition enabled:hover:bg-[var(--glossy-status-error-soft)] enabled:hover:text-[var(--glossy-status-error)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`ลบไฟล์ ${item.file.name}`}>
              <DeleteOutlineRounded className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UploadQueueEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--glossy-action-primary-border)] bg-[var(--glossy-surface-subtle)] px-4 py-6 text-center shadow-[0_16px_36px_var(--glossy-action-primary-soft)]">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--glossy-action-primary-soft)] text-[var(--glossy-action-primary)]">
        <CloudUploadRounded className="h-6 w-6" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--glossy-action-primary)]">Upload queue</p>
      <p className="mt-2 text-base font-semibold text-[var(--glossy-text-primary)]">ยังไม่มีไฟล์ในคิวอัปโหลด</p>
      <p className="mt-1 text-sm text-[var(--glossy-text-secondary)]">ลากไฟล์มาวาง หรือกดเลือกไฟล์จากเครื่องเพื่อเริ่มสร้างคิวงานได้ทันที</p>
    </div>
  );
}

function getCurrentStep(
  isUploading: boolean,
  uploadedCount: number,
  errorCount: number,
  totalFiles: number,
): Step {
  if (isUploading || uploadedCount > 0 || errorCount > 0) return 3;
  return totalFiles > 0 ? 2 : 1;
}

function getUploadProgressSummary(isUploading: boolean, totalFiles: number): string {
  if (isUploading) return 'ระบบกำลังส่งไฟล์ขึ้นเซิร์ฟเวอร์';
  if (totalFiles > 0) return 'อัปโหลดเสร็จแล้วบางส่วนหรือทั้งหมด';
  return 'ยังไม่มีไฟล์ในคิวอัปโหลด';
}

function getFooterDetail(
  totalFiles: number,
  selectedJobLabel: string,
  hasJobNote: boolean,
): string {
  if (totalFiles === 0) {
    return 'เลือกประเภทงานและเพิ่มไฟล์อย่างน้อย 1 ไฟล์ก่อนส่ง';
  }

  const noteSummary = hasJobNote ? ' • มีรายละเอียดเพิ่มเติมแล้ว' : '';
  return `ประเภทงาน ${selectedJobLabel}${noteSummary}`;
}

function statusPill(status: UploadStatus) {
  if (status === 'uploaded') {
    return <span className="rounded-full bg-[var(--glossy-status-success-soft)] px-2.5 py-1 text-xs font-medium text-[var(--glossy-status-success)]">อัปโหลดแล้ว</span>;
  }
  if (status === 'uploading') {
    return <span className="rounded-full bg-[var(--glossy-action-primary-soft)] px-2.5 py-1 text-xs font-medium text-[var(--glossy-action-primary)]">กำลังอัปโหลด</span>;
  }
  if (status === 'error') {
    return <span className="rounded-full bg-[var(--glossy-status-error-soft)] px-2.5 py-1 text-xs font-medium text-[var(--glossy-status-error)]">ผิดพลาด</span>;
  }
  return <span className="rounded-full bg-[var(--glossy-surface-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--glossy-text-secondary)]">รออัปโหลด</span>;
}

function getStepItemClass(active: boolean, done: boolean) {
  if (active) return 'border-[var(--glossy-action-primary-border)] bg-[var(--glossy-action-primary-soft)] text-[var(--glossy-action-primary)]';
  if (done) return 'border-[var(--glossy-status-success-border)] bg-[var(--glossy-status-success-soft)] text-[var(--glossy-status-success)]';
  return 'border-[var(--glossy-border-default)] bg-[var(--glossy-surface-card)] text-[var(--glossy-text-secondary)]';
}

function getStepBadgeClass(active: boolean, done: boolean) {
  if (active) return 'bg-[var(--glossy-action-primary)] text-[var(--glossy-text-inverse)]';
  if (done) return 'bg-[var(--glossy-status-success)] text-[var(--glossy-text-inverse)]';
  return 'bg-[var(--glossy-surface-active)] text-[var(--glossy-text-secondary)]';
}

export default function UploadPage() { // NOSONAR: event orchestration remains colocated with page state.
  const pathname = usePathname();
  const lineMode = pathname.startsWith('/upload/line');
  const [selectedJobType, setSelectedJobType] = useState<string>('document');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>(null);
  const [lineSession, setLineSession] = useState<LineUploadSession | null>(null);
  const [lineStatus, setLineStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [lineError, setLineError] = useState('');

  const [jobNote, setJobNote] = useState('');
  const [touchedFields, setTouchedFields] = useState({
    jobNote: false,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!lineMode) {
      setLineStatus('idle');
      setLineSession(null);
      setLineError('');
      return;
    }

    let cancelled = false;
    setLineStatus('loading');
    setLineError('');

    void initializeLineUploadSession()
      .then(result => {
        if (cancelled || result.status === 'redirecting') return;
        setLineSession(result.session);
        setLineStatus('ready');
      })
      .catch(error => {
        if (cancelled) return;
        setLineSession(null);
        setLineStatus('error');
        setLineError(error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อ LINE ได้');
      });

    return () => {
      cancelled = true;
    };
  }, [lineMode]);

  const selectedJobLabel = useMemo(() => jobOptions.find(item => item.id === selectedJobType)?.label ?? '-', [selectedJobType]);
  const trimmedJobNote = jobNote.trim();
  const fieldErrors = useMemo(() => getUploadFieldErrors(trimmedJobNote), [trimmedJobNote]);

  const uploadedCount = uploadedFiles.filter(item => item.status === 'uploaded').length;
  const errorItems = uploadedFiles.filter(item => item.status === 'error');
  const waitingItems = uploadedFiles.filter(item => item.status === 'waiting');
  const totalFiles = uploadedFiles.length;
  const currentStep = getCurrentStep(isUploading, uploadedCount, errorItems.length, totalFiles);
  const uploadProgress = totalFiles === 0 ? 0 : Math.round((uploadedCount / totalFiles) * 100);
  const showUploadProgress = isUploading || uploadedCount > 0;
  const primaryActionDisabled = isUploading || uploadedFiles.length === 0 || (lineMode && lineStatus !== 'ready');

  const clearFeedback = () => {
    setFeedbackModal(null);
  };

  const openErrorModal = (message: string, details?: string[]) => {
    setFeedbackModal({
      kind: 'error',
      title: 'ส่งไฟล์ไม่สำเร็จ',
      message,
      details,
    });
  };

  const markJobFieldsTouched = () => {
    setTouchedFields(prev => ({
      ...prev,
      jobNote: true,
    }));
  };

  const mergeFilesIntoState = (incomingFiles: File[]) => {
    clearFeedback();
    setUploadedFiles(prev => {
      const queueState = createUploadQueueItems({
        incomingFiles,
        existingIds: new Set(prev.map(item => item.id)),
        existingTotalBytes: prev.reduce((sum, item) => (item.status === 'uploaded' ? sum : sum + item.file.size), 0),
        maxTotalBytes: MAX_UPLOAD_BATCH_SIZE_BYTES,
        totalSizeValidationMessage: `ขนาดไฟล์รวมต่อการส่งต้องไม่เกิน ${MAX_UPLOAD_BATCH_SIZE_LABEL}`,
        buildFileId,
        getValidationError,
      });

      if (queueState.validationMessages.length > 0) {
        openErrorModal('มีบางไฟล์ไม่สามารถเพิ่มเข้าคิวได้', queueState.validationMessages);
      }

      return [...prev, ...queueState.items];
    });
  };

  const handleFileSelection = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    mergeFilesIntoState(Array.from(fileList));
  };

  const handleRemoveUploadedFile = (id: string) => {
    if (isUploading) return;
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleBrowseClick = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;
    handleFileSelection(event.dataTransfer.files);
  };

  const handleDropzoneKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (disableFileActions) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleBrowseClick();
  };

  const handleOpenFile = (item: UploadFileItem) => {
    if (!item.uploaded) return;

    clearFeedback();

    try {
      openUploadedSignedUrl({
        signedUrl: item.uploaded.signedUrl,
        openWindow: signedUrl => window.open(signedUrl, '_blank', 'noopener,noreferrer'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถเปิดไฟล์ได้';
      openErrorModal(message);
    }
  };

  const handleUploadAll = async () => {
    if (isUploading) return;
    if (lineMode && !lineSession) {
      openErrorModal(lineError || 'กำลังตรวจสอบตัวตนจาก LINE กรุณารอสักครู่แล้วลองใหม่');
      return;
    }

    const batchId = createUploadBatchId();
    const legacyNote = buildLegacyUploadNote(trimmedJobNote, batchId);
    const jobType = uploadJobTypeMap[selectedJobType] ?? 'Other';

    markJobFieldsTouched();

    const inputError = getUploadInputError(fieldErrors);
    if (inputError) {
      openErrorModal(inputError.message);
      return;
    }

    const pendingFiles = uploadedFiles.filter(item => item.status === 'waiting' || item.status === 'error');
    if (pendingFiles.length === 0) {
      openErrorModal('ยังไม่มีไฟล์ที่รออัปโหลด');
      return;
    }

    const pendingTotalBytes = pendingFiles.reduce((sum, item) => sum + item.file.size, 0);
    if (pendingTotalBytes > MAX_UPLOAD_BATCH_SIZE_BYTES) {
      openErrorModal(`ขนาดไฟล์รวมต่อการส่งต้องไม่เกิน ${MAX_UPLOAD_BATCH_SIZE_LABEL}`);
      return;
    }

    clearFeedback();
    setIsUploading(true);

    const uploadResult = await uploadPendingFiles({
      items: uploadedFiles,
      payload: {
        customerName: lineSession?.displayName ?? UPLOAD_PLACEHOLDER_CUSTOMER_NAME,
        phone: lineSession ? undefined : UPLOAD_PLACEHOLDER_PHONE,
        lineIdToken: lineSession?.idToken,
        jobType,
        note: legacyNote,
        statusNote: trimmedJobNote || undefined,
        batchId,
        stage: 'waiting-download',
      },
      upload: uploadFile,
    });

    setUploadedFiles(uploadResult.items);
    setIsUploading(false);

    if (uploadResult.failureCount > 0) {
      setFeedbackModal({
        kind: 'error',
        title: uploadResult.successCount > 0 ? 'ส่งไฟล์ได้บางส่วน' : 'ส่งไฟล์ไม่สำเร็จ',
        message:
          uploadResult.successCount > 0
            ? `อัปโหลดสำเร็จ ${uploadResult.successCount} ไฟล์ และยังมี ${uploadResult.failureCount} ไฟล์ที่ต้องลองใหม่`
            : 'ระบบยังส่งไฟล์ไม่สำเร็จ กรุณาตรวจสอบรายการแล้วลองใหม่',
        details: uploadResult.items
          .filter(item => item.status === 'error')
          .slice(0, 3)
          .map(item => `${item.file.name}: ${item.errorMessage ?? 'อัปโหลดไม่สำเร็จ'}`),
      });
      return;
    }

    if (uploadResult.successCount > 0) {
      setFeedbackModal({
        kind: 'success',
        title: 'ส่งไฟล์สำเร็จ!',
        message: `อัปโหลดสำเร็จ ${uploadResult.successCount} ไฟล์`,
        details: [
          `ประเภทงาน: ${selectedJobLabel}`,
          `ไฟล์ที่ส่งสำเร็จ: ${uploadResult.successCount} ไฟล์`,
          ...(lineSession ? [`ส่งผ่าน LINE: ${lineSession.displayName}`] : []),
        ],
      });
    }
  };

  const handleUploadMore = () => {
    clearFeedback();
    setFeedbackModal(null);
    inputRef.current?.click();
  };

  const disableFileActions = isUploading || (lineMode && lineStatus !== 'ready');

  return (
    <main className="min-h-screen bg-[var(--glossy-surface-page)] px-4 py-5 pb-28 text-[var(--glossy-text-primary)] sm:px-6 sm:py-8 sm:pb-32 md:pb-8">
      <input ref={inputRef} type="file" accept={ACCEPT_ATTRIBUTE} multiple hidden onChange={handleInputChange} />

      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <header className={`${glassCard('relative overflow-hidden')} px-4 py-4 sm:px-6 sm:py-5`}>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_top_right,var(--glossy-action-primary-soft),transparent_68%)] sm:w-56" />
          <div className="pointer-events-none absolute -left-8 top-0 h-20 w-20 rounded-full bg-[var(--glossy-action-primary-soft)] blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-16 w-32 rounded-full bg-[color-mix(in_srgb,var(--glossy-brand-magenta)_10%,transparent)] blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--glossy-action-primary-border)] bg-[var(--glossy-surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--glossy-action-primary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--glossy-brand-cyan)]" />
                <span>Upload Status</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-black tracking-[-0.02em] text-[var(--glossy-text-primary)] sm:text-2xl">Glossy Design</p>
                <span className="rounded-full bg-[var(--glossy-surface-inverse)] px-2.5 py-1 text-[11px] font-semibold text-[var(--glossy-text-inverse)]">Fast file intake</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--glossy-text-secondary)] sm:text-[15px]">อัปโหลดงานพิมพ์ได้เร็วขึ้น เหมาะกับทั้งงานด่วน งานเอกสาร และไฟล์พร้อมพิมพ์</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--glossy-action-primary-border)] bg-[var(--glossy-action-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--glossy-action-primary)]">ไฟล์ละไม่เกิน {MAX_FILE_SIZE_LABEL}</span>
                <span className="rounded-full border border-[var(--glossy-border-default)] bg-[var(--glossy-surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--glossy-text-soft)]">รวมต่อครั้งไม่เกิน {MAX_UPLOAD_BATCH_SIZE_LABEL}</span>
              </div>

              {lineMode ? (
                <div className={`mt-4 rounded-2xl border px-3.5 py-3 ${lineStatus === 'error' ? 'border-[var(--glossy-status-error-border)] bg-[var(--glossy-status-error-soft)]' : lineStatus === 'ready' ? 'border-[var(--glossy-status-success-border)] bg-[var(--glossy-status-success-soft)]' : 'border-[var(--glossy-status-warning-border)] bg-[var(--glossy-status-warning-soft)]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${lineStatus === 'ready' ? 'bg-[var(--glossy-status-success)]' : lineStatus === 'error' ? 'bg-[var(--glossy-status-error)]' : 'bg-[var(--glossy-status-warning)]'}`} />
                    <p className={`text-sm font-semibold ${lineStatus === 'error' ? 'text-[var(--glossy-status-error)]' : lineStatus === 'ready' ? 'text-[var(--glossy-status-success)]' : 'text-[var(--glossy-status-warning)]'}`}>
                      {lineStatus === 'ready' && lineSession
                        ? `เชื่อมต่อ LINE แล้ว • ${lineSession.displayName}`
                        : lineStatus === 'error'
                          ? 'เชื่อมต่อ LINE ไม่สำเร็จ'
                          : 'กำลังตรวจสอบบัญชี LINE...'}
                    </p>
                  </div>
                  {lineStatus === 'error' ? <p className="mt-1.5 text-xs leading-5 text-[var(--glossy-status-error)]">{lineError}</p> : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-4 self-start sm:self-center">
              <div className="hidden min-w-[220px] rounded-2xl border border-[var(--glossy-border-default)] bg-[var(--glossy-surface-card)] px-3 py-3 shadow-sm sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--glossy-text-secondary)]">Ready for production</p>
                <p className="mt-1 text-sm font-medium text-[var(--glossy-text-secondary)]">ส่งงานง่าย ได้งานไว ไว้ใจ Glossy Design</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[var(--glossy-surface-subtle)] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--glossy-text-secondary)]">Step</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--glossy-text-primary)]">{currentStep}/3</p>
                  </div>
                  <div className="rounded-xl bg-[var(--glossy-surface-subtle)] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--glossy-text-secondary)]">Files</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--glossy-text-primary)]">{totalFiles}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--glossy-brand-cyan)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--glossy-brand-magenta)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--glossy-brand-yellow)]" />
              </div>
            </div>
          </div>
        </header>

        <section className={`${glassCard()} px-4 py-4 sm:px-6`}>
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-3">
            {steps.map((step, index) => {
              const stepNumber = (index + 1) as Step;
              const active = currentStep === stepNumber;
              const done = currentStep > stepNumber;
              return (
                <li key={step} className={`rounded-2xl border px-3 py-2.5 text-sm transition-all ${getStepItemClass(active, done)}`}>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${getStepBadgeClass(active, done)}`}>
                      {done ? <CheckRounded className="h-3.5 w-3.5" /> : stepNumber}
                    </span>
                    <span className="leading-tight">{step}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="grid gap-4 xl:grid-cols-12 xl:gap-6">
          <div className="space-y-4 xl:col-span-8">
            <article className={`${glassCard()} p-4 sm:p-5`}>
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-[var(--glossy-action-primary-soft)] p-1.5 text-[var(--glossy-action-primary)]">
                  <PersonRounded className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-[var(--glossy-text-primary)]">รายละเอียดงาน</h2>
              </div>
              <p className="mb-4 text-sm text-[var(--glossy-text-secondary)]">เลือกประเภทงานและใส่รายละเอียดเพิ่มเติมเท่าที่จำเป็น เพื่อให้ทีมตรวจสอบและเริ่มงานต่อได้ง่ายขึ้น</p>
              <p className="mb-3 text-sm font-medium text-[var(--glossy-text-soft)]">ประเภทงาน *</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {jobOptions.map(job => {
                  const Icon = job.icon;
                  const selected = selectedJobType === job.id;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedJobType(job.id)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        selected
                          ? 'border-[var(--glossy-action-primary-border)] bg-[var(--glossy-action-primary-soft)] ring-2 ring-[var(--glossy-action-primary-border)]'
                          : 'border-[var(--glossy-border-default)] bg-[var(--glossy-surface-card)] hover:border-[var(--glossy-action-primary-border)] hover:bg-[var(--glossy-action-primary-soft)]'
                      }`}>
                      <Icon className={`mb-1.5 h-4 w-4 ${selected ? 'text-[var(--glossy-action-primary)]' : 'text-[var(--glossy-text-secondary)]'}`} />
                      <p className={`text-sm font-medium ${selected ? 'text-[var(--glossy-action-primary)]' : 'text-[var(--glossy-text-soft)]'}`}>{job.label}</p>
                    </button>
                  );
                })}
              </div>

              <label className="mt-3 block">
                <span className="mb-1 block text-sm font-medium text-[var(--glossy-text-soft)]">หมายเหตุเพิ่มเติม</span>
                <textarea
                  value={jobNote}
                  onChange={e => setJobNote(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, jobNote: true }))}
                  rows={3}
                  placeholder="กรุณาระบุหมายเหตุเพิ่มเติม"
                  maxLength={JOB_NOTE_MAX_LENGTH}
                  aria-invalid={touchedFields.jobNote && Boolean(fieldErrors.jobNote)}
                  className={`w-full rounded-xl border bg-[var(--glossy-surface-card)] px-3 py-2.5 text-sm text-[var(--glossy-text-primary)] placeholder:text-[var(--glossy-text-secondary)] outline-none transition focus:ring-4 ${
                    touchedFields.jobNote && fieldErrors.jobNote
                      ? 'border-[var(--glossy-status-error-border)] focus:border-[var(--glossy-status-error)] focus:ring-[var(--glossy-status-error-soft)]'
                      : 'border-[var(--glossy-border-default)] focus:border-[var(--glossy-action-primary)] focus:ring-[var(--glossy-action-primary-soft)]'
                  }`}
                />
                <span className={`mt-1 block text-xs ${touchedFields.jobNote && fieldErrors.jobNote ? 'text-[var(--glossy-status-error)]' : 'text-[var(--glossy-text-secondary)]'}`}>
                  {touchedFields.jobNote && fieldErrors.jobNote ? fieldErrors.jobNote : `${trimmedJobNote.length}/${JOB_NOTE_MAX_LENGTH}`}
                </span>
              </label>
            </article>

            <article className={`${glassCard()} p-4 sm:p-5`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[var(--glossy-text-primary)]">อัปโหลดไฟล์</h2>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  disabled={disableFileActions}
                  className="rounded-xl border border-[var(--glossy-action-primary-border)] bg-[var(--glossy-action-primary-soft)] px-3 py-2 text-sm font-semibold text-[var(--glossy-action-primary)] transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
                  เลือกไฟล์จากเครื่อง
                </button>
              </div>
              <button
                type="button"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                onKeyDown={handleDropzoneKeyDown}
                disabled={disableFileActions}
                className={`rounded-3xl border-2 border-dashed p-6 w-full h-60 text-center transition ${
                  isDragOver
                    ? 'border-[var(--glossy-action-primary)] bg-[var(--glossy-action-primary-soft)] shadow-md'
                    : 'border-[var(--glossy-action-primary-border)] bg-[var(--glossy-surface-subtle)] hover:border-[var(--glossy-action-primary)] hover:shadow-md'
                } ${disableFileActions ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                <CloudUploadRounded className="mx-auto mb-2 h-10 w-10 text-[var(--glossy-action-primary)]" />
                <p className="text-base font-semibold text-[var(--glossy-text-primary)]">ลากไฟล์มาวางที่นี่</p>
                <p className="mt-1 text-sm text-[var(--glossy-text-secondary)]">หรือกดเลือกไฟล์จากอุปกรณ์ของคุณ</p>
                <p className="mt-3 text-xs text-[var(--glossy-text-secondary)]">รองรับไฟล์: {ACCEPTED_EXTENSIONS.map(extension => extension.toUpperCase()).join(', ')}</p>
                <p className="text-xs text-[var(--glossy-text-secondary)]">
                  ขนาดสูงสุด {MAX_FILE_SIZE_LABEL} / ไฟล์ • รวมไม่เกิน {MAX_UPLOAD_BATCH_SIZE_LABEL} / ครั้ง
                </p>
              </button>

              <div className="mt-4 space-y-2.5">
                {uploadedFiles.length === 0 ? (
                  <UploadQueueEmptyState />
                ) : (
                  uploadedFiles.map(item => (
                    <UploadFileRow key={item.id} item={item} disableActions={disableFileActions} onOpenFile={handleOpenFile} onRemove={handleRemoveUploadedFile} statusPill={statusPill} />
                  ))
                )}
              </div>
            </article>
          </div>

          <aside className="space-y-4 xl:col-span-4">
            <AnimatePresence mode="wait">
              <motion.article
                key={showUploadProgress ? 'progress-active' : 'progress-idle'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${glassCard()} p-4 sm:p-5`}>
                <h3 className="text-base font-semibold text-[var(--glossy-text-primary)]">{isUploading ? 'กำลังอัปโหลดไฟล์...' : 'สรุปสถานะไฟล์'}</h3>
                <div className="my-3 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-[var(--glossy-action-primary-border)] text-[var(--glossy-action-primary)]">
                    <span className="text-sm font-bold">{uploadProgress}%</span>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--glossy-text-secondary)]">{getUploadProgressSummary(isUploading, totalFiles)}</p>
                    <p className="text-xs text-[var(--glossy-text-secondary)]">
                      สำเร็จ {uploadedCount} / {totalFiles} ไฟล์
                    </p>
                  </div>
                </div>
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedFiles.map(item => (
                      <div key={`progress-${item.id}`} className="flex items-center justify-between rounded-xl bg-[var(--glossy-surface-subtle)] px-3 py-2 text-sm">
                        <span className="truncate text-[var(--glossy-text-soft)]">{item.file.name}</span>
                        <span className="ml-2 flex items-center gap-1 text-xs text-[var(--glossy-text-secondary)]">
                          {item.status === 'uploading' ? <AutorenewRounded className="h-3.5 w-3.5 animate-spin text-[var(--glossy-action-primary)]" /> : null}
                          {getUploadStatusLabel(item.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--glossy-action-primary-border)] bg-[var(--glossy-action-primary-soft)] px-4 py-5 text-sm text-[var(--glossy-text-secondary)]">
                    เลือกไฟล์เมื่อไหร่ รายการและสถานะการอัปโหลดจะแสดงที่นี่ทันที
                  </div>
                )}
              </motion.article>
            </AnimatePresence>

          </aside>
        </section>

        <footer className="sticky bottom-2 z-20 rounded-2xl border border-[var(--glossy-border-default)] bg-[var(--glossy-surface-card)] p-3 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-start justify-between gap-3 md:hidden">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--glossy-action-primary)]">ขั้นตอน {currentStep}/3</p>
              <p className="mt-1 text-sm font-semibold text-[var(--glossy-text-primary)]">{steps[currentStep - 1]}</p>
              <p className="mt-1 text-xs text-[var(--glossy-text-secondary)]">{totalFiles > 0 ? `พร้อมส่ง ${totalFiles} ไฟล์ • สำเร็จ ${uploadedCount} ไฟล์` : 'เพิ่มไฟล์อย่างน้อย 1 ไฟล์เพื่อส่งงาน'}</p>
            </div>
            {showUploadProgress ? (
              <div className="rounded-2xl border border-[var(--glossy-action-primary-border)] bg-[var(--glossy-action-primary-soft)] px-3 py-2 text-right">
                <p className="text-[11px] font-medium text-[var(--glossy-action-primary)]">ความคืบหน้า</p>
                <p className="text-sm font-semibold text-[var(--glossy-action-primary)]">{uploadProgress}%</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden min-w-0 sm:block">
              <p className="text-sm font-semibold text-[var(--glossy-text-primary)]">{totalFiles > 0 ? `พร้อมส่ง ${totalFiles} ไฟล์` : 'ยังไม่มีไฟล์สำหรับส่ง'}</p>
              <p className="mt-1 text-xs text-[var(--glossy-text-secondary)]">
                {getFooterDetail(totalFiles, selectedJobLabel, Boolean(trimmedJobNote))}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={primaryActionDisabled}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[var(--glossy-action-primary)] px-4 py-2 text-sm font-semibold text-[var(--glossy-text-inverse)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--glossy-action-primary-border)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px]">
              {getPrimaryActionLabel(isUploading)}
              <ExpandMoreRounded className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {feedbackModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--glossy-surface-overlay)] px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`w-full max-w-md rounded-[28px] border bg-[var(--glossy-surface-card)] p-6 shadow-[0_24px_80px_var(--glossy-surface-overlay)] ${
                feedbackModal.kind === 'success' ? 'border-[var(--glossy-status-success-border)]' : 'border-[var(--glossy-status-error-border)]'
              }`}>
              <div className="flex justify-center text-center">
                <div className={`inline-flex rounded-full p-3 text-[var(--glossy-text-inverse)] ${feedbackModal.kind === 'success' ? 'bg-[var(--glossy-status-success)]' : 'bg-[var(--glossy-status-error)]'}`}>
                  {feedbackModal.kind === 'success' ? <CheckRounded className="h-6 w-6" /> : <ErrorOutlineRounded className="h-6 w-6" />}
                </div>
              </div>
              <h3 className={`mt-4 text-2xl font-black tracking-[-0.02em] text-center ${feedbackModal.kind === 'success' ? 'text-[var(--glossy-status-success)]' : 'text-[var(--glossy-status-error)]'}`}>
                {feedbackModal.title}
              </h3>
              <p className={`mt-2 text-sm leading-6 text-center ${feedbackModal.kind === 'success' ? 'text-[var(--glossy-status-success)]' : 'text-[var(--glossy-status-error)]'}`}>
                {feedbackModal.message}
              </p>
              {feedbackModal.details && feedbackModal.details.length > 0 ? (
                <div
                  className={`mt-4 space-y-2 rounded-2xl border px-4 py-3 text-sm ${
                    feedbackModal.kind === 'success'
                      ? 'border-[var(--glossy-status-success-border)] bg-[var(--glossy-status-success-soft)] text-center text-[var(--glossy-status-success)]'
                      : 'border-[var(--glossy-status-error-border)] bg-[var(--glossy-status-error-soft)] text-left text-[var(--glossy-status-error)]'
                  }`}>
                  {feedbackModal.details.map(detail => (
                    <p key={detail}>{detail}</p>
                  ))}
                </div>
              ) : null}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {feedbackModal.kind === 'success' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleUploadMore}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[var(--glossy-status-success-border)] px-4 py-2 text-sm font-semibold text-[var(--glossy-status-success)] transition hover:bg-[var(--glossy-status-success-soft)]">
                      ส่งไฟล์เพิ่ม
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (lineSession?.isInClient) {
                          closeLineLiffWindow();
                          return;
                        }
                        setFeedbackModal(null);
                      }}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--glossy-status-success)] px-4 py-2 text-sm font-semibold text-[var(--glossy-text-inverse)] transition hover:brightness-95">
                      {lineSession?.isInClient ? 'ปิดหน้าต่าง' : 'รับทราบ'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal(null)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[var(--glossy-status-error-border)] px-4 py-2 text-sm font-semibold text-[var(--glossy-status-error)] transition hover:bg-[var(--glossy-status-error-soft)]">
                      ปิด
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal(null);
                        void handleUploadAll();
                      }}
                      disabled={isUploading || (waitingItems.length === 0 && errorItems.length === 0)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--glossy-status-error)] px-4 py-2 text-sm font-semibold text-[var(--glossy-text-inverse)] transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
                      ลองอัปโหลดอีกครั้ง
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
