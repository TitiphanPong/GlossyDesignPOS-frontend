# 6-Hour Codex Task Queue

This queue is based on a codebase scan of the current frontend. Tasks are ordered to favor low-risk, high-value work first and avoid backend-contract changes unless clearly isolated.

## Codex Queue Schedule

### Cycle 1 (Hours 0-6)
- Primary focus: Quick Wins only
- Target tasks:
  - Standardize missing API-base error states on admin pages
  - Add shared empty-state copy for table/list pages
  - Tighten loading-state consistency for dashboard and invoice screens
- Goal: ship visible UX improvements with minimal logic risk

### Cycle 2 (Hours 6-12)
- Primary focus: remaining low-risk UI polish
- Target tasks:
  - Fix mobile footer/action responsiveness on upload flow
  - Improve drawer behavior on smaller admin screens
  - Replace silent fetch failures with user-visible errors on dashboard
- Goal: improve responsiveness and clarity without changing contracts

### Cycle 3 (Hours 12-18)
- Primary focus: safe low-risk refactors
- Target tasks:
  - Extract upload file-validation utilities into one reusable module
  - Memoize derived list rows on heavy admin pages where practical
  - Audit unused dependencies and heavy client-only libraries
- Goal: reduce duplication and prep the codebase for safer future edits

### Cycle 4 (Hours 18-24)
- Primary focus: testing foundation
- Target tasks:
  - Add pure unit tests for total/payment calculations
  - Add tests for storage payload normalization edge cases
  - Add guardrail tests for auth and route protection assumptions
- Goal: improve confidence before touching medium-risk business logic

### Cycle 5 (Hours 24-30)
- Primary focus: medium-risk contract-safe refactors
- Target tasks:
  - Extract shared admin fetch helper with better error parsing
  - Normalize inconsistent naming for order/payment display types
  - Tighten form validation boundaries for customer and upload inputs
- Goal: reduce inconsistency while staying backend-compatible

### Cycle 6 (Hours 30-36)
- Primary focus: payment/order flow safety
- Target tasks:
  - Reconcile payment/status logic between shared contracts and customer display
  - Harden POS success modal against duplicate order creation
  - Add integration tests for public upload flow
- Goal: reduce bug risk in critical customer-facing flows

### Cycle 7 (Hours 36-42)
- Primary focus: operational correctness
- Target tasks:
  - Persist storage status/note changes instead of local-only edits
  - Add regression tests for POS pending-order lifecycle
- Goal: fix misleading local-only behavior and protect checkout flow

### Cycle 8+ (Hours 42+)
- Primary focus: larger refactors and performance work
- Target tasks:
  - Unify cart total calculations around one source of truth
  - Split the oversized customer display page into focused subcomponents
  - Replace plain `img` usage on asset-heavy screens with audited Next image usage
  - Reduce duplicate product modal code to shrink bundle surface
  - Consolidate POS modal open/select/update boilerplate
- Goal: tackle larger structural work only after the low-risk queue is cleared

## Per-Cycle Rule

- Pick 1 primary task and 1 fallback task per 6-hour cycle
- Prefer `low` risk before `medium`, and avoid `high` unless tests already exist or the bug is user-visible
- End each cycle with: `lint`, `build`, available tests, and a short summary
- Mark a task done only when implementation and verification both succeed
- If a task expands in scope, split the remainder into the next 6-hour cycle instead of forcing it into the current one

## 1. Quick Wins

### Task: Standardize missing API-base error states on admin pages
- Title: Standardize missing API-base error states on admin pages
- Why it matters: `NEXT_PUBLIC_API_URL` is handled differently across dashboard, orders, storage, POS, invoice, and upload flows. A consistent visible fallback is a safe improvement that reduces blank or misleading screens.
- Affected files: `src/app/home/page.tsx`, `src/app/home/orders/page.tsx`, `src/app/home/storage/page.tsx`, `src/app/home/posseller/page.tsx`, `src/app/home/invoice/[orderId]/page.tsx`, `src/lib/api.ts`
- Risk level: low
- Estimated effort: small
- Suggested Codex prompt: "Add a consistent low-risk API-base missing state across admin pages. Reuse existing UI patterns, avoid backend contract changes, and keep behavior identical except for clearer user-facing error handling."

### Task: Add shared empty-state copy for table/list pages
- Title: Add shared empty-state copy for table/list pages
- Why it matters: orders, storage, product list, and upload queue all show different empty-state language and styling. Unifying empty states improves polish without changing data logic.
- Affected files: `src/app/home/orders/page.tsx`, `src/app/home/storage/page.tsx`, `src/app/home/posseller/components/ProductList.tsx`, `src/app/upload/page.tsx`, `src/app/home/components/dashboardUi.tsx`
- Risk level: low
- Estimated effort: small
- Suggested Codex prompt: "Create a small shared empty-state pattern for list and table screens, then apply it to orders, storage, POS product list, and upload queue without changing any fetching behavior."

### Task: Tighten loading-state consistency for dashboard and invoice screens
- Title: Tighten loading-state consistency for dashboard and invoice screens
- Why it matters: some screens use explicit loading placeholders while others fall back to minimal text or nothing. Better loading states improve perceived quality and are safe to ship.
- Affected files: `src/app/home/page.tsx`, `src/app/home/invoice/[orderId]/page.tsx`, `src/app/home/components/dashboardUi.tsx`, `src/app/home/posseller/components/ProductList.tsx`
- Risk level: low
- Estimated effort: small
- Suggested Codex prompt: "Improve loading-state consistency on dashboard, invoice, and POS product surfaces using the repo’s current admin UI style. Do not change data flow or API calls."

### Task: Fix mobile footer/action responsiveness on upload flow
- Title: Fix mobile footer/action responsiveness on upload flow
- Why it matters: the sticky action footer exists only on medium-plus screens, which leaves mobile users with less obvious progress and action affordance late in the flow.
- Affected files: `src/app/upload/page.tsx`
- Risk level: low
- Estimated effort: small
- Suggested Codex prompt: "Improve the upload page’s mobile action layout and step navigation without changing upload logic. Keep the current visual language and make the primary action easier to reach on small screens."

### Task: Improve drawer behavior on smaller admin screens
- Title: Improve drawer behavior on smaller admin screens
- Why it matters: storage and orders both use heavy detail drawers with dense content that may be cramped on tablets and small laptops. Responsive spacing and sticky action cleanup are low-risk usability wins.
- Affected files: `src/app/home/orders/page.tsx`, `src/app/home/storage/page.tsx`
- Risk level: low
- Estimated effort: medium
- Suggested Codex prompt: "Refine responsive drawer layout for orders and storage detail panels on smaller screens, focusing on spacing, action placement, and overflow handling only."

## 2. Refactor Candidates

### Task: Extract shared admin fetch helper with better error parsing
- Title: Extract shared admin fetch helper with better error parsing
- Why it matters: raw `fetch` logic is repeated across dashboard, orders, POS, invoice, and success modal, while `src/lib/api.ts` is too thin and inconsistent with `upload-api.ts`. A shared helper would reduce duplicate error handling safely.
- Affected files: `src/lib/api.ts`, `src/lib/upload-api.ts`, `src/app/home/page.tsx`, `src/app/home/orders/page.tsx`, `src/app/home/posseller/page.tsx`, `src/app/home/invoice/[orderId]/page.tsx`, `src/app/home/posseller/components/successModal.tsx`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Refactor duplicated frontend fetch logic into a shared helper with safer API-base checks and readable error messages. Keep request/response contracts the same and migrate only obvious call sites."

### Task: Consolidate POS modal open/select/update boilerplate
- Title: Consolidate POS modal open/select/update boilerplate
- Why it matters: `posseller/page.tsx` repeats nearly identical modal wiring for every product type. This increases maintenance cost and makes safe category additions harder.
- Affected files: `src/app/home/posseller/page.tsx`, `src/app/home/posseller/components/useProductModals.ts`, `src/app/home/posseller/types/cart.ts`
- Risk level: medium
- Estimated effort: large
- Suggested Codex prompt: "Refactor duplicated POS modal wiring in `posseller/page.tsx` into a safer shared pattern without changing category matching, cart payload shape, or checkout behavior."

### Task: Unify cart total calculations around one source of truth
- Title: Unify cart total calculations around one source of truth
- Why it matters: totals are calculated in `useCart`, `posseller/page.tsx`, `customer/page.tsx`, and `computeTotal.ts`, which raises regression risk for discount, VAT, deposit, and remaining-balance logic.
- Affected files: `src/app/home/posseller/components/useCart.ts`, `src/app/home/posseller/page.tsx`, `src/app/customer/page.tsx`, `src/app/utils/computeTotal.ts`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Refactor cart/payment total computation so the POS and customer display share one source of truth for discount, VAT, deposit, and remaining calculations. Preserve existing output fields."

### Task: Extract upload file-validation utilities into one reusable module
- Title: Extract upload file-validation utilities into one reusable module
- Why it matters: `src/app/upload/page.tsx` and `src/components/upload/uploader.tsx` duplicate accepted extensions, file-size rules, and status logic. A shared utility is a clean low-risk refactor.
- Affected files: `src/app/upload/page.tsx`, `src/components/upload/uploader.tsx`, `src/app/upload/helpers.tsx`
- Risk level: low
- Estimated effort: small
- Suggested Codex prompt: "Deduplicate upload validation and file metadata helpers between the public upload page and the quick uploader component, keeping the current accepted file rules unchanged."

### Task: Normalize inconsistent naming for order/payment display types
- Title: Normalize inconsistent naming for order/payment display types
- Why it matters: the repo mixes backend-facing values like `cash` and `promptpay` with UI-only labels like `Cash`, `PromptPay`, and extra values like `Bank Transfer`, `transfer`, and `card`. Naming cleanup will reduce accidental mismatches.
- Affected files: `src/lib/contracts.ts`, `src/app/customer/page.tsx`, `src/app/home/orders/page.tsx`, `src/app/home/posseller/components/successModal.tsx`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Audit and normalize frontend-only payment/status naming so display labels are clearly separated from backend contract values. Avoid changing actual API payload values."

## 3. Bug Risk Areas

### Task: Persist storage status/note changes instead of local-only edits
- Title: Persist storage status/note changes instead of local-only edits
- Why it matters: storage bulk status changes, drawer saves, and row actions currently update only local React state. Users can think they saved work when nothing was sent to the backend.
- Affected files: `src/app/home/storage/page.tsx`
- Risk level: high
- Estimated effort: medium
- Suggested Codex prompt: "Audit the storage page for local-only mutations and add safe backend persistence for status and note updates using the existing upload endpoint fallbacks. Preserve current UI behavior and handle backend failures clearly."

### Task: Harden POS success modal against duplicate order creation
- Title: Harden POS success modal against duplicate order creation
- Why it matters: `successModal.tsx` reads `localStorage.pendingOrder`, POSTs it, then rewrites local storage and fires a synthetic storage event. Double clicks or retries could create duplicate orders.
- Affected files: `src/app/home/posseller/components/successModal.tsx`, `src/app/home/posseller/page.tsx`, `src/app/customer/page.tsx`
- Risk level: high
- Estimated effort: medium
- Suggested Codex prompt: "Review the POS success modal for duplicate-submit and stale-localStorage risks, then add safe client-side guards without changing the checkout contract."

### Task: Reconcile payment/status logic between shared contracts and customer display
- Title: Reconcile payment/status logic between shared contracts and customer display
- Why it matters: shared contracts allow `cancelled`, but `customer/page.tsx` defines a narrower status union and broader payment union. This mismatch can hide real backend states or cause brittle assumptions.
- Affected files: `src/lib/contracts.ts`, `src/app/customer/page.tsx`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Align customer-display order/payment typings with shared contracts while preserving its UI-specific extensions. Add safe handling for unsupported or unexpected status values."

### Task: Replace silent fetch failures with user-visible errors on dashboard
- Title: Replace silent fetch failures with user-visible errors on dashboard
- Why it matters: the dashboard swallows fetch errors with an empty catch block, which can render partial or misleading data without explanation.
- Affected files: `src/app/home/page.tsx`
- Risk level: low
- Estimated effort: small
- Suggested Codex prompt: "Remove silent dashboard fetch failures and add a visible non-disruptive error state while keeping the current layout and summary logic intact."

### Task: Tighten form validation boundaries for customer and upload inputs
- Title: Tighten form validation boundaries for customer and upload inputs
- Why it matters: upload validation is fairly defensive, but POS customer info and some modal flows still rely on weaker assumptions. Safer validation prevents bad drafts from reaching payment and invoice flows.
- Affected files: `src/app/home/posseller/components/customerInfoModal.tsx`, `src/app/home/posseller/page.tsx`, `src/app/upload/page.tsx`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Audit customer-facing form validation in POS customer info and public upload flow. Add low-risk input guards and inline feedback without changing backend payload shape."

## 4. Performance Improvements

### Task: Split the oversized customer display page into focused subcomponents
- Title: Split the oversized customer display page into focused subcomponents
- Why it matters: `src/app/customer/page.tsx` is very large and mixes state polling, payment math, animation, and multiple screen modes. Smaller components will make future work safer and reduce accidental re-renders.
- Affected files: `src/app/customer/page.tsx`, `src/app/customer/components/CartItemDetails.tsx`, `src/app/customer/components/cartFieldConfigs.ts`
- Risk level: medium
- Estimated effort: large
- Suggested Codex prompt: "Refactor the customer display page into smaller presentational components and isolate polling/state logic, without changing visuals or kiosk behavior."

### Task: Memoize derived list rows on heavy admin pages where practical
- Title: Memoize derived list rows on heavy admin pages where practical
- Why it matters: orders and storage pages do a lot of filtering, sorting, and row mapping in the same component. Some of this is already memoized, but expensive derived sections and handlers are still crowded into one render path.
- Affected files: `src/app/home/orders/page.tsx`, `src/app/home/storage/page.tsx`
- Risk level: low
- Estimated effort: medium
- Suggested Codex prompt: "Review orders and storage pages for unnecessary re-renders and expensive derived computations. Apply targeted memoization or component extraction only where it materially simplifies render work."

### Task: Replace plain `img` usage on asset-heavy screens with audited Next image usage
- Title: Replace plain `img` usage on asset-heavy screens with audited Next image usage
- Why it matters: banner-heavy and file-preview-heavy screens likely miss out on image optimization. A careful audit can improve loading without disturbing visual composition.
- Affected files: `src/app/customer/page.tsx`, `src/app/landing/page.tsx`, `src/app/landing/sections/HeroSection.tsx`, `src/app/home/storage/page.tsx`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Audit image usage on customer, landing, and storage screens and convert safe cases to Next.js image optimization where it won’t break layout, animation, or signed URL previews."

### Task: Reduce duplicate product modal code to shrink bundle surface
- Title: Reduce duplicate product modal code to shrink bundle surface
- Why it matters: many POS product modals repeat similar state and JSX patterns. Consolidating shared pieces can reduce maintenance cost and the amount of UI code loaded for the cashier flow.
- Affected files: `src/app/home/posseller/components/NameCardModal.tsx`, `src/app/home/posseller/components/StampModal.tsx`, `src/app/home/posseller/components/DocumentPrintModal.tsx`, `src/app/home/posseller/components/PostCardModal.tsx`, `src/app/home/posseller/components/InkjetModal.tsx`, `src/app/home/posseller/components/PlotPlanModal.tsx`, `src/app/home/posseller/components/stickerPVCModal.tsx`, `src/app/home/posseller/components/stickerPPModal.tsx`, `src/app/home/posseller/components/premiumProductModal.tsx`
- Risk level: medium
- Estimated effort: large
- Suggested Codex prompt: "Identify shared structure across POS product modals and extract reusable form sections or helpers to reduce duplication without changing product-specific pricing behavior."

### Task: Audit unused dependencies and heavy client-only libraries
- Title: Audit unused dependencies and heavy client-only libraries
- Why it matters: the repo ships several visually heavy libraries and may also have unused dependencies. A dependency audit is a contained way to find future bundle-size wins.
- Affected files: `package.json`, `src/app/customer/page.tsx`, `src/app/landing/page.tsx`, `src/app/home/components/dashboard/*.tsx`
- Risk level: low
- Estimated effort: medium
- Suggested Codex prompt: "Audit package usage and identify unused or unnecessarily heavy client-side dependencies. Produce a minimal safe cleanup plan first, then implement only removals that are clearly unused."

## 5. Test Suggestions

### Task: Add pure unit tests for total/payment calculations
- Title: Add pure unit tests for total/payment calculations
- Why it matters: discount, VAT, deposit, and remaining-balance math appears in multiple places and directly affects billing correctness.
- Affected files: `src/app/utils/computeTotal.ts`, `src/app/home/posseller/components/useCart.ts`, `src/app/customer/page.tsx`
- Risk level: low
- Estimated effort: medium
- Suggested Codex prompt: "Set up a lightweight test path for pure pricing logic and add unit tests covering discount, VAT, full payment, partial payment, and zero-value edge cases."

### Task: Add integration tests for public upload flow
- Title: Add integration tests for public upload flow
- Why it matters: the upload flow has multiple steps, client-side validation, retry paths, and signed URL opening. It is one of the safest high-value surfaces to test because contracts are already fairly explicit.
- Affected files: `src/app/upload/page.tsx`, `src/lib/upload-api.ts`, `src/components/upload/uploader.tsx`
- Risk level: medium
- Estimated effort: medium
- Suggested Codex prompt: "Introduce integration-style tests for the public upload flow covering validation, upload success, partial failure, and retry behavior. Keep the setup lightweight and mock network calls."

### Task: Add regression tests for POS pending-order lifecycle
- Title: Add regression tests for POS pending-order lifecycle
- Why it matters: the POS flow depends on `localStorage.pendingOrder`, customer display polling, and success-modal state transitions. This is a likely regression area whenever checkout logic changes.
- Affected files: `src/app/home/posseller/page.tsx`, `src/app/home/posseller/components/successModal.tsx`, `src/app/customer/page.tsx`
- Risk level: medium
- Estimated effort: large
- Suggested Codex prompt: "Add regression tests around the pending-order lifecycle: create draft, show customer display state, confirm payment, and clear local storage after paid completion."

### Task: Add tests for storage payload normalization edge cases
- Title: Add tests for storage payload normalization edge cases
- Why it matters: storage accepts several backend shape variants for ids, customer fields, and file arrays. Normalization bugs can silently break the table or detail drawer.
- Affected files: `src/app/home/storage/page.tsx`
- Risk level: low
- Estimated effort: medium
- Suggested Codex prompt: "Extract storage normalization helpers if needed and add tests for mixed backend payload shapes, missing fields, string file arrays, and alternate id keys."

### Task: Add guardrail tests for auth and route protection assumptions
- Title: Add guardrail tests for auth and route protection assumptions
- Why it matters: auth currently relies on local storage tokens and client-side guards. Even lightweight tests would help catch accidental regressions in admin access flow.
- Affected files: `src/components/admin/AdminGuardLayout.tsx`, `src/app/login/page.tsx`, `src/app/home/layout.tsx`
- Risk level: low
- Estimated effort: medium
- Suggested Codex prompt: "Add basic auth-guard regression tests for the local-storage admin flow, focusing on redirect/blocked-render behavior rather than security redesign."
