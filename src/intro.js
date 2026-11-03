import { prefersReducedMotion, EASE } from './motion.js';

// Opening sequence (about 7 s) played before slide 1, and again every time you come back to it.
//   0.0-0.6  dark screen, dim aurora; particles float and swirl around the center
//   0.6-3.6  the cloud condenses into the icon (the last 0.4 s crossfade to the sharp SVG icon)
//   3.6-5.0  "GEN LAB" rises letter by letter, then the tagline fades in, the orange node pulses
//   5.0-5.6  pause: the whole logo stays still so it can be read
//   5.6-7.2  the logo moves and shrinks (FLIP) to its place on slide 1 while the slide builds itself
// Only transform and opacity are animated, except the particle canvas.

const NS = 'http://www.w3.org/2000/svg';
const PENDING = ['intro-active', 'intro-bg', 'intro-stage', 'intro-chrome', 'intro-logo'];

// ---- Timeline: edit these (all in seconds) -------------------------------------------------
const SECONDS = {
  condenseStart: 0.6, // particles start to condense (before this they only float)
  condenseEnd: 3.6, // end of the particle phase
  crossfade: 0.4, // last seconds of the particle phase: crossfade to the sharp SVG icon
  particleMinTravel: 1.2, // each particle travels for a random time between these two values...
  particleMaxTravel: 1.6, // ...and starts at a random moment, so the cloud visibly takes shape
  lettersStart: 3.6, // "GEN LAB" starts rising
  letterStep: 0.13, // delay between letters
  letterDuration: 0.45,
  taglineStart: 4.3, // "GENETICS & BIOTECHNOLOGY" fades in
  taglineDuration: 0.5,
  pulseStart: 4.8, // orange node pulse
  pulseDuration: 0.3,
  flipStart: 5.6, // pause from 5.0 to here, then the logo moves to slide 1
  flipDuration: 1.6,
  chromeLead: 0.5, // top bar and controls appear this long before the end
};
// ---------------------------------------------------------------------------------------------

const T = {
  particlesFrom: SECONDS.condenseStart * 1000,
  crossfade: (SECONDS.condenseEnd - SECONDS.crossfade) * 1000,
  crossfadeMs: SECONDS.crossfade * 1000,
  letters: SECONDS.lettersStart * 1000,
  letterStep: SECONDS.letterStep * 1000,
  letterMs: SECONDS.letterDuration * 1000,
  tagline: SECONDS.taglineStart * 1000,
  taglineMs: SECONDS.taglineDuration * 1000,
  pulse: SECONDS.pulseStart * 1000,
  pulseMs: SECONDS.pulseDuration * 1000,
  flip: SECONDS.flipStart * 1000,
  flipMs: SECONDS.flipDuration * 1000,
  end: (SECONDS.flipStart + SECONDS.flipDuration) * 1000,
  chrome: (SECONDS.flipStart + SECONDS.flipDuration - SECONDS.chromeLead) * 1000,
  // particles may start condensing at a random moment, but must arrive before the crossfade begins
  spread: Math.max(0, SECONDS.condenseEnd - SECONDS.crossfade - SECONDS.condenseStart - SECONDS.particleMaxTravel) * 1000,
  minTravel: SECONDS.particleMinTravel * 1000,
  maxTravel: SECONDS.particleMaxTravel * 1000,
};
const FLIP_EASING = 'cubic-bezier(.4,0,.2,1)'; // smooth in and out, no long dead stretch in the middle

const SKIP_KEYS = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Enter', 'Escape'];
const root = document.documentElement;
const setPending = (on) => PENDING.forEach((c) => root.classList.toggle(c, on));
const rand = (min, max) => min + Math.random() * (max - min);
const easeOut = (t) => 1 - Math.pow(1 - t, 2.2); // keeps moving until it lands

// `onStage()` runs when the slide must start building itself. `onEnd({ skipped })` runs when the intro is over.
export function createIntro({ onStage, onEnd } = {}) {
  let running = null; // cleanup function while the intro plays

  // Same rule as the early script in index.html: it plays every time the page is opened or reloaded,
  // unless the URL asks for another slide (#2 ... #10) or motion is reduced. Empty hash or #1 plays.
  function shouldPlay() {
    const slide = parseInt(location.hash.slice(1), 10);
    return (!location.hash || slide === 1) && !prefersReducedMotion();
  }

  async function loadAssets(theme) {
    const base = import.meta.env.BASE_URL + 'brand/';
    const load = async () => {
      const [svgText, png] = await Promise.all([
        fetch(base + `01_horizontal_${theme}_transparente.svg`).then((r) => {
          if (!r.ok) throw new Error('logo svg');
          return r.text();
        }),
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('logo png'));
          img.src = base + `02_icono_${theme}_transparente.png`;
        }),
        document.fonts.ready,
      ]);
      return { svgText, png };
    };
    return Promise.race([load(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))]);
  }

  // Splits the "GEN LAB" path into one group per letter (counters stay with their letter),
  // so each letter can rise inside its own clip window.
  function splitLetters(svg, wordPath) {
    const d = wordPath.getAttribute('d');
    const boxes = d.split(/(?=M)/).map((sub) => {
      const probe = document.createElementNS(NS, 'path');
      probe.setAttribute('d', sub);
      svg.appendChild(probe);
      const b = probe.getBBox();
      probe.remove();
      return [b.x, b.x + b.width, b.y, b.y + b.height];
    });
    boxes.sort((a, b) => a[0] - b[0]);
    const letters = [];
    boxes.forEach((b) => {
      const last = letters[letters.length - 1];
      if (last && b[0] <= last[1]) {
        last[1] = Math.max(last[1], b[1]);
        last[2] = Math.min(last[2], b[2]);
        last[3] = Math.max(last[3], b[3]);
      } else letters.push([...b]);
    });

    const group = document.createElementNS(NS, 'g');
    group.setAttribute('transform', wordPath.getAttribute('transform') || '');
    const risers = letters.map(([x0, x1, y0, y1], i) => {
      const clip = document.createElementNS(NS, 'clipPath');
      clip.id = 'intro-letter-' + i;
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', x0 - 1);
      rect.setAttribute('y', y0 - 3);
      rect.setAttribute('width', x1 - x0 + 2);
      rect.setAttribute('height', y1 - y0 + 6);
      clip.appendChild(rect);
      const window_ = document.createElementNS(NS, 'g');
      window_.setAttribute('clip-path', `url(#${clip.id})`);
      const riser = document.createElementNS(NS, 'g');
      const copy = document.createElementNS(NS, 'path');
      copy.setAttribute('d', d);
      copy.setAttribute('fill', wordPath.getAttribute('fill'));
      riser.appendChild(copy);
      window_.appendChild(riser);
      group.append(clip, window_);
      riser.style.opacity = 0;
      return { riser, rise: y1 - y0 + 6 };
    });
    wordPath.replaceWith(group);
    return risers;
  }

  // Particle targets: opaque pixels of the icon PNG, mapped onto the icon area of the on-screen logo.
  function makeParticles(png, iconRect, count) {
    const width = 320;
    const height = Math.round((png.naturalHeight / png.naturalWidth) * width);
    const hidden = document.createElement('canvas'); // never attached to the page
    hidden.width = width;
    hidden.height = height;
    const ctx = hidden.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(png, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height).data;

    const opaque = [];
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 20) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
        if (a > 60) opaque.push(y * width + x);
      }
    }
    if (!opaque.length) throw new Error('empty icon');

    const spanX = maxX - minX + 1;
    const spanY = maxY - minY + 1;
    const cx = iconRect.left + iconRect.width / 2;
    const cy = iconRect.top + iconRect.height / 2;
    const size = Math.max(1.5, iconRect.width / 140);
    const particles = [];
    for (let i = 0; i < count; i++) {
      const p = opaque[Math.floor(Math.random() * opaque.length)];
      const x = p % width;
      const y = Math.floor(p / width);
      const o = p * 4;
      particles.push({
        tx: iconRect.left + ((x - minX + 0.5) / spanX) * iconRect.width,
        ty: iconRect.top + ((y - minY + 0.5) / spanY) * iconRect.height,
        cx,
        cy,
        // Before condensing, each particle floats on its own slow orbit around the center.
        angle: rand(0, Math.PI * 2),
        speed: rand(0.25, 0.7), // radians per second
        radius: iconRect.width * rand(0.45, 1.3),
        appear: rand(0, 250), // ms: particles fade in at slightly different moments
        bend: rand(-45, 45), // sideways bulge of the path, so the cloud swirls in
        delay: rand(0, T.spread),
        duration: rand(T.minTravel, T.maxTravel),
        size: size * rand(0.8, 1.25),
        color: `rgb(${data[o]},${data[o + 1]},${data[o + 2]})`,
      });
    }
    return particles;
  }

  // `delay` (ms) waits before starting, so the slide you came from can finish its exit transition.
  async function play({ delay = 0 } = {}) {
    if (running || prefersReducedMotion()) return;
    setPending(true);

    const theme = root.dataset.theme === 'light' ? 'light' : 'dark';
    const timers = [];
    const animations = [];
    let frame = 0;
    let overlay;
    let finished = false;

    const finish = (skipped) => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      animations.forEach((a) => a.cancel());
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey, true);
      if (overlay) {
        overlay.querySelectorAll('canvas').forEach((c) => (c.width = c.height = 0)); // free the canvas
        overlay.remove();
      }
      setPending(false);
      running = null;
      onEnd?.({ skipped });
    };
    const onKey = (e) => {
      if (!SKIP_KEYS.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return; // F, P, T and I pass through
      e.preventDefault();
      e.stopImmediatePropagation();
      finish(true);
    };
    running = () => finish(true);
    document.addEventListener('keydown', onKey, true); // skippable from the very start

    try {
      if (delay) await new Promise((resolve) => timers.push(setTimeout(resolve, delay)));
      if (finished) return;
      const { svgText, png } = await loadAssets(theme);
      if (finished) return;

      const hero = [...document.querySelectorAll('.logo-hero')].find((img) => img.offsetParent);
      const dom = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
      const svg = document.importNode(dom, true);
      const [, iconGroup, wordPath, tagPath] = svg.children;
      if (!hero || !iconGroup || !wordPath || !tagPath) throw new Error('unexpected logo structure');
      svg.removeAttribute('width');
      svg.removeAttribute('height');

      // Overlay: particle canvas + the logo (the same element is later moved to slide 1 with FLIP).
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      const mobile = viewW <= 560;
      const boxW = mobile ? viewW * 0.7 : Math.min(640, viewW * 0.5);
      const boxH = (boxW * 920) / 2283;
      overlay = document.createElement('div');
      overlay.className = 'intro';
      overlay.setAttribute('aria-hidden', 'true');
      const canvas = document.createElement('canvas');
      canvas.className = 'intro-canvas';
      const box = document.createElement('div');
      box.className = 'intro-logo-box';
      Object.assign(box.style, { left: (viewW - boxW) / 2 + 'px', top: (viewH - boxH) / 2 + 'px', width: boxW + 'px', height: boxH + 'px' });
      box.appendChild(svg);
      overlay.append(canvas, box);
      overlay.addEventListener('click', () => finish(true));
      document.body.appendChild(overlay);

      const risers = splitLetters(svg, wordPath);
      const node = iconGroup.querySelector('circle');
      iconGroup.style.opacity = 0;
      tagPath.style.opacity = 0;

      // Particles
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      const ctx = canvas.getContext('2d');
      const particles = makeParticles(png, iconGroup.getBoundingClientRect(), mobile ? 400 : 800);

      const t0 = performance.now();
      performance.clearMarks('genlab-intro-start');
      performance.mark('genlab-intro-start');
      const draw = (now) => {
        const t = now - t0;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, viewW, viewH);
        const seconds = t / 1000;
        for (const p of particles) {
          // floating orbit, still turning while the particle travels (so it spirals in)
          const a = p.angle + p.speed * seconds;
          const sx = p.cx + Math.cos(a) * p.radius * 1.35;
          const sy = p.cy + Math.sin(a) * p.radius * 0.9;
          const k = Math.min(1, Math.max(0, (t - T.particlesFrom - p.delay) / p.duration));
          const e = easeOut(k);
          const dx = p.tx - sx;
          const dy = p.ty - sy;
          const len = Math.hypot(dx, dy) || 1;
          const side = Math.sin(Math.PI * e) * p.bend;
          ctx.globalAlpha = Math.min(1, Math.max(0, (t - p.appear) / 400));
          ctx.fillStyle = p.color;
          ctx.fillRect(sx + dx * e - (dy / len) * side - p.size / 2, sy + dy * e + (dx / len) * side - p.size / 2, p.size, p.size);
        }
        if (t < T.crossfade + T.crossfadeMs) frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);

      const play = (el, keyframes, options) => {
        const a = el.animate(keyframes, { fill: 'both', easing: EASE, ...options });
        animations.push(a);
        return a;
      };
      // Crossfade from the particle cloud to the sharp SVG icon.
      play(canvas, [{ opacity: 1 }, { opacity: 0 }], { delay: T.crossfade, duration: T.crossfadeMs, easing: 'linear' });
      play(iconGroup, [{ opacity: 0 }, { opacity: 1 }], { delay: T.crossfade, duration: T.crossfadeMs, easing: 'linear' });
      // Letters rise one by one.
      risers.forEach(({ riser, rise }, i) => {
        play(
          riser,
          [
            { opacity: 0, transform: `translateY(${rise}px)` },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { delay: T.letters + i * T.letterStep, duration: T.letterMs },
        );
      });
      play(tagPath, [{ opacity: 0 }, { opacity: 1 }], { delay: T.tagline, duration: T.taglineMs, easing: 'linear' });
      if (node) {
        node.style.transformBox = 'fill-box';
        node.style.transformOrigin = 'center';
        play(node, [{ transform: 'scale(1)' }, { transform: 'scale(1.7)', offset: 0.45 }, { transform: 'scale(1)' }], { delay: T.pulse, duration: T.pulseMs, easing: 'ease-in-out' });
      }

      // FLIP: the same logo element moves and shrinks to the slide 1 position; the slide builds itself.
      timers.push(
        setTimeout(() => {
          const from = box.getBoundingClientRect();
          const to = hero.getBoundingClientRect();
          box.style.willChange = 'transform';
          play(
            box,
            [
              { transform: 'none' },
              { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` },
            ],
            { duration: T.flipMs, easing: FLIP_EASING },
          );
          root.classList.remove('intro-stage', 'intro-bg');
          onStage?.();
        }, Math.max(0, T.flip - (performance.now() - t0))),
        setTimeout(() => root.classList.remove('intro-chrome'), Math.max(0, T.chrome - (performance.now() - t0))),
        setTimeout(() => finish(false), Math.max(0, T.end - (performance.now() - t0))),
      );
    } catch (error) {
      // Any problem (missing logo, no canvas...) skips the intro and shows slide 1.
      console.warn('Intro skipped:', error.message);
      finish(true);
    }
  }

  return {
    shouldPlay,
    play,
    // Coming back to slide 1 later: can the intro play again?
    canReplay: () => !running && !prefersReducedMotion(),
    // Hides slide 1 and the controls right away, before the transition from the previous slide starts.
    hold: () => setPending(true),
    isActive: () => root.classList.contains('intro-active'),
  };
}
