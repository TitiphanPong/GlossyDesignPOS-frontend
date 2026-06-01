'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { getDisplayOrderNumber, PAYMENT_METHOD_LABELS, PaymentMethod } from '../../../../lib/contracts';
import { isMissingApiBaseError } from '../../../../lib/api';
import { createOrder } from '../../../../lib/orders';
import {
  buildPendingOrderPayload,
  getPendingOrderFinalStatus,
  isPendingOrderSubmissionLocked,
  isPendingOrderSubmitted,
  PENDING_ORDER_KEY,
  persistPendingOrderDraft,
  type StoredPendingOrderDraft,
} from '../../../../lib/pending-order';

type Props = {
  open: boolean;
  payment: PaymentMethod;
  onClose: () => void;
  onPaid: () => void;
  onNewOrder: () => void;
};

function readPendingOrder(): StoredPendingOrderDraft | null {
  const orderStr = localStorage.getItem(PENDING_ORDER_KEY);
  if (!orderStr) return null;

  try {
    return JSON.parse(orderStr) as StoredPendingOrderDraft;
  } catch {
    return null;
  }
}

function getConfirmErrorMessage(error: unknown): string {
  if (isMissingApiBaseError(error)) {
    return 'กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนยืนยันการชำระเงิน';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'เกิดข้อผิดพลาดในการยืนยันการชำระเงิน';
}

function hasDraftConflict(currentOrder: StoredPendingOrderDraft, modalOrder: StoredPendingOrderDraft | null): boolean {
  return Boolean(
    modalOrder?.clientDraftId &&
      currentOrder.clientDraftId &&
      currentOrder.clientDraftId !== modalOrder.clientDraftId
  );
}

function buildSubmittingOrder(order: StoredPendingOrderDraft): StoredPendingOrderDraft {
  return {
    ...order,
    clientDraftId: order.clientDraftId ?? globalThis.crypto.randomUUID(),
    orderSyncStatus: 'submitting',
    orderSyncStartedAt: Date.now(),
    lastSubmissionError: null,
  };
}

function buildSubmittedOrder(
  order: StoredPendingOrderDraft,
  backendOrder: { orderId: string; orderNumber?: string; status?: StoredPendingOrderDraft['status'] },
  status: StoredPendingOrderDraft['status']
): StoredPendingOrderDraft {
  return {
    ...order,
    orderId: backendOrder.orderId,
    orderNumber: getDisplayOrderNumber(backendOrder),
    status: backendOrder.status ?? status,
    orderSyncStatus: 'submitted',
    orderSyncStartedAt: undefined,
    lastSubmissionError: null,
  };
}

function getDialogHeading(isPaid: boolean, isSubmitting: boolean): string {
  if (isPaid) return 'ชำระเงินเรียบร้อย';
  if (isSubmitting) return 'กำลังยืนยันการชำระเงิน';
  return 'รอชำระเงิน';
}

function getDialogDescription(isPaid: boolean, isSubmitting: boolean): string {
  if (isPaid) return 'ชำระเงินเสร็จสิ้น ระบบจะปิดอัตโนมัติใน 5 วินาที';
  if (isSubmitting) return 'ระบบกำลังบันทึกออเดอร์ กรุณารอสักครู่และอย่าปิดหน้าต่างนี้';
  return 'โปรดยืนยันการชำระเงินก่อนปิดบิล';
}

function getPrimaryActionLabel(payment: PaymentMethod, isSubmitting: boolean): string {
  if (isSubmitting) return 'กำลังบันทึก...';
  return payment === 'cash' ? 'รับเงินแล้ว' : 'ยืนยันการโอนแล้ว';
}

function getPrimaryActionColor(payment: PaymentMethod): 'success' | 'warning' {
  return payment === 'cash' ? 'success' : 'warning';
}

function getPaymentMethodLabel(payment: PaymentMethod): string {
  return payment === 'cash' ? 'เงินสด' : PAYMENT_METHOD_LABELS[payment];
}

function getOrderNumberColor(orderData: StoredPendingOrderDraft | null, submitError: string | null): string {
  const hasOrderNumber = Boolean(orderData?.orderNumber || orderData?.orderId);

  if (hasOrderNumber) {
    return 'text.primary';
  }

  return submitError ? 'error.main' : 'warning.main';
}

function getOrderNumberFallback(isSubmitting: boolean, submitError: string | null): string {
  if (isSubmitting) {
    return 'Waiting for backend...';
  }

  if (submitError) {
    return 'Not created yet';
  }

  return 'Pending confirmation';
}

export default function SuccessModal({ open, payment, onClose, onPaid, onNewOrder }: Readonly<Props>) {
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<StoredPendingOrderDraft | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const remainingTotal = orderData?.remainingTotal ?? 0;
  const depositTotal = orderData?.depositTotal ?? 0;
  const grandTotal = orderData?.grandTotal ?? 0;
  const amountToShow = remainingTotal > 0 ? depositTotal : grandTotal;

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
      setSubmitError(null);
      const order = readPendingOrder();

      if (order) {
        setOrderData(order);
        setIsPaid(isPendingOrderSubmitted(order));
        setSubmitError(order.lastSubmissionError ?? null);
      } else {
        setOrderData(null);
        setIsPaid(false);
      }
    }
  }, [open]);

  useEffect(() => {
    if (isPaid) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPaid, onClose]);

  const handleConfirm = async () => {
    if (isSubmitting || isPaid) return;

    try {
      const order = readPendingOrder();
      if (!order) {
        alert('ไม่พบข้อมูลออเดอร์ที่กำลังรอชำระเงิน');
        return;
      }

      if (hasDraftConflict(order, orderData)) {
        alert('พบออเดอร์ใหม่ในระบบแล้ว กรุณาปิดหน้าต่างนี้และตรวจสอบรายการล่าสุดก่อนยืนยันอีกครั้ง');
        return;
      }

      if (isPendingOrderSubmissionLocked(order)) {
        alert('ระบบกำลังยืนยันออเดอร์นี้อยู่แล้ว กรุณารอสักครู่ก่อนลองใหม่');
        return;
      }

      const nextStatus = getPendingOrderFinalStatus(order);

      if (isPendingOrderSubmitted(order)) {
        setOrderData(order);
        setIsPaid(true);
        onPaid();
        return;
      }

      const submittingOrder = buildSubmittingOrder(order);

      persistPendingOrderDraft(submittingOrder);
      setOrderData(submittingOrder);
      setIsSubmitting(true);
      setSubmitError(null);

      const createdOrder = await createOrder(buildPendingOrderPayload(submittingOrder, nextStatus));

      const submittedOrder = buildSubmittedOrder(submittingOrder, createdOrder, nextStatus);

      persistPendingOrderDraft(submittedOrder);
      setOrderData(submittedOrder);
      setIsPaid(true);
      onPaid();
    } catch (error) {
      console.error(error);
      const message = getConfirmErrorMessage(error);

      const latestOrder = readPendingOrder();
      if (latestOrder && (!orderData?.clientDraftId || latestOrder.clientDraftId === orderData.clientDraftId)) {
        const resetOrder: StoredPendingOrderDraft = {
          ...latestOrder,
          orderSyncStatus: 'pending',
          orderSyncStartedAt: undefined,
          lastSubmissionError: message,
        };
        persistPendingOrderDraft(resetOrder);
        setOrderData(resetOrder);
      }

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (isSubmitting && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        onClose();
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isPaid ? (
            <CheckCircleIcon color="success" fontSize="large" />
          ) : (
            <HourglassEmptyIcon color={isSubmitting ? 'info' : 'warning'} fontSize="large" />
          )}
          <Typography variant="h6" fontWeight={800}>
            {getDialogHeading(isPaid, isSubmitting)}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box textAlign="center" py={1}>
          <Typography variant="h3" fontWeight={800} color={isPaid ? 'success.main' : 'warning.main'}>
            {Number(amountToShow).toFixed(2)} บาท
          </Typography>

          {remainingTotal > 0 && (
            <Typography color="error" fontWeight={700} mt={1}>
              คงเหลือ: {remainingTotal.toFixed(2)} บาท
            </Typography>
          )}

          {orderData?.taxInvoice === 'yes' && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              (รวม VAT 7% = {(orderData.vatAmount ?? 0).toFixed(2)} บาท)
            </Typography>
          )}

          <Typography variant="body1" color="text.secondary" mt={1}>
            วิธีชำระเงิน: {getPaymentMethodLabel(payment)}
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={1.5}>
            Order Number:{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color: getOrderNumberColor(orderData, submitError),
              }}>
              {getDisplayOrderNumber(orderData ?? {}, getOrderNumberFallback(isSubmitting, submitError))}
            </Box>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Divider sx={{ my: 2, width: '80%' }} />
        </Box>

        {submitError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        ) : null}

        <Typography variant="body2" color="text.secondary" align="center">
          {getDialogDescription(isPaid, isSubmitting)}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', px: 2.5, pb: 2, pt: 2 }}>
        {!isPaid && (
          <Button
            variant="contained"
            color={getPrimaryActionColor(payment)}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <DoneAllIcon />}
            onClick={handleConfirm}
            disabled={isSubmitting || !orderData}>
            {getPrimaryActionLabel(payment, isSubmitting)}
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ReplayIcon />}
          disabled={isSubmitting}
          onClick={() => {
            persistPendingOrderDraft(null);
            onNewOrder();
          }}>
          ทำรายการใหม่
        </Button>
      </DialogActions>
    </Dialog>
  );
}
