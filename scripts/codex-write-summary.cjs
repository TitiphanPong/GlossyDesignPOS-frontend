const fs = require('fs');

function appendSummary(text) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    process.stdout.write(text);
    return;
  }

  fs.appendFileSync(summaryPath, `${text}\n`, 'utf8');
}

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
  const mode = args.mode || 'generic';
  const taskId = args['task-id'] || '-';
  const taskTitle = args['task-title'] || '-';
  const quotaReason = args['quota-reason'] || '';
  const skipReason = args['skip-reason'] || '';
  const branchName = args['branch-name'] || '-';
  const prTitle = args['pr-title'] || '-';
  const dailySpend = args['daily-spend'] || '-';
  const monthlySpend = args['monthly-spend'] || '-';

  const lines = ['## Codex Auto PR Run', ''];

  if (mode === 'no-task') {
    lines.push('Status: no eligible task found in `TODO.md`.');
  } else if (mode === 'quota-blocked') {
    lines.push('Status: skipped by quota guard.');
    lines.push('');
    lines.push(`Task: ${taskId} ${taskTitle}`);
    lines.push(`Reason: ${quotaReason || '-'}`);
    lines.push(`24h spend (USD): ${dailySpend}`);
    lines.push(`Month-to-date spend (USD): ${monthlySpend}`);
  } else if (mode === 'ai-skipped') {
    lines.push('Status: AI step returned no safe patch.');
    lines.push('');
    lines.push(`Task: ${taskId} ${taskTitle}`);
    lines.push(`Reason: ${skipReason || '-'}`);
  } else if (mode === 'pr-opened') {
    lines.push('Status: draft PR prepared.');
    lines.push('');
    lines.push(`Task: ${taskId} ${taskTitle}`);
    lines.push(`Branch: ${branchName}`);
    lines.push(`PR title: ${prTitle}`);
  } else {
    lines.push('Status: run completed.');
  }

  appendSummary(`${lines.join('\n')}\n`);
}

main();
