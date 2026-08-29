'use client';

import * as React from 'react';
import { Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography, alpha } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { QRCodeCanvas } from 'qrcode.react';
import type { PaymentMethod } from '@/lib/contracts';
import type { CustomerProfile } from '@/lib/customers';
import CustomerPicker from '@/components/customers/CustomerPicker';
import { buildPaymentQrPayload, getPaymentQrProfileFromEnv, paymentQrRequiresManualAmount } from '@/lib/promptpay';
import { calculateChange, canConfirmQuickSalePayment } from '../quickSale';

type QuickSalePaymentDialogProps = Readonly<{
  open: boolean;
  itemCount: number;
  grandTotal: number;
  vatAmount: number;
  paymentMethod: PaymentMethod;
  taxInvoice: 'yes' | 'no';
  receivedAmount: number;
  submitting: boolean;
  entryMode: 'normal' | 'backdated';
  saleDateTime: string;
  backdatedReason: string;
  selectedCustomer: CustomerProfile | null;
  onCustomerChange: (customer: CustomerProfile | null) => void;
  onCreateCustomer: () => void;
  onClose: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onTaxInvoiceChange: (value: 'yes' | 'no') => void;
  onReceivedAmountChange: (amount: number) => void;
  onConfirm: () => void;
  onEntryModeChange: (mode: 'normal' | 'backdated') => void;
  onSaleDateTimeChange: (value: string) => void;
  onBackdatedReasonChange: (value: string) => void;
}>;

const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const amountSx = { fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.035em' } as const;

function PaymentMethodCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: Readonly<{
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}>) {
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        minHeight: 96,
        p: 1.75,
        borderRadius: 3.5,
        justifyContent: 'flex-start',
        textAlign: 'left',
        textTransform: 'none',
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? theme => alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        color: 'text.primary',
        '&:hover': { borderWidth: selected ? 1.5 : 1, borderColor: 'primary.main', bgcolor: selected ? theme => alpha(theme.palette.primary.main, 0.09) : 'action.hover' },
      }}>
      <Box
        sx={{
          width: 46,
          height: 46,
          mr: 1.5,
          flexShrink: 0,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: selected ? 'primary.main' : 'grey.100',
          color: selected ? 'primary.contrastText' : 'text.secondary',
        }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography fontWeight={800}>{title}</Typography>
          {selected && <CheckCircleOutlineRoundedIcon color="primary" sx={{ fontSize: 18 }} />}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Button>
  );
}

export default function QuickSalePaymentDialog({
  open,
  itemCount,
  grandTotal,
  vatAmount,
  paymentMethod,
  taxInvoice,
  receivedAmount,
  submitting,
  entryMode,
  saleDateTime,
  backdatedReason,
  selectedCustomer,
  onCustomerChange,
  onCreateCustomer,
  onClose,
  onPaymentMethodChange,
  onTaxInvoiceChange,
  onReceivedAmountChange,
  onConfirm,
  onEntryModeChange,
  onSaleDateTimeChange,
  onBackdatedReasonChange,
}: QuickSalePaymentDialogProps) {
  const [manualTransferVerified, setManualTransferVerified] = React.useState(false);
  const changeAmount = calculateChange(receivedAmount, grandTotal);
  const missingAmount = Math.max(0, grandTotal - receivedAmount);
  const hasEnoughCash = receivedAmount >= grandTotal;
  const paymentQrProfile = getPaymentQrProfileFromEnv();
  const hasPaymentQrProfile = Boolean(paymentQrProfile);
  const requiresManualAmount = paymentQrProfile ? paymentQrRequiresManualAmount(paymentQrProfile) : false;
  const canConfirm = canConfirmQuickSalePayment({ paymentMethod, hasEnoughCash, hasPaymentQrProfile, manualTransferVerified });

  React.useEffect(() => {
    if (!open || paymentMethod !== 'promptpay' || hasPaymentQrProfile) {
      setManualTransferVerified(false);
    }
  }, [hasPaymentQrProfile, open, paymentMethod]);

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: { xs: 'calc(100% - 24px)', sm: 660 },
          maxWidth: 660,
          maxHeight: '90vh',
          m: { xs: 1.5, sm: 3 },
          borderRadius: { xs: 4, sm: 5.5 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 28px 80px rgba(15, 23, 42, 0.20)',
          overflow: 'hidden',
        },
      }}>
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: theme => alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}>
            <PaymentsOutlinedIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={900}>
              ชำระเงิน
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ดำเนินการรับชำระรายการขายหน้าร้าน
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={submitting} aria-label="ปิดหน้าต่างชำระเงิน" sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1, overflowY: 'auto' }}>
        <Stack gap={2.25}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              border: '1px solid',
              borderColor: theme => alpha(theme.palette.primary.main, 0.18),
              bgcolor: theme => alpha(theme.palette.primary.main, 0.055),
              px: 2.5,
              py: 2.25,
              textAlign: 'center',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 160,
                height: 160,
                borderRadius: '50%',
                right: -70,
                top: -95,
                bgcolor: theme => alpha(theme.palette.primary.main, 0.14),
                opacity: 0.5,
              },
            }}>
            <Typography color="text.secondary" fontWeight={700}>
              ยอดที่ต้องชำระ
            </Typography>
            <Typography color="primary.main" fontWeight={900} sx={{ ...amountSx, position: 'relative', zIndex: 1, my: 0.35, fontSize: { xs: 36, sm: 44 }, lineHeight: 1.2, overflowWrap: 'anywhere' }}>
              ฿{money.format(grandTotal)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {itemCount} รายการ · Quick Sale
            </Typography>
            {taxInvoice === 'yes' && (
              <Typography variant="body2" color="primary.main" fontWeight={800} sx={{ mt: 0.5 }}>
                รวมภาษีมูลค่าเพิ่ม 7% ฿{money.format(vatAmount)}
              </Typography>
            )}
            <Button
              component="a"
              href="/customer"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              startIcon={<DesktopWindowsOutlinedIcon />}
              endIcon={<OpenInNewRoundedIcon />}
              sx={{ mt: 1.5, borderRadius: 2.5, bgcolor: 'background.paper', textTransform: 'none', fontWeight: 700 }}>
              เปิดหน้าจอลูกค้า
            </Button>
          </Box>

          <CustomerPicker
            active={open}
            value={selectedCustomer}
            taxInvoice={taxInvoice}
            onChange={onCustomerChange}
            onCreateCustomer={onCreateCustomer}
          />

          <Box sx={{ p: { xs: 1.5, sm: 1.75 }, border: '1px solid #E5EAF2', borderRadius: 3.5, bgcolor: '#FBFCFE' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1.25 }}>
              <Box>
                <Typography fontWeight={900} color="#172033">
                  ประเภทการบันทึก
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  เลือกวันที่เกิดรายการขาย
                </Typography>
              </Box>
              {entryMode === 'backdated' ? <Chip size="small" label="ย้อนหลัง" color="warning" sx={{ fontWeight: 800 }} /> : null}
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
              <PaymentMethodCard
                selected={entryMode === 'normal'}
                icon={<CalendarTodayRoundedIcon />}
                title="ขายวันนี้"
                description="บันทึกด้วยวันที่ปัจจุบัน"
                onClick={() => onEntryModeChange('normal')}
              />
              <PaymentMethodCard
                selected={entryMode === 'backdated'}
                icon={<HistoryRoundedIcon />}
                title="ลงรายการย้อนหลัง"
                description="เลือกวันที่เกิดการขายจริง"
                onClick={() => onEntryModeChange('backdated')}
              />
            </Box>
            {entryMode === 'backdated' ? (
              <Stack
                gap={1.5}
                sx={{
                  mt: 1.5,
                  p: { xs: 1.5, sm: 1.75 },
                  border: '1px solid #F1DFC1',
                  borderRadius: 3,
                  background: 'linear-gradient(180deg, #FFFCF6 0%, #FFFFFF 72%)',
                }}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2.25,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: '#FFF0CF',
                      color: '#9A5B00',
                      flexShrink: 0,
                    }}>
                    <HistoryRoundedIcon sx={{ fontSize: 21 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={900} color="#3A2A10">
                      รายละเอียดการขายย้อนหลัง
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ระบุวันและเวลาที่เกิดการขายจริง
                    </Typography>
                  </Box>
                </Stack>

                <Alert
                  severity="warning"
                  variant="outlined"
                  icon={<WarningAmberRoundedIcon fontSize="inherit" />}
                  sx={{
                    alignItems: 'flex-start',
                    borderRadius: 2.5,
                    borderColor: '#F4D99B',
                    bgcolor: '#FFF8E8',
                    color: '#704600',
                    '& .MuiAlert-icon': { color: '#B76E00', pt: 0.25 },
                    '& .MuiAlert-message': { py: 0 },
                  }}>
                  <Typography variant="body2" fontWeight={800}>
                    เลข Order จะออกตามวันที่บันทึกปัจจุบัน
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: '#835C19' }}>
                    ยอดขายและรายงานจะนับตามวันขายย้อนหลังที่เลือกด้านล่าง
                  </Typography>
                </Alert>

                <DateTimePicker
                  label="วันที่และเวลาที่เกิดการขาย"
                  value={dayjs(saleDateTime)}
                  onChange={value => {
                    if (value?.isValid()) onSaleDateTimeChange(value.format('YYYY-MM-DDTHH:mm'));
                  }}
                  format="DD/MM/YYYY HH:mm"
                  ampm={false}
                  disableFuture
                  maxDateTime={dayjs()}
                  slotProps={{
                    actionBar: { actions: ['today', 'cancel', 'accept'] },
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'ใช้เป็นวันขายในรายงาน · เวลาโดยประมาณได้',
                      sx: {
                        '& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 2.5 },
                        '& .MuiFormHelperText-root': { mx: 0.5 },
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={2.5}
                  label="เหตุผลที่ลงรายการย้อนหลัง"
                  placeholder="เช่น นำเข้ารายการขายที่ตกหล่นจากวันที่ก่อน"
                  value={backdatedReason}
                  onChange={event => onBackdatedReasonChange(event.target.value)}
                  helperText={`${backdatedReason.length}/500 · ข้อมูลนี้ช่วยในการตรวจสอบย้อนหลัง`}
                  inputProps={{ maxLength: 500 }}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 2.5 },
                    '& .MuiFormHelperText-root': { mx: 0.5, textAlign: 'right' },
                  }}
                />
              </Stack>
            ) : null}
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 1.75 }, border: '1px solid #E5EAF2', borderRadius: 3.5, bgcolor: '#FBFCFE' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1.25 }}>
              <Box>
                <Typography fontWeight={900} color="#172033">
                  ประเภทเอกสาร
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  เลือกเอกสารสำหรับรายการขายนี้
                </Typography>
              </Box>
              {taxInvoice === 'yes' ? <Chip size="small" label="VAT 7%" color="primary" sx={{ fontWeight: 800 }} /> : null}
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
              <PaymentMethodCard selected={taxInvoice === 'no'} icon={<ReceiptLongOutlinedIcon />} title="ใบเสร็จรับเงิน" description="เอกสารการขายทั่วไป" onClick={() => onTaxInvoiceChange('no')} />
              <PaymentMethodCard selected={taxInvoice === 'yes'} icon={<RequestQuoteOutlinedIcon />} title="ใบกำกับภาษี" description="เอกสารพร้อม VAT 7%" onClick={() => onTaxInvoiceChange('yes')} />
            </Box>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 1.75 }, border: '1px solid #E5EAF2', borderRadius: 3.5, bgcolor: '#FBFCFE' }}>
            <Typography fontWeight={900} color="#172033" sx={{ mb: 1.25 }}>
              วิธีชำระเงิน
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
              <PaymentMethodCard selected={paymentMethod === 'cash'} icon={<LocalAtmOutlinedIcon />} title="เงินสด" description="รับเงินสดหน้าร้าน" onClick={() => onPaymentMethodChange('cash')} />
              <PaymentMethodCard
                selected={paymentMethod === 'promptpay'}
                icon={<QrCode2RoundedIcon />}
                title="โอนเงิน / PromptPay"
                description="ให้ลูกค้าสแกนเพื่อชำระ"
                onClick={() => onPaymentMethodChange('promptpay')}
              />
            </Box>
          </Box>

          {paymentMethod === 'cash' ? (
            <Stack gap={1.5} sx={{ p: { xs: 1.5, sm: 1.75 }, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFC' }}>
              <Box>
                <Typography fontWeight={800} sx={{ mb: 1 }}>
                  จำนวนเงินที่รับ
                </Typography>
                <TextField
                  autoFocus
                  fullWidth
                  type="number"
                  value={receivedAmount || ''}
                  inputProps={{ min: 0, step: 0.01, inputMode: 'decimal', 'aria-label': 'จำนวนเงินที่รับ' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography fontSize={24} fontWeight={800}>
                          ฿
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  onChange={event => onReceivedAmountChange(Math.max(0, Number(event.target.value) || 0))}
                  helperText="จำนวนเงินสดที่รับจากลูกค้า"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: 62, borderRadius: 3 }, '& input': { py: 1.5, fontSize: 24, fontWeight: 800, ...amountSx } }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(6, minmax(0, 1fr))' }, gap: 1, width: '100%' }}>
                {[
                  { label: 'พอดี', value: grandTotal, emphasized: true },
                  { label: '฿20', value: 20 },
                  { label: '฿50', value: 50 },
                  { label: '฿100', value: 100 },
                  { label: '฿500', value: 500 },
                  { label: '฿1,000', value: 1000 },
                ].map(option => (
                  <Button
                    key={option.label}
                    variant={option.emphasized ? 'contained' : 'outlined'}
                    onClick={() => onReceivedAmountChange(option.emphasized ? option.value : receivedAmount + option.value)}
                    sx={{ minHeight: 44, minWidth: 0, width: '100%', px: 1, borderRadius: 2.5, fontWeight: 800 }}>
                    {option.label}
                  </Button>
                ))}
              </Box>

              {hasEnoughCash ? (
                <Box sx={{ p: 1.75, borderRadius: 3, bgcolor: theme => alpha(theme.palette.success.main, 0.07), border: '1px solid', borderColor: theme => alpha(theme.palette.success.main, 0.2) }}>
                  <Stack direction="row" alignItems="center" gap={1} color="success.dark">
                    <CheckCircleOutlineRoundedIcon />
                    <Typography fontWeight={800}>เงินทอน</Typography>
                  </Stack>
                  <Typography color="success.dark" fontWeight={900} sx={{ ...amountSx, mt: 0.35, fontSize: 28 }}>
                    ฿{money.format(changeAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รับ ฿{money.format(receivedAmount)} · ยอด ฿{money.format(grandTotal)}
                  </Typography>
                </Box>
              ) : (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  sx={{ p: 1.75, borderRadius: 3, bgcolor: theme => alpha(theme.palette.warning.main, 0.09), border: '1px solid', borderColor: theme => alpha(theme.palette.warning.main, 0.22) }}>
                  <Stack direction="row" alignItems="center" gap={1} color="warning.dark">
                    <WarningAmberRoundedIcon />
                    <Typography fontWeight={800}>จำนวนเงินยังไม่ครบ</Typography>
                  </Stack>
                  <Typography color="warning.dark" fontWeight={900} sx={amountSx}>
                    ขาดอีก ฿{money.format(missingAmount)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack gap={1.25}>
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: theme => alpha(theme.palette.primary.main, 0.18),
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.055),
                  textAlign: 'center',
                }}>
                <Typography fontWeight={900}>สแกนเพื่อชำระเงิน</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75 }}>
                  ให้ลูกค้าสแกน QR Code เพื่อชำระเงิน
                </Typography>
                {paymentQrProfile ? (
                  <Stack alignItems="center" gap={1}>
                    <Box sx={{ width: 'fit-content', maxWidth: '100%', mx: 'auto', p: 1.5, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                      <QRCodeCanvas value={buildPaymentQrPayload(paymentQrProfile, grandTotal)} size={190} style={{ display: 'block', width: 'min(190px, 56vw)', height: 'auto' }} />
                    </Box>
                    <Typography variant="body2" fontWeight={800}>{paymentQrProfile.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">{paymentQrProfile.displayIdentifier}</Typography>
                    {requiresManualAmount ? (
                      <Typography variant="caption" color="warning.dark" fontWeight={800} sx={{ maxWidth: 360 }}>
                        QR ร้านค้าเป็นแบบไม่ล็อกยอด กรุณากรอก ฿{money.format(grandTotal)} ในแอปธนาคาร
                      </Typography>
                    ) : null}
                  </Stack>
                ) : (
                  <Stack alignItems="center" gap={1} sx={{ py: 2, color: 'warning.dark' }}>
                    <QrCode2RoundedIcon sx={{ fontSize: 54, opacity: 0.35 }} />
                    <Typography variant="body2" fontWeight={800}>QR ในระบบยังไม่พร้อม</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 360 }}>
                      ใช้ QR หน้าร้านหรือรับโอนผ่านช่องทางของร้านได้ตามปกติ แล้วตรวจสอบยอดเงินเข้าก่อนบันทึกรายการ
                    </Typography>
                  </Stack>
                )}
                <Typography color="primary.main" fontWeight={900} sx={{ ...amountSx, mt: 1.5, fontSize: 28 }}>
                  ฿{money.format(grandTotal)}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" gap={1} sx={{ px: 1.5, py: 1.25, borderRadius: 2.5, bgcolor: theme => alpha(theme.palette.warning.main, 0.09), color: 'warning.dark' }}>
                <WarningAmberRoundedIcon fontSize="small" />
                <Typography variant="body2" fontWeight={700}>
                  กรุณาตรวจสอบยอดเงินเข้าก่อนยืนยันการขาย
                </Typography>
              </Stack>
              {!paymentQrProfile ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={manualTransferVerified}
                      onChange={event => setManualTransferVerified(event.target.checked)}
                      inputProps={{ 'aria-label': 'ตรวจสอบยอดเงินเข้าแล้ว' }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={800}>ตรวจสอบยอดเงินเข้าแล้ว</Typography>
                      <Typography variant="caption" color="text.secondary">ยืนยันว่าร้านได้รับเงิน ฿{money.format(grandTotal)} ก่อนลงรายการนี้</Typography>
                    </Box>
                  }
                  sx={{
                    m: 0,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: manualTransferVerified ? 'success.light' : 'divider',
                    bgcolor: manualTransferVerified ? theme => alpha(theme.palette.success.main, 0.06) : 'background.paper',
                    alignItems: 'center',
                  }}
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          display: 'block',
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          px: { xs: 2, sm: 3 },
          pt: 1.75,
          pb: { xs: 2, sm: 2.5 },
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
        {paymentMethod === 'cash' && hasEnoughCash && (
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, px: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              รับเงิน ฿{money.format(receivedAmount)}
            </Typography>
            <Typography variant="body2" fontWeight={800} color="success.dark">
              เงินทอน ฿{money.format(changeAmount)}
            </Typography>
          </Stack>
        )}
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={submitting || !canConfirm}
          onClick={onConfirm}
          startIcon={paymentMethod === 'promptpay' ? <CheckCircleOutlineRoundedIcon /> : <AccountBalanceWalletOutlinedIcon />}
          sx={{ minHeight: 62, borderRadius: 3, px: 2.25, fontSize: 16, fontWeight: 900, textTransform: 'none' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
            <span>{submitting ? 'กำลังบันทึก...' : paymentMethod === 'promptpay' ? 'ยืนยันว่าชำระเงินแล้ว' : hasEnoughCash ? 'ยืนยันการขาย' : 'จำนวนเงินยังไม่ครบ'}</span>
            <span style={amountSx}>฿{money.format(grandTotal)}</span>
          </Stack>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
