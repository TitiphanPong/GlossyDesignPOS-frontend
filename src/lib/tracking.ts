import { fetchApiJson } from './api';

export type PublicTrackingMilestone =
  | 'received'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PublicTrackingMilestoneEntry = {
  milestone: PublicTrackingMilestone;
  reachedAt?: string;
};

export type PublicTrackingResult = {
  orderNumber: string;
  currentMilestone: PublicTrackingMilestone;
  milestones: PublicTrackingMilestoneEntry[];
  updatedAt?: string;
};

export type PublicTrackingTimelineState = 'completed' | 'current' | 'upcoming' | 'cancelled';

export type PublicTrackingTimelineItem = {
  milestone: PublicTrackingMilestone;
  state: PublicTrackingTimelineState;
  reachedAt?: string;
};

export const PUBLIC_TRACKING_MILESTONE_COPY: Record<
  PublicTrackingMilestone,
  { label: string; description: string }
> = {
  received: {
    label: 'รับออเดอร์แล้ว',
    description: 'ร้านได้รับออเดอร์และกำลังตรวจสอบรายละเอียดงาน',
  },
  in_progress: {
    label: 'กำลังดำเนินการ',
    description: 'งานอยู่ระหว่างการผลิตหรือจัดเตรียม',
  },
  ready: {
    label: 'พร้อมรับงาน',
    description: 'งานเสร็จแล้วและพร้อมให้รับหรือดำเนินการส่งมอบ',
  },
  completed: {
    label: 'เสร็จสิ้น',
    description: 'งานถูกส่งมอบเรียบร้อยแล้ว',
  },
  cancelled: {
    label: 'ยกเลิก',
    description: 'ออเดอร์นี้ถูกยกเลิกและหยุดดำเนินการแล้ว',
  },
};

export const PUBLIC_TRACKING_FLOW: Exclude<PublicTrackingMilestone, 'cancelled'>[] = [
  'received',
  'in_progress',
  'ready',
  'completed',
];

export function getOrderPrefillFromSearch(search: string): string {
  const normalizedSearch = search.startsWith('?') ? search.slice(1) : search;
  const order = new URLSearchParams(normalizedSearch).get('order');
  return order?.trim().slice(0, 64) ?? '';
}

export function getTrackingTokenFromSearch(search: string): string {
  const normalizedSearch = search.startsWith('?') ? search.slice(1) : search;
  const token = new URLSearchParams(normalizedSearch).get('t')?.trim() ?? '';
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
}

export function buildPublicTrackingTimeline(result: PublicTrackingResult): PublicTrackingTimelineItem[] {
  const reachedAtByMilestone = new Map(
    result.milestones.map(entry => [entry.milestone, entry.reachedAt] as const),
  );

  if (result.currentMilestone === 'cancelled') {
    const reachedFlow = PUBLIC_TRACKING_FLOW.filter(milestone => reachedAtByMilestone.has(milestone)).map(
      milestone => ({
        milestone,
        reachedAt: reachedAtByMilestone.get(milestone),
        state: 'completed' as const,
      }),
    );

    return [
      ...reachedFlow,
      {
        milestone: 'cancelled',
        reachedAt: reachedAtByMilestone.get('cancelled') ?? result.updatedAt,
        state: 'cancelled',
      },
    ];
  }

  const currentIndex = PUBLIC_TRACKING_FLOW.indexOf(result.currentMilestone);
  return PUBLIC_TRACKING_FLOW.map((milestone, index) => ({
    milestone,
    reachedAt: reachedAtByMilestone.get(milestone),
    state: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming',
  }));
}

export async function trackOrder(orderNumber: string, phoneSuffix: string): Promise<PublicTrackingResult> {
  return fetchApiJson<PublicTrackingResult>('/tracking/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: orderNumber.trim(),
      phoneSuffix: phoneSuffix.trim(),
    }),
    cache: 'no-store',
  });
}

export async function trackOrderByToken(token: string): Promise<PublicTrackingResult> {
  const normalizedToken = token.trim();
  if (!/^[A-Za-z0-9_-]{43}$/.test(normalizedToken)) {
    throw new Error('invalid_tracking_token');
  }

  return fetchApiJson<PublicTrackingResult>('/tracking/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: normalizedToken }),
    cache: 'no-store',
  });
}
