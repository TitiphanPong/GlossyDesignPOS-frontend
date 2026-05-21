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

function loadSelectedTask(taskFilePath) {
  if (!fs.existsSync(taskFilePath)) {
    throw new Error(`Task file was not found: ${taskFilePath}`);
  }

  const raw = fs.readFileSync(taskFilePath, 'utf8').trim();
  if (!raw || raw === 'null') {
    throw new Error(`Task file does not contain an active task: ${taskFilePath}`);
  }

  const parsed = JSON.parse(raw);
  if (!parsed?.id) {
    throw new Error(`Task file is missing task id: ${taskFilePath}`);
  }

  return parsed;
}

function main() {
  const args = parseArgs(process.argv);
  const taskFilePath = path.resolve(args.task || 'selected-task.json');
  const completionDate = String(args.date || new Date().toISOString().slice(0, 10));
  const selectedTask = loadSelectedTask(taskFilePath);
  const { todoPath, content } = readTodo();
  const updated = upsertTaskStatus(content, selectedTask.id, `completed on ${completionDate}`);

  if (updated !== content) {
    fs.writeFileSync(path.resolve(todoPath), updated, 'utf8');
  }

  process.stdout.write(
    JSON.stringify(
      {
        taskId: selectedTask.id,
        title: selectedTask.title,
        status: `completed on ${completionDate}`,
      },
      null,
      2,
    ) + '\n',
  );
}

main();
