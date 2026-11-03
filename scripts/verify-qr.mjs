// Test script (not part of the build): decodes public/brand/qr.svg with jsQR and checks it returns PRESENTATION_URL.
// Usage: VITE_PRESENTATION_URL=https://user.github.io/repo/ npm run qr && node scripts/verify-qr.mjs
import jsQR from 'jsqr';
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { PRESENTATION_URL } from '../src/config.js';

const expected = process.env.VITE_PRESENTATION_URL || PRESENTATION_URL;
if (!expected) {
  console.error('No PRESENTATION_URL to compare with.');
  process.exit(1);
}
const svg = readFileSync(new URL('../public/brand/qr.svg', import.meta.url), 'utf8');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
// SVG -> pixels in the browser (no extra image libraries needed)
const pixels = await page.evaluate(async (source) => {
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(source);
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 800;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 800, 800);
  return { width: 800, height: 800, data: Array.from(ctx.getImageData(0, 0, 800, 800).data) };
}, svg);
await browser.close();
const result = jsQR(Uint8ClampedArray.from(pixels.data), pixels.width, pixels.height);
console.log('expected:', expected);
console.log('decoded: ', result?.data ?? '(could not decode)');
if (result?.data !== expected) {
  console.error('MISMATCH');
  process.exit(1);
}
console.log('OK: the QR returns exactly PRESENTATION_URL');
