const fs = require('fs');
const path = require('path');
const {
  branchNameForTask,
  parseTaskIdList,
  parseTodoTasks,
  readTodo,
  writeGithubOutput,
} = require('./codex-queue-utils.cjs');

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
  const { content } = readTodo();
  const tasks = parseTodoTasks(content);
  const openTaskIds = parseTaskIdList(process.env.OPEN_PR_TASK_IDS || args['open-task-ids']);
  const explicitTaskId = (process.env.TASK_ID_OVERRIDE || args['task-id'] || '').trim().toUpperCase();

  let selectedTask = null;
  if (explicitTaskId) {
    selectedTask = tasks.find(task => task.id === explicitTaskId) || null;
    if (!selectedTask) {
      throw new Error(`Task ${explicitTaskId} was not found in TODO.md`);
    }
  } else {
    selectedTask = tasks.find(task => !task.completed && !openTaskIds.has(task.id)) || null;
  }

  const result = selectedTask
    ? {
        ...selectedTask,
        branchName: branchNameForTask(selectedTask),
        prTitle: `[${selectedTask.id}] ${selectedTask.title}`,
      }
    : null;

  if (args.output) {
    const outputPath = path.resolve(args.output);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  }

  writeGithubOutput(
    result
      ? {
          has_task: 'true',
          task_id: result.id,
          task_title: result.title,
          branch_name: result.branchName,
          pr_title: result.prTitle,
          affected_files: result.affectedFiles.join(', '),
        }
      : {
          has_task: 'false',
        },
  );

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
