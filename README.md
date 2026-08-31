# Glossy POS Frontend

Glossy POS is a Next.js 16 + TypeScript frontend for a print-shop workflow. It includes:

- admin dashboard
- POS seller / checkout
- orders and partial-payment follow-up
- printable invoice and tax invoice views
- storage / upload management
- customer display screen
- public landing and upload flows

This repository is frontend-only. The NestJS backend, MongoDB schemas, and persistence logic are not included here.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- MUI for admin surfaces
- Tailwind-style utility CSS in public/upload areas
- local `node:test` + `tsx` test runner

## Getting Started

1. Install dependencies:

```bash
npm ci
```

2. Copy the example environment file:

```bash
copy .env.example .env.local
```

3. Fill in the required environment variables.

4. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the local dev server
- `npm run lint` runs ESLint
- `npm test` runs the TypeScript test suite
- `npm run build` creates a production build
- `npm run check:utf8` validates text file encoding
- `npm run format` formats source files with Prettier

## Environment Variables

Backend/API configuration:

- `BACKEND_API_URL`
  Preferred server-side backend base URL used by the same-origin `/api/backend` BFF and admin session route.

- `NEXT_PUBLIC_API_URL`
  Server-side fallback backend base URL for shared helpers and the BFF when `BACKEND_API_URL` is not set. Browser API calls use the same-origin `/api/backend` route.

- `NEXT_PUBLIC_PROMPTPAY_ID`
  PromptPay QR target used by every customer-facing payment surface.

- `NEXT_PUBLIC_PROMPTPAY_DISPLAY_NAME`
  Public business/payee name displayed beside the QR. Both values are required together; if either is missing, PromptPay UI fails closed and no QR is generated. The visible identifier is derived from `NEXT_PUBLIC_PROMPTPAY_ID`, so it cannot drift from the QR destination.

Required for the current frontend admin session:

- `ADMIN_SESSION_SECRET`
  Signs the HTTP-only frontend session cookie. Login credentials are validated by backend `/auth/login`; they are not configured as frontend environment variables.

Used by printable invoice views:

- `NEXT_PUBLIC_COMPANY_THAI_NAME`
- `NEXT_PUBLIC_COMPANY_ENGLISH_NAME`
- `NEXT_PUBLIC_COMPANY_BRANCH_NO`
- `NEXT_PUBLIC_COMPANY_ADDRESS`
- `NEXT_PUBLIC_COMPANY_PHONE`
- `NEXT_PUBLIC_COMPANY_TAX_ID`
- `NEXT_PUBLIC_COMPANY_EMAIL`
- `NEXT_PUBLIC_COMPANY_WEBSITE`
- `NEXT_PUBLIC_COMPANY_BANK_INFO`

## Project Structure

- `src/app/home`
  Admin application routes and shared admin shell.

- `src/app/home/page.tsx`
  Dashboard summary.

- `src/app/home/posseller/page.tsx`
  POS seller screen for cashier order creation.

- `src/app/home/orders/page.tsx`
  Orders management, status updates, and remaining-balance payments.

- `src/app/home/storage/page.tsx`
  Upload and file management screen.

- `src/app/print/invoice/[orderId]`
  Printable invoice and tax invoice rendering.

- `src/app/customer/page.tsx`
  Full-screen customer display and payment presentation.

- `src/app/upload/page.tsx`
  Public upload intake flow.

- `src/app/landing/page.tsx`
  Marketing / landing page.

- `src/lib/contracts.ts`
  Shared frontend/backend order, payment, and normalization contracts.

- `src/lib/orders.ts`
  Shared order API helpers and response extraction.

- `src/lib/upload-api.ts`
  Canonical upload helper logic.

- `src/app/utils/computeTotal.ts`
  Shared total, VAT, deposit, and remaining-balance calculations.

## Main Frontend Flows

### POS Checkout

1. Cashier opens the POS seller screen.
2. Products load from `GET /products`.
3. Product-specific modal returns cart items with price and payment-split fields.
4. Checkout stores a pending draft in local storage.
5. Success modal posts the finalized draft to `POST /orders`.
6. Customer display reads the same local pending order state.

### Orders and Payments

- Orders list comes from `GET /orders`
- Single-order invoice fetch uses `GET /orders/:orderId`
- Remaining-balance payment uses `POST /orders/:id/payments` with a payment `Idempotency-Key` for retry safety
- Frontend currently supports mixed backend response envelopes and cart field variants

### Storage

- Preferred listing endpoint: `GET /uploads`
- Legacy fallback listing endpoint: `GET /upload`
- Signed download/open URL: `GET /uploads/:id/signed-url`
- Upload creation: `POST /uploads`

## Current Data Compatibility Rules

The frontend normalizes inconsistent order/cart payloads so it can safely handle:

- `qty` and `quantity`
- `price` and `unitPrice`
- `total`, `lineTotal`, and `totalPrice`
- raw array order responses
- `{ data: [...] }`
- `{ orders: [...] }`
- `{ order: {...} }`
- other nested wrapped order payloads already tolerated by `src/lib/orders.ts`

This compatibility layer exists to keep dashboard, orders, and invoice screens stable during backend migration.

## Backend Expectations

This frontend assumes a separate NestJS + MongoDB style backend with:

- `_id` document identifiers
- REST endpoints such as `/orders`, `/products`, and `/uploads`
- Mongo-style order records containing `orderId`, `status`, `payment`, `cart`, and totals

Important backend compatibility work still pending:

- bind `POST /orders` idempotency keys to the same authorized actor and canonical payload instead of key-only deduplication
- standardize `/orders` response envelopes
- decide the long-term canonical stored cart/catalog ownership model

## Routing Notes

- `/` redirects to `/landing` through `src/app/page.tsx`
- `/home` redirects to `/dashboard`
- legacy admin aliases like `/home/orders`, `/home/posseller`, and `/home/storage` are preserved
- `/home/invoice/:orderId` redirects to `/print/invoice/:orderId`

## Validation Workflow

Before shipping frontend changes, run:

```bash
npm run lint
npm test
npm run build
```

## Security Notes

- `.env.local` and `.env.production` should not remain tracked in git
- do not commit real environment values
- current admin authentication is only a transitional frontend/server-env flow and is not a substitute for real backend auth

Recommended cleanup if env files are tracked:

```bash
git rm --cached .env.local .env.production
```

## Legacy Codex Automation

The repository still retains the historical Codex queue scripts and workflow files for reference, but they are no longer an active work queue. The legacy GitHub workflows are inert and the old `codex:todo:*` npm entry points have been removed.

Governance V2 uses the workspace-root `TODO.md` as the sole active execution backlog. Cross-repository governance files are versioned separately in `TitiphanPong/GlossyDesign-Governance`; do not reintroduce a Frontend-local TODO queue or automation that mutates one independently.
