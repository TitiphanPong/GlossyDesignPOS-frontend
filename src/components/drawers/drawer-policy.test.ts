import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const DIRECT_DRAWER_ALLOWLIST = new Set([
  'src/app/home/quick-sale/page.tsx',
  'src/app/print/invoice/[orderId]/PrintInvoicePage.tsx',
  'src/components/drawers/GlossyDetailDrawer.tsx',
  'src/components/navigation/AppSidebar.tsx',
  'src/components/notifications/NotificationDrawer.tsx',
]);

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(target);
      return /\.(?:ts|tsx)$/.test(entry.name) ? [target] : [];
    }),
  );
  return files.flat();
}

test('feature detail drawers use the canonical Order-style drawer shell', async () => {
  const root = process.cwd();
  const sourceFiles = await collectSourceFiles(path.join(root, 'src'));
  const offenders: string[] = [];

  for (const filePath of sourceFiles) {
    const relativePath = path.relative(root, filePath).replaceAll('\\', '/');
    if (DIRECT_DRAWER_ALLOWLIST.has(relativePath)) continue;

    const content = await readFile(filePath, 'utf8');
    if (/<Drawer(?:\s|>)/.test(content)) offenders.push(relativePath);
  }

  assert.deepEqual(
    offenders,
    [],
    `Direct MUI Drawer usage must go through GlossyDetailDrawer unless it is an approved utility drawer: ${offenders.join(', ')}`,
  );
});

test('customer detail drawer keeps edit and close actions in the shared drawer footer', async () => {
  const root = process.cwd();
  const content = await readFile(path.join(root, 'src/components/customers/CustomerDetailDrawer.tsx'), 'utf8');

  assert.match(content, /footer=\{detail \? <CustomerDrawerActionBar/);
  assert.doesNotMatch(content, /<IconButton/);
  assert.match(content, /headerActions=\{detail \? \(\s*<Chip/);
});

test('storage drawer footer follows the Order action button sizing policy', async () => {
  const root = process.cwd();
  const content = await readFile(path.join(root, 'src/app/home/storage/page.tsx'), 'utf8');

  assert.match(content, /\.\.\.commonButtonSx/);
  assert.doesNotMatch(content, /flex:\s*\{ sm: '0 0 140px' \}/);
  assert.doesNotMatch(content, /minHeight:\s*46/);
});
