import type { ReactNode } from 'react';

import type { OrderStatus, OrderType, PaymentMethod } from '../../../lib/contracts';

export type PaymentStatus = OrderStatus;
export type SortOrder = 'newest' | 'oldest' | 'high' | 'low';
export type OrderTypeFilter = 'all' | OrderType;
export type ExportType = 'excel' | 'pdf' | 'sales';

export type OrderProduct = {
  name: string;
  qty: number;
  price: number;
};

export type TimelineEvent = {
  title: string;
  at: string;
  note?: string;
};

export type OrderRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  orderType: OrderType;
  taxInvoice: 'yes' | 'no';
  customerName: string;
  phoneNumber: string;
  taxId: string;
  address: string;
  date: string;
  month: string;
  status: PaymentStatus;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  products: OrderProduct[];
  timeline: TimelineEvent[];
};

export type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  tone: string;
  icon: ReactNode;
};

export type ExportMenuProps = {
  anchorEl: HTMLElement | null;
  rows: OrderRow[];
  onClose: () => void;
};

export type RowActionsMenuProps = {
  anchorEl: HTMLElement | null;
  rowMenuTarget: OrderRow | null;
  updatingOrderId: string | null;
  onClose: () => void;
  onOpenDrawer: (row: OrderRow) => void;
  onCancelOrder: (id: string) => void;
  onDeleteOrder: (order: OrderRow) => void;
  onPrintDocument: (order: OrderRow, mode: 'receipt' | 'invoice') => void;
};

export type OrderDetailDrawerProps = {
  drawerOpen: boolean;
  selectedOrder: OrderRow | null;
  isMobile: boolean;
  isCompactDrawer: boolean;
  updatingOrderId: string | null;
  onClose: () => void;
  onSaveCustomer: (order: OrderRow, customer: Pick<OrderRow, 'customerName' | 'phoneNumber' | 'taxId' | 'address'>) => Promise<void>;
  onOpenPayRemaining: (order: OrderRow) => void;
  onConvertToTaxInvoice: (order: OrderRow) => Promise<void>;
  onCancelOrder: (id: string) => void;
  onPrintDocument: (order: OrderRow, mode: 'receipt' | 'invoice') => void;
};
