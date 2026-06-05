'use client';

import Image from 'next/image';
import Link from 'next/link';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';

type PrintDocumentLayoutProps = Readonly<{
  title: string;
  invoiceNumber: string;
  onEditCustomer: () => void;
  summary?: React.ReactNode;
  printableDocument: React.ReactNode;
}>;

function HeaderButton({
  label,
  icon,
  onClick,
  variant,
}: Readonly<{
  label: string;
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
        minHeight: 44,
        px: 2,
        borderRadius: '12px',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        textTransform: 'none',
        boxShadow: isContained ? '0 10px 24px rgba(37, 99, 235, 0.22)' : 'none',
        borderColor: '#E5E7EB',
        color: isContained ? '#FFFFFF' : '#0F172A',
        bgcolor: isContained ? '#2563EB' : '#FFFFFF',
        '&:hover': {
          borderColor: isContained ? '#2563EB' : '#CBD5E1',
          bgcolor: isContained ? '#1D4ED8' : '#F8FAFC',
          boxShadow: isContained ? '0 12px 28px rgba(37, 99, 235, 0.28)' : 'none',
        },
      }}>
      {label}
    </Button>
  );
}

export function PrintDocumentLayout({ title, invoiceNumber, onEditCustomer, summary, printableDocument }: PrintDocumentLayoutProps) {
  const handlePrint = async () => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    globalThis.print();
  };

  return (
    <Box
      className="print-page-root"
      sx={{
        minHeight: '100vh',
        bgcolor: '#F3F4F6',
      }}>
        <Stack
        className="print-toolbar"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          minHeight: '92px',
          px: '32px',
          py: 2,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
        }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          <ButtonBase
            component={Link}
            href="/home"
            sx={{
              borderRadius: '14px',
              flexShrink: 0,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
              },
            }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              }}>
              <Image src="/logo/logo.png" alt="Glossy Design logo" width={34} height={34} priority />
            </Box>
          </ButtonBase>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ mt: 0.55, fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.03em' }}>{title}</Typography>
            <Typography sx={{ mt: 0.55, fontSize: 16, fontWeight: 500, color: '#64748B', lineHeight: 1.2 }}>{invoiceNumber}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <HeaderButton label="Edit" icon={null} onClick={onEditCustomer} variant="outlined" />
          <HeaderButton label="Export PDF" icon={<PictureAsPdfRoundedIcon />} onClick={handlePrint} variant="outlined" />
          <HeaderButton label="Print" icon={<PrintRoundedIcon />} onClick={handlePrint} variant="contained" />
        </Stack>
      </Stack>

      <Box
        className="print-document-scroll"
        sx={{
          px: { xs: 0, md: 3 },
          py: { xs: 2.5, md: 4 },
          overflowX: 'auto',
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
          sx={{
            width: 'fit-content',
            minWidth: '100%',
            mx: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}>
          <Box
            className="print-document-only print-paper"
            sx={{
              width: '285mm',
              height: '197mm',
              maxWidth: 'none',
              bgcolor: '#fff',
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.14)',
            }}>
            {printableDocument}
          </Box>
        </Box>
      </Box>

      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 6mm;
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
            overflow: visible !important;
          }

          .print-paper,
          .invoice-document-sheet,
          .invoice-copy {
            box-shadow: none !important;
            background: #fff !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .print-document-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 285mm !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </Box>
  );
}
