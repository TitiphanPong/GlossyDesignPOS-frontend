'use client';

import { use, useEffect, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { fetchQuotation, type Quotation } from '@/lib/quotations';
import { quotationMoney } from '@/app/home/quotations/quotationUi';
import { QuotationDocument } from './QuotationDocument';

type PrintQuotationPageProps = Readonly<{
  params: Promise<{ quotationId: string }>;
}>;

export function PrintQuotationPage({ params }: PrintQuotationPageProps) {
  const { quotationId } = use(params);
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchQuotation(quotationId)
      .then((data) => {
        if (!active) return;
        setQuotation(data);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'ไม่สามารถโหลดใบเสนอราคาได้');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [quotationId]);

  if (loading) {
    return (
      <Box role="status" aria-live="polite" aria-label="กำลังเตรียมใบเสนอราคา" sx={{ minHeight: '100vh', bgcolor: '#EEF2F6', py: { xs: 0, sm: 2.5 }, px: { xs: 0, sm: 2 } }}>
        <Stack spacing={2} sx={{ maxWidth: 1040, mx: 'auto' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5} sx={{ px: { xs: 2, sm: 0 }, py: { xs: 2, sm: 0 } }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={250} height={36} />
              <Skeleton variant="text" width={340} height={22} />
            </Box>
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={92} height={38} />
              <Skeleton variant="rounded" width={132} height={38} />
            </Stack>
          </Stack>
          <Box sx={{ bgcolor: '#FFFFFF', borderRadius: { xs: 0, sm: 1.5 }, p: { xs: 2, sm: 4 }, boxShadow: { sm: '0 12px 32px rgba(15, 23, 42, 0.08)' } }}>
            <Stack spacing={2}>
              <Skeleton variant="text" width="34%" height={42} />
              <Skeleton variant="text" width="56%" />
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={340} />
              <Skeleton variant="text" width="42%" />
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="center">กำลังเตรียมใบเสนอราคา...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !quotation) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F4F6F8', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 560 }}>{error ?? 'ไม่พบใบเสนอราคา'}</Alert>
      </Box>
    );
  }

  return (
    <Box className="quotation-print-root" sx={{ minHeight: '100vh', bgcolor: '#EEF2F6', py: { xs: 0, sm: 2.5 } }}>
      <Stack
        className="quotation-print-toolbar"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{
          maxWidth: 1040,
          mx: 'auto',
          mb: 2,
          px: { xs: 2, sm: 0 },
          py: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 20 }}>ตัวอย่างใบเสนอราคา A4</Typography>
          <Typography variant="body2" color="text.secondary">
            {quotation.quotationNumber ?? 'Draft'} · Rev.{quotation.revision} · {quotationMoney.format(quotation.grandTotal)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.push(`/home/quotations/${encodeURIComponent(quotation._id)}`)}
          >
            กลับ
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={() => globalThis.print()}
          >
            พิมพ์ / Save PDF
          </Button>
        </Stack>
      </Stack>

      <QuotationDocument quotation={quotation} />
    </Box>
  );
}
