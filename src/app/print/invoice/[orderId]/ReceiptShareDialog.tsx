'use client';

import * as React from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';

type ReceiptShareDialogProps = Readonly<{
  open: boolean;
  fileName: string;
  imageDataUrl: string | null;
  preparing: boolean;
  statusMessage: string | null;
  statusSeverity: 'info' | 'success' | 'warning' | 'error';
  showSaveGuide: boolean;
  canCopyImage: boolean;
  onClose: () => void;
  onShare: () => void;
  onCopyImage: () => void;
  onShowSaveGuide: () => void;
}>;

export default function ReceiptShareDialog({
  open,
  fileName,
  imageDataUrl,
  preparing,
  statusMessage,
  statusSeverity,
  showSaveGuide,
  canCopyImage,
  onClose,
  onShare,
  onCopyImage,
  onShowSaveGuide,
}: ReceiptShareDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      sx={{ '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } } }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            maxWidth: { xs: '100%', sm: 440 },
            maxHeight: { xs: '88dvh', sm: '82dvh' },
            m: { xs: 0, sm: 3 },
            borderRadius: { xs: '24px 24px 0 0', sm: 4 },
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
          },
        },
      }}>
      <DialogContent sx={{ p: 0, bgcolor: '#F8FAFC' }}>
        <Stack spacing={0}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} sx={{ px: 2.25, pt: 2.2, pb: 1.7, bgcolor: '#FFFFFF', borderBottom: '1px solid #E8EEF5' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                บันทึก / แชร์ใบเสร็จ
              </Typography>
              <Typography sx={{ mt: 0.55, fontSize: 12.5, color: '#64748B', overflowWrap: 'anywhere' }}>
                {fileName}
              </Typography>
            </Box>
            <IconButton aria-label="ปิด" onClick={onClose} sx={{ mt: -0.4, mr: -0.5, bgcolor: '#F1F5F9', color: '#475569' }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1.5} sx={{ px: 2, py: 1.8, overflowY: 'auto' }}>
            {statusMessage ? (
              <Alert severity={statusSeverity} variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
                {statusMessage}
              </Alert>
            ) : null}

            <Box sx={{ p: 1.4, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              {preparing ? (
                <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 180 }}>
                  <CircularProgress size={28} />
                  <Typography fontSize={13} color="#64748B">กำลังเตรียมรูปใบเสร็จ...</Typography>
                </Stack>
              ) : imageDataUrl ? (
                <Box
                  component="img"
                  src={imageDataUrl}
                  alt="ตัวอย่างใบเสร็จสำหรับบันทึก"
                  sx={{
                    display: 'block',
                    width: '100%',
                    maxHeight: showSaveGuide ? '48dvh' : 220,
                    objectFit: 'contain',
                    bgcolor: '#FFFFFF',
                    transition: 'max-height 160ms ease',
                    WebkitTouchCallout: 'default',
                    userSelect: 'auto',
                  }}
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 160 }}>
                  <Typography fontSize={13} color="#64748B">ยังไม่สามารถสร้างรูปใบเสร็จได้</Typography>
                </Stack>
              )}
            </Box>

            {showSaveGuide && imageDataUrl ? (
              <Box sx={{ px: 1.5, py: 1.25, borderRadius: 2.75, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Typography fontSize={13} fontWeight={850} color="#1D4ED8">วิธีบันทึกลงรูปภาพบน iPhone</Typography>
                <Typography sx={{ mt: 0.35, fontSize: 12.25, color: '#49627D', lineHeight: 1.55 }}>
                  กดค้างที่รูปใบเสร็จด้านบน แล้วเลือก “บันทึกไปยังรูปภาพ” หรือ “Save to Photos” โดยหน้านี้จะไม่เปิด URL แบบ blob อีก
                </Typography>
              </Box>
            ) : null}

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.8 }}>
              <Button
                variant="contained"
                startIcon={<IosShareRoundedIcon />}
                disabled={preparing || !imageDataUrl}
                onClick={onShare}
                sx={{ minWidth: 0, minHeight: 52, px: 0.75, borderRadius: 2.75, fontSize: 12, fontWeight: 850, textTransform: 'none' }}>
                แชร์
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                disabled={preparing || !imageDataUrl}
                onClick={onShowSaveGuide}
                sx={{ minWidth: 0, minHeight: 52, px: 0.75, borderRadius: 2.75, borderColor: '#D8E2EE', bgcolor: '#FFFFFF', fontSize: 12, fontWeight: 850, textTransform: 'none' }}>
                บันทึกรูป
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon />}
                disabled={preparing || !imageDataUrl || !canCopyImage}
                onClick={onCopyImage}
                sx={{ minWidth: 0, minHeight: 52, px: 0.75, borderRadius: 2.75, borderColor: '#D8E2EE', bgcolor: '#FFFFFF', fontSize: 12, fontWeight: 850, textTransform: 'none' }}>
                คัดลอกรูป
              </Button>
            </Box>

            {!canCopyImage ? (
              <Typography sx={{ px: 0.5, fontSize: 11.5, color: '#8492A6', lineHeight: 1.45 }}>
                เบราว์เซอร์นี้ไม่รองรับการคัดลอกรูปโดยตรง แต่ยังใช้ “แชร์” หรือกดค้างเพื่อบันทึกรูปได้
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
