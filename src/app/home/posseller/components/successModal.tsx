'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Divider, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { PAYMENT_METHOD_LABELS, PaymentMethod, PendingOrderDraft } from '../../../../lib/contracts';
import { fetchApiJson, isMissingApiBaseError } from '../../../../lib/api';
import {
  buildPendingOrderPayload,
  getPendingOrderFinalStatus,
  isPendingOrderSubmitted,
  PENDING_ORDER_KEY,
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

function persistPendingOrder(order: StoredPendingOrderDraft | null) {
  if (order) {
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } else {
    localStorage.removeItem(PENDING_ORDER_KEY);
  }

  globalThis.dispatchEvent(new Event('storage'));
}

export default function SuccessModal({ open, payment, onClose, onPaid, onNewOrder }: Readonly<Props>) {
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<StoredPendingOrderDraft | null>(null);
  const remainingTotal = orderData?.remainingTotal ?? 0;
  const depositTotal = orderData?.depositTotal ?? 0;
  const grandTotal = orderData?.grandTotal ?? 0;
  const amountToShow = remainingTotal > 0 ? depositTotal : grandTotal;

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
      const order = readPendingOrder();

      if (order) {
        setOrderData(order);
        setIsPaid(isPendingOrderSubmitted(order));
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

      if (orderData?.clientDraftId && order.clientDraftId && order.clientDraftId !== orderData.clientDraftId) {
        alert('พบออเดอร์ใหม่ในระบบแล้ว กรุณาปิดหน้าต่างนี้และตรวจสอบรายการล่าสุดก่อนยืนยันอีกครั้ง');
        return;
      }

      if (order.orderSyncStatus === 'submitting') {
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

      const draftId = order.clientDraftId ?? globalThis.crypto.randomUUID();
      const submittingOrder: StoredPendingOrderDraft = {
        ...order,
        clientDraftId: draftId,
        orderSyncStatus: 'submitting',
        lastSubmissionError: null,
      };

      persistPendingOrder(submittingOrder);
      setOrderData(submittingOrder);
      setIsSubmitting(true);

      await fetchApiJson<PendingOrderDraft>('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPendingOrderPayload(submittingOrder, nextStatus)),
      });

      const submittedOrder: StoredPendingOrderDraft = {
        ...submittingOrder,
        status: nextStatus,
        orderSyncStatus: 'submitted',
        lastSubmissionError: null,
      };

      persistPendingOrder(submittedOrder);
      setOrderData(submittedOrder);
      setIsPaid(true);
      onPaid();
    } catch (error) {
      console.error(error);
      const message = isMissingApiBaseError(error)
        ? 'กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนยืนยันการชำระเงิน'
        : error instanceof Error && error.message
          ? error.message
          : 'เกิดข้อผิดพลาดในการยืนยันการชำระเงิน';

      const latestOrder = readPendingOrder();
      if (latestOrder && (!orderData?.clientDraftId || latestOrder.clientDraftId === orderData.clientDraftId)) {
        const resetOrder: StoredPendingOrderDraft = {
          ...latestOrder,
          orderSyncStatus: 'pending',
          lastSubmissionError: message,
        };
        persistPendingOrder(resetOrder);
        setOrderData(resetOrder);
      }

      alert(message);
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
          {isPaid ? <CheckCircleIcon color="success" fontSize="large" /> : <HourglassEmptyIcon color={isSubmitting ? 'info' : 'warning'} fontSize="large" />}
          <Typography variant="h6" fontWeight={800}>
            {isPaid ? 'ชำระเงินเรียบร้อย' : isSubmitting ? 'กำลังยืนยันการชำระเงิน' : 'รอชำระเงิน'}
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
            วิธีชำระเงิน: {payment === 'cash' ? 'เงินสด' : PAYMENT_METHOD_LABELS[payment]}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Divider sx={{ my: 2, width: '80%' }} />
        </Box>

        <Typography variant="body2" color="text.secondary" align="center">
          {isPaid ? 'ชำระเงินเสร็จสิ้น ระบบจะปิดอัตโนมัติใน 5 วินาที' : isSubmitting ? 'ระบบกำลังบันทึกออเดอร์ กรุณารอสักครู่และอย่าปิดหน้าต่างนี้' : 'โปรดยืนยันการชำระเงินก่อนปิดบิล'}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', px: 2.5, pb: 2, pt: 2 }}>
        {!isPaid && (
          <Button variant="contained" color={payment === 'cash' ? 'success' : 'warning'} startIcon={<DoneAllIcon />} onClick={handleConfirm} disabled={isSubmitting || !orderData}>
            {isSubmitting ? 'กำลังบันทึก...' : payment === 'cash' ? 'รับเงินแล้ว' : 'ยืนยันการโอนแล้ว'}
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ReplayIcon />}
          disabled={isSubmitting}
          onClick={() => {
            persistPendingOrder(null);
            onNewOrder();
          }}>
          ทำรายการใหม่
        </Button>
      </DialogActions>
    </Dialog>
  );
}
