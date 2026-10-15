/**
 * GlossyDesign local receipt bridge. Runs on the Mac physically connected to a
 * TPS-80160I-compatible ESC/POS receipt printer; never expose the port publicly.
 *
 * node scripts/thermal-print-bridge.mjs
 * node scripts/thermal-print-bridge.mjs --show-token
 *
 * Receives a PNG made by the existing authenticated receipt page, converts it
 * to 576-dot ESC/POS raster strips, and sends exactly one copy through the USB
 * backend used in the validated physical printer smoke test.
 */
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const HOST = '127.0.0.1';
export const PORT = Number(process.env.GLOSSY_PRINT_PORT || 18764);
const CONFIG_DIR = path.join(os.homedir(), '.config', 'GlossyDesign');
const TOKEN_FILE = path.join(CONFIG_DIR, 'thermal-printer-token');
const BACKEND = '/usr/libexec/cups/backend/usb';
const PRINTER_URI = process.env.GLOSSY_PRINTER_URI || 'usb://KARSTCOM/80mm%20Series?serial=11101800002';
const DEFAULT_ORIGINS = ['https://glossy-design.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:3000'];
export const ORIGINS = new Set([
  ...DEFAULT_ORIGINS,
  ...(process.env.GLOSSY_PRINT_ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
]);
const MAX_PNG_BYTES = 4 * 1024 * 1024;
const MAX_HEIGHT = 7000;
const MAX_WIDTH = 3000;
const MAX_PIXELS = 12_000_000;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function isValidToken(candidate, actual) {
  if (typeof candidate !== 'string' || !/^[0-9a-f]{64}$/.test(candidate)) return false;
  return timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(actual, 'hex'));
}

export function rasterToEscPos(data, width, height) {
  if (width !== 576 || height < 1 || height > MAX_HEIGHT || data.length !== width * height) {
    throw new Error('invalid-raster-size');
  }
  const bytesPerRow = width / 8;
  const chunks = [Buffer.from([0x1b, 0x40])];
  for (let start = 0; start < height; start += 128) {
    const rows = Math.min(128, height - start);
    const bits = Buffer.alloc(rows * bytesPerRow);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(start + y) * width + x] < 128) bits[y * bytesPerRow + (x >>> 3)] |= 0x80 >>> (x & 7);
      }
    }
    chunks.push(Buffer.from([0x1d, 0x76, 0x30, 0, bytesPerRow, 0, rows & 255, rows >>> 8]), bits);
  }
  chunks.push(Buffer.from([0x0a, 0x0a, 0x1d, 0x56, 0x00]));
  return Buffer.concat(chunks);
}

export async function pngToEscPos(input) {
  if (!Buffer.isBuffer(input) || !input.subarray(0, 8).equals(PNG_SIGNATURE) || input.length > MAX_PNG_BYTES) {
    throw new Error('invalid-png');
  }
  const source = sharp(input, { limitInputPixels: MAX_PIXELS, failOn: 'error' });
  const metadata = await source.metadata();
  if (metadata.format !== 'png' || !metadata.width || !metadata.height ||
      metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT ||
      metadata.width * metadata.height > MAX_PIXELS) {
    throw new Error('invalid-png-dimensions');
  }
  const { data, info } = await source
    .resize({ width: 576 })
    .flatten({ background: '#ffffff' })
    .greyscale()
    .threshold(180)
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== 576 || info.channels !== 1 || info.height > MAX_HEIGHT) {
    throw new Error('invalid-output');
  }
  return rasterToEscPos(data, info.width, info.height);
}

async function getOrCreateToken() {
  if (process.env.GLOSSY_PRINT_TOKEN) {
    if (!/^[0-9a-f]{64}$/.test(process.env.GLOSSY_PRINT_TOKEN)) throw new Error('GLOSSY_PRINT_TOKEN must be 64 lowercase hex characters');
    return process.env.GLOSSY_PRINT_TOKEN;
  }
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  try {
    const token = (await readFile(TOKEN_FILE, 'utf8')).trim();
    if (!/^[0-9a-f]{64}$/.test(token)) throw new Error('Invalid existing print token; refuse to silently replace it');
    return token;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const token = randomBytes(32).toString('hex');
    try {
      await writeFile(TOKEN_FILE, token + '\n', { flag: 'wx', mode: 0o600 });
      return token;
    } catch (writeError) {
      if (writeError.code === 'EEXIST') return (await readFile(TOKEN_FILE, 'utf8')).trim();
      throw writeError;
    }
  }
}

function sendToUsb(payload) {
  return new Promise((resolve, reject) => {
    // macOS CUPS USB backend receives bytes on stdin for a single, spool-free job.
    // It bypasses the incorrect Zebra ZPL printer queue; no PPD conversion occurs.
    const child = spawn(BACKEND, ['1', os.userInfo().username, 'GlossyDesign Receipt', '1', ''], {
      env: { ...process.env, DEVICE_URI: PRINTER_URI, PRINTER: 'Glossy_TPS80160_USB',
        CONTENT_TYPE: 'application/vnd.cups-raw', FINAL_CONTENT_TYPE: 'application/vnd.cups-raw' },
      stdio: ['pipe', 'ignore', 'pipe'],
    });
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => child.kill('SIGTERM'), 30000);
    child.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-4000); });
    child.on('error', error => { if (!settled) { settled = true; clearTimeout(timer); reject(error); } });
    child.on('close', code => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      // Exit 0 means bytes sent, not proof that paper emerged.
      if (code === 0) resolve();
      else reject(new Error('USB backend failed (' + code + '): ' + stderr.slice(-250)));
    });
    child.stdin.on('error', () => {}); // backend early-exit is handled by close
    child.stdin.end(payload);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}

export function createBridgeServer({ token, printFn = sendToUsb } = {}) {
  if (!/^[0-9a-f]{64}$/.test(token || '')) throw new Error('Print token required');
  let printing = false;
  const seen = new Map();
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin;
    const host = req.headers.host;
    const listenerPort = server.address()?.port || PORT;
    if (host !== HOST + ':' + listenerPort && host !== 'localhost:' + listenerPort) {
      return json(res, 403, { error: 'invalid-host' });
    }
    if (typeof origin !== 'string' || !ORIGINS.has(origin)) {
      return json(res, 403, { error: 'origin-not-allowed' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Glossy-Print-Id');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    res.setHeader('Access-Control-Max-Age', '600');
    if (req.method === 'OPTIONS') return json(res, 204, {});
    if (req.method === 'GET' && req.url === '/v1/status') return json(res, 200, { ready: true, model: 'ESC/POS 80mm USB' });
    if (req.method !== 'POST' || req.url !== '/v1/print') return json(res, 404, { error: 'not-found' });

    const match = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.authorization || '');
    if (!match || !isValidToken(match[1], token)) return json(res, 401, { error: 'invalid-token' });
    if (req.headers['content-type'] !== 'image/png') return json(res, 415, { error: 'png-required' });
    const printId = req.headers['x-glossy-print-id'];
    if (typeof printId !== 'string' || !/^[0-9a-f-]{36}$/.test(printId)) return json(res, 400, { error: 'invalid-print-id' });
    if (seen.has(printId)) return json(res, 200, { ok: true, duplicate: true, receiptId: printId });
    if (printing) return json(res, 409, { error: 'printer-busy' });
    if (Number(req.headers['content-length'] || 0) > MAX_PNG_BYTES) return json(res, 413, { error: 'image-too-large' });

    printing = true;
    try {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > MAX_PNG_BYTES) return json(res, 413, { error: 'image-too-large' });
        chunks.push(chunk);
      }
      let bytes;
      try {
        bytes = await pngToEscPos(Buffer.concat(chunks));
      } catch {
        return json(res, 422, { error: 'invalid-receipt-image' });
      }
      await printFn(bytes);
      seen.set(printId, Date.now());
      // Bound deduplication cache; repeat button clicks require an intentional new ID.
      for (const [id, when] of seen) if (Date.now() - when > 30 * 60 * 1000) seen.delete(id);
      if (seen.size > 300) seen.delete(seen.keys().next().value);
      console.log('[Glossy USB] receipt job sent', new Date().toISOString());
      return json(res, 200, { ok: true, receiptId: printId });
    } catch (error) {
      console.error('[Glossy USB] print failed:', error.message);
      return json(res, 503, { error: 'usb-print-failed' });
    } finally {
      printing = false;
    }
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const token = await getOrCreateToken();
  if (process.argv.includes('--show-token')) {
    console.log('GlossyDesign local print pairing key: ' + token);
  } else {
    const server = createBridgeServer({ token });
    server.listen(PORT, HOST, () => console.log('[Glossy USB] Ready at http://' + HOST + ':' + PORT + ' (origins: ' + [...ORIGINS].join(', ') + ')'));
  }
}
