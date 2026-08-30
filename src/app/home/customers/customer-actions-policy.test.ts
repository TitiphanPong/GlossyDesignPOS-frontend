import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

test('customer table uses the same compact icon action pattern as other admin tables', async () => {
  const source = await readFile(path.join(process.cwd(), 'src/app/home/customers/page.tsx'), 'utf8');

  assert.match(source, /<Tooltip title="ดูรายละเอียด">\s*<IconButton size="small"/);
  assert.match(source, /<Tooltip title="แก้ไข">\s*<IconButton size="small"/);
  assert.match(source, /width: 120/);
});

test('customer desktop table gives the document address its own column', async () => {
  const source = await readFile(path.join(process.cwd(), 'src/app/home/customers/page.tsx'), 'utf8');

  assert.match(source, /key: 'address',\s*header: 'ที่อยู่',\s*width: '42%'/);
  assert.match(source, /render: customer => <CustomerAddress customer=\{customer\} \/>/);
  assert.doesNotMatch(source, /const secondaryName/);
});

test('customer directory does not expose the unused active status filter', async () => {
  const source = await readFile(path.join(process.cwd(), 'src/app/home/customers/page.tsx'), 'utf8');

  assert.doesNotMatch(source, /ActiveFilter|activeFilter|handleFilterChange/);
  assert.doesNotMatch(source, /label="สถานะ"/);
});
