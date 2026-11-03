// Typewriter effect for the chat answer on slide 1.
let timer;

export function startTyping(reduceMotion) {
  const el = document.getElementById('typed-text');
  if (!el) return;
  if (!el.dataset.full) el.dataset.full = el.textContent;
  const full = el.dataset.full;
  clearTimeout(timer);

  if (reduceMotion) {
    el.textContent = full;
    el.classList.remove('caret');
    return;
  }

  el.textContent = '';
  el.classList.add('caret');
  let i = 0;
  timer = setTimeout(function tick() {
    i += 2;
    el.textContent = full.slice(0, i);
    if (i < full.length) {
      timer = setTimeout(tick, 28);
    } else {
      el.classList.remove('caret');
    }
  }, 1100);
}
