# Project TODO Plan

## Project Overview

This repository is a **Next.js 15 + TypeScript frontend** for the Glossy Design POS system. It covers cashier flows, customer display, upload intake, storage management, dashboard views, and invoice pages for a print shop workflow.

Important scope note:

- This repo does **not** include the NestJS backend source.
- This repo does **not** include MongoDB schema/model files.
- Backend/API assumptions are inferred from frontend contracts and request usage in `src/lib/contracts.ts`, `src/lib/api.ts`, `src/lib/upload-api.ts`, and route code under `src/app/home/**`.

Because of that, all backend, module, controller, service, and schema findings below are based on **frontend expectations**, not direct backend inspection.

## Current Architecture Summary

### Frontend structure

- App Router is used under `src/app`.
- Main public/customer surfaces:
  - `src/app/landing/page.tsx`
  - `src/app/upload/page.tsx`
  - `src/app/customer/page.tsx`
- Main admin surfaces:
  - `src/app/home/page.tsx` for dashboard
  - `src/app/home/orders/page.tsx`
  - `src/app/home/posseller/page.tsx`
  - `src/app/home/storage/page.tsx`
  - `src/app/home/invoice/[orderId]/page.tsx`
- Route aliases exist for cleaner URLs:
  - `/dashboard` re-exports `/home/page`
  - `/orders` re-exports `/home/saleListPage/page`
  - `/storage` re-exports `/home/storage/page`
  - `/pos` re-exports `/home/posseller/page`
  - `/invoice/[orderId]` re-exports `/home/invoice/[orderId]/page`
- Redirects in `next.config.ts` also map legacy `/home/*` routes to cleaner public paths.

### Shared frontend foundations

- Shared API helper:
  - `src/lib/api.ts`
- Shared upload API wrapper:
  - `src/lib/upload-api.ts`
- Shared frontend contracts:
  - `src/lib/contracts.ts`
- Shared pending-order lifecycle:
  - `src/lib/pending-order.ts`
- Shared admin auth:
  - `src/lib/admin-auth.ts`
- Shared totals/payment logic:
  - `src/app/utils/computeTotal.ts`

### UI architecture

- Admin UI is primarily MUI-based with reusable style tokens:
  - `src/app/home/components/adminUi.ts`
  - `src/app/home/components/dashboardUi.tsx`
- Public upload and customer-facing screens use Tailwind-heavy styling plus motion/animation.
- Login uses CSS module plus `styled-components`, which is a separate styling island.
- The codebase currently uses **multiple UI approaches**:
  - MUI
  - Tailwind utility classes
  - CSS modules
  - `styled-components`
  - route-local CSS

### State and data flow

- Data fetching is primarily direct `fetch` through `fetchApiJson` plus some `axios` in storage.
- Client state is mostly local React state and localStorage.
- POS checkout and customer display are synchronized through `localStorage.pendingOrder`.
- The repo does **not** currently use React Query or Zustand as core shared patterns, despite that being desired in the provided project rules.

### Testing status

There is lightweight automated coverage for pure/shared logic:

- `src/app/utils/computeTotal.test.ts`
- `src/app/upload/upload-flow.test.ts`
- `src/app/home/storage/normalizers.test.ts`
- `src/lib/pending-order.test.ts`
- `src/lib/admin-auth.test.ts`

There is no evidence of:

- E2E tests
- browser interaction tests
- integrated admin page tests
- backend contract tests

## Existing Features

### POS Seller

Implemented:

- Product fetch from `/products`
- Product modal selection system
- Cart management and discount handling
- VAT/tax invoice calculation
- Customer info capture
- Payment selection (`cash`, `promptpay`)
- Pending order draft persistence to localStorage
- Success modal that posts the order to `/orders`

Key files:

- `src/app/home/posseller/page.tsx`
- `src/app/home/posseller/components/useCart.ts`
- `src/app/home/posseller/components/useProductModals.ts`
- `src/app/home/posseller/components/successModal.tsx`
- modal components under `src/app/home/posseller/components/*Modal.tsx`

### Customer POS Display

Implemented:

- Idle slideshow screen
- Active order display
- PromptPay QR generation
- Deposit/remaining/grand total summary
- Auto-clear after paid/settled state
- localStorage polling for live order updates

Key files:

- `src/app/customer/page.tsx`
- `src/app/customer/components/CustomerDisplayShell.tsx`
- `src/app/customer/components/CustomerActiveOrderScreen.tsx`

### Orders

Implemented:

- Orders table and filtering
- Status display
- Export to CSV
- Order detail drawer
- Status update attempts via PATCH
- Invoice/receipt print links

Key file:

- `src/app/home/orders/page.tsx`

### Payments

Implemented:

- `cash` and `promptpay` contract values in shared types
- broader display-only payment union for customer display (`transfer`, `card`)
- partial-payment and remaining-balance calculations
- status handling for `pending`, `partial`, `paid`, `cancelled`

Key files:

- `src/lib/contracts.ts`
- `src/app/utils/computeTotal.ts`
- `src/lib/pending-order.ts`

### Upload / Files

Implemented:

- Public multi-step upload flow
- File validation and upload queue
- Signed URL open flow
- Quick uploader component
- Upload API wrapper

Key files:

- `src/app/upload/page.tsx`
- `src/app/upload/helpers.tsx`
- `src/app/upload/upload-flow.ts`
- `src/components/upload/uploader.tsx`
- `src/lib/upload-api.ts`

### Storage / Products

Implemented:

- Upload/storage table
- Filtering and sorting
- Drawer details
- Bulk selection
- Fallback support for `/uploads` and `/upload`
- backend payload normalization helpers

Key files:

- `src/app/home/storage/page.tsx`
- `src/app/home/storage/normalizers.ts`

### Dashboard

Implemented:

- Summary fetch from `/orders/summary`
- recent orders fetch from `/orders`
- KPI cards
- charts and quick action blocks
- loading and missing-API states

Key files:

- `src/app/home/page.tsx`
- dashboard components under `src/app/home/components/dashboard/*`

### Invoices

Implemented:

- single-order fetch from `/orders/:orderId`
- print-friendly dual invoice copy layout

Key file:

- `src/app/home/invoice/[orderId]/page.tsx`

### Auth / Admin access

Implemented:

- simple client-side login page
- localStorage token check
- route guard around `/home/*`

Key files:

- `src/app/login/page.tsx`
- `src/components/admin/AdminGuardLayout.tsx`
- `src/lib/admin-auth.ts`

## What Seems Partially Implemented

### 1. Backend integration is inferred, not strongly modeled

- The app assumes REST endpoints exist, but there is no backend code here to validate controller/service behavior.
- Storage page endpoint fallback (`/uploads` and `/upload`) suggests backend inconsistency is still being worked around in the frontend.

### 2. Customer display dismissal looks incomplete

- `src/app/customer/page.tsx` passes `onClose` to `ActiveOrderScreen`.
- `src/app/customer/components/CustomerActiveOrderScreen.tsx` types `onClose` in props but does not actually use it in the function signature/UI shown in the current file.
- This suggests a partially implemented dismissal flow or dead prop wiring.

### 3. Dashboard contains presentation placeholders/mock-style behavior

- `src/app/home/components/dashboard/RecentOrdersTable.tsx` falls back to `MOCK_ORDERS` when no orders are returned.
- `src/app/home/components/dashboard/KPICards.tsx` mixes real totals with fixed extra cards and hardcoded values like processing jobs and new customers.
- This makes the dashboard look complete even when real backend support is incomplete.

### 4. Upload system has both polished public flow and separate quick-uploader path

- The public upload page is much more complete than `src/components/upload/uploader.tsx`.
- The quick uploader appears more like an example/admin utility than a fully integrated product feature.

### 5. Route structure is functional but carries legacy duplication

- There are parallel `/home/*` routes, public aliases like `/orders`, and redirect rules for both.
- This works, but it increases maintenance overhead and can confuse future routing changes.

## What Is Missing

### Missing from repository scope

- NestJS modules
- NestJS controllers
- NestJS services
- DTO classes
- MongoDB/Mongoose schemas
- backend validation logic
- backend standard response wrappers
- backend tests

### Missing or not yet established in the frontend

- React Query data layer
- Zustand shared state layer
- centralized auth/session strategy
- role-based admin permissions
- API contract versioning
- E2E flow coverage
- consistent error surface across all pages
- unified i18n/text encoding integrity

## Risks and Technical Debt

### 1. Broken encoding / mojibake is widespread

This is one of the clearest codebase-wide issues.

Observed in multiple files including:

- `src/app/landing/page.tsx`
- `src/app/home/orders/page.tsx`
- `src/app/home/storage/normalizers.ts`
- `src/app/customer/components/CustomerDisplayShell.tsx`
- `src/app/customer/components/CustomerActiveOrderScreen.tsx`
- `src/app/login/page.tsx`
- `src/app/home/components/dashboard/RecentOrdersTable.tsx`
- `src/app/home/components/dashboard/KPICards.tsx`
- `next.config.ts`

Impact:

- Thai UI text is hard to maintain and review
- business labels may be accidentally changed incorrectly
- future editing risk is high
- some text may render incorrectly in production depending on file/editor history

### 2. Hardcoded admin authentication is a serious long-term risk

Observed in:

- `src/lib/admin-auth.ts`

Issues:

- hardcoded username
- hardcoded password
- hardcoded token
- purely client-side auth guard

This is acceptable only as a temporary internal gate, not as a durable admin auth design.

### 3. Build currently ignores ESLint failures

Observed in:

- `next.config.ts`

`eslint.ignoreDuringBuilds = true` reduces build friction, but it also allows code quality and correctness issues to slip into deployable output.

### 4. Large page components are hard to maintain

Current large files include:

- `src/app/home/orders/page.tsx` (~1567 lines)
- `src/app/home/storage/page.tsx` (~1263 lines)
- `src/app/upload/page.tsx` (~865 lines)
- `src/app/landing/page.tsx` (~473 lines)
- `src/app/customer/components/CustomerDisplayShell.tsx` (~391 lines)
- `src/app/customer/components/CustomerActiveOrderScreen.tsx` (~344 lines)
- `src/app/home/posseller/page.tsx` (~332 lines)

Impact:

- higher regression risk
- slower onboarding
- harder testing
- repeated UI/state logic is more likely

### 5. Data fetching patterns are inconsistent

Observed patterns:

- direct `fetch` via `fetchApiJson`
- `axios` in storage page
- local normalization scattered in pages
- no React Query caching or invalidation strategy

Impact:

- inconsistent error handling
- harder retry/loading patterns
- duplicate request logic
- less predictable refresh behavior

### 6. Dashboard can mislead with fallback/mock data

Observed in:

- `src/app/home/components/dashboard/RecentOrdersTable.tsx`
- `src/app/home/components/dashboard/KPICards.tsx`

Impact:

- users may think backend data exists when it does not
- empty states are masked
- business trust risk for an operational dashboard

### 7. Route alias duplication adds maintenance overhead

Observed in:

- `src/app/dashboard/page.tsx`
- `src/app/orders/page.tsx`
- `src/app/storage/page.tsx`
- `src/app/pos/page.tsx`
- `next.config.ts`

Impact:

- two navigation shapes to keep aligned
- more places for future redirect bugs
- harder route ownership clarity

### 8. POS/customer state depends on localStorage polling

Observed in:

- `src/lib/pending-order.ts`
- `src/app/customer/page.tsx`
- `src/app/home/posseller/components/successModal.tsx`

Impact:

- kiosk sync is browser-local only
- no server truth until order POST succeeds
- duplicate-tab or interrupted-flow risk remains
- polling every 500ms is simple but not robust

## Current System Status by Feature Area

### POS Seller

Status: usable and fairly complete for a frontend-driven cashier flow.

Concerns:

- heavy modal duplication still exists across product forms
- order creation still relies on local draft then POST
- no stronger async data/state management layer

### Customer POS Display

Status: visually advanced and mostly implemented.

Concerns:

- localStorage polling is brittle
- dismissal/onClose path appears incomplete
- encoding issues are severe in customer-facing copy

### Orders

Status: feature-rich admin table exists.

Concerns:

- very large single-file implementation
- likely hard to test and evolve safely
- some user-facing Thai text appears corrupted

### Payments

Status: core amount/deposit/remaining logic exists and has tests.

Concerns:

- frontend contract values and backend assumptions are still tightly coupled to localStorage flow
- broader payment types exist for display only, not clearly for backend

### Upload / Files

Status: one of the stronger surfaces in the repo.

Concerns:

- public page is large
- quick uploader is separate and may not reflect final product behavior
- backend response consistency is still handled defensively in the frontend

### Storage / Products

Status: storage UI is substantial and normalization coverage is decent.

Concerns:

- very large page component
- endpoint fallback implies unstable backend conventions
- product management itself is not strongly modeled beyond frontend fetch/use

### Order Tracking

Status: partially covered through orders, invoice, pending-order lifecycle, and customer display.

Missing/unclear:

- no dedicated order-tracking module or customer self-service tracking route
- no clear queue-management backend integration in this repo

### Dashboard

Status: visually complete but partially supported by placeholder behavior.

Concerns:

- recent orders fallback mock data
- some KPI cards use fixed values
- not fully trustworthy as an operations dashboard yet

### Backend APIs

Status: inferred only.

Known expected endpoints:

- `GET /orders`
- `GET /orders/summary`
- `GET /orders/:orderId`
- `POST /orders`
- `PATCH /orders/:id`
- `PATCH /orders/:id/status`
- `PATCH /orders/:id/payments`
- `GET /products`
- `GET /uploads`
- `GET /upload`
- `POST /uploads`
- `GET /uploads/:id/signed-url`

### MongoDB Schemas

Status: not present in repo.

Assumptions from frontend:

- orders use `_id`
- uploads may use `_id`, `id`, or `uploadId`
- file metadata shape varies

### UI/UX Consistency

Status: strong in some areas, mixed overall.

Strengths:

- admin pages share MUI cards/tokens
- customer display has clear premium direction
- upload flow is visually coherent

Concerns:

- login looks disconnected from admin system
- landing page, admin pages, and customer kiosk feel like separate design islands
- encoding issues break polish

### Refactor / Cleanup

Status: needed.

Main cleanup drivers:

- oversized files
- text encoding corruption
- route duplication
- inconsistent fetch/state patterns

## Prioritized TODO List

### High Priority

| Priority | Area | Description | Related files | Suggested implementation approach |
|---|---|---|---|---|
| High | UI / Refactor | Fix broken Thai text encoding across customer-facing and admin-facing screens before adding more copy-heavy features. | `src/app/landing/page.tsx`, `src/app/home/orders/page.tsx`, `src/app/customer/components/CustomerDisplayShell.tsx`, `src/app/customer/components/CustomerActiveOrderScreen.tsx`, `src/app/login/page.tsx`, `src/app/home/components/dashboard/*.tsx`, `src/app/home/storage/normalizers.ts`, `next.config.ts` | Audit mojibake files first, restore intended UTF-8 Thai strings in small batches, and verify with `npm run check:utf8`, `npm run lint`, and visual review. |
| High | Frontend / UI | Remove misleading dashboard fallback/mock presentation so empty or partial backend data is visible honestly. | `src/app/home/components/dashboard/RecentOrdersTable.tsx`, `src/app/home/components/dashboard/KPICards.tsx`, `src/app/home/page.tsx` | Replace `MOCK_ORDERS` fallback and hardcoded KPI values with explicit empty/partial-data states tied to real API responses. |
| High | Frontend / Refactor | Split the oversized orders page into focused sections/components. | `src/app/home/orders/page.tsx` | Extract pure helpers, table section, stats header, filters toolbar, detail drawer, and print/export helpers into colocated files without changing behavior. |
| High | Frontend / Refactor | Split the oversized storage page into focused sections/components. | `src/app/home/storage/page.tsx`, `src/app/home/storage/normalizers.ts` | Extract fetch/persistence helpers, stat cards, filters, table, row menu, and drawer editor into smaller files while preserving current API fallbacks. |
| High | Security / Frontend | Replace hardcoded admin credentials/token with environment-backed or backend-verified auth flow. | `src/lib/admin-auth.ts`, `src/app/login/page.tsx`, `src/components/admin/AdminGuardLayout.tsx` | If backend auth exists, integrate it; otherwise move secrets out of source immediately and treat current auth as temporary/internal only. |
| High | Frontend / UX | Review customer display active screen for incomplete dismiss/close behavior and tighten live order lifecycle handling. | `src/app/customer/page.tsx`, `src/app/customer/components/CustomerActiveOrderScreen.tsx`, `src/lib/pending-order.ts` | Either fully implement dismiss controls using the existing `onClose` path or remove dead wiring; keep paid/settled behavior explicit and testable. |
| High | Build / Refactor | Re-enable meaningful lint enforcement for production readiness after current violations are addressed. | `next.config.ts`, repo-wide lint issues | Fix blocking lint issues incrementally, then remove `eslint.ignoreDuringBuilds = true`. |

### Medium Priority

| Priority | Area | Description | Related files | Suggested implementation approach |
|---|---|---|---|---|
| Medium | Frontend / Refactor | Standardize data fetching patterns and error handling across admin pages. | `src/lib/api.ts`, `src/app/home/page.tsx`, `src/app/home/orders/page.tsx`, `src/app/home/storage/page.tsx`, `src/app/home/posseller/page.tsx`, `src/app/home/invoice/[orderId]/page.tsx` | Consolidate on one fetch approach, keep current contracts, and prepare for future React Query migration. |
| Medium | Frontend | Introduce React Query gradually for server-backed screens. | admin routes under `src/app/home/**`, `src/lib/api.ts` | Start with dashboard/orders/storage queries, keep local UI state local, and avoid broad migration in one pass. |
| Medium | Frontend | Introduce Zustand only where cross-route/client state genuinely benefits from it. | likely POS/customer shared state areas | Use it sparingly for POS session state if localStorage-only flow becomes too brittle; do not rewrite everything at once. |
| Medium | Frontend / Refactor | Reduce POS modal duplication and improve maintainability of cashier product setup. | `src/app/home/posseller/page.tsx`, modal files under `src/app/home/posseller/components/*Modal.tsx`, `useProductModals.ts` | Extract shared modal form sections and product-config helpers while preserving category-specific output payloads. |
| Medium | Frontend / UX | Rationalize route alias duplication and confirm one canonical navigation structure. | `src/app/dashboard/page.tsx`, `src/app/orders/page.tsx`, `src/app/storage/page.tsx`, `src/app/pos/page.tsx`, `next.config.ts` | Keep public aliases if needed, but document canonical routes and reduce redundant maintenance paths where safe. |
| Medium | UI | Align login visual design with the premium admin system. | `src/app/login/page.tsx`, `src/app/login/components/*` | Preserve functionality, but move closer to shared typography/color language used in admin surfaces. |
| Medium | Frontend / Testing | Add route-level and interaction tests for critical business flows. | POS, customer display, upload, orders pages | Focus first on POS submit flow, customer display state transitions, and storage/order filtering logic. |
| Medium | Frontend / UX | Improve dashboard truthfulness around partial failures and incomplete backend data. | `src/app/home/page.tsx`, dashboard widgets | Show when data is unavailable widget-by-widget instead of implying complete business metrics. |

### Low Priority

| Priority | Area | Description | Related files | Suggested implementation approach |
|---|---|---|---|---|
| Low | UI | Unify design language across landing, login, admin, and kiosk where appropriate. | `src/app/landing/page.tsx`, `src/app/login/**`, `src/app/home/**`, `src/app/customer/**` | Keep each surface fit-for-purpose, but align typography, spacing, and brand color decisions more intentionally. |
| Low | Frontend | Review dependency usage and trim unused UI libraries where practical. | `package.json`, route/component usage across `src/app/**` | Audit before removing anything, especially motion/chart/image dependencies used in premium UI surfaces. |
| Low | Documentation | Replace the generic README with project-specific setup, env vars, API expectations, and route map. | `README.md` | Document actual product architecture, backend assumptions, and local development flow. |
| Low | Frontend | Create stronger feature docs for inferred backend payload shapes. | `src/lib/contracts.ts`, `src/app/home/storage/normalizers.ts`, `src/lib/upload-api.ts` | Add markdown docs near `docs/` so backend/frontend work stays aligned. |

## Recommended Next Development Order

1. Fix encoding corruption in shared and customer-facing text first.
2. Remove dashboard mock/fallback behaviors so the current system state is honest.
3. Refactor `orders/page.tsx` and `storage/page.tsx` into smaller units before adding new features there.
4. Review and stabilize POS to customer-display lifecycle, including the incomplete `onClose`/dismiss path.
5. Replace hardcoded admin auth with a safer temporary or real backend-auth approach.
6. Standardize fetch/error handling and begin a careful React Query migration on server-backed admin screens.
7. Reduce POS modal duplication and continue component extraction on other oversized pages.
8. Re-enable strict build linting once the current repo is clean enough.
9. Revisit design consistency and project documentation after the operational risks above are reduced.

## Assumptions

- The backend is a separate NestJS service not included in this repository.
- MongoDB schema details are inferred from frontend field usage such as `_id`, `orderId`, `remainingTotal`, upload file metadata variants, and status/payment fields.
- Existing field names like `orderId`, `customerName`, `phoneNumber`, `total`, and `remainingTotal` should remain unchanged.
- The current localStorage-driven POS/customer display flow is intentional for kiosk behavior, even though it has long-term limitations.

## Summary

The project already contains substantial real functionality for a print-shop POS frontend, especially in POS, upload, storage, and customer display flows. The biggest immediate concerns are not missing screens, but **truthfulness, maintainability, and reliability**:

- broken Thai text encoding
- dashboard mock/fallback behavior
- oversized page files
- weak frontend-only admin auth
- inconsistent data patterns
- missing backend source visibility

The most practical next step is to stabilize what already exists before expanding scope.
