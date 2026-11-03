import { slides } from './content/slides.js';
import { splitWords } from './split-words.js';
import { prefersReducedMotion, EASE } from './motion.js';

const CHANNEL_NAME = 'genlab-deck';
const SHIFT = 24; // px the slides travel during a transition
const introActive = () => document.documentElement.classList.contains('intro-active');

// Builds one <section class="slide"> from the slide data. Also used by the presenter preview.
export function createSlideElement(slide) {
  const section = document.createElement('section');
  section.className = 'slide';
  section.dataset.title = slide.title;
  section.innerHTML = slide.html;
  section.querySelectorAll('[data-split]').forEach(splitWords);
  return section;
}

// Navigation: keyboard, buttons, swipe, URL hash, progress bar, dots and directional transitions.
// `onBeforeChange(index, previousIndex)` runs first, `onChange(index, slideElement, previousIndex)` after each slide change. Call `start()` once everything is wired.
export function createDeck({ onChange, onBeforeChange } = {}) {
  const stage = document.getElementById('stage');
  const progress = document.getElementById('progress');
  const counter = document.getElementById('counter');
  const dots = document.getElementById('dots');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const total = slides.length;
  let current = null;
  let running = []; // transition animations in flight

  const elements = slides.map((slide, i) => {
    const section = createSlideElement(slide);
    stage.appendChild(section);

    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', 'Ir a ' + (slide.title || i + 1));
    dot.onclick = () => go(i);
    dots.appendChild(dot);
    return section;
  });

  // Lets the presenter window follow and drive the deck.
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;
  const announce = () => channel?.postMessage({ type: 'slide', index: current });
  if (channel) {
    channel.onmessage = (event) => {
      if (event.data.type === 'goto') {
        if (!introActive()) go(event.data.index);
      }
      else if (event.data.type === 'hello') announce();
    };
  }

  // Outgoing slide slides out and fades; incoming slide slides in. A new call cancels the one in flight.
  function transition(from, to) {
    const direction = to > from ? 1 : -1;
    const outgoing = elements[from];
    outgoing.classList.add('leaving');
    const exit = outgoing.animate(
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: `translateX(${-SHIFT * direction}px)` },
      ],
      { duration: 220, easing: EASE, fill: 'forwards' },
    );
    exit.onfinish = () => {
      exit.cancel();
      outgoing.classList.remove('leaving');
    };
    // When the intro holds slide 1 (coming back to it), only the old slide transitions out.
    if (to === 0 && introActive()) {
      running.push(exit);
      return;
    }
    const enter = elements[to].animate(
      [
        { opacity: 0, transform: `translateX(${SHIFT * direction}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 400, easing: EASE },
    );
    running.push(exit, enter);
  }

  function restartEntrance(slide) {
    slide.querySelectorAll('.reveal,.pop,.fade,.word>span,.line').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    const previous = current;
    onBeforeChange?.(n, previous);

    running.forEach((a) => a.cancel());
    running = [];
    elements.forEach((el) => el.classList.remove('leaving'));
    elements.forEach((el, i) => el.classList.toggle('on', i === n));
    if (previous !== null && previous !== n && !prefersReducedMotion()) transition(previous, n);

    // Restart entrance animations every time a slide is entered.
    const active = elements[n];
    active.scrollTop = 0;
    restartEntrance(active);

    current = n;
    document.body.dataset.slide = n + 1;
    progress.style.width = ((n + 1) / total) * 100 + '%';
    counter.textContent = n + 1 + ' / ' + total;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === n));
    prevButton.disabled = n === 0;
    nextButton.disabled = n === total - 1;
    try {
      history.replaceState(null, '', '#' + (n + 1));
    } catch (e) {}
    announce();
    onChange?.(n, active, previous);
  }

  prevButton.onclick = () => go(current - 1);
  nextButton.onclick = () => go(current + 1);

  const viewerOpen = () => document.body.classList.contains('viewer-open');

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || viewerOpen() || introActive()) return;
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      go(current + 1);
    } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      go(current - 1);
    } else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(total - 1);
  });

  // Swipe on touch screens.
  let startX = null;
  document.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  document.addEventListener(
    'touchend',
    (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (!viewerOpen() && !introActive() && Math.abs(dx) > 70) go(current + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  const readHash = () => {
    const n = parseInt((location.hash || '').slice(1), 10);
    return n >= 1 && n <= total ? n - 1 : 0;
  };

  return {
    go,
    current: () => current,
    // Plays the entrance animations of the current slide again (used by the opening sequence).
    replay: () => restartEntrance(elements[current]),
    // Jumps the current slide's entrance animations to their end state.
    settle: () =>
      elements[current].getAnimations({ subtree: true }).forEach((a) => {
        try {
          a.finish();
        } catch (e) {}
      }),
    // Typing #5 in the address bar jumps to that slide (replaceState does not fire this).
    start() {
      window.addEventListener('hashchange', () => !introActive() && go(readHash()));
      go(readHash());
    },
  };
}
