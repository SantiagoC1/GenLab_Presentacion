import { prefersReducedMotion, EASE } from '../motion.js';

// Enlarged screenshot viewer: dialog with focus trap, arrow navigation and a FLIP expansion
// from the thumbnail to the big image (and back).
let root, backdrop, image, caption, counter, closeButton, prevButton, nextButton, ui;
let list = [];
let index = 0;
let closing = false;

const FLIP_MS = 380;

function build() {
  if (root) return;
  root = document.createElement('div');
  root.className = 'viewer';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Captura ampliada');
  root.innerHTML = `
    <div class="viewer-backdrop"></div>
    <figure class="viewer-figure">
      <img class="viewer-image" alt="" />
      <figcaption class="viewer-caption"></figcaption>
    </figure>
    <button class="viewer-button viewer-close" type="button" aria-label="Cerrar">✕</button>
    <button class="viewer-button viewer-prev" type="button" aria-label="Captura anterior">←</button>
    <button class="viewer-button viewer-next" type="button" aria-label="Captura siguiente">→</button>
    <span class="viewer-counter" aria-live="polite"></span>`;
  document.body.appendChild(root);

  backdrop = root.querySelector('.viewer-backdrop');
  image = root.querySelector('.viewer-image');
  caption = root.querySelector('.viewer-caption');
  counter = root.querySelector('.viewer-counter');
  closeButton = root.querySelector('.viewer-close');
  prevButton = root.querySelector('.viewer-prev');
  nextButton = root.querySelector('.viewer-next');
  ui = [caption, closeButton, prevButton, nextButton, counter];

  closeButton.onclick = close;
  prevButton.onclick = () => step(-1);
  nextButton.onclick = () => step(1);
  root.addEventListener('click', (e) => {
    if (!e.target.closest('.viewer-image, .viewer-button')) close();
  });
  // Capture phase: while the viewer is open, its keys never reach the deck.
  document.addEventListener('keydown', onKey, true);
}

function onKey(e) {
  if (!root || root.hidden) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    close();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    e.stopPropagation();
    step(e.key === 'ArrowLeft' ? -1 : 1);
  } else if (e.key === 'Tab') {
    const focusable = [closeButton, prevButton, nextButton].filter((b) => !b.hidden && !b.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (!root.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  }
}

function setCurrent(i) {
  index = i;
  const item = list[i];
  image.src = item.img.src;
  image.alt = item.alt;
  caption.textContent = item.caption;
  caption.hidden = !item.caption;
  const many = list.length > 1;
  prevButton.hidden = nextButton.hidden = counter.hidden = !many;
  prevButton.disabled = i === 0;
  nextButton.disabled = i === list.length - 1;
  counter.textContent = i + 1 + ' / ' + list.length;
}

// Transform that makes `el` (at its final place) look like `from`.
function flipKeyframe(from, el) {
  const to = el.getBoundingClientRect();
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

export function openViewer(items, i) {
  if (!items.length || i < 0) return;
  build();
  list = items;
  closing = false;
  root.hidden = false;
  document.body.classList.add('viewer-open');
  setCurrent(i);

  const thumb = list[i].img;
  if (!prefersReducedMotion()) {
    const from = thumb.getBoundingClientRect();
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    ui.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }));
    image.animate(
      [
        { transformOrigin: '0 0', transform: flipKeyframe(from, image) },
        { transformOrigin: '0 0', transform: 'none' },
      ],
      { duration: FLIP_MS, easing: EASE },
    );
  }
  thumb.style.visibility = 'hidden';
  closeButton.focus();
}

function step(direction) {
  const next = index + direction;
  if (next < 0 || next >= list.length) return;
  list[index].img.style.visibility = '';
  setCurrent(next);
  list[next].img.style.visibility = 'hidden';
  if (!prefersReducedMotion()) {
    image.getAnimations().forEach((a) => a.cancel());
    image.animate(
      [
        { opacity: 0, transform: `translateX(${40 * direction}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 250, easing: EASE },
    );
  }
}

function close() {
  if (closing || root.hidden) return;
  closing = true;
  const item = list[index];
  const thumb = item.img;

  const finish = () => {
    [image, backdrop, ...ui].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    root.hidden = true;
    document.body.classList.remove('viewer-open');
    thumb.style.visibility = '';
    closing = false;
    item.button.focus();
  };

  if (prefersReducedMotion()) return finish();

  const back = image.animate(
    [
      { transformOrigin: '0 0', transform: 'none' },
      { transformOrigin: '0 0', transform: flipKeyframe(thumb.getBoundingClientRect(), image) },
    ],
    { duration: 300, easing: EASE, fill: 'forwards' },
  );
  backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 100, fill: 'forwards' });
  ui.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }));
  back.onfinish = finish;
}
