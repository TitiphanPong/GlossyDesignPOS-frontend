import type { OrderType } from '../../../lib/contracts';

export type OrderKindBadgeKind = 'backdated' | 'rush' | 'normal';

export type OrderKindBadge = {
  kind: OrderKindBadgeKind;
  label: 'ย้อนหลัง' | 'งานด่วน' | 'งานปกติ';
};

type OrderKindBadgeSource = {
  orderType: OrderType;
  isBackdated: boolean;
};

export function getOrderKindBadge(order: OrderKindBadgeSource): OrderKindBadge {
  if (order.isBackdated) {
    return { kind: 'backdated', label: 'ย้อนหลัง' };
  }

  if (order.orderType === 'QUICK_SALE') {
    return { kind: 'rush', label: 'งานด่วน' };
  }

  return { kind: 'normal', label: 'งานปกติ' };
}
