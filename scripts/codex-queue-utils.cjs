const fs = require('fs');
const path = require('path');

const TASK_HEADER_REGEX = /^### Task ([A-Z]{2}-\d{2}): (.+)$/gm;

function readTodo(rootDir = process.cwd()) {
  const todoPath = path.join(rootDir, 'TODO.md');
  return {
    todoPath,
    content: fs.readFileSync(todoPath, 'utf8'),
  };
}

function parseAffectedFiles(rawValue) {
  if (!rawValue) {
    return [];
  }

  const backtickMatches = [...rawValue.matchAll(/`([^`]+)`/g)].map(match => match[1].trim());
  if (backtickMatches.length > 0) {
    return backtickMatches;
  }

  return rawValue
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function findField(block, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return block.match(new RegExp(`^- ${escapedLabel}: (.+)$`, 'm'))?.[1]?.trim() ?? '';
}

function parseTodoTasks(content) {
  const matches = [...content.matchAll(TASK_HEADER_REGEX)];
  return matches.map((match, index) => {
    const blockStart = match.index + match[0].length;
    const blockEnd = index + 1 < matches.length ? matches[index + 1].index : content.length;
    const block = content.slice(blockStart, blockEnd).trim();
    const status = findField(block, 'Status');
    const affectedFiles = parseAffectedFiles(findField(block, 'Affected files'));

    return {
      id: match[1],
      title: match[2].trim(),
      status,
      completed: /completed/i.test(status),
      why: findField(block, 'Why it matters'),
      risk: findField(block, 'Risk level'),
      effort: findField(block, 'Estimated effort'),
      prompt: findField(block, 'Suggested Codex prompt').replace(/^"|"$/g, ''),
      affectedFiles,
      block,
      order: index,
    };
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function branchNameForTask(task) {
  return `codex-auto/${task.id.toLowerCase()}-${slugify(task.title)}`;
}

function parseTaskIdList(value) {
  return new Set(
    String(value || '')
      .split(/[,\s]+/)
      .map(item => item.trim().toUpperCase())
      .filter(Boolean),
  );
}

function writeGithubOutput(values) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }

  const lines = [];
  for (const [key, value] of Object.entries(values)) {
    const normalized = value == null ? '' : String(value);
    if (normalized.includes('\n')) {
      const marker = `EOF_${key.toUpperCase()}_${Date.now()}`;
      lines.push(`${key}<<${marker}`);
      lines.push(normalized);
      lines.push(marker);
    } else {
      lines.push(`${key}=${normalized}`);
    }
  }

  fs.appendFileSync(outputPath, `${lines.join('\n')}\n`);
}

function upsertTaskStatus(content, taskId, statusLine) {
  const matches = [...content.matchAll(TASK_HEADER_REGEX)];
  const taskIndex = matches.findIndex(match => match[1] === taskId);
  if (taskIndex === -1) {
    throw new Error(`Could not find task ${taskId} in TODO.md`);
  }

  const match = matches[taskIndex];
  const blockStart = match.index;
  const bodyStart = blockStart + match[0].length;
  const blockEnd = taskIndex + 1 < matches.length ? matches[taskIndex + 1].index : content.length;
  const header = match[0];
  const body = content.slice(bodyStart, blockEnd);
  const statusRegex = /^- Status: .+$/m;
  const updatedBody = statusRegex.test(body)
    ? body.replace(statusRegex, `- Status: ${statusLine}`)
    : `\n- Status: ${statusLine}${body}`;

  return `${content.slice(0, blockStart)}${header}${updatedBody}${content.slice(blockEnd)}`;
}

module.exports = {
  branchNameForTask,
  parseTaskIdList,
  parseTodoTasks,
  readTodo,
  slugify,
  upsertTaskStatus,
  writeGithubOutput,
};
