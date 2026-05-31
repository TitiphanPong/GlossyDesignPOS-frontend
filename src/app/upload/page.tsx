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
import { useMemo, useRef, useState } from 'react';
import { getSignedUrl, uploadFile, type UploadPayload } from '@/lib/upload-api';
import { ACCEPTED_EXTENSIONS, buildAcceptAttribute, formatFileSize, getFileExtension, validateUploadFile } from './helpers';
import { createUploadQueueItems, openSignedUrlWithRetry, uploadPendingFiles, type UploadQueueItem, type UploadStatus } from './upload-flow';

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
  return `rounded-3xl border border-indigo-100/70 bg-white/85 shadow-[0_18px_45px_rgba(91,73,227,0.10)] backdrop-blur ${extra}`;
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
    return `ไฟล์ ${file.name} มีขนาดเกิน 100MB`;
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
    <motion.div layout className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">{item.file.name}</p>
          <p className="text-xs text-slate-500">{formatFileSize(item.file.size)}</p>
          {item.errorMessage ? <p className="mt-1 text-xs text-rose-600">{item.errorMessage}</p> : null}
          {item.uploaded ? <p className="mt-1 text-xs text-emerald-700">Upload ID: {item.uploaded.id}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {statusPill(item.status)}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenFile(item)}
              disabled={!item.uploaded || disableActions}
              className="rounded-lg p-1.5 text-slate-400 transition enabled:hover:bg-indigo-50 enabled:hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`เปิดไฟล์ ${item.file.name}`}>
              <OpenInNewRounded className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={disableActions}
              className="rounded-lg p-1.5 text-slate-400 transition enabled:hover:bg-rose-50 enabled:hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/80 px-4 py-6 text-center shadow-[0_16px_36px_rgba(79,70,229,0.08)]">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-600">
        <CloudUploadRounded className="h-6 w-6" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">Upload queue</p>
      <p className="mt-2 text-base font-semibold text-slate-800">ยังไม่มีไฟล์ในคิวอัปโหลด</p>
      <p className="mt-1 text-sm text-slate-500">ลากไฟล์มาวาง หรือกดเลือกไฟล์จากเครื่องเพื่อเริ่มสร้างคิวงานได้ทันที</p>
    </div>
  );
}

export default function UploadPage() {
  const [selectedJobType, setSelectedJobType] = useState<string>('document');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>(null);

  const [jobNote, setJobNote] = useState('');
  const [touchedFields, setTouchedFields] = useState({
    jobNote: false,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedJobLabel = useMemo(() => jobOptions.find(item => item.id === selectedJobType)?.label ?? '-', [selectedJobType]);
  const envError = process.env.NEXT_PUBLIC_API_URL ? null : 'กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนใช้งานอัปโหลดไฟล์';
  const trimmedJobNote = jobNote.trim();
  const fieldErrors = useMemo(() => getUploadFieldErrors(trimmedJobNote), [trimmedJobNote]);

  const uploadedCount = uploadedFiles.filter(item => item.status === 'uploaded').length;
  const errorItems = uploadedFiles.filter(item => item.status === 'error');
  const waitingItems = uploadedFiles.filter(item => item.status === 'waiting');
  const totalFiles = uploadedFiles.length;
  const currentStep: Step = isUploading || uploadedCount > 0 || errorItems.length > 0 ? 3 : totalFiles > 0 ? 2 : 1;
  const uploadProgress = totalFiles === 0 ? 0 : Math.round((uploadedCount / totalFiles) * 100);
  const showUploadProgress = isUploading || uploadedCount > 0;
  const primaryActionDisabled = Boolean(envError) || isUploading || uploadedFiles.length === 0;

  const statusPill = (status: UploadStatus) => {
    if (status === 'uploaded') {
      return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">อัปโหลดแล้ว</span>;
    }
    if (status === 'uploading') {
      return <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">กำลังอัปโหลด</span>;
    }
    if (status === 'error') {
      return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">ผิดพลาด</span>;
    }
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">รออัปโหลด</span>;
  };

  const getStepItemClass = (active: boolean, done: boolean) => {
    if (active) return 'border-indigo-300 bg-indigo-50 text-indigo-700';
    if (done) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-500';
  };

  const getStepBadgeClass = (active: boolean, done: boolean) => {
    if (active) return 'bg-indigo-600 text-white';
    if (done) return 'bg-emerald-600 text-white';
    return 'bg-slate-200 text-slate-600';
  };

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

  const handleOpenFile = async (item: UploadFileItem) => {
    if (!item.uploaded || openingFileId || envError) return;

    clearFeedback();
    setOpeningFileId(item.id);

    try {
      await openSignedUrlWithRetry({
        id: item.uploaded.id,
        getSignedUrl,
        openWindow: signedUrl => window.open(signedUrl, '_blank', 'noopener,noreferrer'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถเปิดไฟล์ได้';
      openErrorModal(message);
    } finally {
      setOpeningFileId(null);
    }
  };

  const handleUploadAll = async () => {
    if (isUploading || envError) return;

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

    clearFeedback();
    setIsUploading(true);

    const uploadResult = await uploadPendingFiles({
      items: uploadedFiles,
      payload: {
        // TODO(upload-backend): remove placeholder customer fields once the backend no longer requires them.
        customerName: UPLOAD_PLACEHOLDER_CUSTOMER_NAME,
        phone: UPLOAD_PLACEHOLDER_PHONE,
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
        details: [`ประเภทงาน: ${selectedJobLabel}`, `ไฟล์ที่ส่งสำเร็จ: ${uploadResult.successCount} ไฟล์`],
      });
    }
  };

  const handleUploadMore = () => {
    clearFeedback();
    setFeedbackModal(null);
    inputRef.current?.click();
  };

  const disableFileActions = isUploading || Boolean(envError) || Boolean(openingFileId);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50/40 px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-32 md:pb-8">
      <input ref={inputRef} type="file" accept={ACCEPT_ATTRIBUTE} multiple hidden onChange={handleInputChange} />

      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <header className={`${glassCard('relative overflow-hidden')} px-4 py-4 sm:px-6 sm:py-5`}>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_68%)] sm:w-56" />
          <div className="pointer-events-none absolute -left-8 top-0 h-20 w-20 rounded-full bg-indigo-100/70 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-16 w-32 rounded-full bg-violet-100/70 blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Upload Status
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-black tracking-[-0.02em] text-slate-900 sm:text-2xl">Glossy Design</p>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white/90">Fast file intake</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">อัปโหลดงานพิมพ์ได้เร็วขึ้น เหมาะกับทั้งงานด่วน งานเอกสาร และไฟล์พร้อมพิมพ์</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700">รองรับไฟล์สูงสุด 100MB</span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700">อัปโหลดได้หลายไฟล์</span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-start sm:self-center">
              <div className="hidden min-w-[220px] rounded-2xl border border-white/70 bg-white/75 px-3 py-3 shadow-sm sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ready for production</p>
                <p className="mt-1 text-sm font-medium text-slate-600">ส่งงานง่าย ได้งานไว ไว้ใจ Glossy Design</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Step</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{currentStep}/3</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Files</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{totalFiles}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
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
                <div className="rounded-lg bg-indigo-100 p-1.5 text-indigo-700">
                  <PersonRounded className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">รายละเอียดงาน</h2>
              </div>
              <p className="mb-4 text-sm text-slate-600">เลือกประเภทงานและใส่รายละเอียดเพิ่มเติมเท่าที่จำเป็น เพื่อให้ทีมตรวจสอบและเริ่มงานต่อได้ง่ายขึ้น</p>
              <p className="mb-3 text-sm font-medium text-slate-700">ประเภทงาน *</p>
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
                        selected ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40'
                      }`}>
                      <Icon className={`mb-1.5 h-4 w-4 ${selected ? 'text-indigo-700' : 'text-slate-500'}`} />
                      <p className={`text-sm font-medium ${selected ? 'text-indigo-700' : 'text-slate-700'}`}>{job.label}</p>
                    </button>
                  );
                })}
              </div>

              <label className="mt-3 block">
                <span className="mb-1 block text-sm font-medium text-slate-700">หมายเหตุเพิ่มเติม</span>
                <textarea
                  value={jobNote}
                  onChange={e => setJobNote(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, jobNote: true }))}
                  rows={3}
                  placeholder="กรุณาระบุหมายเหตุเพิ่มเติม"
                  maxLength={JOB_NOTE_MAX_LENGTH}
                  aria-invalid={touchedFields.jobNote && Boolean(fieldErrors.jobNote)}
                  className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-black placeholder:text-grey outline-none transition focus:ring-4 ${
                    touchedFields.jobNote && fieldErrors.jobNote ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                />
                <span className={`mt-1 block text-xs ${touchedFields.jobNote && fieldErrors.jobNote ? 'text-rose-600' : 'text-slate-500'}`}>
                  {touchedFields.jobNote && fieldErrors.jobNote ? fieldErrors.jobNote : `${trimmedJobNote.length}/${JOB_NOTE_MAX_LENGTH}`}
                </span>
              </label>
            </article>

            <article className={`${glassCard()} p-4 sm:p-5`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">อัปโหลดไฟล์</h2>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  disabled={disableFileActions}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition enabled:hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50">
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
                  isDragOver ? 'border-indigo-400 bg-indigo-50/80 shadow-md' : 'border-indigo-200 bg-gradient-to-br from-white to-indigo-50/80 hover:border-indigo-300 hover:shadow-md'
                } ${disableFileActions ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                <CloudUploadRounded className="mx-auto mb-2 h-10 w-10 text-indigo-600" />
                <p className="text-base font-semibold text-slate-800">ลากไฟล์มาวางที่นี่</p>
                <p className="mt-1 text-sm text-slate-500">หรือกดเลือกไฟล์จากอุปกรณ์ของคุณ</p>
                <p className="mt-3 text-xs text-slate-500">รองรับไฟล์: {ACCEPTED_EXTENSIONS.map(extension => extension.toUpperCase()).join(', ')}</p>
                <p className="text-xs text-slate-500">ขนาดไฟล์สูงสุด 100MB / ไฟล์</p>
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
            {/* Legacy helper card kept for future reuse:
            <article className={`${glassCard()} p-4 sm:p-5`}>
              <h3 className="mb-1 text-base font-semibold text-slate-900">ส่งงานได้จากทุกที่</h3>

              <p className="mb-3 text-sm leading-6 text-slate-600">
                อัปโหลดไฟล์ สรุปรายละเอียดงาน และส่งต่อให้ทีมผลิตได้ในหน้าเดียว เหมาะทั้งงานด่วน งานพิมพ์ทั่วไป และงานที่ต้องการตรวจข้อมูลให้ครบก่อนเริ่มผลิต
              </p>

              <h3 className="mb-1 text-base font-semibold text-slate-900">สิ่งที่คุณจะได้รับ</h3>
              <ul className="leading-6 text-sm text-slate-600">
                <li>ส่งไฟล์และรายละเอียดงานได้ครบในครั้งเดียว</li>
                <li>รองรับไฟล์งานขนาดใหญ่สูงสุด 100MB ต่อไฟล์</li>
                <li>ตรวจสอบสถานะการอัปโหลดได้ทันทีบนหน้าจอ</li>
              </ul>
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-sm">
                <p className="font-semibold text-slate-800">ต้องการให้ช่วยเช็กไฟล์ก่อนผลิต?</p>
                <p className="mt-1 text-slate-600">ทักหาเราได้ทาง LINE หรือ Facebook เพื่อสอบถามราคา</p>
                <p className="mt-1 text-slate-600">ระยะเวลาและความพร้อมของไฟล์งานที่จะใช้งาน</p>
                <p className="mt-2 text-slate-600">LINE : @glossydesign</p>
                <p className="mt-1 text-slate-600">Facebook : Glossy Design</p>
              </div>
            </article>
            */}

            <AnimatePresence mode="wait">
              <motion.article
                key={showUploadProgress ? 'progress-active' : 'progress-idle'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${glassCard()} p-4 sm:p-5`}>
                <h3 className="text-base font-semibold text-slate-900">{isUploading ? 'กำลังอัปโหลดไฟล์...' : 'สรุปสถานะไฟล์'}</h3>
                <div className="my-3 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-indigo-100 text-indigo-700">
                    <span className="text-sm font-bold">{uploadProgress}%</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{isUploading ? 'ระบบกำลังส่งไฟล์ขึ้นเซิร์ฟเวอร์' : totalFiles > 0 ? 'อัปโหลดเสร็จแล้วบางส่วนหรือทั้งหมด' : 'ยังไม่มีไฟล์ในคิวอัปโหลด'}</p>
                    <p className="text-xs text-slate-500">
                      สำเร็จ {uploadedCount} / {totalFiles} ไฟล์
                    </p>
                  </div>
                </div>
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedFiles.map(item => (
                      <div key={`progress-${item.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="truncate text-slate-700">{item.file.name}</span>
                        <span className="ml-2 flex items-center gap-1 text-xs text-slate-500">
                          {item.status === 'uploading' ? <AutorenewRounded className="h-3.5 w-3.5 animate-spin" /> : null}
                          {getUploadStatusLabel(item.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-5 text-sm text-slate-600">
                    เลือกไฟล์เมื่อไหร่ รายการและสถานะการอัปโหลดจะแสดงที่นี่ทันที
                  </div>
                )}
              </motion.article>
            </AnimatePresence>

          </aside>
        </section>

        <footer className="sticky bottom-2 z-20 rounded-2xl border border-indigo-100 bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-start justify-between gap-3 md:hidden">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">ขั้นตอน {currentStep}/3</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{steps[currentStep - 1]}</p>
              <p className="mt-1 text-xs text-slate-500">{totalFiles > 0 ? `พร้อมส่ง ${totalFiles} ไฟล์ • สำเร็จ ${uploadedCount} ไฟล์` : 'เพิ่มไฟล์อย่างน้อย 1 ไฟล์เพื่อส่งงาน'}</p>
            </div>
            {showUploadProgress ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-right">
                <p className="text-[11px] font-medium text-indigo-600">ความคืบหน้า</p>
                <p className="text-sm font-semibold text-indigo-800">{uploadProgress}%</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden min-w-0 sm:block">
              <p className="text-sm font-semibold text-slate-900">{totalFiles > 0 ? `พร้อมส่ง ${totalFiles} ไฟล์` : 'ยังไม่มีไฟล์สำหรับส่ง'}</p>
              <p className="mt-1 text-xs text-slate-500">
                {totalFiles > 0 ? `ประเภทงาน ${selectedJobLabel}${trimmedJobNote ? ' • มีรายละเอียดเพิ่มเติมแล้ว' : ''}` : 'เลือกประเภทงานและเพิ่มไฟล์อย่างน้อย 1 ไฟล์ก่อนส่ง'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={primaryActionDisabled}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px]">
              {getPrimaryActionLabel(isUploading)}
              <ExpandMoreRounded className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {feedbackModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`w-full max-w-md rounded-[28px] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] ${
                feedbackModal.kind === 'success' ? 'border-emerald-100 bg-white' : 'border-rose-100 bg-white'
              }`}>
              <div className={`flex ${feedbackModal.kind === 'success' ? 'justify-center text-center' : 'justify-center text-center'}`}>
                <div className={`inline-flex rounded-full p-3 ${feedbackModal.kind === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {feedbackModal.kind === 'success' ? <CheckRounded className="h-6 w-6" /> : <ErrorOutlineRounded className="h-6 w-6" />}
                </div>
              </div>
              <h3 className={`mt-4 text-2xl font-black tracking-[-0.02em] text-center ${feedbackModal.kind === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {feedbackModal.title}
              </h3>
              <p className={`mt-2 text-sm leading-6 text-center ${feedbackModal.kind === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {feedbackModal.message}
              </p>
              {feedbackModal.details && feedbackModal.details.length > 0 ? (
                <div
                  className={`mt-4 space-y-2 rounded-2xl border px-4 py-3 text-sm ${
                    feedbackModal.kind === 'success'
                      ? 'border-emerald-100 bg-emerald-50/70 text-center text-emerald-900'
                      : 'border-rose-100 bg-rose-50/70 text-left text-rose-900'
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
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                      ส่งไฟล์เพิ่ม
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal(null)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                      รับทราบ
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal(null)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                      ปิด
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal(null);
                        void handleUploadAll();
                      }}
                      disabled={isUploading || Boolean(envError) || (waitingItems.length === 0 && errorItems.length === 0)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
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
