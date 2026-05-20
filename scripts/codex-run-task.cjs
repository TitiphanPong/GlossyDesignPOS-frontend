const fs = require('fs');
const path = require('path');
const { writeGithubOutput } = require('./codex-queue-utils.cjs');

const MAX_CONTEXT_CHARS_PER_FILE = 24000;

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

function loadTemplate(templatePath) {
  return fs.readFileSync(path.resolve(templatePath), 'utf8');
}

function fillTemplate(template, values) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function truncateContent(content) {
  if (content.length <= MAX_CONTEXT_CHARS_PER_FILE) {
    return { content, truncated: false };
  }

  const headLength = Math.floor(MAX_CONTEXT_CHARS_PER_FILE * 0.65);
  const tailLength = MAX_CONTEXT_CHARS_PER_FILE - headLength;
  return {
    content: `${content.slice(0, headLength)}\n\n/* ... truncated for automation context ... */\n\n${content.slice(-tailLength)}`,
    truncated: true,
  };
}

function readFileContext(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    return `FILE: ${filePath}\nSTATUS: missing\n`;
  }

  const rawContent = fs.readFileSync(absolutePath, 'utf8');
  const truncated = truncateContent(rawContent);
  const note = truncated.truncated ? 'truncated' : 'full';
  return `FILE: ${filePath}\nSTATUS: existing (${note})\n\`\`\`\n${truncated.content}\n\`\`\`\n`;
}

function extractOutputText(responseBody) {
  if (typeof responseBody.output_text === 'string' && responseBody.output_text.trim()) {
    return responseBody.output_text;
  }

  const parts = [];
  for (const item of responseBody.output || []) {
    for (const contentItem of item.content || []) {
      if (typeof contentItem.text === 'string') {
        parts.push(contentItem.text);
      }
    }
  }

  return parts.join('\n').trim();
}

function ensureRelativePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\.\/+/, '');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) {
    throw new Error(`Unsafe path returned by model: ${relativePath}`);
  }
  return normalized;
}

function isAllowedCreatePath(task, normalizedPath) {
  const fileName = path.posix.basename(normalizedPath);
  const isTestFile =
    normalizedPath.includes('/__tests__/') ||
    /\.test\.[A-Za-z0-9]+$/.test(fileName) ||
    /\.spec\.[A-Za-z0-9]+$/.test(fileName);

  if (!isTestFile) {
    return false;
  }

  return task.affectedFiles.some(affectedFile => {
    const affectedDirectory = path.posix.dirname(affectedFile);
    return normalizedPath.startsWith(`${affectedDirectory}/`);
  });
}

function validateChange(task, change) {
  if (!change || typeof change !== 'object') {
    throw new Error('Each model change must be an object.');
  }

  const normalizedPath = ensureRelativePath(change.path);
  const operation = change.operation;
  if (!['create', 'update'].includes(operation)) {
    throw new Error(`Unsupported operation "${operation}" for ${normalizedPath}`);
  }

  const exactMatch = task.affectedFiles.includes(normalizedPath);
  const allowed = exactMatch || isAllowedCreatePath(task, normalizedPath);
  if (!allowed) {
    throw new Error(`Model attempted to change a path outside the allowed scope: ${normalizedPath}`);
  }

  if (operation === 'update' && !fs.existsSync(path.resolve(normalizedPath))) {
    throw new Error(`Model attempted to update a missing file: ${normalizedPath}`);
  }

  return {
    path: normalizedPath,
    operation,
    content: typeof change.content === 'string' ? change.content : '',
  };
}

function applyChanges(changes) {
  for (const change of changes) {
    const absolutePath = path.resolve(change.path);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, change.content, 'utf8');
  }
}

async function callOpenAI(task, systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for codex automation.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'codex_auto_pr_result',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['decision', 'summary', 'skip_reason', 'commit_message', 'pr_title', 'pr_body', 'changes'],
            properties: {
              decision: { type: 'string', enum: ['proceed', 'skip'] },
              summary: { type: 'string' },
              skip_reason: { type: 'string' },
              commit_message: { type: 'string' },
              pr_title: { type: 'string' },
              pr_body: { type: 'string' },
              changes: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['path', 'operation', 'content'],
                  properties: {
                    path: { type: 'string' },
                    operation: { type: 'string', enum: ['create', 'update'] },
                    content: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status}): ${JSON.stringify(body)}`);
  }

  const outputText = extractOutputText(body);
  if (!outputText) {
    throw new Error('OpenAI response did not include output text.');
  }

  return JSON.parse(outputText);
}

async function main() {
  const args = parseArgs(process.argv);
  const taskPath = args.task ? path.resolve(args.task) : null;
  if (!taskPath || !fs.existsSync(taskPath)) {
    throw new Error('Missing required --task <path> argument.');
  }

  const task = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
  const fileContexts = task.affectedFiles.map(readFileContext).join('\n');
  const packageJsonContext = readFileContext('package.json');

  const systemPrompt = loadTemplate('.github/prompts/codex-auto-pr-system.md');
  const userPrompt = fillTemplate(loadTemplate('.github/prompts/codex-auto-pr-user.md'), {
    TASK_ID: task.id,
    TASK_TITLE: task.title,
    TASK_RISK: task.risk || 'unknown',
    TASK_EFFORT: task.effort || 'unknown',
    TASK_WHY: task.why || '-',
    TASK_PROMPT: task.prompt || `Implement only ${task.id} with a narrow scope.`,
    AFFECTED_FILES: task.affectedFiles.join('\n'),
    TASK_BLOCK: task.block,
    FILE_CONTEXTS: `${packageJsonContext}\n${fileContexts}`.trim(),
  });

  const result = await callOpenAI(task, systemPrompt, userPrompt);
  const changes = (result.changes || []).map(change => validateChange(task, change));
  const shouldApply = result.decision === 'proceed' && changes.length > 0;

  if (shouldApply) {
    applyChanges(changes);
  }

  const metadata = {
    ...result,
    changes,
    applied: shouldApply,
  };

  if (args.result) {
    fs.writeFileSync(path.resolve(args.result), JSON.stringify(metadata, null, 2));
  }

  writeGithubOutput({
    has_changes: shouldApply ? 'true' : 'false',
    pr_title: result.pr_title || task.prTitle || `[${task.id}] ${task.title}`,
    commit_message: result.commit_message || `feat: automate ${task.id.toLowerCase()}`,
    pr_body:
      result.pr_body ||
      [
        `## Automated Task`,
        ``,
        `Task ID: ${task.id}`,
        `Task: ${task.title}`,
        ``,
        `Summary:`,
        result.summary || 'Automated update prepared by the codex workflow.',
      ].join('\n'),
    summary: result.summary || '',
    skip_reason: result.skip_reason || '',
  });

  process.stdout.write(`${JSON.stringify(metadata, null, 2)}\n`);
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
