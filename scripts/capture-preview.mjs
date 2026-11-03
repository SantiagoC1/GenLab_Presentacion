// Saves screenshots of slides 6, 8, 9 and 10 (and the viewer) to docs/preview/. Uses the installed Chrome.
// Usage: npm run build && node scripts/capture-preview.mjs
import { preview } from 'vite';
import { chromium } from 'playwright';

const server = await preview({ preview: { port: 4190 } });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];

for (const [name, width, height, scheme] of [['1280-dark', 1280, 720, 'dark'], ['1280-light', 1280, 720, 'light'], ['400-dark', 400, 800, 'dark'], ['400-light', 400, 800, 'light']]) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push(m.text()));
  await page.goto(url);
  for (const n of [6, 8, 9, 10]) {
    await page.evaluate((h) => (location.hash = h), '#' + n);
    await page.waitForTimeout(n === 9 ? 1800 : 1500);
    if (n === 9) {
      await page.click('.step:nth-child(9)'); // the 429 step with the countdown
      await page.waitForTimeout(2800);
    }
    await page.screenshot({ path: `docs/preview/slide-${n}-${name}.png` });
  }
  if (width === 1280) {
    await page.evaluate(() => (location.hash = '#6'));
    await page.waitForTimeout(1200);
    await page.locator('.shot[data-code="429"]').click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `docs/preview/viewer-${name}.png` });
  }
  await context.close();
}
console.log('errors:', errors);
await browser.close();
server.httpServer.close();
