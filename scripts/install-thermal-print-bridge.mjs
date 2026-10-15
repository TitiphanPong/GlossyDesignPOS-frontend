/**
 * Register a per-user LaunchAgent so the Mac mini's local printer bridge
 * starts at login. The currently running bridge is intentionally left alone.
 * This script never runs as root and never modifies the printer's PPD/driver.
 */
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const appDir = path.dirname(fileURLToPath(import.meta.url));
const agentDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
const plistPath = path.join(agentDir, 'com.glossydesign.thermal-print-bridge.plist');
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.glossydesign.thermal-print-bridge</string>
  <key>ProgramArguments</key><array>
    <string>${escapeXml(process.execPath)}</string>
    <string>${escapeXml(path.join(appDir, 'thermal-print-bridge.mjs'))}</string>
  </array>
  <key>WorkingDirectory</key><string>${escapeXml(path.dirname(appDir))}</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${escapeXml(path.join(os.homedir(), 'Library/Logs/GlossyDesign-thermal-print.log'))}</string>
  <key>StandardErrorPath</key><string>${escapeXml(path.join(os.homedir(), 'Library/Logs/GlossyDesign-thermal-print.error.log'))}</string>
</dict>
</plist>
`;
await mkdir(agentDir, { recursive: true });
try {
  const existing = await readFile(plistPath, 'utf8');
  if (existing !== xml) throw new Error('LaunchAgent already exists with different content. Manual review required: ' + plistPath);
  console.log('LaunchAgent already configured:', plistPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  await writeFile(plistPath, xml, { flag: 'wx', mode: 0o644 });
  console.log('LaunchAgent installed for next macOS login:', plistPath);
}
console.log('Current printer bridge remains running. No printer driver or CUPS queue modified.');
