Implement exactly one queued task for this repository.

Task ID: {{TASK_ID}}
Task title: {{TASK_TITLE}}
Risk level: {{TASK_RISK}}
Estimated effort: {{TASK_EFFORT}}
Why it matters: {{TASK_WHY}}

Task block:
{{TASK_BLOCK}}

Suggested implementation prompt:
{{TASK_PROMPT}}

Allowed affected files:
{{AFFECTED_FILES}}

Files with full context available:
{{FULL_CONTEXT_FILES}}

Files with partial excerpt-only context:
{{PARTIAL_CONTEXT_FILES}}

Repository context:
{{FILE_CONTEXTS}}

Return `decision: "skip"` if:
- the task needs backend code not present here
- you need to touch files outside the allowed scope
- the provided context is too incomplete for a safe change

If you proceed:
- keep the scope narrow
- prefer updating existing files over creating new abstractions
- use `format: "full"` only for files with full context available
- use `format: "search_replace"` for files that only have partial excerpts
- for `search_replace`, make the `search` string specific enough to match exactly once
- include a PR body that starts with `## Automated Task` and includes `Task ID: {{TASK_ID}}`
