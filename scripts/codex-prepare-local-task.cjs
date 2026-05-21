const fs = require('fs');
const path = require('path');
const {
  branchNameForTask,
  parseTaskIdList,
  parseTodoTasks,
  readTodo,
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

function selectTask(tasks, explicitTaskId, claimedTaskIds) {
  if (explicitTaskId) {
    const explicitTask = tasks.find(task => task.id === explicitTaskId) || null;
    if (!explicitTask) {
      throw new Error(`Task ${explicitTaskId} was not found in TODO.md`);
    }
    return explicitTask;
  }

  return tasks.find(task => !task.completed && !claimedTaskIds.has(task.id)) || null;
}

function buildPrompt(task, taskFilePath) {
  const affectedFilesList =
    task.affectedFiles.length > 0
      ? task.affectedFiles.map(filePath => `- \`${filePath}\``).join('\n')
      : '- Use the smallest safe file set needed for this task.';

  return [
    '# Codex Local Task Prompt',
    '',
    'Use the next queued task from the local repository and implement it in this Codex session.',
    '',
    `Task file: \`${taskFilePath}\``,
    `Task ID: ${task.id}`,
    `Title: ${task.title}`,
    `Risk: ${task.risk || 'unspecified'}`,
    `Effort: ${task.effort || 'unspecified'}`,
    '',
    'Why it matters:',
    task.why || 'Not provided.',
    '',
    'Affected files:',
    affectedFilesList,
    '',
    'Suggested task prompt:',
    task.prompt || 'Implement the task safely and keep the scope narrow.',
    '',
    'Execution rules:',
    '- Read `selected-task.json` first and use it as the source of truth.',
    '- Keep the change narrowly scoped to the affected files. Adjacent test files are allowed if needed.',
    '- Reuse existing UI and data patterns from this repo. Avoid broad refactors.',
    '- If the task is ambiguous or requires backend behavior not present in this repo, stop and explain the blocker instead of guessing.',
    '- Run `npm run check:utf8`, `npm run lint`, and `npm run build` after the change. Run relevant tests too if you add or update any.',
    '- Summarize what changed, what was verified, and any remaining risk.',
    '',
    'Start now by opening `selected-task.json`, then implement the task end-to-end.',
    '',
  ].join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const outputPath = path.resolve(args.output || 'selected-task.json');
  const promptOutputPath = path.resolve(args['prompt-output'] || 'selected-task-prompt.md');
  const explicitTaskId = String(args['task-id'] || '').trim().toUpperCase();
  const openTaskIds = parseTaskIdList(process.env.OPEN_PR_TASK_IDS || args['open-task-ids']);
  const { content } = readTodo();
  const tasks = parseTodoTasks(content);
  const selectedTask = selectTask(tasks, explicitTaskId, openTaskIds);

  if (!selectedTask) {
    fs.writeFileSync(outputPath, 'null\n');
    fs.writeFileSync(
      promptOutputPath,
      [
        '# Codex Local Task Prompt',
        '',
        'No eligible task was found in `TODO.md`.',
        '',
        'Everything unfinished may already be completed or claimed by an open automation PR.',
        '',
      ].join('\n'),
    );
    process.stdout.write('No eligible task found in TODO.md\n');
    return;
  }

  const taskResult = {
    ...selectedTask,
    branchName: branchNameForTask(selectedTask),
    prTitle: `[${selectedTask.id}] ${selectedTask.title}`,
  };

  fs.writeFileSync(outputPath, JSON.stringify(taskResult, null, 2));
  fs.writeFileSync(promptOutputPath, buildPrompt(taskResult, path.basename(outputPath)));

  process.stdout.write(
    JSON.stringify(
      {
        taskId: taskResult.id,
        title: taskResult.title,
        output: path.relative(process.cwd(), outputPath),
        promptOutput: path.relative(process.cwd(), promptOutputPath),
      },
      null,
      2,
    ) + '\n',
  );
}

main();
