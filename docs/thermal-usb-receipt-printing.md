# GlossyDesign — Mac mini USB thermal receipt printing

## What is connected
- Device: ONE TPS-80160I-compatible 80mm thermal printer, identified by macOS as KARSTCOM 80mm Series (`usb://KARSTCOM/80mm%20Series?serial=11101800002`).
- Printing language: ESC/POS (72mm printable width, 576 dots), not Zebra ZPL.
- Mac mini only: a loopback HTTP print bridge binds to `127.0.0.1:18764` and forwards raster images to the USB backend. No production DB insert or backend schema change is involved.
- GlossyDesign UI path: order/Quick Sale → `/print/invoice/[orderId]?documentType=receipt` → **พิมพ์ USB 80 มม.** Existing **พิมพ์ทั่วไป** remains a fallback, but the Mac's Zebra ZPL queue is incompatible and should not be used for this printer.
- Works only in the browser **on the Mac mini to which the printer is attached**. A remote terminal/computer's `127.0.0.1` points to that other device, not the Mac mini.

## First-time setup (on the Mac mini)

The bridge is configured for the production origin `https://glossy-design.vercel.app`, and local dev `http://localhost:3000`.

1. Connect printer over USB, check paper via the printer's FEED self-test, sign in to the cashier account on Chrome on the **Mac mini**.
2. If the bridge is not already running, run from the frontend project folder:
   ```bash
   /opt/homebrew/bin/node scripts/thermal-print-bridge.mjs
   ```
   This process must stay running; it listens only on loopback.
3. In another Terminal, see the one-time pairing key:
   ```bash
   /opt/homebrew/bin/node scripts/thermal-print-bridge.mjs --show-token
   ```
   Never share this token, commit it, put it in a screenshot, or paste it into developer chat.
4. In Chrome open the GlossyDesign receipt page. Click **พิมพ์ USB 80 มม.**, paste the 64-character key and click **บันทึกและพิมพ์**. The site stores the key in this browser's localStorage only, not in Vercel/backend.
5. If Chrome prompts to "Look for and connect to devices on your local network" or similar, choose **Allow** for `glossy-design.vercel.app`. This is the browser's Local Network Access / loopback permission. If you initially denied it, adjust the site's permissions in Chrome settings, then try again.
6. After setup, the button sends one current receipt image without a system Print dialog. No automatic reprint on refresh. Tax-invoice printing is unchanged.

### Login startup
A per-user LaunchAgent is installed at `~/Library/LaunchAgents/com.glossydesign.thermal-print-bridge.plist`; it will run the bridge on **next Mac login**, and restart it if stopped. The currently running process is not interrupted during installation. The machine must remain powered on, with the cashier logged in. To prepare the file on another Mac:
```bash
/opt/homebrew/bin/node scripts/install-thermal-print-bridge.mjs
```
Run only on a trusted Mac workstation with the printer attached.

## Safety and constraints
- HTTPS origin allowlist; loopback-only listener; 64-hex-character bearer pairing token; bound, validated PNG payload; unique per-request print ID; no arbitrary ESC/POS or file-path upload; one physical job at a time; duplicate request IDs are ignored.
- Do **not** expose port 18764 through any public tunnel, reverse proxy, or router port-forward. Do not use the Zebra ZPL printer driver for normal receipt output.
- The server accepts a validated image; if backend order amounts are incorrect, this bridge does not recalculate them. The existing authenticated order page remains the source of receipt data.
- A successful HTTP 200 means USB backend accepted/transmitted the job, **not** proof the physical paper cut or ink appeared. Verify paper, Thai characters, totals, and cutter.
- On Chrome from Vercel, a browser Local Network Access permission is required. Headless Chrome tests can be denied automatically until permission is available; successful direct Node HTTP tests alone do not prove that browser permission was granted.
- Printing depends on the locally running Mac service. An operator using the POS from Windows or a different computer cannot use this Mac USB bridge through the same `127.0.0.1` URL without a separate, authenticated design.

## Validation
```bash
node --test scripts/thermal-print-bridge.test.mjs
node --import tsx --test src/lib/thermal-print.test.ts src/app/print/invoice/InvoiceDocument.test.ts
npx tsc --noEmit
npx eslint src/lib/thermal-print.ts src/lib/thermal-print.test.ts 'src/app/print/invoice/[orderId]/PrintDocumentLayout.tsx'
```
The separate `scripts/print-usb-receipt-smoke.tsx --print` remains available for a one-copy synthetic test without an order record, and was previously validated on this attached printer.
