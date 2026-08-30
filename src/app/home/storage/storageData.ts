import type { StorageRow, StorageStatus } from './normalizers';

export type SortType = 'newest' | 'oldest' | 'customer' | 'status';

export type StorageRowPatch = {
  status?: StorageStatus;
  notes?: string;
};

export function toPersistedUploadStatus(status: StorageStatus): 'pending' | 'completed' {
  return status === 'completed' ? 'completed' : 'pending';
}

export function toEditableStorageStatus(status: StorageStatus): StorageStatus {
  return status;
}

export function buildPersistedNote(note: string) {
  return note.trim();
}

export function rowContainsAnySourceId(row: Pick<StorageRow, 'sourceIds'>, targetIds: string[]): boolean {
  return row.sourceIds.some(sourceId => targetIds.includes(sourceId));
}

export function applyStorageRowPatch(row: StorageRow, patch: StorageRowPatch): StorageRow {
  return {
    ...row,
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.notes === undefined ? {} : { notes: patch.notes }),
  };
}

export function getBulkMutationTargetIds(selectedIds: string[], rowsById: Map<string, StorageRow>): string[] {
  return Array.from(new Set(selectedIds.flatMap(rowId => rowsById.get(rowId)?.sourceIds ?? [rowId])));
}

export function matchesStorageSearch(row: StorageRow, query: string): boolean {
  if (!query) return true;
  return (
    row.customerName.toLowerCase().includes(query) ||
    row.lineDisplayName.toLowerCase().includes(query) ||
    row.lineId.toLowerCase().includes(query) ||
    row.phone.toLowerCase().includes(query) ||
    row.jobType.toLowerCase().includes(query) ||
    row.notes.toLowerCase().includes(query)
  );
}

export function matchesStorageDateFilter(uploadDate: string, dateFilter: string): boolean {
  if (!dateFilter) return true;
  const day = new Date(uploadDate);
  return !Number.isNaN(day.getTime()) && day.toISOString().slice(0, 10) === dateFilter;
}

export function compareStorageRows(a: StorageRow, b: StorageRow, sortBy: SortType): number {
  if (sortBy === 'customer') return a.customerName.localeCompare(b.customerName);
  if (sortBy === 'status') return a.status.localeCompare(b.status);
  const firstTime = new Date(a.uploadDate).getTime();
  const secondTime = new Date(b.uploadDate).getTime();
  return sortBy === 'newest' ? secondTime - firstTime : firstTime - secondTime;
}

export function toStructuredStage(status?: StorageStatus): 'waiting-download' | 'pending' | 'completed' | undefined {
  if (status === 'waiting') return 'waiting-download';
  return status;
}
