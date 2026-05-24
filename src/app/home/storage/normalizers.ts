export type StorageStatus = 'waiting' | 'processing' | 'completed';

export type UploadApiFile = {
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

export type UploadApiRecord = {
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
  files?: Array<UploadApiFile | string>;
  createdAt?: string;
  status?: string;
};

export type FileItem = {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  size: string;
};

export type StorageRow = {
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

export function inferStatus(rawStatus?: string): StorageStatus {
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

export function normalizeFiles(rawFiles: UploadApiRecord['files']): FileItem[] {
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

export function normalizeRecord(raw: UploadApiRecord): StorageRow {
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
