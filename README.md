This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Codex Automation

This repo includes a queue-driven draft PR automation flow:

- `.github/workflows/codex-queue.yml` refreshes the `Codex Queue` issue with the real next task and claimed PRs
- `.github/workflows/codex-auto-pr.yml` picks the next unfinished task from `TODO.md`
- `scripts/codex-run-task.cjs` asks OpenAI for a bounded change set
- `scripts/codex-check-quota.cjs` can block AI runs when configured cost thresholds are exceeded
- `scripts/codex-write-summary.cjs` writes a human-readable run summary for quick review
- the workflow runs `npm run check:utf8`, `npm run lint`, and `npm run build`
- a draft PR is opened only when those checks pass
- `.github/workflows/codex-auto-complete.yml` marks the matching TODO task as completed after the PR is merged

Required repository secret:

- `OPENAI_API_KEY`

Optional repository secret and variables for quota guard:

- `OPENAI_ADMIN_API_KEY`
- `OPENAI_PROJECT_ID`
- `OPENAI_DAILY_USD_LIMIT`
- `OPENAI_MONTHLY_USD_LIMIT`

Optional manual trigger inputs:

- `task_id` to force a specific TODO task
- `openai_model` to override the default model
- `daily_usd_limit` to override the 24h spend threshold for that run
- `monthly_usd_limit` to override the month-to-date spend threshold for that run

The automation is intentionally narrow:

- it only updates files listed in a task's `Affected files`
- it may create adjacent test files for those paths
- it will skip tasks that need broader context or backend work

Notes:

- the schedule runs every 3 hours
- quota guard uses OpenAI's organization Costs endpoint, so it needs an Admin API key to enforce spend limits
- if no spend limits are configured, the quota guard stays disabled and the workflow proceeds normally
- each run writes a GitHub Actions summary, and quota-blocked or no-task runs also leave a note on the `Codex Queue` issue

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
