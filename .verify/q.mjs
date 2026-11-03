import { preview } from 'vite';
import { chromium } from 'playwright';
const server = await preview({ preview: { port: 4240 } });
const base = server.resolvedUrls.local[0]; // includes /genlab-chatbot-presentation/
console.log('base url:', base);
const b = await chromium.launch({ channel: 'chrome' });
const failed = [];
const ctxOpts = (w, h, theme) => ({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
// A. subpath checks
{
  const ctx = await b.newContext(ctxOpts(1280, 720));
  const p = await ctx.newPage();
  p.on('response', (r) => r.status() >= 400 && failed.push(r.status() + ' ' + r.url()));
  await p.goto(base + '#5'); await p.waitForTimeout(600);
  console.log('#5 opens slide', await p.evaluate(() => document.querySelector('.slide.on').dataset.title), '| counter', await p.textContent('#counter'));
  await p.evaluate(() => (location.hash = '#6')); await p.waitForTimeout(1200);
  console.log('slide 6 screenshots loaded:', await p.$$eval('.shot img', (i) => i.map((x) => x.naturalWidth > 0).join(',')));
  console.log('brand icon loaded:', await p.$$eval('.brand img', (i) => i.filter((x) => x.offsetParent).map((x) => x.naturalWidth > 0)));
  console.log('favicon links:', await p.$$eval('link[rel*=icon]', (l) => l.map((x) => x.getAttribute('href'))));
  const [pop] = await Promise.all([ctx.waitForEvent('page'), p.keyboard.press('p')]);
  await pop.waitForTimeout(800);
  console.log('presenter url:', pop.url(), '| shows:', await pop.textContent('#p-position'));
  console.log('qr image loaded:', await (async () => { await p.evaluate(() => (location.hash = '#1')); await p.waitForTimeout(500); return p.$eval('.qr img', (i) => i.naturalWidth > 0); })());
  await ctx.close();
}
// D. QR layout and screenshots
const overlaps = async (p) => p.evaluate(() => {
  const qr = document.querySelector('.slide.on .qr'); if (!qr) return 'no qr';
  const r = qr.getBoundingClientRect();
  const hud = document.querySelector('.hud').getBoundingClientRect();
  const hits = [];
  document.querySelectorAll('.slide.on .inner *').forEach((e) => {
    if (qr.contains(e) || e.closest('.qr')) return;
    const b = e.getBoundingClientRect();
    if (!b.width || !b.height) return;
    // leaf elements only, to avoid containers that merely span the area
    if (e.children.length && !['P', 'H1', 'H2', 'PRE', 'IMG', 'SPAN', 'CODE'].includes(e.tagName)) return;
    if (b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top) hits.push(e.tagName + '.' + e.className);
  });
  return { rect: [r.left, r.top, r.right, r.bottom].map(Math.round), bar: Math.round(hud.top), overBar: r.bottom > hud.top, overlapping: hits, scrolls: document.querySelector('.slide.on').scrollHeight > document.querySelector('.slide.on').clientHeight };
});
for (const [w, h] of [[1280, 720], [1024, 768]]) for (const theme of ['dark', 'light']) {
  const ctx = await b.newContext(ctxOpts(w, h));
  await ctx.addInitScript((t) => localStorage.setItem('genlab-theme', t), theme);
  const p = await ctx.newPage();
  await p.goto(base); await p.waitForTimeout(400);
  for (const n of [1, 10]) {
    await p.evaluate((x) => (location.hash = x), '#' + n); await p.waitForTimeout(700);
    console.log(`${w}x${h} ${theme} slide ${n}:`, JSON.stringify(await overlaps(p)));
    await p.screenshot({ path: `docs/preview/qr/s${String(n).padStart(2, '0')}-${w}x${h}-${theme}.png` });
  }
  await ctx.close();
}
for (const theme of ['dark', 'light']) {
  const ctx = await b.newContext(ctxOpts(400, 800));
  await ctx.addInitScript((t) => localStorage.setItem('genlab-theme', t), theme);
  const p = await ctx.newPage(); await p.goto(base); await p.waitForTimeout(500);
  console.log(`400x800 ${theme} slide 1 qr visible:`, await p.evaluate(() => { const q = document.querySelector('.slide.on .qr'); return q ? getComputedStyle(q).display : 'none-element'; }));
  await p.screenshot({ path: `docs/preview/qr/s01-400x800-${theme}.png` });
  await ctx.close();
}
console.log('failed requests:', failed);
await b.close(); server.httpServer.close();
