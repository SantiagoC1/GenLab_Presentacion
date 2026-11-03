// Writes public/brand/qr.svg for PRESENTATION_URL (src/config.js or the VITE_PRESENTATION_URL variable).
// Dark modules (--bg) on a light background (--txt of the dark theme) with a 4-module quiet zone.
// Runs before dev and build (predev / prebuild). Nothing is requested from the internet.
import QRCode from 'qrcode';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { PRESENTATION_URL } from '../src/config.js';

const OUTPUT = new URL('../public/brand/qr.svg', import.meta.url);
const QUIET_ZONE = 4;

function darkThemeColors() {
  const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  const block = css.slice(css.indexOf(':root,:root[data-theme="dark"]'));
  const get = (name) => block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];
  return { dark: get('bg'), light: get('txt') };
}

export function makeQr(url = process.env.VITE_PRESENTATION_URL || PRESENTATION_URL) {
  if (!url) {
    rmSync(OUTPUT, { force: true }); // no URL: no QR (never a fake one)
    console.log('QR: no PRESENTATION_URL, the QR code is hidden.');
    return false;
  }
  const { dark, light } = darkThemeColors();
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const total = size + QUIET_ZONE * 2;
  let path = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!qr.modules.get(y, x)) continue;
      let run = 1;
      while (x + run < size && qr.modules.get(y, x + run)) run++;
      path += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h${run}v1h-${run}z`;
      x += run - 1;
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>\n`;
  writeFileSync(OUTPUT, svg);
  console.log(`QR: ${url} (${size}x${size} modules, level M) -> public/brand/qr.svg`);
  return true;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) makeQr();
