'use client';

import { useState } from 'react';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import TvRoundedIcon from '@mui/icons-material/TvRounded';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { ensureCustomerDisplaySession, getCustomerDisplayPairingUrl } from '@/lib/customer-display-sync';

export default function CustomerDisplayPairingButton() {
  const [open, setOpen] = useState(false);
  const [pairingUrl, setPairingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const preparePairing = async () => {
    setOpen(true);
    setCopied(false);
    setError(null);
    if (pairingUrl) return;
    setLoading(true);
    try {
      const session = await ensureCustomerDisplaySession();
      const url = getCustomerDisplayPairingUrl(session);
      if (!url) throw new Error('ไม่สามารถสร้างลิงก์หน้าจอลูกค้าได้');
      setPairingUrl(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'สร้างการจับคู่หน้าจอลูกค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!pairingUrl) return;
    await navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
  };

  return (
    <>
      <Button variant="outlined" startIcon={<TvRoundedIcon />} onClick={() => void preparePairing()}>
        จอลูกค้า
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>จับคู่หน้าจอลูกค้า</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" fontSize={14}>
            สแกน QR นี้จาก Tablet / มือถือ / คอมอีกเครื่อง หรือเปิดลิงก์บนจอที่สองของเครื่องเดียวกัน แต่ละเคาน์เตอร์จะใช้ Session แยกกัน
          </Typography>
          {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
          {loading ? <Typography sx={{ py: 5, textAlign: 'center' }}>กำลังสร้าง Session...</Typography> : null}
          {pairingUrl ? (
            <Stack alignItems="center" gap={2} sx={{ mt: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
                <QRCodeSVG value={pairingUrl} size={220} level="M" title="Customer display pairing QR" />
              </Box>
              <Typography sx={{ width: '100%', p: 1.25, borderRadius: 2, bgcolor: '#F8FAFC', fontSize: 12, color: '#475569', wordBreak: 'break-all' }}>
                {pairingUrl}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>ปิด</Button>
          <Button disabled={!pairingUrl} startIcon={<ContentCopyRoundedIcon />} onClick={() => void copyLink()}>
            {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
          </Button>
          <Button
            variant="contained"
            disabled={!pairingUrl}
            startIcon={<OpenInNewRoundedIcon />}
            onClick={() => pairingUrl && globalThis.open(pairingUrl, '_blank', 'noopener,noreferrer')}>
            เปิดจอ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
