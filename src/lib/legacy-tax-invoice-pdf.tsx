'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { createInvoiceOrderFromNormalizedOrder } from './contracts';
import { buildExportFilename, normalizeMonthScope } from './export-filename';
import { fetchOrderById, getOrderTrackingAccess } from './orders';
import type { TaxInvoiceReportItem } from './tax-invoice-reports';
import { InvoiceDocument } from '../app/print/invoice/[orderId]/InvoiceDocument';

const MILLIMETERS_TO_POINTS = 72 / 25.4;
const LEGACY_DOCUMENT_WIDTH_MM = 285;
const LEGACY_DOCUMENT_HEIGHT_MM = 197;

async function waitForImages(element: HTMLElement): Promise<void> {
  const pending = Array.from(element.querySelectorAll('img'))
    .filter(image => !image.complete)
    .map(
      image =>
        new Promise<void>(resolve => {
          const finish = () => resolve();
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        }),
    );
  await Promise.all(pending);
}

async function nextPaint(): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function getTrackingToken(orderId: string): Promise<string | null> {
  try {
    return (await getOrderTrackingAccess(orderId)).token;
  } catch {
    // Match the single-invoice print page: a tracking QR is optional and must not block printing.
    return null;
  }
}

async function renderLegacyInvoicePng(orderId: string): Promise<Uint8Array> {
  const [order, trackingToken] = await Promise.all([fetchOrderById(orderId), getTrackingToken(orderId)]);
  const invoiceOrder = createInvoiceOrderFromNormalizedOrder(order);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${LEGACY_DOCUMENT_WIDTH_MM}mm`,
    pointerEvents: 'none',
    zIndex: '-2147483648',
    background: '#ffffff',
  });
  document.body.append(host);
  const root = createRoot(host);

  try {
    flushSync(() => {
      root.render(
        <InvoiceDocument
          documentType="tax-invoice"
          order={invoiceOrder}
          trackingOrigin={globalThis.location?.origin ?? null}
          trackingToken={trackingToken}
        />,
      );
    });

    if ('fonts' in document) {
      await document.fonts.ready;
    }

    const sheet = host.querySelector<HTMLElement>('.invoice-document-sheet');
    if (!sheet) {
      throw new Error('ไม่พบใบกำกับภาษีแบบเก่าสำหรับสร้าง PDF');
    }

    await waitForImages(sheet);
    await nextPaint();
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(sheet, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      throw new Error('สร้างภาพใบกำกับภาษีไม่สำเร็จ');
    }
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    root.unmount();
    host.remove();
  }
}

function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.slice().buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadLegacyTaxInvoiceMonthlyPdf(
  period: string,
  documents: ReadonlyArray<TaxInvoiceReportItem>,
): Promise<{ filename: string }> {
  if (documents.length === 0) {
    throw new Error('งวดนี้ไม่มีใบกำกับภาษีสำหรับดาวน์โหลด');
  }

  const pdf = await PDFDocument.create();
  const [a4PortraitWidth, a4PortraitHeight] = PageSizes.A4;
  const pageWidth = a4PortraitHeight;
  const pageHeight = a4PortraitWidth;
  const documentWidth = LEGACY_DOCUMENT_WIDTH_MM * MILLIMETERS_TO_POINTS;
  const documentHeight = LEGACY_DOCUMENT_HEIGHT_MM * MILLIMETERS_TO_POINTS;
  const x = (pageWidth - documentWidth) / 2;
  const y = (pageHeight - documentHeight) / 2;

  for (const reportDocument of documents) {
    const pngBytes = await renderLegacyInvoicePng(reportDocument.orderId);
    const image = await pdf.embedPng(pngBytes);
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x,
      y,
      width: documentWidth,
      height: documentHeight,
    });
  }

  const filename = buildExportFilename({
    artifact: 'tax-invoices',
    variant: 'legacy',
    scope: normalizeMonthScope(period),
    extension: 'pdf',
  });
  downloadPdf(await pdf.save(), filename);
  return { filename };
}
