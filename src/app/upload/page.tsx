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
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import StickyNote2Rounded from '@mui/icons-material/StickyNote2Rounded';
import TableChartRounded from '@mui/icons-material/TableChartRounded';
import ViewAgendaRounded from '@mui/icons-material/ViewAgendaRounded';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

type Step = 1 | 2 | 3 | 4;
type ColorMode = 'color' | 'bw';
type UploadStatus = 'uploaded' | 'uploading' | 'waiting';

type JobOption = {
  id: string;
  label: string;
  icon: typeof DescriptionRounded;
};

type UploadFileItem = {
  id: string;
  name: string;
  size: string;
  status: UploadStatus;
};

const steps = ['ข้อมูลลูกค้า', 'รายละเอียดงาน', 'อัปโหลดไฟล์', 'ตรวจสอบและส่ง'];

const jobOptions: JobOption[] = [
  { id: 'document', label: 'ปริ้นเอกสาร', icon: DescriptionRounded },
  { id: 'namecard', label: 'นามบัตร', icon: PersonRounded },
  { id: 'sticker', label: 'สติ๊กเกอร์', icon: StickyNote2Rounded },
  { id: 'banner', label: 'ป้าย / ไวนิล', icon: ViewAgendaRounded },
  { id: 'poster', label: 'โปสเตอร์', icon: ImageRounded },
  { id: 'binding', label: 'เข้าเล่ม', icon: Inventory2Rounded },
  { id: 'other', label: 'อื่นๆ', icon: DescriptionRounded },
];

const initialFiles: UploadFileItem[] = [];

function fileIconByName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return ImageRounded;
  if (ext === 'xlsx') return TableChartRounded;
  if (ext === 'zip') return Inventory2Rounded;
  return DescriptionRounded;
}

function glassCard(extra = '') {
  return `rounded-3xl border border-indigo-100/70 bg-white/85 shadow-[0_18px_45px_rgba(91,73,227,0.10)] backdrop-blur ${extra}`;
}

function getUploadStatusLabel(status: UploadStatus): 'uploaded' | 'uploading' | 'waiting' {
  if (status === 'uploaded') return 'uploaded';
  if (status === 'uploading') return 'uploading';
  return 'waiting';
}

type UploadFileRowProps = {
  readonly item: UploadFileItem;
  readonly onRemove: (id: string) => void;
  readonly statusPill: (status: UploadStatus) => ReactElement;
};

function UploadFileRow({ item, onRemove, statusPill }: UploadFileRowProps) {
  const Icon = fileIconByName(item.name);

  return (
    <motion.div layout className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
        <p className="text-xs text-slate-500">{item.size}</p>
      </div>
      {statusPill(item.status)}
      <button onClick={() => onRemove(item.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500" aria-label={`ลบไฟล์ ${item.name}`}>
        <DeleteOutlineRounded className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedJobType, setSelectedJobType] = useState<string>('document');
  const [quantity, setQuantity] = useState(1);
  const [colorMode, setColorMode] = useState<ColorMode>('color');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileItem[]>(initialFiles);
  const [uploadProgress] = useState(68);
  const [showUploadProgress] = useState(true);
  const [showSuccess] = useState(true);
  const [showError] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [sizeOption, setSizeOption] = useState('A4');
  const [jobNote, setJobNote] = useState('');

  const selectedJobLabel = useMemo(() => jobOptions.find(item => item.id === selectedJobType)?.label ?? '-', [selectedJobType]);

  const statusPill = (status: UploadStatus) => {
    if (status === 'uploaded') {
      return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">อัปโหลดแล้ว</span>;
    }
    if (status === 'uploading') {
      return <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">กำลังอัปโหลด</span>;
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

  const handleRemoveUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50/40 px-4 py-5 sm:px-6 sm:py-8">
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
              const stepNumber = index + 1;
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="space-y-1 sm:col-span-1">
                  <span className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์ *</span>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="space-y-1 sm:col-span-1">
                  <span className="text-sm font-medium text-slate-700">LINE ID (ถ้ามี)</span>
                  <input
                    value={lineId}
                    onChange={e => setLineId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">หมายเหตุเพิ่มเติม</span>
                  <textarea
                    value={customerNote}
                    onChange={e => setCustomerNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200">
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

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-700">จำนวน</p>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      aria-label="ลดจำนวน">
                      <ExpandMoreRounded className="h-4 w-4 rotate-90" />
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      aria-label="เพิ่มจำนวน">
                      <ExpandMoreRounded className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                </div>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">ขนาดงาน</span>
                  <select
                    value={sizeOption}
                    onChange={e => setSizeOption(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="A5">A5</option>
                    <option value="นามบัตร 9x5.5 ซม.">นามบัตร 9x5.5 ซม.</option>
                  </select>
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  ขนาดอื่นๆ
                </button>
                <div className="ml-auto inline-flex rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setColorMode('color')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${colorMode === 'color' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    สี
                  </button>
                  <button
                    onClick={() => setColorMode('bw')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${colorMode === 'bw' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    ขาวดำ
                  </button>
                </div>
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
              <h2 className="mb-3 text-base font-semibold text-slate-900">อัปโหลดไฟล์</h2>
              <div className="rounded-3xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/80 p-6 text-center transition hover:border-indigo-300 hover:shadow-md">
                <CloudUploadRounded className="mx-auto mb-2 h-10 w-10 text-indigo-600" />
                <p className="text-base font-semibold text-slate-800">ลากไฟล์มาวางที่นี่</p>
                <p className="mt-1 text-sm text-slate-500">หรือกดเลือกไฟล์จากอุปกรณ์ของคุณ</p>
                <button className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200">
                  เลือกไฟล์จากเครื่อง
                </button>
                <p className="mt-3 text-xs text-slate-500">รองรับไฟล์: PDF, JPG, PNG, AI, PSD, DOCX, XLSX, ZIP</p>
                <p className="text-xs text-slate-500">ขนาดไฟล์สูงสุด 100MB / ไฟล์</p>
              </div>

              <div className="mt-4 space-y-2.5">
                {uploadedFiles.map(item => (
                  <UploadFileRow key={item.id} item={item} onRemove={handleRemoveUploadedFile} statusPill={statusPill} />
                ))}
              </div>
            </article>

            <article className={`${glassCard()} p-4 sm:p-5`}>
              <h3 className="mb-2 text-base font-semibold text-slate-900">เคล็ดลับ</h3>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>ตรวจสอบความละเอียดของไฟล์ให้ชัดเจน</li>
                <li>ไฟล์ PDF ควรฝังฟอนต์ (Embed Font)</li>
                <li>สี CMYK สำหรับงานพิมพ์ จะได้สีใกล้เคียงที่สุด</li>
              </ul>
            </article>
          </div>

          <aside className="space-y-4 xl:col-span-4">
            <article className={`${glassCard()} p-4 sm:p-5`}>
              <h3 className="mb-3 text-base font-semibold text-slate-900">รองรับทุกอุปกรณ์</h3>
              <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                <div className="rounded-xl bg-indigo-50 px-2 py-2 font-medium text-indigo-700">มือถือ</div>
                <div className="rounded-xl bg-indigo-50 px-2 py-2 font-medium text-indigo-700">แท็บเล็ต</div>
                <div className="rounded-xl bg-indigo-50 px-2 py-2 font-medium text-indigo-700">คอมพิวเตอร์</div>
              </div>
              <h4 className="mb-1 text-sm font-semibold text-slate-800">ทำไมต้องส่งไฟล์ที่นี่?</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>ส่งไฟล์ได้ง่ายและปลอดภัย</li>
                <li>รองรับไฟล์ใหญ่ถึง 100MB</li>
                <li>ติดตามสถานะงานได้</li>
              </ul>
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-sm">
                <p className="font-semibold text-slate-800">สอบถามเพิ่มเติม</p>
                <p className="mt-1 text-slate-600">LINE: @glossydesign</p>
                <p className="flex items-center gap-1 text-slate-600">
                  <PhoneRounded className="h-3.5 w-3.5" />
                  02-123-4567
                </p>
              </div>
            </article>

            <AnimatePresence>
              {showUploadProgress && (
                <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard()} p-4 sm:p-5`}>
                  <h3 className="text-base font-semibold text-slate-900">กำลังอัปโหลดไฟล์...</h3>
                  <div className="my-3 flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-indigo-100 text-indigo-700">
                      <span className="text-sm font-bold">{uploadProgress}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">ระบบกำลังส่งไฟล์ขึ้นเซิร์ฟเวอร์</p>
                      <p className="text-xs text-slate-500">กรุณาอย่าปิดหน้าต่างนี้</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {uploadedFiles.map(item => (
                      <div key={`progress-${item.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="truncate text-slate-700">{item.name}</span>
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
                <p className="mt-1 text-sm text-emerald-700">หมายเลขงาน: #GD240516-001</p>
                <div className="mt-3 space-y-1 text-sm text-emerald-900">
                  <p>ลูกค้า: {customerName || 'ระบุภายหลัง'}</p>
                  <p>เบอร์โทร: {phone || 'ระบุภายหลัง'}</p>
                  <p>ประเภทงาน: {selectedJobLabel}</p>
                  <p>ไฟล์ที่ส่ง: {uploadedFiles.length} ไฟล์</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">ส่งไฟล์เพิ่ม</button>
                  <button className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">กลับหน้าหลัก</button>
                </div>
              </article>
            )}

            {showError && (
              <article className="rounded-3xl border border-rose-100 bg-rose-50/80 p-4 shadow-[0_16px_40px_rgba(244,63,94,0.12)] sm:p-5">
                <div className="mb-2 inline-flex rounded-full bg-rose-600 p-2 text-white">
                  <ErrorOutlineRounded className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-rose-800">อัปโหลดไม่สำเร็จ</h3>
                <div className="mt-3 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm">
                  <p className="font-medium text-slate-800">ไฟล์: โลโก้.ai</p>
                  <p className="text-rose-700">สาเหตุ: การเชื่อมต่อขาดหายระหว่างอัปโหลด</p>
                </div>
                <button className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">ลองอัปโหลดอีกครั้ง</button>
              </article>
            )}
          </aside>
        </section>

        <footer className="sticky bottom-2 z-20 hidden rounded-2xl border border-indigo-100 bg-white/90 p-3 shadow-xl backdrop-blur md:block">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setCurrentStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <ExpandMoreRounded className="h-4 w-4 rotate-90" />
              ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(prev => (prev < 4 ? ((prev + 1) as Step) : prev))}
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200">
              ถัดไป: ตรวจสอบข้อมูล
              <ExpandMoreRounded className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
