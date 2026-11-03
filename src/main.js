import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/figtree';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/animations.css';
import './styles/slides.css';
import './styles/viewer.css';
import './styles/intro.css';

import { createDeck } from './deck.js';
import { initTheme } from './theme.js';
import { createIntro } from './intro.js';
import { startTyping } from './typing.js';
import { prefersReducedMotion, runCounts } from './motion.js';
import { initTabs } from './components/tabs.js';
import { initDemoStepper } from './components/demo-stepper.js';
import { initScreenshots } from './components/screenshots.js';

// Slide indexes (0-based) that need something when entered.
const SLIDE = { intro: 0, status: 4, cases: 5, health: 7, demo: 8 };

let demo;
let screenshots;
let replayIntro = false; // set just before coming back to slide 1

const deck = createDeck({
  // Coming back to slide 1 from another slide: hold it (and the controls) so the old slide exits normally,
  // then the intro plays again. Not with reduced motion.
  onBeforeChange(n, previous) {
    replayIntro = n === SLIDE.intro && previous !== null && previous !== SLIDE.intro && intro.canReplay();
    if (replayIntro) intro.hold();
  },
  onChange(n, element, previous) {
    if (replayIntro) {
      replayIntro = false;
      intro.play({ delay: 260 }); // after the exit transition of the previous slide (220 ms)
    }
    if (n === SLIDE.intro) startTyping(prefersReducedMotion());
    runCounts(element);
    // Preload each screenshot group one slide before it is shown.
    if (n === SLIDE.status || n === SLIDE.cases) screenshots.preload('cases');
    if (n === SLIDE.cases || n === SLIDE.health - 1 || n === SLIDE.health) screenshots.preload('health');
    if (n === SLIDE.demo) demo.activate();
    else demo.deactivate();
  },
});

initTheme();

// createDeck renders the slides, so the interactive parts are wired right after it.
initTabs();
demo = initDemoStepper();
screenshots = initScreenshots();
// Opening sequence: first open in the session, no slide number in the URL, motion allowed.
const intro = createIntro({
  onStage() {
    deck.replay();
    startTyping(false);
  },
  onEnd({ skipped }) {
    if (!skipped) return;
    deck.settle(); // skipped: slide 1 appears complete right away
    startTyping(true);
  },
});
const playIntro = intro.shouldPlay();
deck.start();
if (playIntro) intro.play();
else document.documentElement.classList.remove('intro-active', 'intro-bg', 'intro-stage', 'intro-chrome', 'intro-logo');

// The background aurora rests while the tab is hidden (it also pauses when the viewer is open, in CSS).
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('paused', document.hidden);
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest && e.target.closest('input,textarea')) return;
  const key = e.key.toLowerCase();
  if (key === 'f') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  } else if (key === 'i') {
    // Replay the opening sequence (to rehearse). From another slide, going to slide 1 replays it by itself.
    if (intro.isActive() || prefersReducedMotion()) return;
    if (deck.current() === SLIDE.intro) intro.play();
    else deck.go(SLIDE.intro);
  } else if (key === 'p') {
    window.open(import.meta.env.BASE_URL + 'presenter.html', 'genlab-presenter', 'width=1180,height=720');
  }
});
