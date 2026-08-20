import * as React from 'react';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ContactPageRoundedIcon from '@mui/icons-material/ContactPageRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import dayjs from 'dayjs';

import JobTimelineCard from '../components/JobTimelineCard';
import { commonButtonSx, statusChipSx } from '../components/adminUi';
import type { ExportMenuProps, OrderDetailDrawerProps, OrderRow, RowActionsMenuProps, StatCardProps } from './orderManagementTypes';
import { buildOrderTimelineItems, downloadCsv, formatMoney, PAYMENT_METHOD_LABELS_TH, statusChip } from './orderManagementUtils';

export function StatCard({ title, value, subtitle, tone, icon }: Readonly<StatCardProps>) {
  return (
    <Card
      sx={{
        borderRadius: 4.5,
        border: '1px solid #E8EDF5',
        boxShadow: '0 14px 32px rgba(13, 30, 64, 0.07)',
        background: `linear-gradient(135deg, ${alpha(tone, 0.11)} 0%, #FFFFFF 50%, #FCFDFF 100%)`,
        backdropFilter: 'blur(6px)',
      }}>
      <CardContent sx={{ p: 2.2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 12.7 }}>{title}</Typography>
            <Typography sx={{ mt: 0.75, fontWeight: 800, fontSize: 28, color: '#0B1325', lineHeight: 1.1 }}>{value}</Typography>
            <Typography sx={{ mt: 0.5, color: '#8A95A7', fontSize: 11.8 }}>{subtitle}</Typography>
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: tone,
              bgcolor: alpha(tone, 0.14),
              boxShadow: `0 10px 20px ${alpha(tone, 0.2)}`,
            }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ExportMenu({ anchorEl, rows, onClose }: Readonly<ExportMenuProps>) {
  const handleExport = (label: 'excel' | 'pdf' | 'sales') => {
    downloadCsv(rows, label);
    onClose();
  };

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: '1px solid #E6EDF7',
            boxShadow: '0 16px 34px rgba(15, 23, 42, 0.14)',
            p: 0.5,
          },
        },
      }}>
      <MenuItem onClick={() => handleExport('excel')}>ส่งออก Excel</MenuItem>
      <MenuItem onClick={() => handleExport('pdf')}>ส่งออก PDF</MenuItem>
      <MenuItem onClick={() => handleExport('sales')}>ส่งออกรายงานยอดขาย</MenuItem>
    </Menu>
  );
}

export function RowActionsMenu({ anchorEl, rowMenuTarget, updatingOrderId, onClose, onOpenDrawer, onCancelOrder, onDeleteOrder, onPrintDocument }: Readonly<RowActionsMenuProps>) {
  const rowMenuTargetId = rowMenuTarget?.id ?? '';
  const cancelOrderDisabled = !rowMenuTarget || updatingOrderId === rowMenuTargetId;

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: '1px solid #E6EDF7',
            boxShadow: '0 16px 34px rgba(15, 23, 42, 0.14)',
            p: 0.6,
          },
        },
      }}>
      <MenuItem
        onClick={() => {
          if (rowMenuTarget) onOpenDrawer(rowMenuTarget);
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <VisibilityRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>ดูรายละเอียด</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        sx={{ color: '#B42318' }}
        disabled={cancelOrderDisabled}
        onClick={() => {
          if (rowMenuTarget) onDeleteOrder(rowMenuTarget);
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <DeleteForeverRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>ลบรายการ</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (rowMenuTarget) onPrintDocument(rowMenuTarget, 'receipt');
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PrintRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>พิมพ์ใบเสร็จ</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        disabled={rowMenuTarget?.taxInvoice !== 'yes'}
        onClick={() => {
          if (rowMenuTarget) onPrintDocument(rowMenuTarget, 'invoice');
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ReceiptRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>พิมพ์ใบกำกับภาษี</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        sx={{ color: '#D73A49' }}
        disabled={cancelOrderDisabled}
        onClick={() => {
          if (rowMenuTarget) {
            onCancelOrder(rowMenuTarget.id);
          }
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CancelRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>ยกเลิกงาน</Typography>
        </Stack>
      </MenuItem>
    </Menu>
  );
}

function getOrderDetailDrawerPaperSx(isMobile: boolean) {
  return {
    width: isMobile ? '100%' : { sm: 420, md: 480, lg: 560 },
    maxHeight: isMobile ? '94vh' : '100vh',
    height: isMobile ? 'min(94vh, 860px)' : '100%',
    borderTopLeftRadius: isMobile ? 18 : 22,
    borderTopRightRadius: isMobile ? 18 : 0,
    borderBottomLeftRadius: isMobile ? 0 : 22,
    borderBottomRightRadius: 0,
    background: 'linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 100%)',
    overflow: 'hidden',
  };
}

type CustomerDraft = Pick<OrderRow, 'customerName' | 'phoneNumber' | 'taxId' | 'address'>;

const customerFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.75,
    bgcolor: '#FFFFFF',
    transition: 'box-shadow 160ms ease, background-color 160ms ease',
    '& fieldset': { borderColor: '#DCE5F1' },
    '&:hover fieldset': { borderColor: '#AFC3DE' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(43, 98, 238, 0.10)' },
  },
  '& .MuiInputLabel-root': { color: '#64748B' },
} as const;

function createCustomerDraft(order: OrderRow): CustomerDraft {
  return {
    customerName: order.customerName === '-' ? '' : order.customerName,
    phoneNumber: order.phoneNumber === '-' ? '' : order.phoneNumber,
    taxId: order.taxId === '-' ? '' : order.taxId,
    address: order.address === '-' ? '' : order.address,
  };
}

function DrawerHeader({ order }: Readonly<{ order: OrderRow }>) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 1.8, sm: 2.2 },
        borderBottom: '1px solid #E8EFF8',
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(10px)',
      }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>รายละเอียดงาน</Typography>
          <Typography sx={{ mt: 0.4, color: '#64748B' }}>
            {order.orderNumber} | {order.customerName}
          </Typography>
        </Box>
        {statusChip(order.status)}
      </Stack>
    </Box>
  );
}

function PaymentNotice({ order }: Readonly<{ order: OrderRow }>) {
  if (order.status !== 'pending' && order.status !== 'partial') return null;

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #FFD8A8', bgcolor: '#FFF8ED', boxShadow: 'none' }}>
      <CardContent sx={{ py: 1.2 }}>
        <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>
          {order.status === 'partial' ? 'งานนี้ชำระบางส่วน' : 'งานนี้รอชำระเงิน'}: คงเหลือ ฿{formatMoney(Math.max(order.total - order.paidAmount, 0))}
        </Typography>
      </CardContent>
    </Card>
  );
}

function OrderInfoCard({ order, isEditing }: Readonly<{ order: OrderRow; isEditing: boolean }>) {
  return (
    <Card
      sx={{
        borderRadius: 3.8,
        border: isEditing ? '1px solid #CFE0FA' : '1px solid #E6EDF7',
        boxShadow: 'none',
        background: isEditing ? 'linear-gradient(145deg, #F8FBFF 0%, #F3F7FD 100%)' : '#FFFFFF',
      }}>
      <CardContent sx={{ p: isEditing ? 2.2 : 2 }}>
        <Stack spacing={isEditing ? 1.6 : 1.1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#1E5EFF', 0.14), color: '#2156D8' }}>
              <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 700 }}>ข้อมูลรายการ</Typography>
          </Stack>
          <Typography sx={{ color: '#334155' }}>
            <strong>เลขที่งาน :</strong> {order.orderNumber}
          </Typography>
          <Typography sx={{ color: '#334155' }}>
            <strong>วันที่รับงาน :</strong> {dayjs(order.date).format('DD/MM/YYYY HH:mm')}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CustomerEditFields({ draft, editError, onDraftChange }: Readonly<{ draft: CustomerDraft; editError: string | null; onDraftChange: React.Dispatch<React.SetStateAction<CustomerDraft>> }>) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ px: 1.35, py: 1.1, borderRadius: 2.5, bgcolor: 'rgba(43, 98, 238, 0.07)', border: '1px solid rgba(43, 98, 238, 0.10)' }}>
        <Typography sx={{ color: '#254D8C', fontSize: 12.5, fontWeight: 700 }}>แก้ไขข้อมูลสำหรับติดต่อและออกเอกสาร</Typography>
        <Typography sx={{ mt: 0.2, color: '#718096', fontSize: 11.5 }}>เมื่อตรวจสอบข้อมูลเรียบร้อยแล้ว กด “บันทึกข้อมูล” ด้านล่าง</Typography>
      </Box>
      <TextField
        required
        fullWidth
        label="ชื่อลูกค้า"
        value={draft.customerName}
        onChange={event => onDraftChange(current => ({ ...current, customerName: event.target.value }))}
        error={Boolean(editError && !draft.customerName.trim())}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PersonRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={customerFieldSx}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
        <TextField
          label="เบอร์โทรศัพท์"
          value={draft.phoneNumber}
          onChange={event => onDraftChange(current => ({ ...current, phoneNumber: event.target.value }))}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={customerFieldSx}
        />
        <TextField
          label="เลขประจำตัวผู้เสียภาษี"
          value={draft.taxId}
          onChange={event => onDraftChange(current => ({ ...current, taxId: event.target.value }))}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={customerFieldSx}
        />
      </Box>
      <TextField
        fullWidth
        label="ที่อยู่สำหรับออกเอกสาร"
        value={draft.address}
        onChange={event => onDraftChange(current => ({ ...current, address: event.target.value }))}
        minRows={2}
        multiline
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0 }}>
                <LocationOnRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={customerFieldSx}
      />
      {editError ? (
        <Typography color="error" sx={{ fontSize: 12 }}>
          {editError}
        </Typography>
      ) : null}
    </Stack>
  );
}

function CustomerReadOnlyFields({ order }: Readonly<{ order: OrderRow }>) {
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <PersonRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
        <Typography>ชื่อลูกค้า : {order.customerName}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
        <Typography>เบอร์โทรศัพท์ : {order.phoneNumber}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <BadgeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
        <Typography>เลขประจำตัวผู้เสียภาษี : {order.taxId}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
        <Typography>ที่อยู่ : {order.address}</Typography>
      </Stack>
    </>
  );
}

function CustomerCard({
  order,
  isEditing,
  draft,
  editError,
  onDraftChange,
}: Readonly<{ order: OrderRow; isEditing: boolean; draft: CustomerDraft; editError: string | null; onDraftChange: React.Dispatch<React.SetStateAction<CustomerDraft>> }>) {
  return (
    <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
      <CardContent>
        <Stack spacing={1.1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#4F46E5', 0.14), color: '#4F46E5' }}>
              <ContactPageRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 700 }}>ข้อมูลลูกค้า</Typography>
          </Stack>
          {isEditing ? <CustomerEditFields draft={draft} editError={editError} onDraftChange={onDraftChange} /> : <CustomerReadOnlyFields order={order} />}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ProductsCard({ order }: Readonly<{ order: OrderRow }>) {
  return (
    <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#F59E0B', 0.14), color: '#B76E00' }}>
                <Inventory2RoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontWeight: 700 }}>รายการสินค้า / งาน</Typography>
            </Stack>
            <Chip label={`${order.products.length} รายการ`} size="small" sx={{ ...statusChipSx, bgcolor: '#FFF7E8', color: '#9A5B00' }} />
          </Stack>
          {order.products.length > 0 ? (
            <Stack divider={<Divider flexItem />}>
              {order.products.map((product, index) => (
                <Stack key={`${product.name}-${index}`} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.15 }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: '#1E293B', fontWeight: 700, overflowWrap: 'anywhere' }}>{product.name}</Typography>
                    <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 13 }}>
                      จำนวน {product.qty.toLocaleString('th-TH')} ชิ้น × ฿{formatMoney(product.price)}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#0F172A', fontWeight: 800, whiteSpace: 'nowrap' }}>฿{formatMoney(product.qty * product.price)}</Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Box sx={{ px: 1.5, py: 1.4, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, textAlign: 'center' }}>ไม่พบข้อมูลรายการสินค้า / งาน</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PaymentSummaryCard({ order }: Readonly<{ order: OrderRow }>) {
  return (
    <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
      <CardContent>
        <Stack spacing={1.05}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#1F9D63', 0.14), color: '#1F9D63' }}>
              <AttachMoneyRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography sx={{ fontWeight: 700 }}>สรุปยอดชำระ</Typography>
              <Chip label={PAYMENT_METHOD_LABELS_TH[order.paymentMethod]} sx={{ ...statusChipSx, width: 'fit-content', bgcolor: '#EEF8FF', color: '#1D4ED8' }} />
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ยอดก่อนส่วนลด</Typography>
            <Typography>฿{formatMoney(order.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ส่วนลด</Typography>
            <Typography>-฿{formatMoney(order.discount)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">VAT</Typography>
            <Typography>฿{formatMoney(order.vat)}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontWeight: 700 }}>ยอดสุทธิ</Typography>
            <Typography sx={{ fontWeight: 800 }}>฿{formatMoney(order.total)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ยอดที่ชำระแล้ว</Typography>
            <Typography sx={{ color: '#18794E', fontWeight: 700 }}>฿{formatMoney(order.paidAmount)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ยอดคงเหลือ</Typography>
            <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>฿{formatMoney(Math.max(order.total - order.paidAmount, 0))}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DrawerActionBar({
  order,
  isEditing,
  updatingOrderId,
  onEdit,
  onSaveCustomer,
  onOpenPayRemaining,
  onConvertToTaxInvoice,
  onOpenTaxInvoiceConfirm,
  onCancelOrder,
  onPrintDocument,
}: Readonly<{
  order: OrderRow;
  isEditing: boolean;
  updatingOrderId: string | null;
  onEdit: () => void;
  onSaveCustomer: () => void;
  onOpenPayRemaining: (order: OrderRow) => void;
  onConvertToTaxInvoice: (order: OrderRow) => Promise<void>;
  onOpenTaxInvoiceConfirm: () => void;
  onCancelOrder: (id: string) => void;
  onPrintDocument: (order: OrderRow, mode: 'receipt' | 'invoice') => void;
}>) {
  const isUpdating = updatingOrderId === order.id;

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 1.5, sm: 1.8 },
        borderTop: '1px solid #E8EFF8',
        bgcolor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
      }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1}>
        {order.status === 'partial' ? (
          <Button
            variant="outlined"
            startIcon={<PaymentsRoundedIcon />}
            disabled={isUpdating}
            onClick={() => onOpenPayRemaining(order)}
            sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
            รับชำระยอดคงเหลือ
          </Button>
        ) : null}
        <Button
          variant="contained"
          startIcon={isEditing ? <SaveRoundedIcon /> : <EditRoundedIcon />}
          disabled={isUpdating}
          onClick={() => {
            if (isEditing) onSaveCustomer();
            else onEdit();
          }}
          sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
          {isEditing ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReceiptRoundedIcon />}
          disabled={isUpdating}
          onClick={async () => {
            if (order.taxInvoice === 'yes') {
              await onConvertToTaxInvoice(order);
              onPrintDocument(order, 'invoice');
            } else onOpenTaxInvoiceConfirm();
          }}
          sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
          {order.taxInvoice === 'yes' ? 'เปิดใบกำกับภาษี' : 'เปลี่ยนเป็นใบกำกับภาษี'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelRoundedIcon />}
          disabled={isUpdating}
          onClick={() => onCancelOrder(order.id)}
          sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
          ยกเลิกงาน
        </Button>
      </Stack>
    </Box>
  );
}

function TaxInvoiceConfirmDialog({
  open,
  order,
  updatingOrderId,
  error,
  onClose,
  onConfirm,
  onErrorChange,
}: Readonly<{
  open: boolean;
  order: OrderRow | null;
  updatingOrderId: string | null;
  error: string | null;
  onClose: () => void;
  onConfirm: (order: OrderRow) => Promise<void>;
  onErrorChange: (error: string | null) => void;
}>) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>ยืนยันออกใบกำกับภาษี</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography color="text.secondary">ระบบจะสร้างเลขที่ใบกำกับภาษีและบวก VAT 7% เพิ่มจากยอดเดิม ยอดรวมและยอดคงเหลือจะเพิ่มขึ้นตามภาษี</Typography>
          <Alert severity="warning">เมื่อยืนยันแล้ว จะไม่สามารถเปลี่ยนรายการนี้กลับเป็นใบเสร็จทั่วไปได้</Alert>
          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={updatingOrderId === order?.id}>
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          startIcon={<ReceiptRoundedIcon />}
          disabled={!order || updatingOrderId === order.id}
          onClick={async () => {
            if (!order) return;
            onErrorChange(null);
            try {
              await onConfirm(order);
              onClose();
            } catch {
              onErrorChange('ไม่สามารถออกใบกำกับภาษีได้ กรุณาลองใหม่อีกครั้ง');
            }
          }}>
          ยืนยันออกใบกำกับภาษี
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function OrderDetailDrawer({
  drawerOpen,
  selectedOrder,
  isMobile,
  isCompactDrawer,
  updatingOrderId,
  onClose,
  onSaveCustomer,
  onOpenPayRemaining,
  onConvertToTaxInvoice,
  onCancelOrder,
  onPrintDocument,
}: Readonly<OrderDetailDrawerProps>) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [customerDraft, setCustomerDraft] = React.useState({ customerName: '', phoneNumber: '', taxId: '', address: '' });
  const [taxInvoiceConfirmOpen, setTaxInvoiceConfirmOpen] = React.useState(false);
  const [taxInvoiceError, setTaxInvoiceError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedOrder) return;
    setCustomerDraft(createCustomerDraft(selectedOrder));
    setIsEditing(false);
    setEditError(null);
    setTaxInvoiceConfirmOpen(false);
    setTaxInvoiceError(null);
  }, [selectedOrder]);

  const saveCustomer = async () => {
    if (!selectedOrder || !customerDraft.customerName.trim()) {
      setEditError('กรุณาระบุชื่อลูกค้า');
      return;
    }
    setEditError(null);
    try {
      await onSaveCustomer(selectedOrder, customerDraft);
      setIsEditing(false);
    } catch {
      setEditError('แก้ไขข้อมูลลูกค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={drawerOpen}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: getOrderDetailDrawerPaperSx(isMobile),
        },
      }}>
      {selectedOrder ? (
        <Stack sx={{ height: '100%' }}>
          <DrawerHeader order={selectedOrder} />

          <Box
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 2, sm: 2.3 },
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
            }}>
            <Stack spacing={isCompactDrawer ? 1.25 : 1.5}>
              <PaymentNotice order={selectedOrder} />
              <OrderInfoCard order={selectedOrder} isEditing={isEditing} />

              {/*
                <>
              <Card
                sx={{
                  borderRadius: 3.8,
                  border: isEditing ? '1px solid #CFE0FA' : '1px solid #E6EDF7',
                  boxShadow: 'none',
                  background: isEditing ? 'linear-gradient(145deg, #F8FBFF 0%, #F3F7FD 100%)' : '#FFFFFF',
                }}>
                <CardContent sx={{ p: isEditing ? 2.2 : 2 }}>
                  <Stack spacing={isEditing ? 1.6 : 1.1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: alpha('#1E5EFF', 0.14),
                          color: '#2156D8',
                        }}>
                        <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>

                      <Typography sx={{ fontWeight: 700 }}>ข้อมูลรายการ</Typography>
                    </Stack>

                    <Typography sx={{ color: '#334155' }}>
                      <strong>เลขที่งาน :</strong> {selectedOrder.orderNumber}
                    </Typography>

                    <Typography sx={{ color: '#334155' }}>
                      <strong>วันที่รับงาน :</strong> {dayjs(selectedOrder.date).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 3.8,
                  border: '1px solid #E6EDF7',
                  boxShadow: 'none',
                }}>
                <CardContent>
                  <Stack spacing={1.1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: alpha('#4F46E5', 0.14),
                          color: '#4F46E5',
                        }}>
                        <ContactPageRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>

                      <Typography sx={{ fontWeight: 700 }}>ข้อมูลลูกค้า</Typography>
                    </Stack>

                    {isEditing ? (
                      <Stack spacing={1.5}>
                        <Box sx={{ px: 1.35, py: 1.1, borderRadius: 2.5, bgcolor: 'rgba(43, 98, 238, 0.07)', border: '1px solid rgba(43, 98, 238, 0.10)' }}>
                          <Typography sx={{ color: '#254D8C', fontSize: 12.5, fontWeight: 700 }}>แก้ไขข้อมูลสำหรับติดต่อและออกเอกสาร</Typography>
                          <Typography sx={{ mt: 0.2, color: '#718096', fontSize: 11.5 }}>เมื่อตรวจสอบข้อมูลเรียบร้อยแล้ว กด “บันทึกข้อมูล” ด้านล่าง</Typography>
                        </Box>
                        <TextField
                          required
                          fullWidth
                          label="ชื่อลูกค้า"
                          value={customerDraft.customerName}
                          onChange={event => setCustomerDraft(draft => ({ ...draft, customerName: event.target.value }))}
                          error={Boolean(editError && !customerDraft.customerName.trim())}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={customerFieldSx}
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
                          <TextField
                            label="เบอร์โทรศัพท์"
                            value={customerDraft.phoneNumber}
                            onChange={event => setCustomerDraft(draft => ({ ...draft, phoneNumber: event.target.value }))}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={customerFieldSx}
                          />
                          <TextField
                            label="เลขประจำตัวผู้เสียภาษี"
                            value={customerDraft.taxId}
                            onChange={event => setCustomerDraft(draft => ({ ...draft, taxId: event.target.value }))}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BadgeRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={customerFieldSx}
                          />
                        </Box>
                        <TextField
                          fullWidth
                          label="ที่อยู่สำหรับออกเอกสาร"
                          value={customerDraft.address}
                          onChange={event => setCustomerDraft(draft => ({ ...draft, address: event.target.value }))}
                          minRows={2}
                          multiline
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0 }}>
                                  <LocationOnRoundedIcon sx={{ color: '#6B7EA1', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={customerFieldSx}
                        />
                        {editError ? (
                          <Typography color="error" sx={{ fontSize: 12 }}>
                            {editError}
                          </Typography>
                        ) : null}
                      </Stack>
                    ) : (
                      <>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography>ชื่อลูกค้า : {selectedOrder.customerName}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography>เบอร์โทรศัพท์ : {selectedOrder.phoneNumber}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BadgeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography>เลขประจำตัวผู้เสียภาษี : {selectedOrder.taxId}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography>ที่อยู่ : {selectedOrder.address}</Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#F59E0B', 0.14), color: '#B76E00' }}>
                          <Inventory2RoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700 }}>รายการสินค้า / งาน</Typography>
                      </Stack>
                      <Chip label={`${selectedOrder.products.length} รายการ`} size="small" sx={{ ...statusChipSx, bgcolor: '#FFF7E8', color: '#9A5B00' }} />
                    </Stack>

                    {selectedOrder.products.length > 0 ? (
                      <Stack divider={<Divider flexItem />}>
                        {selectedOrder.products.map((product, index) => (
                          <Stack key={`${product.name}-${index}`} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.15 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#1E293B', fontWeight: 700, overflowWrap: 'anywhere' }}>{product.name}</Typography>
                              <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 13 }}>
                                จำนวน {product.qty.toLocaleString('th-TH')} ชิ้น × ฿{formatMoney(product.price)}
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#0F172A', fontWeight: 800, whiteSpace: 'nowrap' }}>฿{formatMoney(product.qty * product.price)}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ px: 1.5, py: 1.4, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                        <Typography sx={{ color: '#64748B', fontSize: 13, textAlign: 'center' }}>ไม่พบข้อมูลรายการสินค้า / งาน</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1.05}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#1F9D63', 0.14), color: '#1F9D63' }}>
                        <AttachMoneyRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700 }}>สรุปยอดชำระ</Typography>
                        <Chip label={PAYMENT_METHOD_LABELS_TH[selectedOrder.paymentMethod]} sx={{ ...statusChipSx, width: 'fit-content', bgcolor: '#EEF8FF', color: '#1D4ED8' }} />
                      </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ยอดก่อนส่วนลด</Typography>
                      <Typography>฿{formatMoney(selectedOrder.subtotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ส่วนลด</Typography>
                      <Typography>-฿{formatMoney(selectedOrder.discount)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">VAT</Typography>
                      <Typography>฿{formatMoney(selectedOrder.vat)}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontWeight: 700 }}>ยอดสุทธิ</Typography>
                      <Typography sx={{ fontWeight: 800 }}>฿{formatMoney(selectedOrder.total)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ยอดที่ชำระแล้ว</Typography>
                      <Typography sx={{ color: '#18794E', fontWeight: 700 }}>฿{formatMoney(selectedOrder.paidAmount)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ยอดคงเหลือ</Typography>
                      <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>฿{formatMoney(Math.max(selectedOrder.total - selectedOrder.paidAmount, 0))}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
                </>
              */}
              <CustomerCard order={selectedOrder} isEditing={isEditing} draft={customerDraft} editError={editError} onDraftChange={setCustomerDraft} />
              <ProductsCard order={selectedOrder} />
              <PaymentSummaryCard order={selectedOrder} />

              <JobTimelineCard items={buildOrderTimelineItems(selectedOrder)} />
            </Stack>
          </Box>

          <Divider />
          <DrawerActionBar
            order={selectedOrder}
            isEditing={isEditing}
            updatingOrderId={updatingOrderId}
            onEdit={() => setIsEditing(true)}
            onSaveCustomer={() => void saveCustomer()}
            onOpenPayRemaining={onOpenPayRemaining}
            onConvertToTaxInvoice={onConvertToTaxInvoice}
            onOpenTaxInvoiceConfirm={() => setTaxInvoiceConfirmOpen(true)}
            onCancelOrder={onCancelOrder}
            onPrintDocument={onPrintDocument}
          />
        </Stack>
      ) : null}
  {/*
      <Dialog open={taxInvoiceConfirmOpen} onClose={() => setTaxInvoiceConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>ยืนยันออกใบกำกับภาษี</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography color="text.secondary">ระบบจะสร้างเลขที่ใบกำกับภาษีและบวก VAT 7% เพิ่มจากยอดเดิม ยอดรวมและยอดคงเหลือจะเพิ่มขึ้นตามภาษี</Typography>
            <Alert severity="warning">เมื่อยืนยันแล้ว จะไม่สามารถเปลี่ยนรายการนี้กลับเป็นใบเสร็จทั่วไปได้</Alert>
            {taxInvoiceError ? <Alert severity="error">{taxInvoiceError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTaxInvoiceConfirmOpen(false)} disabled={updatingOrderId === selectedOrder?.id}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            startIcon={<ReceiptRoundedIcon />}
            disabled={!selectedOrder || updatingOrderId === selectedOrder.id}
            onClick={async () => {
              if (!selectedOrder) return;
              setTaxInvoiceError(null);
              try {
                await onConvertToTaxInvoice(selectedOrder);
                setTaxInvoiceConfirmOpen(false);
              } catch {
                setTaxInvoiceError('ไม่สามารถออกใบกำกับภาษีได้ กรุณาลองใหม่อีกครั้ง');
              }
            }}>
            ยืนยันออกใบกำกับภาษี
          </Button>
        </DialogActions>
      </Dialog>
  */}
      <TaxInvoiceConfirmDialog
        open={taxInvoiceConfirmOpen}
        order={selectedOrder}
        updatingOrderId={updatingOrderId}
        error={taxInvoiceError}
        onClose={() => setTaxInvoiceConfirmOpen(false)}
        onConfirm={onConvertToTaxInvoice}
        onErrorChange={setTaxInvoiceError}
      />
    </Drawer>
  );
}
