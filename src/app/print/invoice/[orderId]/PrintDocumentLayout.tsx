'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import { buildReceiptFileName, isShareCancelled, prefersReceiptShare } from '@/lib/receipt-download';

type PrintDocumentLayoutProps = Readonly<{
  titleTh: string;
  titleEn: string;
  invoiceNumber: string;
  documentType: 'quotation' | 'tax-invoice' | 'receipt';
  onEditCustomer: () => void;
  summary?: React.ReactNode;
  printableDocument: React.ReactNode;
}>;

function HeaderButton({
  label,
  mobileLabel,
  icon,
  onClick,
  variant,
}: Readonly<{
  label: string;
  mobileLabel?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant: 'contained' | 'outlined';
}>) {
  const isContained = variant === 'contained';

  return (
    <Button
      variant={variant}
      startIcon={icon}
      onClick={onClick}
      sx={{
        minHeight: { xs: 42, sm: 44 },
        width: '100%',
        minWidth: 0,
        px: { xs: 0.7, sm: 2 },
        borderRadius: { xs: '10px', sm: '12px' },
        fontSize: { xs: 12, sm: 14 },
        fontWeight: 750,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        boxShadow: isContained ? { xs: '0 5px 14px rgba(37, 99, 235, 0.18)', sm: '0 10px 24px rgba(37, 99, 235, 0.22)' } : 'none',
        borderColor: '#E2E8F0',
        color: isContained ? '#FFFFFF' : '#0F172A',
        bgcolor: isContained ? '#2563EB' : '#FFFFFF',
        '& .MuiButton-startIcon': {
          mr: { xs: 0.55, sm: 1 },
          '& svg': { fontSize: { xs: 18, sm: 20 } },
        },
        '&:hover': {
          borderColor: isContained ? '#2563EB' : '#CBD5E1',
          bgcolor: isContained ? '#1D4ED8' : '#F8FAFC',
          boxShadow: isContained ? '0 12px 28px rgba(37, 99, 235, 0.28)' : 'none',
        },
      }}>
      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
        {mobileLabel ?? label}
      </Box>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {label}
      </Box>
    </Button>
  );
}

export function PrintDocumentLayout({ titleTh, titleEn, invoiceNumber, documentType, onEditCustomer, summary, printableDocument }: PrintDocumentLayoutProps) {
  const isReceipt = documentType === 'receipt';
  const documentStageRef = useRef<HTMLDivElement>(null);
  const [useMobileShare, setUseMobileShare] = useState(false);

  useEffect(() => {
    setUseMobileShare(prefersReceiptShare(globalThis.navigator));
  }, []);

  const handlePrint = async () => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    globalThis.print();
  };

  const handleDownloadReceipt = async () => {
    const receiptElement = documentStageRef.current?.querySelector<HTMLElement>('.receipt-document-sheet');
    if (!receiptElement) return;

    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(receiptElement, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
    });
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;

    const fileName = buildReceiptFileName(invoiceNumber);
    const file = new File([blob], fileName, { type: 'image/png' });
    const navigatorWithShare = globalThis.navigator;

    if (
      useMobileShare &&
      typeof navigatorWithShare.share === 'function' &&
      typeof navigatorWithShare.canShare === 'function' &&
      navigatorWithShare.canShare({ files: [file] })
    ) {
      try {
        await navigatorWithShare.share({
          files: [file],
          title: 'ใบเสร็จ Glossy Design',
        });
        return;
      } catch (error) {
        if (isShareCancelled(error)) return;
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    if (useMobileShare) {
      const openedWindow = globalThis.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (openedWindow) {
        globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      } else {
        globalThis.location.assign(objectUrl);
      }
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = objectUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  };

  return (
    <Box
      className="print-page-root"
      sx={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        bgcolor: '#EEF2F7',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(226,232,240,0.55))',
      }}>
      <Stack
        className="print-toolbar"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 1, sm: 0 }}
        sx={{
          position: { xs: 'relative', sm: 'sticky' },
          top: { sm: 0 },
          zIndex: 10,
          width: '100%',
          minWidth: 0,
          minHeight: { xs: 'auto', sm: '88px' },
          px: { xs: 1.25, sm: '32px' },
          pt: { xs: 1.1, sm: '1.8rem' },
          pb: { xs: 1, sm: '1.8rem' },
          borderBottom: '1px solid #DCE3EC',
          bgcolor: 'rgba(255,255,255,0.96)',
          backdropFilter: { xs: 'none', sm: 'blur(16px)' },
          boxShadow: { xs: '0 5px 16px rgba(15, 23, 42, 0.04)', sm: '0 8px 26px rgba(15, 23, 42, 0.06)' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: '#2563EB',
          },
        }}>
        <Stack direction="row" spacing={{ xs: 1.05, sm: 2 }} alignItems={{ xs: 'center', sm: 'flex-start' }} sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
          <ButtonBase
            component={Link}
            href="/home"
            sx={{
              borderRadius: { xs: '10px', sm: '14px' },
              flexShrink: 0,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
              },
            }}>
            <Box
              sx={{
                width: { xs: 36, sm: 48 },
                height: { xs: 36, sm: 48 },
                borderRadius: { xs: '10px', sm: '16px' },
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: { xs: '0 4px 12px rgba(15, 23, 42, 0.08)', sm: '0 10px 22px rgba(15, 23, 42, 0.12)' },
              }}>
              <Image src="/logo/logo.png" alt="Glossy Design logo" width={26} height={26} priority />
            </Box>
          </ButtonBase>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <DescriptionRoundedIcon sx={{ display: { xs: 'none', sm: 'block' }, mt: 0.35, fontSize: 18, color: '#2563EB', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 16, sm: 20, md: 22 },
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: { xs: 1.15, sm: 1.18 },
                    letterSpacing: '-0.025em',
                    overflowWrap: 'anywhere',
                  }}>
                  {titleTh}
                </Typography>
                <Typography
                  sx={{
                    mt: { xs: 0.1, sm: 0.2 },
                    fontSize: { xs: 11.25, sm: 13 },
                    fontWeight: 650,
                    color: '#64748B',
                    lineHeight: 1.2,
                    letterSpacing: '0.01em',
                    overflowWrap: 'anywhere',
                  }}>
                  {titleEn}
                </Typography>
              </Box>
            </Stack>
            <Typography
              sx={{
                mt: { xs: 0.4, sm: 0.65 },
                display: 'inline-block',
                maxWidth: '100%',
                px: { xs: 0.8, sm: 1 },
                py: { xs: 0.2, sm: 0.3 },
                borderRadius: '7px',
                bgcolor: '#EFF6FF',
                fontSize: { xs: 11.5, sm: 13 },
                fontWeight: 800,
                color: '#1D4ED8',
                lineHeight: 1.2,
                overflowWrap: 'anywhere',
              }}>
              {invoiceNumber}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, auto))' },
            gap: { xs: 0.7, sm: 1.5 },
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { sm: 'end' },
          }}>
          <HeaderButton label="แก้ไข" mobileLabel="แก้ไข" icon={<EditRoundedIcon />} onClick={onEditCustomer} variant="outlined" />
          {isReceipt ? (
            <HeaderButton
              label={useMobileShare ? 'บันทึก / แชร์' : 'ดาวน์โหลด'}
              mobileLabel={useMobileShare ? 'แชร์' : 'บันทึก'}
              icon={useMobileShare ? <IosShareRoundedIcon /> : <DownloadRoundedIcon />}
              onClick={() => void handleDownloadReceipt()}
              variant="outlined"
            />
          ) : null}
          {!isReceipt ? (
            <HeaderButton label="ส่งออก PDF" mobileLabel="PDF" icon={<PictureAsPdfRoundedIcon />} onClick={handlePrint} variant="outlined" />
          ) : null}
          <HeaderButton label="พิมพ์" mobileLabel="พิมพ์" icon={<PrintRoundedIcon />} onClick={handlePrint} variant="contained" />
        </Box>
      </Stack>

      <Box
        className="print-document-scroll"
        sx={{
          width: '100%',
          maxWidth: '100%',
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1.5, sm: 2.5, md: 4 },
          overflowX: { xs: 'hidden', sm: 'auto' },
          overflowY: 'visible',
        }}>
        {summary ? (
          <Box
            className="no-print"
            sx={{
              maxWidth: '1120px',
              mx: 'auto',
              px: { xs: 2, md: 0 },
              mb: 3,
            }}>
            {summary}
          </Box>
        ) : null}

        <Box
          className="print-document-stage"
          ref={documentStageRef}
          sx={{
            width: '100%',
            minWidth: 0,
            maxWidth: isReceipt ? { xs: 390, sm: 'none' } : 'none',
            mx: 'auto',
            display: 'flex',
            justifyContent: 'center',
            height: 'auto',
          }}>
          <Box
            className="print-document-only print-paper"
            sx={{
              width: isReceipt ? { xs: '100%', sm: '80mm' } : '285mm',
              height: isReceipt ? 'auto' : '197mm',
              maxWidth: isReceipt ? '80mm' : 'none',
              minWidth: 0,
              bgcolor: '#fff',
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.14)',
              zoom: isReceipt ? { xs: 1, md: 1.32 } : 1,
              transform: isReceipt ? 'none' : { xs: 'scale(0.34)', sm: 'none' },
              transformOrigin: isReceipt ? 'initial' : { xs: 'top left', sm: 'initial' },
              '@media (max-width: 359.95px)': isReceipt
                ? {}
                : {
                    transform: 'scale(0.288)',
                  },
            }}>
            {printableDocument}
          </Box>
        </Box>
      </Box>

      <style jsx global>{`
        @page {
          size: ${isReceipt ? '80mm auto' : 'A4 landscape'};
          margin: ${isReceipt ? '0' : '6mm'};
        }

        @media print {
          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-document-only,
          .print-document-only * {
            visibility: visible !important;
          }

          .print-toolbar {
            display: none !important;
          }

          .print-page-root,
          .print-document-scroll,
          .print-document-stage {
            background: #fff !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          .print-paper,
          .invoice-document-sheet,
          .invoice-copy {
            box-shadow: none !important;
            background: #fff !important;
            zoom: 1 !important;
            transform: none !important;
            transform-origin: initial !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .print-document-only {
            position: absolute;
            left: 0;
            top: 0;
            width: ${isReceipt ? '80mm' : '285mm'} !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </Box>
  );
}
