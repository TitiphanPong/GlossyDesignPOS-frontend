# Order Number System

## Current frontend order flow

- Order creation starts in `src/app/home/posseller/page.tsx` when checkout customer info is submitted.
- The POS page builds a draft with `buildPendingOrderDraft(...)` in `src/lib/pending-order.ts` and stores it in `localStorage.pendingOrder`.
- `src/app/home/posseller/components/successModal.tsx` reads the pending draft and calls `createOrder(...)` from `src/lib/orders.ts`.
- `createOrder(...)` sends `POST /orders` to the backend and normalizes the response.
- Frontend surfaces then read the returned order through `fetchOrders()`, `fetchOrderById()`, or `localStorage.pendingOrder`.

## Current frontend order identifier surfaces

- Orders list and detail drawer: `src/app/home/orders/page.tsx`
- Dashboard recent orders: `src/app/home/components/dashboard/RecentOrdersTable.tsx`
- Invoice page: `src/app/home/invoice/[orderId]/page.tsx`
- Customer display: `src/app/customer/page.tsx` and `src/app/customer/components/CustomerActiveOrderScreen.tsx`
- POS success modal: `src/app/home/posseller/components/successModal.tsx`

All of these should display `orderNumber` when the backend provides it and fall back to `orderId` otherwise.

## Shared frontend contract rule

Frontend display code should use:

```ts
getDisplayOrderNumber(order)
```

Behavior:

```ts
if (order.orderNumber) return order.orderNumber;
return order.orderId;
```

The frontend must not generate official order numbers. If the backend does not return `orderNumber` yet, the UI temporarily displays `orderId`.

## Backend proposal

The backend should own official order number generation.

Suggested MongoDB collection:

```json
{
  "_id": "order",
  "year": 2026,
  "seq": 125
}
```

Suggested reservation flow:

```ts
findOneAndUpdate(
  { _id: "order", year: 2026 },
  { $inc: { seq: 1 } },
  { upsert: true, new: true }
)
```

Suggested formatter:

```ts
const orderNumber = `GD-${year}-${String(seq).padStart(6, "0")}`;
```

Example result:

```txt
GD-2026-000126
```

## Remaining backend work

- Add `orderNumber?: string` to NestJS DTOs and response contracts.
- Generate `orderNumber` during order creation inside the backend transaction path.
- Return `orderNumber` from `POST /orders`, `GET /orders`, `GET /orders/:id`, and payment update responses.
- Add a unique index for `orderNumber` if business rules require global uniqueness.
- Decide whether the counter resets yearly and how to handle timezone/year boundaries.
