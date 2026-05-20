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
import { getSignedUrl, uploadFile, type UploadPayload, type UploadResponse } from '@/lib/upload-api';
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES, formatFileSize, getFileExtension } from './helpers';

type Step = 1 | 2 | 3 | 4;
type UploadStatus = 'uploaded' | 'uploading' | 'waiting' | 'error';

type JobOption = {
  id: string;
  label: string;
  icon: typeof DescriptionRounded;
};

type UploadFileItem = {
  id: string;
  file: File;
  status: UploadStatus;
  uploaded?: UploadResponse;
  errorMessage?: string;
};

const steps = ['ข้อมูลลูกค้า', 'รายละเอียดงาน', 'อัปโหลดไฟล์', 'ตรวจสอบและส่ง'];

const jobOptions: JobOption[] = [
  { id: 'document', label: 'ปริ้นเอกสาร', icon: DescriptionRounded },
  { id: 'namecard', label: 'นามบัตร', icon: PersonRounded },
  { id: 'sticker', label: 'สติกเกอร์', icon: StickyNote2Rounded },
  { id: 'banner', label: 'ป้าย / ไวนิล', icon: ViewAgendaRounded },
  { id: 'poster', label: 'โปสเตอร์', icon: ImageRounded },
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

const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map(extension => `.${extension}`).join(',');

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
  const extension = getFileExtension(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return `ไฟล์ ${file.name} ไม่รองรับนามสกุลนี้`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `ไฟล์ ${file.name} มีขนาดเกิน 100MB`;
  }

  return null;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function buildUploadNote(customerNote: string, lineId: string, jobNote: string): string {
  return [customerNote.trim(), lineId.trim() ? `LINE ID: ${lineId.trim()}` : null, jobNote.trim()].filter(Boolean).join('\n');
}

function getUploadInputError(customerName: string, normalizedPhone: string): { message: string; step: Step } | null {
  if (!customerName) {
    return { message: 'กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์ก่อนอัปโหลด', step: 1 };
  }

  if (!normalizedPhone) {
    return { message: 'กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์ก่อนอัปโหลด', step: 1 };
  }

  if (customerName.length > 120) {
    return { message: 'ชื่อลูกค้ายาวเกิน 120 ตัวอักษร', step: 1 };
  }

  if (normalizedPhone.length < 9 || normalizedPhone.length > 20) {
    return { message: 'เบอร์โทรควรมี 9-20 ตัวเลข', step: 1 };
  }

  return null;
}

function getPrimaryActionLabel(isUploading: boolean, currentStep: Step): string {
  if (isUploading) return 'กำลังอัปโหลด...';
  if (currentStep === 1) return 'ถัดไป: รายละเอียดงาน';
  if (currentStep === 2) return 'ถัดไป: อัปโหลดไฟล์';
  return 'เริ่มอัปโหลดไฟล์';
}

function getPreviousStep(currentStep: Step): Step {
  return currentStep > 1 ? ((currentStep - 1) as Step) : currentStep;
}

function getNextStep(currentStep: Step): Step {
  return currentStep < 4 ? ((currentStep + 1) as Step) : currentStep;
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

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedJobType, setSelectedJobType] = useState<string>('document');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [jobNote, setJobNote] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedJobLabel = useMemo(() => jobOptions.find(item => item.id === selectedJobType)?.label ?? '-', [selectedJobType]);
  const envError = process.env.NEXT_PUBLIC_API_URL ? null : 'กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนใช้งานอัปโหลดไฟล์';

  const uploadedCount = uploadedFiles.filter(item => item.status === 'uploaded').length;
  const errorItems = uploadedFiles.filter(item => item.status === 'error');
  const waitingItems = uploadedFiles.filter(item => item.status === 'waiting');
  const totalFiles = uploadedFiles.length;
  const uploadProgress = totalFiles === 0 ? 0 : Math.round((uploadedCount / totalFiles) * 100);
  const showUploadProgress = isUploading || uploadedCount > 0;
  const showSuccess = !isUploading && uploadedCount > 0;
  const showError = errorItems.length > 0 || Boolean(globalError) || Boolean(envError);
  const canAdvanceStep = currentStep < 3;
  const canSubmitUploads = currentStep >= 3 && uploadedFiles.length > 0;
  const primaryActionDisabled = Boolean(envError) || isUploading || (!canAdvanceStep && !canSubmitUploads);

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

  const setUploadStatus = (id: string, updater: (item: UploadFileItem) => UploadFileItem) => {
    setUploadedFiles(prev => prev.map(item => (item.id === id ? updater(item) : item)));
  };

  const clearFeedback = () => {
    setGlobalError(null);
    setSuccessMessage(null);
  };

  const mergeFilesIntoState = (incomingFiles: File[]) => {
    clearFeedback();

    const nextItems: UploadFileItem[] = [];
    const validationMessages: string[] = [];

    for (const file of incomingFiles) {
      const error = getValidationError(file);
      if (error) {
        validationMessages.push(error);
        continue;
      }

      nextItems.push({
        id: buildFileId(file),
        file,
        status: 'waiting',
      });
    }

    setUploadedFiles(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const dedupedItems = nextItems.filter(item => !existingIds.has(item.id));
      return [...prev, ...dedupedItems];
    });

    if (validationMessages.length > 0) {
      setGlobalError(validationMessages.join(' | '));
    }

    if (nextItems.length > 0) {
      setCurrentStep(3);
    }
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
      const signed = await getSignedUrl(item.uploaded.id);
      const openedWindow = window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
      if (!openedWindow) {
        throw new Error('ไม่สามารถเปิดไฟล์อัตโนมัติได้ กรุณาอนุญาต popup แล้วลองใหม่');
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'ไม่สามารถเปิดไฟล์ได้');
    } finally {
      setOpeningFileId(null);
    }
  };

  const handleUploadAll = async () => {
    if (isUploading || envError) return;

    const trimmedCustomerName = customerName.trim();
    const normalizedPhone = normalizePhone(phone);
    const note = buildUploadNote(customerNote, lineId, jobNote);
    const jobType = uploadJobTypeMap[selectedJobType] ?? 'Other';

    const inputError = getUploadInputError(trimmedCustomerName, normalizedPhone);
    if (inputError) {
      setGlobalError(inputError.message);
      setCurrentStep(inputError.step);
      return;
    }

    const pendingFiles = uploadedFiles.filter(item => item.status === 'waiting' || item.status === 'error');
    if (pendingFiles.length === 0) {
      setGlobalError('ยังไม่มีไฟล์ที่รออัปโหลด');
      setCurrentStep(3);
      return;
    }

    clearFeedback();
    setIsUploading(true);
    setCurrentStep(4);

    let successCount = 0;

    for (const item of pendingFiles) {
      setUploadStatus(item.id, current => ({
        ...current,
        status: 'uploading',
        errorMessage: undefined,
      }));

      try {
        const uploaded = await uploadFile(item.file, {
          customerName: trimmedCustomerName,
          phone: normalizedPhone,
          jobType,
          note,
        });
        successCount += 1;
        setUploadStatus(item.id, current => ({
          ...current,
          status: 'uploaded',
          uploaded,
          errorMessage: undefined,
        }));
      } catch (error) {
        setUploadStatus(item.id, current => ({
          ...current,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ',
        }));
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      setSuccessMessage(`อัปโหลดสำเร็จ ${successCount} ไฟล์`);
    }

    if (successCount !== pendingFiles.length) {
      setGlobalError('บางไฟล์อัปโหลดไม่สำเร็จ กรุณาตรวจสอบรายการแล้วลองใหม่');
    }
  };

  const handleUploadMore = () => {
    clearFeedback();
    setCurrentStep(3);
    inputRef.current?.click();
  };

  const disableFileActions = isUploading || Boolean(envError) || Boolean(openingFileId);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50/40 px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-32 md:pb-8">
      <input ref={inputRef} type="file" accept={ACCEPT_ATTRIBUTE} multiple hidden onChange={handleInputChange} />

      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <header className={`${glassCard()} px-4 py-4 sm:px-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <p className="text-lg font-bold text-slate-900">Glossy Design</p>
            </div>
            <p className="text-right text-sm font-medium text-slate-600">ส่งงานง่าย ได้งานไว ไว้ใจ Glossy Design</p>
          </div>
        </header>

        <section className={`${glassCard()} px-4 py-4 sm:px-6`}>
          <ol className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
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
                <h2 className="text-base font-semibold text-slate-900">ข้อมูลลูกค้า</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 sm:col-span-1">
                  <span className="text-sm font-medium text-slate-700">ชื่อลูกค้า *</span>
                  <input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="กรุณาระบุชื่อลูกค้า"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black placeholder:text-grey outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="space-y-1 sm:col-span-1">
                  <span className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์ *</span>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="กรุณาระบุเบอร์โทรศัพท์"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black placeholder:text-grey outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="space-y-1 sm:col-span-1">
                  <span className="text-sm font-medium text-slate-700">LINE ID (ถ้ามี)</span>
                  <input
                    value={lineId}
                    onChange={e => setLineId(e.target.value)}
                    placeholder="กรุณาระบุ LINE ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black placeholder:text-grey outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">หมายเหตุเพิ่มเติม</span>
                  <textarea
                    value={customerNote}
                    onChange={e => setCustomerNote(e.target.value)}
                    rows={3}
                    placeholder="กรุณาระบุหมายเหตุเพิ่มเติม"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black placeholder:text-grey outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="mt-4 hidden items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 md:inline-flex">
                ถัดไป
                <ExpandMoreRounded className="h-4 w-4 rotate-[-90deg]" />
              </button>
            </article>

            <article className={`${glassCard()} p-4 sm:p-5`}>
              <h2 className="mb-4 text-base font-semibold text-slate-900">รายละเอียดงาน</h2>
              <p className="mb-3 text-sm font-medium text-slate-700">ประเภทงาน *</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
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
                className={`rounded-3xl border-2 border-dashed p-6 text-center transition ${
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
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-5 text-center text-sm text-slate-500">ยังไม่มีไฟล์ในคิวอัปโหลด</div>
                ) : (
                  uploadedFiles.map(item => (
                    <UploadFileRow key={item.id} item={item} disableActions={disableFileActions} onOpenFile={handleOpenFile} onRemove={handleRemoveUploadedFile} statusPill={statusPill} />
                  ))
                )}
              </div>
            </article>
          </div>

          <aside className="space-y-4 xl:col-span-4">
            <article className={`${glassCard()} p-4 sm:p-5`}>
              <h3 className="mb-3 text-base font-semibold text-slate-900">ส่งงานได้จากทุกที่</h3>

              <p className="mb-3 text-sm leading-6 text-slate-600">
                อัปโหลดไฟล์ สรุปรายละเอียดงาน และส่งต่อให้ทีมผลิตได้ในหน้าเดียว เหมาะทั้งงานด่วน งานพิมพ์ทั่วไป และงานที่ต้องการตรวจข้อมูลให้ครบก่อนเริ่มผลิต
              </p>

              <h4 className="mb-1 text-sm font-semibold text-slate-800">สิ่งที่คุณจะได้รับ</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>ส่งไฟล์และรายละเอียดงานได้ครบในครั้งเดียว</li>
                <li>รองรับไฟล์งานขนาดใหญ่สูงสุด 100MB ต่อไฟล์</li>
                <li>ตรวจสอบสถานะการอัปโหลดได้ทันทีบนหน้าจอ</li>
              </ul>
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-sm">
                <p className="font-semibold text-slate-800">ต้องการให้ช่วยเช็กไฟล์ก่อนผลิต?</p>
                <p className="mt-1 text-slate-600">ทักหาเราได้ทาง LINE เพื่อสอบถามราคา ระยะเวลา และความพร้อมของไฟล์งาน</p>
                <p className="mt-2 text-slate-600">LINE : @glossydesign</p>
              </div>
            </article>

            <AnimatePresence>
              {showUploadProgress && (
                <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard()} p-4 sm:p-5`}>
                  <h3 className="text-base font-semibold text-slate-900">{isUploading ? 'กำลังอัปโหลดไฟล์...' : 'สรุปสถานะไฟล์'}</h3>
                  <div className="my-3 flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-indigo-100 text-indigo-700">
                      <span className="text-sm font-bold">{uploadProgress}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{isUploading ? 'ระบบกำลังส่งไฟล์ขึ้นเซิร์ฟเวอร์' : 'อัปโหลดเสร็จแล้วบางส่วนหรือทั้งหมด'}</p>
                      <p className="text-xs text-slate-500">
                        สำเร็จ {uploadedCount} / {totalFiles} ไฟล์
                      </p>
                    </div>
                  </div>
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
                </motion.article>
              )}
            </AnimatePresence>

            {showSuccess && (
              <article className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-[0_16px_40px_rgba(20,184,116,0.12)] sm:p-5">
                <div className="mb-2 inline-flex rounded-full bg-emerald-600 p-2 text-white">
                  <CheckRounded className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-emerald-800">ส่งไฟล์สำเร็จ!</h3>
                <p className="mt-1 text-sm text-emerald-700">{successMessage ?? 'ระบบบันทึกการอัปโหลดเรียบร้อยแล้ว'}</p>
                <div className="mt-3 space-y-1 text-sm text-emerald-900">
                  <p>ลูกค้า: {customerName || 'ระบุภายหลัง'}</p>
                  <p>เบอร์โทร: {phone || 'ระบุภายหลัง'}</p>
                  <p>ประเภทงาน: {selectedJobLabel}</p>
                  <p>ไฟล์ที่ส่งสำเร็จ: {uploadedCount} ไฟล์</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleUploadMore}
                    className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                    ส่งไฟล์เพิ่ม
                  </button>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                    กลับขึ้นด้านบน
                  </button>
                </div>
              </article>
            )}

            {showError && (
              <article className="rounded-3xl border border-rose-100 bg-rose-50/80 p-4 shadow-[0_16px_40px_rgba(244,63,94,0.12)] sm:p-5">
                <div className="mb-2 inline-flex rounded-full bg-rose-600 p-2 text-white">
                  <ErrorOutlineRounded className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-rose-800">ต้องตรวจสอบบางรายการ</h3>
                <div className="mt-3 space-y-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm">
                  {envError ? <p className="text-rose-700">{envError}</p> : null}
                  {globalError ? <p className="text-rose-700">{globalError}</p> : null}
                  {errorItems.slice(0, 3).map(item => (
                    <div key={`error-${item.id}`}>
                      <p className="font-medium text-slate-800">ไฟล์: {item.file.name}</p>
                      <p className="text-rose-700">สาเหตุ: {item.errorMessage ?? 'อัปโหลดไม่สำเร็จ'}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={isUploading || Boolean(envError) || (waitingItems.length === 0 && errorItems.length === 0)}
                  className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition enabled:hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                  ลองอัปโหลดอีกครั้ง
                </button>
              </article>
            )}
          </aside>
        </section>

        <footer className="sticky bottom-2 z-20 rounded-2xl border border-indigo-100 bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-start justify-between gap-3 md:hidden">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">ขั้นตอน {currentStep}/4</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{steps[currentStep - 1]}</p>
              <p className="mt-1 text-xs text-slate-500">
                {totalFiles > 0 ? `เลือกแล้ว ${totalFiles} ไฟล์ • สำเร็จ ${uploadedCount} ไฟล์` : `ประเภทงาน ${selectedJobLabel}`}
              </p>
            </div>
            {showUploadProgress ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-right">
                <p className="text-[11px] font-medium text-indigo-600">ความคืบหน้า</p>
                <p className="text-sm font-semibold text-indigo-800">{uploadProgress}%</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => getPreviousStep(prev))}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <ExpandMoreRounded className="h-4 w-4 rotate-90" />
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={canAdvanceStep ? () => setCurrentStep(prev => getNextStep(prev)) : handleUploadAll}
              disabled={primaryActionDisabled}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px]">
              {getPrimaryActionLabel(isUploading, currentStep)}
              <ExpandMoreRounded className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
