export type StorageStatus = 'waiting' | 'pending' | 'completed';

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
  statusNote?: string;
  category?: string;
  jobType?: string;
  batchId?: string;
  stage?: string;
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
  sourceIds: string[];
  batchId?: string;
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

const BATCH_MARKER_PATTERN = /\[\[batch:([a-z0-9-]+)\]\]/i;
const STAGE_MARKER_PATTERN = /\[\[stage:(waiting-download|pending)\]\]/i;

export function inferStatus(rawStatus?: string): StorageStatus {
  const status = (rawStatus ?? '').toLowerCase();
  if (status.includes('complete') || status.includes('done') || status.includes('success')) return 'completed';
  if (status.includes('process') || status.includes('doing') || status.includes('working')) return 'pending';
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

function normalizeStage(value?: string): 'waiting' | 'pending' | undefined {
  const stage = String(value ?? '').toLowerCase().trim();
  if (stage === 'waiting' || stage === 'waiting-download') return 'waiting';
  if (stage === 'pending') return 'pending';
  return undefined;
}

function extractUploadMetadata(raw: Pick<UploadApiRecord, 'note' | 'statusNote' | 'batchId' | 'stage'>): { batchId?: string; stage?: 'waiting' | 'pending'; cleanNote: string } {
  const structuredBatchId = typeof raw.batchId === 'string' && raw.batchId.trim() ? raw.batchId.trim() : undefined;
  const structuredStage = normalizeStage(raw.stage);
  const structuredNote = typeof raw.statusNote === 'string' ? raw.statusNote.trim() : '';
  const rawNote = String(raw.note ?? '');
  const batchMatch = rawNote.match(BATCH_MARKER_PATTERN);
  const stageMatch = rawNote.match(STAGE_MARKER_PATTERN);
  const cleanNote = rawNote.replace(BATCH_MARKER_PATTERN, '').replace(STAGE_MARKER_PATTERN, '').replace(/\n{3,}/g, '\n\n').trim();

  return {
    batchId: structuredBatchId ?? batchMatch?.[1],
    stage: structuredStage ?? (stageMatch?.[1] === 'pending' ? 'pending' : stageMatch?.[1] === 'waiting-download' ? 'waiting' : undefined),
    cleanNote: structuredNote || cleanNote,
  };
}

function resolveStorageStatus(rawStatus?: string, stage?: 'waiting' | 'pending'): StorageStatus {
  const status = (rawStatus ?? '').toLowerCase();
  if (status.includes('complete') || status.includes('done') || status.includes('success')) return 'completed';
  if (stage === 'pending') return 'pending';
  if (stage === 'waiting') return 'waiting';
  if (status.includes('process') || status.includes('doing') || status.includes('working')) return 'pending';
  return 'waiting';
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
  const { batchId, stage, cleanNote } = extractUploadMetadata(raw);

  return {
    id,
    sourceIds: [id],
    batchId,
    uploadDate: createdAt,
    customerName: String(raw.customerName ?? raw.customer ?? 'ไม่ระบุชื่อลูกค้า'),
    phone: String(raw.phone ?? raw.phoneNumber ?? '-'),
    lineId: String(raw.lineId ?? raw.line ?? '-'),
    jobType: String(raw.jobType ?? raw.category ?? 'งานพิมพ์ทั่วไป'),
    files,
    status: resolveStorageStatus(raw.status, stage),
    notes: cleanNote || '-',
    activities: ['อัปโหลดไฟล์เข้าสู่ระบบคลังเอกสาร', 'เจ้าหน้าที่รับงานและตรวจไฟล์เบื้องต้น', 'รอคิวดาวน์โหลดเพื่อพิมพ์'],
  };
}

export function groupStorageRows(rows: readonly StorageRow[]): StorageRow[] {
  const grouped = new Map<string, StorageRow>();

  for (const row of rows) {
    const key = row.batchId ? `batch:${row.batchId}` : `single:${row.id}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...row,
        files: [...row.files],
        sourceIds: [...row.sourceIds],
        activities: [...row.activities],
      });
      continue;
    }

    const mergedFiles = [...existing.files];
    const seenFileIds = new Set(mergedFiles.map(file => file.id));
    row.files.forEach(file => {
      if (!seenFileIds.has(file.id)) {
        seenFileIds.add(file.id);
        mergedFiles.push(file);
      }
    });

    grouped.set(key, {
      ...existing,
      uploadDate: new Date(row.uploadDate).getTime() < new Date(existing.uploadDate).getTime() ? row.uploadDate : existing.uploadDate,
      files: mergedFiles,
      sourceIds: Array.from(new Set([...existing.sourceIds, ...row.sourceIds])),
      notes: existing.notes !== '-' ? existing.notes : row.notes,
      activities: Array.from(new Set([...existing.activities, ...row.activities])),
    });
  }

  return Array.from(grouped.values());
}
