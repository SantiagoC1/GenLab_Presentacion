// Saves frames of the opening sequence (0.5, 2, 3.5, 4.5, 5.3, 6.2 and 7.2 s) to docs/preview/intro/. Uses the installed Chrome.
// Usage: npm run build && node scripts/capture-intro.mjs
import { preview } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('docs/preview/intro', { recursive: true });
const server = await preview({ preview: { port: 4230 } });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: 'chrome' });
const TIMES = [500, 2000, 3500, 4500, 5300, 6200, 7200];

for (const [name, width, height] of [['1280x720', 1280, 720], ['400x800', 400, 800]]) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(url);
  // the page marks the exact start of the sequence
  await page.waitForFunction(() => performance.getEntriesByName('genlab-intro-start').length > 0);
  const start = await page.evaluate(() => performance.getEntriesByName('genlab-intro-start')[0].startTime);
  for (const target of TIMES) {
    while ((await page.evaluate((s) => performance.now() - s, start)) < target - 40) await page.waitForTimeout(10);
    const shot = await page.screenshot({ path: `docs/preview/intro/intro-${name}-${(target / 1000).toFixed(1)}s.png` });
    const at = await page.evaluate((s) => Math.round(performance.now() - s), start);
    console.log(`${name} target ${target} ms, captured at about ${at} ms (${shot.length} bytes)`);
  }
  await context.close();
}
await browser.close();
server.httpServer.close();
