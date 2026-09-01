---
name: glossy-pos-ui
description: "Use for implementation or review work that changes GlossyPOS frontend routes, page layouts, shared MUI components, responsive behavior, drawers/dialogs, cashier/admin interactions, or UI flows that may touch a frontend-backend contract. Trigger for UI redesigns, responsive fixes, shared-component consolidation, Quick Seller/POS/admin screen changes, and browser-visible regressions in the GlossyDesign workspace."
---

# GlossyPOS UI Workflow

Use this skill for bounded UI work in the GlossyDesign workspace. Optimize for a small diff, shared-component reuse, preserved behavior, and focused verification.

## Governance and scope

1. Treat workspace-root `AGENTS.md`, `PROJECT_RULES.md`, `DECISIONS.md`, `WORKFLOW.md`, and the explicit task/TODO as the active governance set.
2. Current checked-out source is authoritative for current behavior. Do not implement from archived reports without re-verifying the source.
3. `GlossyPOS-Frontend` and `GlossyPOS-Backend` are separate Git repositories. Never assume one Git operation covers both.
4. Keep one primary outcome. Do not fold unrelated cleanup or visual redesign into a bounded fix.
5. If the task is financial, auth/RBAC, schema, deployment, or destructive in nature, stop treating it as a normal UI task and follow the higher-risk governance path.

## Discover before editing

Use the narrowest reliable path to locate the implementation.

1. Inspect Frontend Git branch, HEAD, and status before editing. Preserve unrelated user WIP.
2. Prefer lnwjud `workspace_context`, `search_text`, `symbol_search`, or bounded file reads to broad recursive dumps.
3. Search for the exact route, component, visible text, prop, handler, or shared style before opening whole files.
4. Read only the relevant line ranges once the symbol/location is known.
5. For repeated visual patterns, search for an existing shared component before creating or duplicating markup. In admin screens, check surfaces such as `AdminHeroHeader`, `AdminPageContainer`, common buttons/styles, shared drawers/dialogs, and existing responsive patterns.
6. If a change spans multiple routes, list the affected routes and the shared component/style surface before editing.

Avoid:
- broad source-tree dumps when a targeted search answers the question;
- repeating the same read/search after the location is already known;
- malformed shell/regex exploration when a direct text or symbol search is available;
- probing unavailable browser tooling repeatedly.

## Frontend-backend contract check

A visual-only change can remain Frontend-only. If UI behavior changes persisted state, permissions, totals, order status, uploads, customer data, production state, or any API payload:

1. Locate the Frontend request/response shape and call site.
2. Inspect the matching Backend controller/DTO/schema/service behavior before editing the contract.
3. Preserve the existing contract unless the task explicitly authorizes a versioned cross-repo change.
4. Never compensate for a Backend authorization or validation rule by weakening Frontend validation or hiding an error.
5. Financial values remain Backend-authoritative; client totals are previews only.

## Implement with shared surfaces

- Reuse the existing shared component when it matches the interaction instead of copying a similar block into another page.
- Preserve each page's existing actions, loading states, error states, permissions, and keyboard/interaction behavior while consolidating layout.
- Responsive work must explicitly consider mobile, tablet/narrow desktop, and normal desktop behavior for the changed surface.
- For drawers/dialogs, verify width/max-width, viewport overflow, scroll ownership, close behavior, and action accessibility on narrow screens.
- Keep custom styling local to the smallest reusable surface. Do not create a new design system layer for one screen.
- Keep generated/framework artifacts out of intentional source changes unless the task explicitly requires them. Examples include `.next*`, `dist/`, coverage, reports, test-results, screenshots, and generated type/build files such as `next-env.d.ts` when changed only as a side effect.
- Do not delete source files without explicit authorization.

For text/source changes through lnwjud, prefer guarded file operations such as `edit_file`, `apply_patch`, and `write_file`. Do not use shell/PowerShell/Node/Python as a text editor when a guarded file tool can express the change.

## Verification ladder

Run checks from narrow to broad. Do not start with the most expensive verification unless risk requires it.

1. Re-read the edited region and review the intended behavior.
2. Run focused tests for the changed component/flow when available.
3. Run targeted ESLint on edited files or the smallest relevant lint scope first.
4. Run TypeScript/type checking when TypeScript files changed.
5. Run `git diff --check` and inspect the task-scoped Git diff.
6. Run repository-wide `npm test`, `npm run lint`, `npm run check:utf8`, and/or `npm run build` when the task risk, routing/build impact, or repository policy requires it.
7. For browser-visible regressions or responsive/interaction changes, use the installed Playwright skill/tooling when available and useful. Verify the exact affected flow/viewport instead of performing an unrelated full browser crawl.
8. If browser/runtime verification is unavailable, say so plainly; do not keep retrying an unavailable path.
9. If Frontend and Backend both changed, re-check the request/response contract after implementation and verify each repository separately.

A failed narrow check should be fixed before escalating to broader checks. Do not report completion while required verification is failing.

## Diff hygiene

Before completion:

- confirm only task-related files changed;
- remove accidental generated artifacts from the task diff;
- do not overwrite unrelated pre-existing WIP;
- ensure shared-component refactors did not silently change unaffected routes;
- confirm responsive behavior did not introduce horizontal overflow or inaccessible actions;
- confirm no secrets, debug output, scratch files, or temporary reports were added.

## Completion report

Report concisely:

- task/goal;
- routes/components changed;
- behavior changed;
- shared component reused or introduced;
- FE↔BE contract status if relevant;
- focused and broad verification actually run, with results;
- visual/browser verification status;
- Git status and any unrelated pre-existing WIP;
- remaining risk or follow-up.

Never claim a check, browser run, build, or test passed unless it was actually executed.
