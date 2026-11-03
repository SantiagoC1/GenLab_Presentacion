// WCAG contrast check for every text/background pair used by the deck. Reads src/styles/tokens.css.
// Usage: node scripts/check-contrast.mjs   (exits with code 1 if a pair fails)
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const block = (selector) => {
  const start = css.indexOf(selector);
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
};
const parse = (text) => Object.fromEntries([...text.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const shared = parse(block(':root{'));
const themes = { dark: parse(block(':root,:root[data-theme="dark"]')), light: parse(block(':root[data-theme="light"]')) };

const toRgba = (v) => {
  if (v.startsWith('#')) {
    const n = parseInt(v.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const m = v.match(/rgba?\(([^)]+)\)/).slice(1)[0].split(',').map(Number);
  return [m[0], m[1], m[2], m[3] ?? 1];
};
const over = (top, under) => {
  const [r, g, b, a] = top;
  return [0, 1, 2].map((i) => [r, g, b][i] * a + under[i] * (1 - a)).concat(1);
};
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

let failures = 0;
for (const [name, t] of Object.entries(themes)) {
  const c = (key, under) => {
    const color = toRgba(t[key]);
    return color[3] < 1 ? over(color, under) : color;
  };
  const bg = c('bg');
  const panel = c('panel');
  const panel2 = c('panel2');
  const code = c('code');
  const accentSoftOnPanel = c('accent-soft', panel);
  const signalSoftOnBg = c('signal-soft', bg);
  const signalSoftOnPanel = c('signal-soft', panel);
  const pairs = [
    // [label, foreground, background, minimum]
    ['text on bg', c('txt'), bg, 4.5],
    ['text on panel', c('txt'), panel, 4.5],
    ['text on panel2', c('txt'), panel2, 4.5],
    ['muted on bg', c('muted'), bg, 4.5],
    ['muted on panel', c('muted'), panel, 4.5],
    ['muted on panel2', c('muted'), panel2, 4.5],
    ['muted on code (comments)', c('muted'), code, 4.5],
    ['accent on bg', c('accent'), bg, 4.5],
    ['accent on panel', c('accent'), panel, 4.5],
    ['accent on chip (accent-soft/panel)', c('accent'), accentSoftOnPanel, 4.5],
    ['accent on chip (accent-soft/bg)', c('accent'), over(toRgba(t['accent-soft']), bg), 4.5],
    ['on-accent on accent-solid', c('on-accent'), c('accent-solid'), 4.5],
    ['cyan on bg', c('cyan'), bg, 4.5],
    ['cyan on panel', c('cyan'), panel, 4.5],
    ['code key on code', c('code-key'), code, 4.5],
    ['magenta on code', c('magenta'), code, 4.5],
    ['code-string on code', c('code-string'), code, 4.5],
    ['signal on bg', c('signal'), bg, 4.5],
    ['signal on panel', c('signal'), panel, 4.5],
    ['signal-text on chip (signal-soft/panel)', c('signal-text'), signalSoftOnPanel, 4.5],
    ['text on band / active step (signal-soft/bg)', c('txt'), signalSoftOnBg, 4.5],
    ['status-ok on panel (large number)', c('status-ok'), panel, 3],
    ['status-auth on panel (large number)', c('status-auth'), panel, 3],
    ['status-warn on panel (large number)', c('status-warn'), panel, 3],
    ['status-info on panel (large number)', c('status-info'), panel, 3],
    ['status-error on panel (large number)', c('status-error'), panel, 3],
    ['on-status on status-ok-fill (badge)', c('on-status'), c('status-ok-fill'), 4.5],
    ['on-status on status-auth (badge)', c('on-status'), c('status-auth'), 4.5],
    ['on-status on status-warn (badge)', c('on-status'), c('status-warn'), 4.5],
    ['on-status on status-info (badge)', c('on-status'), c('status-info'), 4.5],
    ['accent focus ring on bg', c('accent'), bg, 3],
    // controls: borders of buttons, tabs, steps and the fill of inactive dots (WCAG 1.4.11, 3:1)
    ['control-border on bg (outside the control)', c('control-border'), bg, 3],
    ['control-border on panel (button/tab/step fill)', c('control-border'), panel, 3],
    ['control-border on panel2', c('control-border'), panel2, 3],
    ['control-border on code', c('control-border'), code, 3],
    ['gradient start on bg (large title)', toRgba(t['grad-1']), bg, 3],
    ['gradient middle on bg (large title)', toRgba(t['grad-2']), bg, 3],
    ['gradient end on bg (large title)', toRgba(t['grad-3']), bg, 3],
  ];
  pairs.push(['viewer-border on viewer-ui-bg (viewer is always dark)', toRgba(shared['viewer-border']), over(toRgba(shared['viewer-ui-bg']), toRgba(themes.dark.bg)), 3]);
  console.log(`\n${name.toUpperCase()} theme`);
  console.log('pair'.padEnd(46), 'ratio'.padStart(7), 'min'.padStart(5), ' result');
  for (const [label, fg, back, min] of pairs) {
    const r = ratio(fg, back);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(label.padEnd(46), r.toFixed(2).padStart(7), String(min).padStart(5), ok ? ' pass' : ' FAIL');
  }
}
process.exit(failures ? 1 : 0);
