// Exports the deck to genlab-chatbot.pdf (one slide per page, 16:9).
// Usage: npm run export:pdf   (uses installed Chrome; otherwise run `npx playwright install chromium`)
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { slides } from '../src/content/slides.js';
import { makeQr } from './make-qr.mjs';

const TOTAL = slides.length;
const W = 1280;
const H = 720;

makeQr(); // the QR code is part of the exported slides
await build({ logLevel: 'warn' });
const server = await preview({ preview: { port: 4173, strictPort: false, open: false } });
const url = server.resolvedUrls.local[0];

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch {
  browser = await chromium.launch();
}

const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1.5,
  reducedMotion: 'reduce', // everything visible, no entrance animations
});
const page = await context.newPage();
await page.addStyleTag({ content: '' }).catch(() => {});

const images = [];
for (let n = 1; n <= TOTAL; n++) {
  await page.goto(`${url}#${n}`);
  await page.addStyleTag({ content: '.hud,.hint,.progress-bar{display:none !important}' });
  await page.waitForTimeout(700); // slide fade-in
  images.push((await page.screenshot()).toString('base64'));
}

const html = `<style>@page{size:${W}px ${H}px;margin:0}*{margin:0}img{display:block;width:${W}px;height:${H}px;page-break-after:always}</style>` +
  images.map((b64) => `<img src="data:image/png;base64,${b64}">`).join('');
const pdfPage = await context.newPage();
await pdfPage.setContent(html);
const pdf = await pdfPage.pdf({ width: `${W}px`, height: `${H}px`, printBackground: true });
await writeFile('genlab-chatbot.pdf', pdf);

await browser.close();
server.httpServer.close();
console.log('Wrote genlab-chatbot.pdf');
