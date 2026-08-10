import assert from 'node:assert/strict';
import test from 'node:test';
import { createCsvBlob, createExcelCompatibleCsv } from './csv';

test('creates Excel-compatible UTF-8 CSV with BOM and CRLF', () => {
  const csv = createExcelCompatibleCsv([
    ['ชื่อสินค้า', 'ลูกค้า', 'วันที่', 'ยอดรวม'],
    ['นามบัตร', 'ลูกค้า ทดสอบภาษาไทย', '10/08/2026', 350.5],
    ['สติ๊กเกอร์', 'English Customer', '11/08/2026', 1200],
  ]);

  assert.equal(csv.codePointAt(0), 0xfeff);
  assert.deepEqual([...new TextEncoder().encode(csv).slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.match(csv, /^\uFEFF"ชื่อสินค้า"/u);
  assert.equal(csv.split('\r\n').length, 3);
  assert.equal(csv.includes('\n') && !csv.includes('\r\n'), false);
  assert.equal(new TextDecoder('utf-8', { fatal: true }).decode(new TextEncoder().encode(csv)), csv.slice(1));
});

test('escapes commas, quotes, newlines and Thai text without altering content', () => {
  const csv = createExcelCompatibleCsv([
    ['รายการ', 'หมายเหตุ'],
    ['ถ่ายเอกสารสี, A4', 'พิมพ์หน้า-หลัง กระดาษอาร์ตมัน'],
    ['เข้าเล่มสันเกลียว', 'ลูกค้าบอกว่า "งานด่วน"\nรับวันนี้'],
  ]);

  assert.ok(csv.includes('"ถ่ายเอกสารสี, A4"'));
  assert.ok(csv.includes('"ลูกค้าบอกว่า ""งานด่วน""\nรับวันนี้"'));
  assert.ok(csv.includes('พิมพ์หน้า-หลัง กระดาษอาร์ตมัน'));
});

test('creates a UTF-8 CSV browser Blob without text re-decoding', async () => {
  const csv = createExcelCompatibleCsv([['ชื่อสินค้า'], ['นามบัตร']]);
  const blob = createCsvBlob(csv);
  const bytes = new Uint8Array(await blob.arrayBuffer());

  assert.equal(blob.type, 'text/csv; charset=utf-8');
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.equal(new TextDecoder('utf-8', { fatal: true }).decode(bytes), csv.slice(1));
});
