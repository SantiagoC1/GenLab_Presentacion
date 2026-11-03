// Shared motion helpers. Only transform and opacity are animated anywhere in the deck.
const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => query.matches;
export const EASE = 'cubic-bezier(.2,.8,.2,1)';

// Counts a number from 0 to `finalValue`. The resting text is always the final value,
// so nothing depends on the animation finishing. Returns a function that cancels and shows the final value.
export function countUp(el, finalValue, { delay = 0, duration = 400 } = {}) {
  const final = Number(finalValue);
  if (prefersReducedMotion()) {
    el.textContent = final;
    return () => {};
  }
  let frame;
  const startAt = performance.now() + delay;
  el.textContent = 0;
  const tick = (now) => {
    const t = Math.min(1, Math.max(0, (now - startAt) / duration));
    el.textContent = Math.round(final * (1 - Math.pow(1 - t, 3)));
    if (t < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    el.textContent = final;
  };
}

// Counts every [data-count] number inside a slide, staggered like the card entrance (--i).
export function runCounts(root) {
  root.querySelectorAll('[data-count]').forEach((el) => {
    el._cancelCount?.();
    const card = el.closest('.pop');
    const i = card ? parseFloat(getComputedStyle(card).getPropertyValue('--i')) || 0 : 0;
    el._cancelCount = countUp(el, el.dataset.count, { delay: i * 60 + 260 });
  });
}
