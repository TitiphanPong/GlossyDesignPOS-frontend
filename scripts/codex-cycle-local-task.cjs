const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

function hasFlag(args, key) {
  if (!(key in args)) {
    return false;
  }

  const value = args[key];
  if (value == null) {
    return true;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === '' || normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function resolveCommand(command) {
  if (process.platform !== 'win32') {
    return command;
  }

  if (command === 'npm') {
    return 'npm.cmd';
  }

  if (command === 'npx') {
    return 'npx.cmd';
  }

  if (command === 'node') {
    return 'node.exe';
  }

  if (command === 'git') {
    return 'git.exe';
  }

  if (command === 'codex') {
    return 'codex.exe';
  }

  return command;
}

function runCommand(command, args, options = {}) {
  const executable = resolveCommand(command);
  const useShell = process.platform === 'win32' && /\.(cmd|bat)$/i.test(executable);
  let stdio = 'inherit';
  if (options.captureOutput) {
    stdio = 'pipe';
  } else if (typeof options.input === 'string') {
    stdio = ['pipe', 'inherit', 'inherit'];
  }

  const result = spawnSync(executable, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    input: options.input,
    env: options.env || process.env,
    stdio,
    shell: useShell,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stdout = result.stdout ? `\n${result.stdout}` : '';
    const stderr = result.stderr ? `\n${result.stderr}` : '';
    throw new Error(`Command failed: ${executable} ${args.join(' ')}${stdout}${stderr}`);
  }

  return result;
}

function runPowerShell(script, options = {}) {
  return runCommand(
    'powershell.exe',
    ['-NoProfile', '-Command', script],
    {
      ...options,
      captureOutput: options.captureOutput ?? true,
    },
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function getGitStatus() {
  return runCommand('git', ['status', '--porcelain'], { captureOutput: true }).stdout.trim();
}

function ensureCleanWorktree(allowDirty) {
  const status = getGitStatus();
  if (!status || allowDirty) {
    return status;
  }

  throw new Error(
    'Working tree is not clean. Commit or stash existing changes first, or rerun with --allow-dirty if you intentionally want to include current changes in the cycle.',
  );
}

function ensureBranch(branchName) {
  const branchCheck = runCommand('git', ['branch', '--list', branchName], { captureOutput: true }).stdout.trim();
  if (branchCheck) {
    runCommand('git', ['switch', branchName]);
    return;
  }

  runCommand('git', ['switch', '-c', branchName]);
}

function prepareTask({ taskId, openTaskIds }) {
  const args = ['scripts/codex-prepare-local-task.cjs', '--output', 'selected-task.json', '--prompt-output', 'selected-task-prompt.md'];
  if (taskId) {
    args.push('--task-id', taskId);
  }
  if (openTaskIds) {
    args.push('--open-task-ids', openTaskIds);
  }

  runCommand('node', args);

  const selectedTaskPath = path.resolve('selected-task.json');
  if (!fileExists(selectedTaskPath)) {
    throw new Error('selected-task.json was not created.');
  }

  const raw = fs.readFileSync(selectedTaskPath, 'utf8').trim();
  if (!raw || raw === 'null') {
    throw new Error('No eligible task was found in TODO.md.');
  }

  return readJson(selectedTaskPath);
}

function runCodexExec({ model, promptPath }) {
  const prompt = fs.readFileSync(promptPath, 'utf8');
  const outputPath = path.resolve('codex-last-message.txt');
  const args = ['exec', '-C', process.cwd(), '-s', 'workspace-write', '-o', outputPath];
  if (model) {
    args.push('-m', model);
  }

  runCommand('codex', args, { input: prompt });
  return outputPath;
}

function verifyChanges() {
  const commands = [
    ['npm', ['run', 'check:utf8']],
    ['npm', ['run', 'lint']],
    ['npm', ['run', 'build']],
  ];

  for (const [command, args] of commands) {
    runCommand(command, args);
  }
}

function markTaskComplete() {
  runCommand('node', ['scripts/codex-complete-local-task.cjs', '--task', 'selected-task.json']);
}

function parseRemoteRepo(remoteUrl) {
  const sshMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/i);
  if (!sshMatch) {
    return null;
  }
  return {
    owner: sshMatch[1],
    repo: sshMatch[2],
  };
}

function createPullRequest({ repo, head, base, title, body }) {
  const token =
    String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GIT_TOKEN || '').trim();

  if (!token) {
    return {
      status: 'skipped',
      reason: 'Missing GITHUB_TOKEN/GH_TOKEN/GIT_TOKEN for GitHub REST PR creation.',
      url: `https://github.com/${repo.owner}/${repo.repo}/compare/${base}...${head}?expand=1`,
    };
  }

  const response = runPowerShell(
    [
      '$headers = @{',
      `  Authorization = 'Bearer ${token.replace(/'/g, "''")}'`,
      "  'User-Agent' = 'codex-local-cycle'",
      "  Accept = 'application/vnd.github+json'",
      '}',
      '$payload = @{',
      `  title = '${title.replace(/'/g, "''")}'`,
      `  head = '${head.replace(/'/g, "''")}'`,
      `  base = '${base.replace(/'/g, "''")}'`,
      `  body = @'\n${body}\n'@`,
      '  draft = $true',
      '} | ConvertTo-Json -Depth 6',
      `$response = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/repos/${repo.owner}/${repo.repo}/pulls' -Headers $headers -Body $payload -ContentType 'application/json'`,
      '$response | ConvertTo-Json -Depth 10',
    ].join('\n'),
    { captureOutput: true },
  );

  const parsed = JSON.parse(response.stdout);
  return {
    status: 'created',
    url: parsed.html_url,
    number: parsed.number,
  };
}

function commitChanges(task) {
  runCommand('git', ['add', '-A']);
  runCommand('git', ['commit', '-m', `[${task.id}] ${task.title}`]);
}

function pushBranch(branchName) {
  runCommand('git', ['push', '-u', 'origin', branchName]);
}

function getCurrentBranch() {
  return runCommand('git', ['branch', '--show-current'], { captureOutput: true }).stdout.trim();
}

function buildPrBody(task) {
  const affectedFiles = task.affectedFiles.length
    ? task.affectedFiles.map(filePath => `- \`${filePath}\``).join('\n')
    : '- Narrowly scoped change set';

  return [
    `Implements ${task.id}: ${task.title}`,
    '',
    'Why:',
    task.why || '-',
    '',
    'Affected files:',
    affectedFiles,
    '',
    'Verification:',
    '- `npm run check:utf8`',
    '- `npm run lint`',
    '- `npm run build`',
  ].join('\n');
}

function writeSummary(summary) {
  const summaryPath = path.resolve('codex-cycle-summary.json');
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv);
  const allowDirty = hasFlag(args, 'allow-dirty');
  const skipPush = hasFlag(args, 'skip-push');
  const skipPr = hasFlag(args, 'skip-pr');
  const skipCommit = hasFlag(args, 'skip-commit');
  const skipComplete = hasFlag(args, 'skip-complete');
  const skipAgent = hasFlag(args, 'skip-agent');
  const baseBranch = args['base-branch'] || 'main';
  const taskId = String(args['task-id'] || '').trim().toUpperCase();
  const model = args.model || '';

  const initialStatus = ensureCleanWorktree(allowDirty);
  const selectedTask = prepareTask({
    taskId,
    openTaskIds: args['open-task-ids'] || '',
  });

  ensureBranch(selectedTask.branchName);
  if (!skipAgent) {
    runCodexExec({
      model,
      promptPath: path.resolve('selected-task-prompt.md'),
    });
  }
  verifyChanges();

  if (!skipComplete) {
    markTaskComplete();
  }

  if (!skipCommit) {
    commitChanges(selectedTask);
  }

  if (!skipPush) {
    pushBranch(selectedTask.branchName);
  }

  const remoteUrl = runCommand('git', ['config', '--get', 'remote.origin.url'], { captureOutput: true }).stdout.trim();
  const repo = parseRemoteRepo(remoteUrl);
  let prResult = { status: 'skipped', reason: 'PR creation was skipped.' };
  if (!skipPr && repo) {
    prResult = createPullRequest({
      repo,
      head: selectedTask.branchName,
      base: baseBranch,
      title: selectedTask.prTitle,
      body: buildPrBody(selectedTask),
    });
  }

  const summary = {
    taskId: selectedTask.id,
    title: selectedTask.title,
    branch: getCurrentBranch(),
    baseBranch,
    initialStatus,
    pr: prResult,
  };

  writeSummary(summary);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
