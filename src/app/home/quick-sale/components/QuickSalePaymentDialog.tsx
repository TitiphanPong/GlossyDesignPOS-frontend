'use client';

import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, alpha } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import type { PaymentMethod } from '@/lib/contracts';
import { calculateChange } from '../quickSale';

type QuickSalePaymentDialogProps = Readonly<{
  open: boolean;
  itemCount: number;
  grandTotal: number;
  vatAmount: number;
  paymentMethod: PaymentMethod;
  taxInvoice: 'yes' | 'no';
  receivedAmount: number;
  submitting: boolean;
  onClose: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onTaxInvoiceChange: (value: 'yes' | 'no') => void;
  onReceivedAmountChange: (amount: number) => void;
  onConfirm: () => void;
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
  onClose,
  onPaymentMethodChange,
  onTaxInvoiceChange,
  onReceivedAmountChange,
  onConfirm,
}: QuickSalePaymentDialogProps) {
  const changeAmount = calculateChange(receivedAmount, grandTotal);
  const missingAmount = Math.max(0, grandTotal - receivedAmount);
  const hasEnoughCash = receivedAmount >= grandTotal;
  const canConfirm = paymentMethod === 'promptpay' || hasEnoughCash;
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID?.trim();

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

          <Box>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
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

          <Box
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              border: '1px solid #DFE7F2',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #FAFCFF 0%, #F3F7FD 100%)',
              boxShadow: '0 8px 24px rgba(36, 75, 125, 0.06)',
            }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={1.25}>
              <Box>
                <Typography fontWeight={900} color="#172033">
                  ประเภทเอกสาร
                </Typography>
                <Typography variant="body2" color="#718096">
                  เลือกเอกสารสำหรับรายการขายนี้
                </Typography>
              </Box>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={taxInvoice}
                onChange={(_, value: 'yes' | 'no' | null) => value && onTaxInvoiceChange(value)}
                sx={{
                  width: { sm: 'auto' },
                  gap: 0.75,
                  p: 0.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.72)',
                  border: '1px solid #E1E8F2',
                  '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '10px !important' },
                  '& .MuiToggleButton-root': {
                    minHeight: 48,
                    px: { xs: 1.25, sm: 1.75 },
                    gap: 0.75,
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    fontWeight: 800,
                    transition: 'all 160ms ease',
                  },
                  '& .MuiToggleButton-root:hover': { bgcolor: '#F3F7FC', color: '#245FB5' },
                  '& .Mui-selected': {
                    color: '#FFFFFF !important',
                    bgcolor: '#216FDC !important',
                    boxShadow: '0 7px 16px rgba(33, 111, 220, 0.25)',
                  },
                  '& .Mui-selected:hover': { bgcolor: '#1B62C5 !important' },
                }}>
                <ToggleButton value="no">
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
                  ใบเสร็จรับเงิน
                </ToggleButton>
                <ToggleButton value="yes">
                  <RequestQuoteOutlinedIcon sx={{ fontSize: 20 }} />
                  ใบกำกับภาษี
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
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
                {promptpayId ? (
                  <Box sx={{ width: 'fit-content', maxWidth: '100%', mx: 'auto', p: 1.5, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <QRCodeCanvas value={generatePayload(promptpayId, { amount: grandTotal })} size={190} style={{ display: 'block', width: 'min(190px, 56vw)', height: 'auto' }} />
                  </Box>
                ) : (
                  <Stack alignItems="center" gap={1} sx={{ py: 2, color: 'text.secondary' }}>
                    <QrCode2RoundedIcon sx={{ fontSize: 54, opacity: 0.35 }} />
                    <Typography variant="body2">ยังไม่ได้ตั้งค่า PromptPay สำหรับแสดง QR ในหน้าต่างนี้</Typography>
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
