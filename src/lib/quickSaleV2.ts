import { fetchApiJson, isRecord } from './api';

export type DocumentWorkType = 'print' | 'copy' | 'scan';
export type DocumentSize = 'A4' | 'A3';
export type DocumentColorMode = 'bw' | 'color';

export type QuickSaleV2DocumentMapping = {
  workType: DocumentWorkType;
  size: DocumentSize;
  colorMode: DocumentColorMode;
  quickProductId: string;
};

export type QuickSaleV2Config = {
  mappings: QuickSaleV2DocumentMapping[];
  version: number;
  updatedAt: string | null;
};

const WORK_TYPES: DocumentWorkType[] = ['print', 'copy', 'scan'];
const SIZES: DocumentSize[] = ['A4', 'A3'];
const COLOR_MODES: DocumentColorMode[] = ['bw', 'color'];

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function normalizeMapping(value: unknown): QuickSaleV2DocumentMapping | null {
  if (!isRecord(value)) return null;
  if (!isOneOf(value.workType, WORK_TYPES) || !isOneOf(value.size, SIZES) || !isOneOf(value.colorMode, COLOR_MODES)) return null;
  if (typeof value.quickProductId !== 'string' || !value.quickProductId.trim()) return null;
  return {
    workType: value.workType,
    size: value.size,
    colorMode: value.colorMode,
    quickProductId: value.quickProductId.trim(),
  };
}

function normalizeConfig(value: unknown): QuickSaleV2Config {
  const raw = isRecord(value) ? value : {};
  return {
    mappings: Array.isArray(raw.mappings) ? raw.mappings.map(normalizeMapping).filter((mapping): mapping is QuickSaleV2DocumentMapping => Boolean(mapping)) : [],
    version: typeof raw.version === 'number' && Number.isFinite(raw.version) ? raw.version : 0,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  };
}

export function documentMappingKey(selection: Pick<QuickSaleV2DocumentMapping, 'workType' | 'size' | 'colorMode'>): string {
  return `${selection.workType}:${selection.size}:${selection.colorMode}`;
}

export function resolveDocumentMapping(
  mappings: QuickSaleV2DocumentMapping[],
  selection: Pick<QuickSaleV2DocumentMapping, 'workType' | 'size' | 'colorMode'>,
): QuickSaleV2DocumentMapping | null {
  const key = documentMappingKey(selection);
  return mappings.find(mapping => documentMappingKey(mapping) === key) ?? null;
}

export async function fetchQuickSaleV2Published(): Promise<QuickSaleV2Config> {
  return normalizeConfig(await fetchApiJson<unknown>('/quick-sale-v2/config', { cache: 'no-store' }));
}

export async function fetchQuickSaleV2Draft(): Promise<QuickSaleV2Config> {
  return normalizeConfig(await fetchApiJson<unknown>('/quick-sale-v2/config/draft', { cache: 'no-store' }));
}

export async function updateQuickSaleV2Draft(mappings: QuickSaleV2DocumentMapping[]): Promise<QuickSaleV2Config> {
  return normalizeConfig(
    await fetchApiJson<unknown>('/quick-sale-v2/config/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mappings }),
    }),
  );
}

export async function publishQuickSaleV2Draft(): Promise<QuickSaleV2Config> {
  return normalizeConfig(await fetchApiJson<unknown>('/quick-sale-v2/config/publish', { method: 'POST' }));
}
