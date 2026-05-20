const fs = require('fs');
const path = require('path');
const { readTodo, upsertTaskStatus } = require('./codex-queue-utils.cjs');

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith('--') ? next : 'true';
    if (args[key] === next) {
      index += 1;
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const taskId = String(args['task-id'] || '').trim().toUpperCase();
  if (!taskId) {
    throw new Error('Missing required --task-id argument.');
  }

  const completionDate = String(args.date || new Date().toISOString().slice(0, 10));
  const { todoPath, content } = readTodo();
  const updated = upsertTaskStatus(content, taskId, `completed on ${completionDate}`);

  if (updated !== content) {
    fs.writeFileSync(path.resolve(todoPath), updated, 'utf8');
  }
}

main();
