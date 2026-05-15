const fs = require('fs');
const path = require('path');

const root = process.cwd();
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md', '.mjs', '.cjs', '.html', '.yml', '.yaml']);
const skipDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'build']);
const bad = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walk(full);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!exts.has(ext)) continue;

    const buf = fs.readFileSync(full);
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
      bad.push(path.relative(root, full));
    }
  }
}

walk(root);

if (bad.length > 0) {
  console.error('Found non-UTF-8 files:');
  for (const file of bad) console.error(`- ${file}`);
  process.exit(1);
}

console.log('All checked text files are valid UTF-8.');
