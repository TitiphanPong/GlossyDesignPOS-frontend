# Glossy POS Project TODO Report

## Project Status Summary

This repository is a Next.js 15 + TypeScript frontend for a print-shop POS system. The main frontend flows already exist:

- Admin dashboard
- POS seller / checkout
- Orders management
- Storage / upload management
- Customer display
- Public upload intake
- Invoice printing

Current technical status:

- `npm test`: passed
- `npm run build`: passed
- `npm run lint`: passed with 1 warning

Important scope note:

- This repository does not contain the NestJS backend source.
- This repository does not contain MongoDB schema/model files.
- Backend, API, and schema findings below are inferred from frontend contracts and usage.
- Items that depend on backend internals are marked `Needs verification` where appropriate.

## Backend Requirements From Current Frontend Work

- Frontend now expects `orderNumber` to be returned consistently by `POST /orders`, `GET /orders`, and `GET /orders/:id`.
- Frontend now preserves and sends `clientDraftId` during order creation and also sends it as `Idempotency-Key` when available.
- Backend still needs to deduplicate repeated `POST /orders` requests by `clientDraftId` / `Idempotency-Key`.
- Backend should keep accepting legacy cart field variants during transition, but should converge on one canonical shape.
- Upload endpoints should validate and persist real `customerName`, `phone`, `jobType`, and `note` fields from the public upload flow.
- Frontend now also sends structured upload workflow metadata via `batchId`, `stage`, and `statusNote`; backend should persist and return those fields so note-marker fallbacks can be removed later.

## Top 10 Most Important TODOs First

1. Replace the current hardcoded client-side admin authentication with real backend auth.
2. Fix invoice data normalization so invoice rows match real shared order/cart contracts.
3. Add idempotent order creation to prevent duplicate order records on retry.
4. Restore real customer information capture in the public upload flow.
5. Complete and harden the remaining-balance payment flow for partial orders.
6. Normalize `/orders` API response handling across dashboard, orders, and invoice pages.
7. Move upload workflow metadata out of `note` text markers into real backend fields.
8. Remove tracked environment files from the repository and review exposed configuration.
9. Split very large pages into smaller components/hooks for maintainability.
10. Replace customer-display localStorage polling with a more reliable sync approach.

## Critical Bugs

### 1. Client-side admin auth is fully bypassable

- Title: Replace insecure localStorage-only admin auth
- File path(s) involved:
  - `src/lib/admin-auth.ts`
  - `src/app/login/page.tsx`
  - `src/components/admin/AdminGuardLayout.tsx`
- Current problem:
  - Admin username, password, and token are hardcoded in frontend code.
  - Access is gated only by `localStorage`.
  - Anyone with browser devtools can bypass the admin guard.
- Recommended fix:
  - Move authentication to the NestJS backend.
  - Use real login endpoints, hashed credentials, session/JWT cookies, and protected admin APIs.
- Priority: High
- Estimated effort: Large
- Risk if ignored:
  - Unauthorized admin access, fake data changes, and no real production security.

### 2. Invoice page expects cart fields that do not fully match shared contracts

- Title: Normalize invoice order/cart data before rendering
- File path(s) involved:
  - `src/app/home/invoice/[orderId]/page.tsx`
  - `src/lib/contracts.ts`
- Current problem:
  - Invoice rows assume `quantity`, `unitPrice`, and `totalPrice`.
  - Shared contracts and other pages also use `qty`, `price`, and fallback variants.
  - Invoice output can be wrong or break when backend payloads vary.
- Recommended fix:
  - Add a shared order/cart normalizer and reuse it across invoice, orders, and dashboard pages.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Broken invoice rendering, incorrect receipts, and billing mistakes.

### 3. Order creation is not idempotent

- Title: Prevent duplicate backend order creation
- File path(s) involved:
  - `src/app/home/posseller/components/successModal.tsx`
  - `src/lib/orders.ts`
  - `src/lib/pending-order.ts`
- Current problem:
  - The frontend tracks `clientDraftId` locally.
  - `buildPendingOrderPayload` removes that field before POSTing.
  - Network retries or uncertain responses can create duplicate orders.
- Recommended fix:
  - Send an idempotency key such as `clientDraftId` to the backend and deduplicate in `POST /orders`.
- Priority: High
- Estimated effort: Large
- Risk if ignored:
  - Duplicate orders, duplicate accounting records, and reconciliation issues.

### 4. Partial-payment settlement flow is incomplete

- Title: Finish and validate remaining-balance payment flow
- File path(s) involved:
  - `src/app/home/saleListPage/components/PayRemainingModal.tsx`
  - `src/app/home/orders/page.tsx`
- Current problem:
  - Remaining-payment modal exists but is not integrated into the main orders page flow.
  - It bypasses shared API helpers.
  - Validation only rejects values greater than the remaining balance.
- Recommended fix:
  - Wire the modal into order actions.
  - Validate `0 < amount <= remaining`.
  - Use shared API helpers and consistent error handling.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Partial-payment orders cannot be safely completed.

## Frontend TODO

### 1. Restore customer information capture in public upload flow

- Title: Reintroduce real customer identity fields in upload flow
- File path(s) involved:
  - `src/app/upload/page.tsx`
- Current problem:
  - The upload flow sends fallback values:
    - `Walk-in Customer`
    - `000000000`
  - Real customer information is no longer captured.
- Recommended fix:
  - Re-add customer name/phone/contact inputs and validation, or bind uploads to a real customer/session model.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Uploaded jobs are hard to contact, trace, and fulfill correctly.

### 2. POS filter/search state is effectively dead

- Status: Complete (frontend POS search and category filters wired on 2026-05-31)

- Title: Wire up real POS search and category filtering
- File path(s) involved:
  - `src/app/home/posseller/page.tsx`
  - `src/app/home/posseller/components/SearchBar.tsx`
  - `src/app/home/posseller/components/ProductList.tsx`
- Current problem:
  - `activeCat` and `q` state exist, but they are never updated by UI in the page.
  - Filtering logic exists but is not meaningfully interactive.
- Recommended fix:
  - Connect real search/category controls or remove dead state until ready.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - Poor cashier usability as product count increases.

### 3. Login screen contains misleading placeholder UX

- Status: Complete (frontend cleaned up on 2026-05-31)

- Title: Remove or implement fake login affordances
- File path(s) involved:
  - `src/app/login/components/loginForm.tsx`
- Current problem:
  - `Remember me` and `Sign Up` appear in the UI but do nothing.
- Recommended fix:
  - Remove inactive controls or implement real behavior.
- Priority: Low
- Estimated effort: Small
- Risk if ignored:
  - User confusion and lower trust in the admin interface.

### 4. Unused/alternate landing hero component should be cleaned up

- Title: Resolve unused `HeroSection` component
- File path(s) involved:
  - `src/app/landing/sections/HeroSection.tsx`
  - `src/app/landing/page.tsx`
- Current problem:
  - `HeroSection.tsx` contains an unfinished TODO and does not appear to be used.
- Recommended fix:
  - Either integrate it properly or remove/archive it to reduce confusion.
- Priority: Low
- Estimated effort: Small
- Risk if ignored:
  - Design drift and developer confusion about the active landing implementation.

## Backend TODO

### 1. Implement real authentication/authorization

- Title: Add secure backend auth for admin surfaces
- File path(s) involved:
  - Frontend touchpoints:
    - `src/lib/admin-auth.ts`
    - `src/app/login/page.tsx`
    - `src/components/admin/AdminGuardLayout.tsx`
  - Backend modules: Needs verification
- Current problem:
  - No evidence of a real NestJS auth integration from this repo.
- Recommended fix:
  - Add a backend auth module, hashed passwords, session/JWT handling, and role checks.
- Priority: High
- Estimated effort: Large
- Risk if ignored:
  - Admin area remains insecure.

### 2. Standardize order response envelopes

- Title: Normalize `/orders` and single-order response shapes
- File path(s) involved:
  - `src/app/home/page.tsx`
  - `src/app/home/orders/page.tsx`
  - `src/app/home/invoice/[orderId]/page.tsx`
  - Backend controllers/services: Needs verification
- Current problem:
  - Different pages assume different payload shapes.
  - Dashboard only accepts a raw array from `/orders`.
- Recommended fix:
  - Standardize NestJS responses and document them in shared contracts.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Fragile frontend/backend integration and inconsistent breakage.

### 3. Standardize upload endpoint naming

- Title: Remove `/upload` vs `/uploads` inconsistency
- File path(s) involved:
  - `src/app/home/storage/page.tsx`
  - Backend routes/controllers: Needs verification
- Current problem:
  - The storage page tries both `/uploads` and `/upload`.
- Recommended fix:
  - Choose one canonical endpoint family and deprecate the other.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - More frontend workarounds and ambiguous API behavior.

## Database / Schema TODO

### 1. Stop storing workflow metadata in free-text notes

- Title: Move upload `batch` and `stage` out of note strings
- File path(s) involved:
  - `src/app/upload/page.tsx`
  - `src/app/home/storage/normalizers.ts`
  - `src/app/home/storage/page.tsx`
  - Backend schema: Needs verification
- Current problem:
  - Upload workflow metadata is embedded inside `note` text using markers like:
    - `[[batch:...]]`
    - `[[stage:waiting-download]]`
- Recommended fix:
  - Add real schema fields such as `batchId`, `stage`, and `statusNote`.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Brittle parsing, bad filtering, and accidental note corruption.

### 2. Unify order cart field naming

- Title: Standardize stored cart item field names
- File path(s) involved:
  - `src/lib/contracts.ts`
  - `src/app/home/orders/page.tsx`
  - `src/app/home/invoice/[orderId]/page.tsx`
  - Backend schema: Needs verification
- Current problem:
  - The app tolerates `qty` vs `quantity` and `price` vs `unitPrice`.
- Recommended fix:
  - Choose one canonical schema shape and normalize at the API boundary.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Reporting and invoice logic remain fragile.

### 3. Require stable upload file metadata from backend

- Title: Stop fabricating upload IDs and file sizes in frontend fallbacks
- File path(s) involved:
  - `src/app/home/storage/normalizers.ts`
  - Backend schema/API: Needs verification
- Current problem:
  - When metadata is missing, the frontend fabricates IDs and inferred file sizes.
- Recommended fix:
  - Always return stable file IDs, byte sizes, names, and URLs from the backend.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - Misleading file info, unreliable bulk actions, and weak download integrity.

## API Integration TODO

### 1. Use summary endpoints instead of deriving everything client-side

- Title: Reuse `OrdersSummary` contract for dashboard KPIs
- File path(s) involved:
  - `src/lib/contracts.ts`
  - `src/app/home/page.tsx`
- Current problem:
  - `OrdersSummary` exists but the dashboard still downloads all orders and computes KPIs locally.
- Recommended fix:
  - Use `GET /orders/summary` for KPIs and fetch recent orders separately.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - Slower dashboard loads and unnecessary data transfer.

### 2. Align payment method contracts across screens

- Title: Reconcile backend-facing payment types with customer display types
- File path(s) involved:
  - `src/lib/contracts.ts`
  - `src/app/customer/page.tsx`
  - `src/app/customer/components/customerDisplayShared.ts`
- Current problem:
  - Customer display allows `transfer` and `card`, while backend-facing contracts only allow `cash` and `promptpay`.
- Recommended fix:
  - Extend backend payment enums if needed, or make unsupported values explicit instead of silently normalizing.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - Wrong payment display and future integration bugs.

### 3. Reuse shared order extraction logic on all order reads

- Title: Add a shared single-order response normalizer
- File path(s) involved:
  - `src/lib/orders.ts`
  - `src/app/home/invoice/[orderId]/page.tsx`
- Current problem:
  - Order creation already normalizes backend order responses.
  - Invoice fetch does not reuse the same robustness.
- Recommended fix:
  - Add a shared extractor/normalizer and use it for all order reads.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - One backend response change can break only some screens.

## UI / UX Improvements

### 1. Show a loading state instead of a blank admin screen during guard checks

- Title: Add admin guard loading UI
- File path(s) involved:
  - `src/components/admin/AdminGuardLayout.tsx`
- Current problem:
  - While checking auth, the layout returns `null`.
- Recommended fix:
  - Show a lightweight loading shell or skeleton.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - Jarring blank flashes on admin route load.

### 2. Replace placeholder landing content with real business links/content

- Title: Clean up landing page placeholder CTAs and footer links
- File path(s) involved:
  - `src/app/landing/page.tsx`
  - `src/app/landing/sections/HeroSection.tsx`
- Current problem:
  - Placeholder CTA copy and non-linked legal/footer content still exist.
- Recommended fix:
  - Replace demo/phone/legal placeholders with real business actions and links.
- Priority: Low
- Estimated effort: Small
- Risk if ignored:
  - Lower trust and reduced marketing polish.

### 3. Hide placeholder customer/contact fields in orders until real data exists

- Title: Remove misleading placeholder order metadata
- File path(s) involved:
  - `src/app/home/orders/page.tsx`
- Current problem:
  - `lineId`, `email`, `address`, `salesChannel`, and `staffName` are mostly shown as `-`.
- Recommended fix:
  - Remove these sections until backend support exists, or add the real fields end-to-end.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - Staff may assume missing data actually exists somewhere in the system.

## Refactor / Code Quality

### 1. Break up oversized route files

- Title: Split monolithic route pages into focused modules
- File path(s) involved:
  - `src/app/home/orders/page.tsx`
  - `src/app/home/storage/page.tsx`
  - `src/app/upload/page.tsx`
  - `src/app/landing/page.tsx`
- Current problem:
  - These files combine data loading, mapping, rendering, dialogs, and exports in very large modules.
- Recommended fix:
  - Extract route-local hooks, mappers, dialogs, and view sections.
- Priority: Medium
- Estimated effort: Large
- Risk if ignored:
  - Slower development and more regression-prone edits.

### 2. Remove dead imports and stale paths

- Title: Clean warnings and legacy/dead code paths
- File path(s) involved:
  - `src/app/home/orders/page.tsx`
  - `src/app/landing/sections/HeroSection.tsx`
  - `src/app/home/components/AppBreadCrumb.tsx`
- Current problem:
  - Lint already reports an unused icon import.
  - Some components appear stale or unused.
- Recommended fix:
  - Remove dead imports and retire obsolete components/routes where safe.
- Priority: Low
- Estimated effort: Small
- Risk if ignored:
  - More code drift and harder onboarding.

### 3. Strengthen POS cart/product typing

- Title: Replace weak cart typing with explicit types
- File path(s) involved:
  - `src/app/home/posseller/types/cart.ts`
- Current problem:
  - `variant?: any` weakens a central business type.
- Recommended fix:
  - Replace `any` with explicit variant types or discriminated unions.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - Type safety gaps in pricing and modal flows.

### 4. Reduce string-coupled modal routing

- Title: Stop routing product modals by fragile UI strings
- File path(s) involved:
  - `src/app/home/posseller/components/useProductModals.ts`
- Current problem:
  - Modal selection depends on exact Thai category strings and product-name substrings.
- Recommended fix:
  - Use stable product type codes from the backend instead of display labels.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - Product config changes can silently break modal selection.

## Security / Validation

### 1. Remove tracked environment files and rotate if needed

- Title: Stop versioning local/production env files
- File path(s) involved:
  - `.env.local`
  - `.env.production`
  - `.gitignore`
- Current problem:
  - Env files are already tracked in git even though `.gitignore` excludes them.
- Recommended fix:
  - Remove them from version control, rotate any sensitive values if necessary, and document required env vars in `README.md`.
- Priority: High
- Estimated effort: Small
- Risk if ignored:
  - Configuration leakage and unsafe production coupling.

### 2. Tighten remaining-payment validation

- Title: Validate remaining-payment amounts properly
- File path(s) involved:
  - `src/app/home/saleListPage/components/PayRemainingModal.tsx`
- Current problem:
  - The modal does not reject zero, negative, empty, or non-finite values.
- Recommended fix:
  - Add inline validation for valid positive numeric ranges before submit.
- Priority: High
- Estimated effort: Small
- Risk if ignored:
  - Invalid payment records and accounting errors.

### 3. Add validation parity between upload and POS customer capture

- Title: Reuse customer validation standards in upload flows
- File path(s) involved:
  - `src/app/upload/page.tsx`
  - `src/app/home/posseller/components/customerInfoModal.tsx`
- Current problem:
  - POS has meaningful customer validation, but upload flow bypasses it entirely.
- Recommended fix:
  - Reuse equivalent validation rules for public upload customer fields.
- Priority: High
- Estimated effort: Medium
- Risk if ignored:
  - Bad customer records and support/fulfillment issues.

## Performance

### 1. Remove aggressive customer-display polling

- Title: Stop polling every 500ms when storage sync already exists
- File path(s) involved:
  - `src/app/customer/page.tsx`
- Current problem:
  - The page already uses storage/BroadcastChannel subscriptions but still polls every 500ms.
- Recommended fix:
  - Remove polling or make it a slower fallback only when sync primitives are unavailable.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - Unnecessary browser work and extra re-renders.

### 2. Avoid loading full datasets for admin analytics/pages

- Title: Add server-side pagination/filtering/summary endpoints
- File path(s) involved:
  - `src/app/home/page.tsx`
  - `src/app/home/orders/page.tsx`
  - `src/app/home/storage/page.tsx`
  - Backend services/controllers: Needs verification
- Current problem:
  - Large lists and aggregates are handled client-side.
- Recommended fix:
  - Add server-side summaries, filters, and pagination.
- Priority: Medium
- Estimated effort: Large
- Risk if ignored:
  - Slower admin UX as data volume grows.

### 3. Review heavy client bundles in admin pages

- Title: Reduce large admin first-load JS where practical
- File path(s) involved:
  - Admin route pages and route-local dialogs/charts
- Current problem:
  - Build output shows relatively heavy first-load JS on major admin routes.
- Recommended fix:
  - Lazy-load dialogs/charts/export tools and reduce always-on client code where possible.
- Priority: Medium
- Estimated effort: Medium
- Risk if ignored:
  - Slower initial page load on lower-end devices.

## Deployment / Environment

### 1. Re-enable lint enforcement during builds

- Title: Stop skipping lint in production builds
- File path(s) involved:
  - `next.config.ts`
- Current problem:
  - `ignoreDuringBuilds: true` allows production builds to pass even when lint quality regresses.
- Recommended fix:
  - Re-enable lint during builds after current warnings are cleaned up.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - Gradual code quality drift in production builds.

### 2. Replace generic README with real project documentation

- Title: Update README to match the actual POS system
- File path(s) involved:
  - `README.md`
- Current problem:
  - README is still largely generic Next.js boilerplate and does not clearly document routes, flows, or env requirements.
- Recommended fix:
  - Add real setup, architecture, env vars, API expectations, and route descriptions.
- Priority: Medium
- Estimated effort: Small
- Risk if ignored:
  - Slower onboarding and more setup mistakes.

### 3. Keep one canonical root redirect strategy

- Title: Remove duplicate root redirect mechanisms
- File path(s) involved:
  - `next.config.ts`
  - `src/app/page.tsx`
- Current problem:
  - Both config redirects and App Router redirect logic handle the root path.
- Recommended fix:
  - Keep a single redirect approach.
- Priority: Low
- Estimated effort: Small
- Risk if ignored:
  - Small but unnecessary maintenance confusion.

## Future Features

### 1. Real-time customer display backed by backend state

- Title: Replace browser-local display sync with store-wide real-time state
- File path(s) involved:
  - `src/app/customer/page.tsx`
  - Backend real-time infrastructure: Needs verification
- Current problem:
  - Customer display is local-browser based rather than backend-synchronized.
- Recommended fix:
  - Add WebSocket/SSE/backend polling tied to the active store/order state.
- Priority: Medium
- Estimated effort: Large
- Risk if ignored:
  - Display remains limited to the same browser/storage context.

### 2. Production workflow beyond payment-only state

- Title: Add real print-production lifecycle states
- File path(s) involved:
  - `src/app/customer/components/customerDisplayShared.ts`
  - `src/app/home/orders/page.tsx`
  - `src/app/home/storage/page.tsx`
  - Backend models/services: Needs verification
- Current problem:
  - The app hints at workflow stages, but core operational tracking is still shallow.
- Recommended fix:
  - Add production, proofing, ready-for-pickup, and completion states end-to-end.
- Priority: Medium
- Estimated effort: Large
- Risk if ignored:
  - Staff must continue tracking operations outside the system.

### 3. Product management/admin CRUD

- Title: Add product management flow for `/products`
- File path(s) involved:
  - `src/app/home/posseller/page.tsx`
  - Backend product module: Needs verification
- Current problem:
  - POS relies on `/products`, but there is no visible admin product-management interface in this repo.
- Recommended fix:
  - Add admin product CRUD, pricing, and stable product type codes.
- Priority: Medium
- Estimated effort: Large
- Risk if ignored:
  - Product updates remain manual and error-prone.

### 4. Quote/proof approval flow for uploaded jobs

- Title: Extend upload intake into real pre-production workflow
- File path(s) involved:
  - `src/app/upload/page.tsx`
  - `src/app/home/storage/page.tsx`
  - Backend quote/proof modules: Needs verification
- Current problem:
  - Upload intake exists, but no visible quotation/proof approval lifecycle is implemented.
- Recommended fix:
  - Add quote, proof approval, and upload-to-order conversion workflow.
- Priority: Low
- Estimated effort: Large
- Risk if ignored:
  - Public upload remains disconnected from higher-value print-job operations.

## Suggested Development Roadmap

### Phase 1: Fix critical bugs

- Replace client-side admin auth with real backend auth.
- Fix invoice/order cart normalization.
- Add idempotent order creation.
- Complete and validate remaining-payment flow.
- Remove tracked env files and review exposed configuration.

### Phase 2: Complete core POS/order/upload flow

- Restore upload customer information capture.
- Standardize `/orders` and `/uploads` API contracts.
- Move upload workflow metadata into real schema fields.
- Reuse shared order normalizers across dashboard, orders, and invoice.

### Phase 3: Improve UI/UX

- Add POS search/filter controls.
- Add guard loading state instead of blank admin render.
- Clean placeholder landing/login content.
- Hide fake order-contact fields until they are real.

### Phase 4: Refactor and stabilize

- Split monolithic route files.
- Strengthen core cart/product types.
- Remove dead imports/components.
- Re-enable strict lint enforcement in builds.

### Phase 5: Add future features

- Backend-driven real-time customer display.
- Production workflow statuses and pickup readiness.
- Product CRUD and pricing management.
- Quote/proof approval flow for uploads.
