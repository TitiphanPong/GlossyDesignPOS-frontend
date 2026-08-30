import { fetchApiJson } from './api';

export const PRODUCTION_STAGES = ['file_check', 'queued', 'producing', 'quality_check', 'ready', 'delivered'] as const;
export type ProductionStage = (typeof PRODUCTION_STAGES)[number];
export type ProductionPriority = 'normal' | 'rush';
export type ProductionDueFilter = 'all' | 'today' | 'overdue';

export type ProductionStageHistoryEntry = {
  stage: ProductionStage;
  changedAt: string;
  changedBy: string;
};

export type ProductionJob = {
  id: string;
  jobNumber: string;
  orderId: string;
  orderNumber: string;
  workSummary: string;
  jobType?: string;
  dueAt: string;
  dueAtBangkok: string;
  priority: ProductionPriority;
  isRush: boolean;
  isOverdue: boolean;
  assignee: { id: string; username: string } | null;
  internalNote?: string;
  linkedUploadIds: string[];
  stage: ProductionStage;
  customerMilestone: 'received' | 'in_progress' | 'ready' | 'completed';
  stageHistory: ProductionStageHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductionJobListResponse = {
  items: ProductionJob[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  stageCounts: Record<ProductionStage, number>;
};

export type ProductionAssignee = {
  id: string;
  username: string;
};

export type ProductionJobQuery = {
  page?: number;
  limit?: number;
  stage?: ProductionStage;
  priority?: ProductionPriority;
  assigneeUserId?: string;
  jobType?: string;
  due?: ProductionDueFilter;
  active?: boolean;
  q?: string;
};

export type CreateProductionJobInput = {
  orderId: string;
  workSummary: string;
  dueAt: string;
  jobType?: string;
  priority?: ProductionPriority;
  assigneeUserId?: string;
  internalNote?: string;
  linkedUploadIds?: string[];
};

export function bangkokLocalDateTimeToIso(value: string): string {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    throw new Error('กรุณาระบุวันและเวลากำหนดส่งให้ครบ');
  }
  const parsed = new Date(`${normalized}:00+07:00`);
  if (!Number.isFinite(parsed.getTime())) throw new Error('วันและเวลากำหนดส่งไม่ถูกต้อง');
  return parsed.toISOString();
}

export const PRODUCTION_STAGE_META: Record<ProductionStage, { label: string; shortLabel: string }> = {
  file_check: { label: 'ตรวจไฟล์', shortLabel: 'ตรวจไฟล์' },
  queued: { label: 'รอผลิต', shortLabel: 'คิว' },
  producing: { label: 'กำลังผลิต', shortLabel: 'ผลิต' },
  quality_check: { label: 'ตรวจคุณภาพ', shortLabel: 'QC' },
  ready: { label: 'พร้อมส่งมอบ', shortLabel: 'พร้อม' },
  delivered: { label: 'ส่งมอบแล้ว', shortLabel: 'ส่งแล้ว' },
};

export function nextProductionStage(stage: ProductionStage): ProductionStage | null {
  const index = PRODUCTION_STAGES.indexOf(stage);
  return index >= 0 && index < PRODUCTION_STAGES.length - 1 ? PRODUCTION_STAGES[index + 1] : null;
}

export function productionJobsPath(query: ProductionJobQuery = {}): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.stage) params.set('stage', query.stage);
  if (query.priority) params.set('priority', query.priority);
  if (query.assigneeUserId) params.set('assigneeUserId', query.assigneeUserId);
  if (query.jobType?.trim()) params.set('jobType', query.jobType.trim());
  if (query.due && query.due !== 'all') params.set('due', query.due);
  if (query.active !== undefined) params.set('active', String(query.active));
  if (query.q?.trim()) params.set('q', query.q.trim());
  const search = params.toString();
  return `/production/jobs${search ? `?${search}` : ''}`;
}

export function listProductionJobs(query: ProductionJobQuery = {}) {
  return fetchApiJson<ProductionJobListResponse>(productionJobsPath(query), { cache: 'no-store' });
}

export function createProductionJob(input: CreateProductionJobInput) {
  return fetchApiJson<ProductionJob>('/production/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function listProductionAssignees() {
  return fetchApiJson<ProductionAssignee[]>('/production/jobs/assignees', { cache: 'no-store' });
}

export function getProductionJob(id: string) {
  return fetchApiJson<ProductionJob>(`/production/jobs/${encodeURIComponent(id)}`, { cache: 'no-store' });
}

export function advanceProductionJob(id: string, stage: ProductionStage) {
  return fetchApiJson<ProductionJob>(`/production/jobs/${encodeURIComponent(id)}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
}

export function updateProductionJob(
  id: string,
  patch: { assigneeUserId?: string; internalNote?: string; jobType?: string; linkedUploadIds?: string[] },
) {
  return fetchApiJson<ProductionJob>(`/production/jobs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}
