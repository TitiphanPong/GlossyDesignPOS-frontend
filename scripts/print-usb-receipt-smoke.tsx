/**
 * Safe local thermal receipt smoke test for TPS-80160I-compatible ESC/POS printers.
 * Renders GlossyDesign's EXISTING ReceiptTemplate with an entirely synthetic order.
 * Usage: npx tsx scripts/print-usb-receipt-smoke.tsx [--print]
 * --print sends one copy to the connected USB device via macOS CUPS USB backend.
 * No API or database requests; no production order is created.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { InvoiceDocument } from '../src/app/print/invoice/[orderId]/InvoiceDocument';
import type { NormalizedInvoiceOrder } from '../src/lib/contracts';

const print = process.argv.includes('--print');
const uri = process.env.GLOSSY_PRINTER_URI || 'usb://KARSTCOM/80mm%20Series?serial=11101800002';
const today = new Date();
const baseName = 'glossy-tps80160-receipt-smoke-' + today.toISOString().replace(/[:.]/g, '-');
const pngFile = join(tmpdir(), baseName + '.png');
const rawFile = join(tmpdir(), baseName + '.escpos');

process.env.NEXT_PUBLIC_COMPANY_THAI_NAME ||= 'กลอสซี่ ดีไซน์';
process.env.NEXT_PUBLIC_COMPANY_ENGLISH_NAME ||= 'GLOSSY DESIGN';

const order: NormalizedInvoiceOrder = {
  orderId: 'LOCAL-TEST-ONLY',
  orderNumber: 'TEST-USB-20261015',
  invoiceNumber: '',
  invoiceSequence: '',
  invoicePeriod: '',
  bookNo: '',
  customerName: 'ลูกค้าทดสอบ',
  phoneNumber: '',
  email: '',
  address: '',
  taxId: '',
  branch: '',
  note: '*** เอกสารทดสอบ USB - ไม่ใช่รายการขายจริง ***',
  salesChannel: 'pos',
  paymentMethod: 'promptpay',
  status: 'paid',
  issueDate: today.toISOString(),
  orderDate: today.toISOString(),
  taxInvoice: 'no',
  customerInfo: { customerName: 'ลูกค้าทดสอบ', taxId: '', address: '' },
  cart: [
    { name: 'พิมพ์ A4 ขาวดำ', quantity: 2, unitPrice: 5, totalPrice: 10 },
    { name: 'พิมพ์ A4 สี', quantity: 1, unitPrice: 15, totalPrice: 15 },
    { name: 'ถ่ายเอกสาร A4', quantity: 5, unitPrice: 1, totalPrice: 5 },
  ],
  subtotal: 30,
  discount: 0,
  finalTotal: 30,
  vatAmount: 0,
  grandTotal: 30,
};

function rasterEscPos(gray: Buffer, width: number, height: number): Buffer {
  if (width !== 576) throw new Error('Expected exact 576-pixel output for 72mm print head');
  const stripeHeight = 128;
  const bytesPerRow = width / 8;
  const output: Buffer[] = [Buffer.from([0x1b, 0x40])]; // initialize printer
  for (let rowStart = 0; rowStart < height; rowStart += stripeHeight) {
    const rows = Math.min(stripeHeight, height - rowStart);
    const bits = Buffer.alloc(rows * bytesPerRow);
    for (let row = 0; row < rows; row++) {
      for (let x = 0; x < width; x++) {
        if (gray[(rowStart + row) * width + x] < 128) {
          const offset = row * bytesPerRow + (x >> 3);
          bits[offset] |= 0x80 >> (x & 7);
        }
      }
    }
    output.push(Buffer.from([0x1d, 0x76, 0x30, 0x00, bytesPerRow, 0, rows & 255, rows >> 8]), bits);
  }
  output.push(Buffer.from([0x0a, 0x0a, 0x1d, 0x56, 0x00])); // feed, full cut
  return Buffer.concat(output);
}

async function main() {
  const markup = renderToStaticMarkup(createElement(InvoiceDocument, { documentType: 'receipt', order }));
  if (!markup.includes('ใบแจ้งราคาสินค้า / ใบส่งของ') || !markup.includes('TEST-USB-20261015')) {
    throw new Error('Unexpected GlossyDesign receipt template output');
  }
  const html = '<!doctype html><html lang="th"><head><meta charset="utf-8" />' +
    '<style>html,body{padding:0;margin:0;background:white;} .receipt-document-sheet{width:80mm!important;max-width:80mm!important;}</style>' +
    '</head><body>' + markup + '</body></html>';
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  let screenshot: Buffer;
  try {
    const page = await browser.newPage({
      viewport: { width: 500, height: 1600 },
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: 'load' });
    screenshot = await page.locator('.receipt-document-sheet').screenshot({ type: 'png' });
  } finally {
    await browser.close();
  }
  await writeFile(pngFile, screenshot);
  const { data, info } = await sharp(screenshot)
    .resize({ width: 576 })
    .flatten({ background: '#ffffff' })
    .greyscale()
    .threshold(180)
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || info.width !== 576 || info.height <= 0) {
    throw new Error('Invalid raster shape: ' + JSON.stringify(info));
  }
  const bytes = rasterEscPos(data, info.width, info.height);
  await writeFile(rawFile, bytes);
  console.log(JSON.stringify({
    source: 'GlossyDesign ReceiptTemplate',
    demonstration: true,
    orderNumber: order.orderNumber,
    count: order.cart.length,
    total: order.grandTotal,
    vat: order.vatAmount,
    raster: [info.width, info.height],
    preview: pngFile,
    escpos: rawFile,
    bytes: bytes.length,
    printRequested: print,
  }, null, 2));
  if (!print) return;

  const result = spawnSync('/usr/libexec/cups/backend/usb',
    ['1', process.env.USER || 'local-test', 'GlossyDesign TEST Receipt', '1', '', rawFile],
    {
      env: {
        ...process.env,
        DEVICE_URI: uri,
        PRINTER: 'Glossy_TPS80160_USB',
        CONTENT_TYPE: 'application/vnd.cups-raw',
        FINAL_CONTENT_TYPE: 'application/vnd.cups-raw',
      },
      encoding: 'utf8',
      timeout: 30_000,
    });
  console.log('USB PRINT: exit', result.status, 'signal', result.signal);
  console.log('USB PRINT stdout:', (result.stdout || '').slice(-1200));
  console.log('USB PRINT stderr:', (result.stderr || '').slice(-3000));
  if (result.error || result.status !== 0) {
    throw result.error || new Error('USB print backend failed, exit ' + result.status);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
