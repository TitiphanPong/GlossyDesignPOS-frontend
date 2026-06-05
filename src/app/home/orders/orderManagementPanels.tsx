import { alpha, Avatar, Box, Button, Card, CardContent, Chip, Divider, Drawer, Menu, MenuItem, Stack, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import dayjs from 'dayjs';

import JobTimelineCard from '../components/JobTimelineCard';
import { commonButtonSx, statusChipSx } from '../components/adminUi';
import type { ExportMenuProps, OrderDetailDrawerProps, RowActionsMenuProps, StatCardProps } from './orderManagementTypes';
import { buildOrderTimelineItems, downloadCsv, formatMoney, PAYMENT_METHOD_LABELS_TH, printDocument, statusChip } from './orderManagementUtils';

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

export function RowActionsMenu({ anchorEl, rowMenuTarget, updatingOrderId, onClose, onOpenDrawer, onOpenPayRemaining, onMarkAsPaid, onCancelOrder }: Readonly<RowActionsMenuProps>) {
  const rowMenuTargetId = rowMenuTarget?.id ?? '';
  const confirmPaymentDisabled = !rowMenuTarget || rowMenuTarget.status !== 'pending' || updatingOrderId === rowMenuTargetId;
  const payRemainingDisabled = !rowMenuTarget || rowMenuTarget.status !== 'partial' || updatingOrderId === rowMenuTargetId;
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
        onClick={() => {
          if (rowMenuTarget) printDocument(rowMenuTarget, 'receipt');
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PrintRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>พิมพ์ใบเสร็จ</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (rowMenuTarget) printDocument(rowMenuTarget, 'invoice');
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ReceiptRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>พิมพ์ใบกำกับภาษี</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        disabled={payRemainingDisabled}
        onClick={() => {
          if (rowMenuTarget) {
            onOpenPayRemaining(rowMenuTarget);
          }
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PaymentsRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>รับชำระยอดคงเหลือ</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        disabled={confirmPaymentDisabled}
        onClick={() => {
          if (rowMenuTarget) {
            onMarkAsPaid(rowMenuTarget.id);
          }
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>ยืนยันการชำระเงิน</Typography>
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

export function OrderDetailDrawer({
  drawerOpen,
  selectedOrder,
  isMobile,
  isCompactDrawer,
  updatingOrderId,
  onClose,
  onMarkAsPaid,
  onOpenPayRemaining,
  onCancelOrder,
}: Readonly<OrderDetailDrawerProps>) {
  const drawerAnchor = isMobile ? 'bottom' : 'right';
  const drawerPaperSx = getOrderDetailDrawerPaperSx(isMobile);

  return (
    <Drawer
      anchor={drawerAnchor}
      open={drawerOpen}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: drawerPaperSx,
        },
      }}>
      {selectedOrder ? (
        <Stack sx={{ height: '100%' }}>
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
                  {selectedOrder.orderNumber} | {selectedOrder.customerName}
                </Typography>
              </Box>
              {statusChip(selectedOrder.status)}
            </Stack>
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 2, sm: 2.3 },
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
            }}>
            <Stack spacing={isCompactDrawer ? 1.25 : 1.5}>
              {selectedOrder.status === 'pending' || selectedOrder.status === 'partial' ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #FFD8A8', bgcolor: '#FFF8ED', boxShadow: 'none' }}>
                  <CardContent sx={{ py: 1.2 }}>
                    <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>
                      {selectedOrder.status === 'partial' ? 'งานนี้ชำระบางส่วน' : 'งานนี้รอชำระเงิน'}: คงเหลือ ฿{formatMoney(Math.max(selectedOrder.total - selectedOrder.paidAmount, 0))}
                    </Typography>
                  </CardContent>
                </Card>
              ) : null}

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
                        <AccountCircleRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>

                      <Typography sx={{ fontWeight: 700 }}>ข้อมูลลูกค้า</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>ชื่อลูกค้า : {selectedOrder.customerName}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>เบอร์โทรศัพท์ : {selectedOrder.phoneNumber}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>เลขประจำตัวผู้เสียภาษี : {selectedOrder.taxId}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>ที่อยู่ : {selectedOrder.address}</Typography>
                    </Stack>
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

              <JobTimelineCard items={buildOrderTimelineItems(selectedOrder)} />
            </Stack>
          </Box>

          <Divider />
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
              {selectedOrder.status === 'partial' ? (
                <Button
                  variant="outlined"
                  startIcon={<PaymentsRoundedIcon />}
                  disabled={updatingOrderId === selectedOrder.id}
                  onClick={() => {
                    onOpenPayRemaining(selectedOrder);
                  }}
                  sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                  รับชำระยอดคงเหลือ
                </Button>
              ) : null}
              <Button
                variant="contained"
                startIcon={<CheckCircleRoundedIcon />}
                disabled={selectedOrder.status !== 'pending' || updatingOrderId === selectedOrder.id}
                onClick={() => {
                  onMarkAsPaid(selectedOrder.id);
                }}
                sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                ยืนยันการชำระเงิน
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReceiptRoundedIcon />}
                onClick={() => {
                  printDocument(selectedOrder, 'invoice');
                }}
                sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                ใบกำกับภาษี
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelRoundedIcon />}
                disabled={updatingOrderId === selectedOrder.id}
                onClick={() => {
                  onCancelOrder(selectedOrder.id);
                }}
                sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                ยกเลิกงาน
              </Button>
            </Stack>
          </Box>
        </Stack>
      ) : null}
    </Drawer>
  );
}
