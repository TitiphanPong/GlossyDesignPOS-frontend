import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const DIRECT_TABLE_ROOT_ALLOWLIST = new Set([
  'src/app/home/components/DataTable.tsx',
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

test('admin table roots use the shared Orders-style DataTable', async () => {
  const root = process.cwd();
  const homeRoot = path.join(root, 'src', 'app', 'home');
  const sourceFiles = await collectSourceFiles(homeRoot);
  const offenders: string[] = [];

  for (const filePath of sourceFiles) {
    const relativePath = path.relative(root, filePath).replaceAll('\\', '/');
    if (DIRECT_TABLE_ROOT_ALLOWLIST.has(relativePath)) continue;

    const content = await readFile(filePath, 'utf8');
    if (/<Table(?:\s|>)/.test(content) || /<TableContainer(?:\s|>)/.test(content)) {
      offenders.push(relativePath);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Admin table roots must use the shared DataTable: ${offenders.join(', ')}`,
  );
});
