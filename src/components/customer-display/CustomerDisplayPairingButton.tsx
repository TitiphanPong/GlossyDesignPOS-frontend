'use client';

import { useState } from 'react';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TvRoundedIcon from '@mui/icons-material/TvRounded';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import {
  ensureCustomerDisplaySession,
  getCustomerDisplayPairingUrl,
  revokeCustomerDisplaySession,
  rotateCustomerDisplaySession,
} from '@/lib/customer-display-sync';

export default function CustomerDisplayPairingButton() {
  const [open, setOpen] = useState(false);
  const [confirmUnpair, setConfirmUnpair] = useState(false);
  const [pairingUrl, setPairingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const setSessionUrl = (session: Awaited<ReturnType<typeof ensureCustomerDisplaySession>>) => {
    const url = getCustomerDisplayPairingUrl(session);
    if (!url) throw new Error('ไม่สามารถสร้างลิงก์หน้าจอลูกค้าได้');
    setPairingUrl(url);
  };

  const preparePairing = async () => {
    setOpen(true);
    setCopied(false);
    setError(null);
    setNotice(null);
    if (pairingUrl) return;
    setLoading(true);
    try {
      setSessionUrl(await ensureCustomerDisplaySession());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'สร้างการจับคู่หน้าจอลูกค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const rotatePairing = async () => {
    setCopied(false);
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      setSessionUrl(await rotateCustomerDisplaySession());
      setNotice('สร้างลิงก์ใหม่แล้ว ลิงก์และ QR เดิมใช้งานไม่ได้อีกต่อไป');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'สร้างลิงก์ใหม่ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const unpair = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await revokeCustomerDisplaySession();
      setPairingUrl(null);
      setCopied(false);
      setConfirmUnpair(false);
      setNotice('ยกเลิกการจับคู่แล้ว ลิงก์และ QR เดิมใช้งานไม่ได้อีกต่อไป');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ยกเลิกการจับคู่ไม่สำเร็จ');
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
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>จับคู่หน้าจอลูกค้า</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" fontSize={14}>
            สแกน QR นี้จาก Tablet / มือถือ / คอมอีกเครื่อง หรือเปิดลิงก์บนจอที่สองของเครื่องเดียวกัน แต่ละเคาน์เตอร์จะใช้ Session แยกกัน
          </Typography>
          {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
          {notice ? <Alert severity="success" sx={{ mt: 2 }}>{notice}</Alert> : null}
          {loading ? <Typography sx={{ py: 5, textAlign: 'center' }}>กำลังอัปเดต Session...</Typography> : null}
          {pairingUrl && !loading ? (
            <Stack alignItems="center" gap={2} sx={{ mt: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
                <QRCodeSVG value={pairingUrl} size={220} level="M" title="Customer display pairing QR" />
              </Box>
              <Typography sx={{ width: '100%', p: 1.25, borderRadius: 2, bgcolor: '#F8FAFC', fontSize: 12, color: '#475569', wordBreak: 'break-all' }}>
                {pairingUrl}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} width="100%" justifyContent="center">
                <Button size="small" startIcon={<RefreshRoundedIcon />} onClick={() => void rotatePairing()}>
                  สร้างลิงก์ใหม่
                </Button>
                <Button size="small" color="error" startIcon={<LinkOffRoundedIcon />} onClick={() => setConfirmUnpair(true)}>
                  ยกเลิกการจับคู่
                </Button>
              </Stack>
            </Stack>
          ) : null}
          {!pairingUrl && !loading && notice ? (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" startIcon={<TvRoundedIcon />} onClick={() => void preparePairing()}>
                จับคู่ใหม่
              </Button>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>ปิด</Button>
          <Button disabled={!pairingUrl || loading} startIcon={<ContentCopyRoundedIcon />} onClick={() => void copyLink()}>
            {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
          </Button>
          <Button
            variant="contained"
            disabled={!pairingUrl || loading}
            startIcon={<OpenInNewRoundedIcon />}
            onClick={() => pairingUrl && globalThis.open(pairingUrl, '_blank', 'noopener,noreferrer')}>
            เปิดจอ
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmUnpair} onClose={() => setConfirmUnpair(false)} fullWidth maxWidth="xs">
        <DialogTitle>ยกเลิกการจับคู่หน้าจอ?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            จอที่เชื่อมต่อด้วย QR หรือลิงก์นี้จะหยุดใช้งานทันที หากต้องการใช้อีกครั้งจะต้องสร้างการจับคู่ใหม่
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button disabled={loading} onClick={() => setConfirmUnpair(false)}>ย้อนกลับ</Button>
          <Button color="error" variant="contained" disabled={loading} onClick={() => void unpair()}>
            ยกเลิกการจับคู่
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
