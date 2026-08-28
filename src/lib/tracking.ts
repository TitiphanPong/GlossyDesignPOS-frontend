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
