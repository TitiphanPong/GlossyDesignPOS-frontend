const fs = require('fs');
const path = require('path');
const { writeGithubOutput } = require('./codex-queue-utils.cjs');

const MAX_FULL_CONTEXT_CHARS_PER_FILE = 20000;
const MAX_EXCERPT_BLOCKS = 8;
const EXCERPT_CONTEXT_LINES = 24;

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

function countCharLength(lines) {
  return lines.reduce((total, line) => total + line.length + 1, 0);
}

function formatLinesWithNumbers(lines, startLine) {
  return lines
    .map((line, index) => `${String(startLine + index).padStart(4, ' ')} | ${line}`)
    .join('\n');
}

function collectImportRange(lines) {
  let lastImportLine = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(import|['"]use client['"])/.test(line)) {
      lastImportLine = index;
      continue;
    }

    if (lastImportLine >= 0 && line.trim() === '') {
      return { label: 'imports and module setup', start: 0, end: index };
    }

    if (lastImportLine >= 0 && !/^\s*(import|['"]use client['"])/.test(line) && line.trim() !== '') {
      return { label: 'imports and module setup', start: 0, end: index - 1 };
    }
  }

  return lastImportLine >= 0 ? { label: 'imports and module setup', start: 0, end: lastImportLine } : null;
}

function collectPatternRanges(lines, patterns, label) {
  const ranges = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!patterns.some(pattern => pattern.test(line))) {
      continue;
    }

    const start = Math.max(0, index - EXCERPT_CONTEXT_LINES);
    const end = Math.min(lines.length - 1, index + EXCERPT_CONTEXT_LINES);
    ranges.push({ label, start, end });
  }
  return ranges;
}

function collectReturnRange(lines) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (/^\s*return\s*\(/.test(line) || /^\s*return\s+</.test(line)) {
      return {
        label: 'main render return',
        start: Math.max(0, index - EXCERPT_CONTEXT_LINES),
        end: Math.min(lines.length - 1, index + EXCERPT_CONTEXT_LINES * 2),
      };
    }
  }
  return null;
}

function mergeRanges(ranges) {
  const sorted = ranges
    .filter(Boolean)
    .sort((left, right) => left.start - right.start)
    .slice(0, MAX_EXCERPT_BLOCKS);

  const merged = [];
  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end + 3) {
      previous.end = Math.max(previous.end, range.end);
      previous.label = `${previous.label}; ${range.label}`;
      continue;
    }
    merged.push({ ...range });
  }
  return merged;
}

function buildExcerptContext(filePath, rawContent) {
  const lines = rawContent.split(/\r?\n/);
  const ranges = mergeRanges([
    collectImportRange(lines),
    ...collectPatternRanges(
      lines,
      [/NEXT_PUBLIC_API_URL/, /apiBase/i, /process\.env/, /from ['"].*api['"]/, /from ['"].*lib\/api['"]/],
      'API config usage',
    ),
    ...collectPatternRanges(
      lines,
      [/\bfetch\s*\(/, /\baxios\./, /\buseEffect\s*\(/, /\basync function\b/, /\bconst\s+\w+\s*=\s*async\b/, /\bload\w*\s*=\s*async\b/],
      'fetch and data loading logic',
    ),
    ...collectPatternRanges(
      lines,
      [/\bloading\b/, /\berror\b/, /\bsetLoading\b/, /\bsetError\b/, /\bisLoading\b/, /\bempty\b/],
      'error and loading states',
    ),
    collectReturnRange(lines),
  ]);

  if (ranges.length === 0) {
    return {
      mode: 'partial',
      context: [
        `FILE: ${filePath}`,
        'STATUS: existing (partial excerpts)',
        'NOTE: No targeted excerpt anchors were found. Omitted sections are not shown.',
      ].join('\n'),
    };
  }

  const blocks = [];
  let previousEnd = -1;
  for (const range of ranges) {
    if (range.start > previousEnd + 1) {
      blocks.push(`... omitted lines ${previousEnd + 2}-${range.start} ...`);
    }
    const excerptLines = lines.slice(range.start, range.end + 1);
    blocks.push(
      [
        `EXCERPT: ${range.label} (lines ${range.start + 1}-${range.end + 1})`,
        '```',
        formatLinesWithNumbers(excerptLines, range.start + 1),
        '```',
      ].join('\n'),
    );
    previousEnd = range.end;
  }

  if (previousEnd < lines.length - 1) {
    blocks.push(`... omitted lines ${previousEnd + 2}-${lines.length} ...`);
  }

  return {
    mode: 'partial',
    context: [
      `FILE: ${filePath}`,
      'STATUS: existing (partial excerpts)',
      'NOTE: Only targeted excerpts are shown. Omitted sections are marked explicitly.',
      ...blocks,
    ].join('\n'),
  };
}

function readFileContext(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    return {
      path: filePath,
      mode: 'missing',
      context: `FILE: ${filePath}\nSTATUS: missing\n`,
    };
  }

  const rawContent = fs.readFileSync(absolutePath, 'utf8');
  const lines = rawContent.split(/\r?\n/);
  if (countCharLength(lines) <= MAX_FULL_CONTEXT_CHARS_PER_FILE) {
    return {
      path: filePath,
      mode: 'full',
      context: `FILE: ${filePath}\nSTATUS: existing (full)\n\`\`\`\n${rawContent}\n\`\`\`\n`,
    };
  }

  return {
    path: filePath,
    ...buildExcerptContext(filePath, rawContent),
  };
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

function validateChange(task, contextByPath, change) {
  if (!change || typeof change !== 'object') {
    throw new Error('Each model change must be an object.');
  }

  const normalizedPath = ensureRelativePath(change.path);
  const fileContext = contextByPath.get(normalizedPath) || { mode: 'missing' };
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

  const format = change.format || 'full';
  if (operation === 'create') {
    if (format !== 'full') {
      throw new Error(`Create operation for ${normalizedPath} must use format "full"`);
    }
    return {
      path: normalizedPath,
      operation,
      format,
      content: typeof change.content === 'string' ? change.content : '',
    };
  }

  if (!['full', 'search_replace'].includes(format)) {
    throw new Error(`Unsupported format "${format}" for ${normalizedPath}`);
  }

  if (format === 'full' && fileContext.mode === 'partial') {
    throw new Error(`Full-file updates are not allowed for partial-context file ${normalizedPath}`);
  }

  if (format === 'search_replace') {
    if (typeof change.search !== 'string' || typeof change.replace !== 'string') {
      throw new Error(`search_replace update for ${normalizedPath} requires string search and replace fields`);
    }
    return {
      path: normalizedPath,
      operation,
      format,
      search: change.search,
      replace: change.replace,
    };
  }

  return {
    path: normalizedPath,
    operation,
    format,
    content: typeof change.content === 'string' ? change.content : '',
  };
}

function applyChanges(changes) {
  for (const change of changes) {
    const absolutePath = path.resolve(change.path);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    if (change.operation === 'create' || change.format === 'full') {
      fs.writeFileSync(absolutePath, change.content, 'utf8');
      continue;
    }

    const currentContent = fs.readFileSync(absolutePath, 'utf8');
    const searchMatches = currentContent.split(change.search).length - 1;
    if (searchMatches !== 1) {
      throw new Error(
        `Expected exactly one match for search_replace update in ${change.path}, but found ${searchMatches}`,
      );
    }
    const nextContent = currentContent.replace(change.search, change.replace);
    fs.writeFileSync(absolutePath, nextContent, 'utf8');
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
                  required: ['path', 'operation', 'format', 'content', 'search', 'replace'],
                  properties: {
                    path: { type: 'string' },
                    operation: { type: 'string', enum: ['create', 'update'] },
                    format: { type: 'string', enum: ['full', 'search_replace'] },
                    content: { type: ['string', 'null'] },
                    search: { type: ['string', 'null'] },
                    replace: { type: ['string', 'null'] },
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
  const fileContexts = task.affectedFiles.map(readFileContext);
  const packageJsonContext = readFileContext('package.json');
  const contextByPath = new Map(fileContexts.map(fileContext => [fileContext.path, fileContext]));
  const fullContextFiles = fileContexts.filter(fileContext => fileContext.mode === 'full').map(fileContext => fileContext.path);
  const partialContextFiles = fileContexts
    .filter(fileContext => fileContext.mode === 'partial')
    .map(fileContext => fileContext.path);

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
    FULL_CONTEXT_FILES: fullContextFiles.length > 0 ? fullContextFiles.join('\n') : '(none)',
    PARTIAL_CONTEXT_FILES: partialContextFiles.length > 0 ? partialContextFiles.join('\n') : '(none)',
    FILE_CONTEXTS: [packageJsonContext.context, ...fileContexts.map(fileContext => fileContext.context)].join('\n\n').trim(),
  });

  const result = await callOpenAI(task, systemPrompt, userPrompt);
  const changes = (result.changes || []).map(change => validateChange(task, contextByPath, change));
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
