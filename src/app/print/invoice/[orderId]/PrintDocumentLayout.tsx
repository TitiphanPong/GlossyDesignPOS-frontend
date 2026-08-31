'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import { buildReceiptFileName, isShareCancelled, prefersReceiptShare } from '@/lib/receipt-download';
import ReceiptShareDialog from './ReceiptShareDialog';

type PrintDocumentLayoutProps = Readonly<{
  titleTh: string;
  titleEn: string;
  invoiceNumber: string;
  documentType: 'quotation' | 'tax-invoice' | 'receipt';
  onEditCustomer: () => void;
  summary?: React.ReactNode;
  mobilePreviewDocument?: React.ReactNode;
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
        minHeight: { xs: 48, sm: 44 },
        width: '100%',
        minWidth: 0,
        px: { xs: 0.75, sm: 2 },
        borderRadius: '11px',
        fontSize: { xs: 12, sm: 14 },
        fontWeight: 750,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        boxShadow: isContained ? { xs: '0 5px 14px rgba(37, 99, 235, 0.18)', sm: '0 8px 18px rgba(37, 99, 235, 0.2)' } : 'none',
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
          boxShadow: isContained ? '0 10px 22px rgba(37, 99, 235, 0.26)' : '0 2px 5px rgba(15, 23, 42, 0.04)',
        },
        '&:active': {
          transform: 'translateY(1px)',
          boxShadow: isContained ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
        },
        '&:focus-visible': {
          outline: '3px solid rgba(37, 99, 235, 0.25)',
          outlineOffset: 2,
        },
        '@media (min-width: 600px) and (max-width: 767.95px)': {
          minHeight: 48,
        },
      }}>
      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, '@media (min-width: 600px) and (max-width: 767.95px)': { display: 'inline' } }}>
        {mobileLabel ?? label}
      </Box>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, '@media (min-width: 600px) and (max-width: 767.95px)': { display: 'none' } }}>
        {label}
      </Box>
    </Button>
  );
}

export function PrintDocumentLayout({ titleTh, titleEn, invoiceNumber, documentType, onEditCustomer, summary, mobilePreviewDocument, printableDocument }: PrintDocumentLayoutProps) {
  const isReceipt = documentType === 'receipt';
  const documentStageRef = useRef<HTMLDivElement>(null);
  const receiptRenderRequestRef = useRef(0);
  const [useMobileShare, setUseMobileShare] = useState(false);
  const [receiptShareOpen, setReceiptShareOpen] = useState(false);
  const [receiptPreparing, setReceiptPreparing] = useState(false);
  const [receiptAsset, setReceiptAsset] = useState<{ blob: Blob; file: File; dataUrl: string } | null>(null);
  const [receiptStatusMessage, setReceiptStatusMessage] = useState<string | null>(null);
  const [receiptStatusSeverity, setReceiptStatusSeverity] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [showReceiptSaveGuide, setShowReceiptSaveGuide] = useState(false);
  const [canCopyReceiptImage, setCanCopyReceiptImage] = useState(false);

  useEffect(() => {
    setUseMobileShare(prefersReceiptShare(globalThis.navigator));
    setCanCopyReceiptImage(
      typeof globalThis.navigator?.clipboard?.write === 'function' && typeof globalThis.ClipboardItem === 'function'
    );
  }, []);

  const handlePrint = async () => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    globalThis.print();
  };

  const renderReceiptImage = async () => {
    const receiptElement = documentStageRef.current?.querySelector<HTMLElement>('.receipt-document-sheet');
    if (!receiptElement) throw new Error('ไม่พบใบเสร็จสำหรับสร้างรูป');

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
    if (!blob) throw new Error('สร้างรูปใบเสร็จไม่สำเร็จ');

    const fileName = buildReceiptFileName(invoiceNumber);
    return {
      blob,
      file: new File([blob], fileName, { type: 'image/png' }),
      dataUrl: canvas.toDataURL('image/png'),
    };
  };

  const handleReceiptHeaderAction = async () => {
    if (!useMobileShare) {
      try {
        const asset = await renderReceiptImage();
        const objectUrl = URL.createObjectURL(asset.blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = objectUrl;
        downloadLink.download = asset.file.name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      } catch {
        // Desktop keeps the existing direct-download behavior and fails without navigating away.
      }
      return;
    }

    const requestId = ++receiptRenderRequestRef.current;
    setReceiptShareOpen(true);
    setReceiptPreparing(true);
    setReceiptAsset(null);
    setReceiptStatusMessage(null);
    setShowReceiptSaveGuide(false);

    try {
      const asset = await renderReceiptImage();
      if (requestId === receiptRenderRequestRef.current) setReceiptAsset(asset);
    } catch (error) {
      if (requestId === receiptRenderRequestRef.current) {
        setReceiptStatusSeverity('error');
        setReceiptStatusMessage(error instanceof Error ? error.message : 'สร้างรูปใบเสร็จไม่สำเร็จ');
      }
    } finally {
      if (requestId === receiptRenderRequestRef.current) setReceiptPreparing(false);
    }
  };

  const closeReceiptShare = () => {
    receiptRenderRequestRef.current += 1;
    setReceiptShareOpen(false);
    setReceiptPreparing(false);
    setReceiptAsset(null);
    setReceiptStatusMessage(null);
    setShowReceiptSaveGuide(false);
  };

  const handleNativeReceiptShare = async () => {
    if (!receiptAsset) return;
    const navigatorWithShare = globalThis.navigator;
    let supportsFileShare = typeof navigatorWithShare.share === 'function';

    if (supportsFileShare && typeof navigatorWithShare.canShare === 'function') {
      try {
        supportsFileShare = navigatorWithShare.canShare({ files: [receiptAsset.file] });
      } catch {
        supportsFileShare = false;
      }
    }

    if (!supportsFileShare) {
      setReceiptStatusSeverity('warning');
      setReceiptStatusMessage('เบราว์เซอร์นี้ไม่รองรับการแชร์ไฟล์ PNG โดยตรง ใช้ “บันทึกรูป” ด้านล่างแทนได้');
      setShowReceiptSaveGuide(true);
      return;
    }

    try {
      await navigatorWithShare.share({
        files: [receiptAsset.file],
        title: `ใบเสร็จ ${invoiceNumber.replace(/^#/u, '')} · Glossy Design`,
      });
      closeReceiptShare();
    } catch (error) {
      if (isShareCancelled(error)) return;
      setReceiptStatusSeverity('warning');
      setReceiptStatusMessage('อุปกรณ์นี้ไม่สามารถแชร์ไฟล์ได้ในขณะนี้ โดยจะไม่เปิดหน้า blob ให้ ใช้ “บันทึกรูป” หรือ “คัดลอกรูป” แทนได้');
      setShowReceiptSaveGuide(true);
    }
  };

  const handleCopyReceiptImage = async () => {
    if (!receiptAsset) return;
    if (typeof globalThis.navigator?.clipboard?.write !== 'function' || typeof globalThis.ClipboardItem !== 'function') {
      setReceiptStatusSeverity('warning');
      setReceiptStatusMessage('เบราว์เซอร์นี้ไม่รองรับการคัดลอกรูปโดยตรง');
      return;
    }

    try {
      await globalThis.navigator.clipboard.write([
        new globalThis.ClipboardItem({ 'image/png': receiptAsset.blob }),
      ]);
      setReceiptStatusSeverity('success');
      setReceiptStatusMessage('คัดลอกรูปใบเสร็จแล้ว สามารถนำไปวางใน LINE หรือแอปอื่นได้');
    } catch {
      setReceiptStatusSeverity('warning');
      setReceiptStatusMessage('เบราว์เซอร์ไม่อนุญาตให้คัดลอกรูป ใช้ “แชร์” หรือกดค้างที่รูปเพื่อบันทึกแทนได้');
    }
  };

  const handleShowReceiptSaveGuide = () => {
    setShowReceiptSaveGuide(true);
    setReceiptStatusSeverity('info');
    setReceiptStatusMessage('กดค้างที่รูปใบเสร็จ แล้วเลือกบันทึกรูปภาพ ระบบจะไม่พาไป URL แบบ blob');
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
      <Box
        className="print-toolbar"
        sx={{
          position: { xs: 'relative', sm: 'sticky' },
          top: { sm: 0 },
          zIndex: 10,
          width: '100%',
          minWidth: 0,
          px: { xs: 0, sm: 2, md: 3 },
          py: { xs: 0, sm: 1.5 },
          borderBottom: { xs: '1px solid #E5E7EB', sm: 'none' },
          bgcolor: { xs: '#FFFFFF', sm: 'rgba(248,250,252,0.78)' },
          backdropFilter: { xs: 'none', sm: 'blur(16px)' },
        }}>
        <Box
          className="print-toolbar-card"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            width: '100%',
            maxWidth: '1440px',
            minWidth: 0,
            minHeight: 104,
            boxSizing: 'border-box',
            mx: 'auto',
            px: { xs: 2, sm: 2.25, lg: 2.5 },
            py: { xs: 2, sm: 1.5 },
            border: { xs: 'none', sm: '1px solid #E5E7EB' },
            borderRadius: { xs: 0, sm: '16px' },
            bgcolor: '#FFFFFF',
            boxShadow: { xs: 'none', sm: '0 8px 24px rgba(15, 23, 42, 0.06)' },
            '@media (min-width: 768px) and (max-width: 1199.95px)': {
              flexWrap: 'wrap',
              gap: 1.5,
              minHeight: 0,
            },
            '@media (max-width: 767.95px)': {
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 1.75,
              minHeight: 0,
            },
          }}>
          <Stack
            direction="row"
            spacing={{ xs: 1.25, sm: 1.5 }}
            alignItems="flex-start"
            sx={{
              minWidth: 0,
              flex: '1 1 auto',
              '@media (min-width: 768px) and (max-width: 1199.95px)': { flexBasis: '360px' },
            }}>
          <ButtonBase
            component={Link}
            href="/home"
            sx={{
              borderRadius: '13px',
              flexShrink: 0,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
              },
            }}>
            <Box
              sx={{
                width: { xs: 44, sm: 52 },
                height: { xs: 44, sm: 52 },
                borderRadius: '13px',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 5px 14px rgba(15, 23, 42, 0.07)',
              }}>
              <Image src="/logo/logo.png" alt="Glossy Design logo" width={30} height={30} priority />
            </Box>
          </ButtonBase>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 16, sm: 19, lg: 21 },
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: { xs: 1.24, sm: 1.2 },
                letterSpacing: '-0.025em',
                overflowWrap: 'anywhere',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: { xs: 2, sm: 'unset' },
                overflow: 'hidden',
                '@media (min-width: 600px) and (max-width: 767.95px)': { WebkitLineClamp: 2 },
              }}>
              {titleTh}
            </Typography>
            <Box
              sx={{
                mt: 0.25,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.75,
                minWidth: 0,
                '@media (max-width: 767.95px)': { display: 'block' },
              }}>
              <Typography
                sx={{
                  minWidth: 0,
                  fontSize: { xs: 11.5, sm: 12.5 },
                  fontWeight: 600,
                  color: '#64748B',
                  lineHeight: 1.25,
                  letterSpacing: '0.01em',
                  overflowWrap: 'anywhere',
                }}>
                {titleEn}
              </Typography>
              <Typography
                sx={{
                  mt: { xs: 0.75, sm: 0 },
                  display: 'inline-block',
                  maxWidth: '100%',
                  px: 1,
                  py: 0.35,
                  borderRadius: '8px',
                  bgcolor: '#EFF6FF',
                  fontSize: { xs: 11.5, sm: 12.5 },
                  fontWeight: 800,
                  color: '#1D4ED8',
                  lineHeight: 1.2,
                  overflowWrap: 'anywhere',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {invoiceNumber}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, auto))' },
            gap: { xs: 0.75, sm: 1 },
            flexShrink: 0,
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { sm: 'end' },
            '@media (min-width: 768px) and (max-width: 1199.95px)': {
              marginLeft: 'auto',
            },
            '@media (max-width: 767.95px)': {
              width: '100%',
            },
          }}>
          <HeaderButton label="แก้ไข" mobileLabel="แก้ไข" icon={<EditRoundedIcon />} onClick={onEditCustomer} variant="outlined" />
          {isReceipt ? (
            <HeaderButton
              label={useMobileShare ? 'บันทึก / แชร์' : 'ดาวน์โหลด'}
              mobileLabel={useMobileShare ? 'แชร์' : 'บันทึก'}
              icon={useMobileShare ? <IosShareRoundedIcon /> : <DownloadRoundedIcon />}
              onClick={() => void handleReceiptHeaderAction()}
              variant="outlined"
            />
          ) : null}
          {!isReceipt ? (
            <HeaderButton label="ส่งออก PDF" mobileLabel="PDF" icon={<PictureAsPdfRoundedIcon />} onClick={handlePrint} variant="outlined" />
          ) : null}
          <HeaderButton label="พิมพ์" mobileLabel="พิมพ์" icon={<PrintRoundedIcon />} onClick={handlePrint} variant="contained" />
        </Box>
        </Box>
      </Box>

      <Box
        className="print-document-scroll"
        sx={{
          width: '100%',
          maxWidth: '100%',
          px: { xs: 2, sm: 2, md: 3 },
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

        {mobilePreviewDocument ? (
          <Box
            className="mobile-invoice-preview"
            sx={{
              display: { xs: 'flex', sm: 'none' },
              justifyContent: 'center',
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
              '@media (min-width: 600px) and (max-width: 767.95px)': { display: 'flex' },
              '@media (min-width: 768px)': { display: 'none' },
            }}>
            <Box
              sx={{
                width: '139mm',
                height: '197mm',
                flexShrink: 0,
                zoom: 0.62,
                bgcolor: '#FFFFFF',
                boxShadow: '0 14px 32px rgba(15, 23, 42, 0.14)',
                '@media (min-width: 400px)': { zoom: 0.68 },
                '@media (min-width: 480px)': { zoom: 0.84 },
                '@media (min-width: 600px)': { zoom: 1 },
              }}>
              {mobilePreviewDocument}
            </Box>
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
            display: isReceipt ? 'flex' : { xs: 'none', sm: 'flex' },
            justifyContent: 'center',
            height: 'auto',
            ...(!isReceipt ? { '@media (max-width: 767.95px)': { display: 'none' } } : {}),
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

      {isReceipt && useMobileShare ? (
        <ReceiptShareDialog
          open={receiptShareOpen}
          fileName={receiptAsset?.file.name ?? buildReceiptFileName(invoiceNumber)}
          imageDataUrl={receiptAsset?.dataUrl ?? null}
          preparing={receiptPreparing}
          statusMessage={receiptStatusMessage}
          statusSeverity={receiptStatusSeverity}
          showSaveGuide={showReceiptSaveGuide}
          canCopyImage={canCopyReceiptImage}
          onClose={closeReceiptShare}
          onShare={() => void handleNativeReceiptShare()}
          onCopyImage={() => void handleCopyReceiptImage()}
          onShowSaveGuide={handleShowReceiptSaveGuide}
        />
      ) : null}

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

          .mobile-invoice-preview {
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
