import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/figtree';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/animations.css';
import './styles/slides.css';
import './styles/presenter.css';

import { slides } from './content/slides.js';
import { createSlideElement } from './deck.js';
import { initTheme } from './theme.js';

initTheme();

// Presenter window: notes, timer and a preview of the next slide.
// It follows the deck through a BroadcastChannel and can also drive it.
const channel = new BroadcastChannel('genlab-deck');
const $ = (id) => document.getElementById(id);
let current = 0;

const preview = $('p-preview');
const stage = document.createElement('div');
stage.className = 'preview-stage';
preview.appendChild(stage);

function scalePreview() {
  stage.style.transform = `scale(${preview.clientWidth / 1280})`;
}
new ResizeObserver(scalePreview).observe(preview);

function render(index) {
  current = index;
  const slide = slides[index];
  $('p-position').textContent = `Diapositiva ${index + 1} de ${slides.length}` + (slide.minutes ? ` · ${String(slide.minutes).replace('.', ',')} min` : '');
  $('p-title').textContent = slide.title;
  $('p-notes').textContent = slide.notes || '(sin notas)';

  stage.innerHTML = '';
  const next = slides[index + 1];
  if (next) {
    const el = createSlideElement(next);
    el.classList.add('on');
    stage.appendChild(el);
    $('p-next-title').textContent = next.title;
  } else {
    $('p-next-title').textContent = 'Fin de la presentación';
  }
  scalePreview();
}

const goTo = (index) => channel.postMessage({ type: 'goto', index });
channel.onmessage = (event) => {
  if (event.data.type === 'slide') render(event.data.index);
};
$('p-prev').onclick = () => goTo(current - 1);
$('p-next').onclick = () => goTo(current + 1);
document.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
    e.preventDefault();
    goTo(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
    e.preventDefault();
    goTo(current - 1);
  }
});

// Timer
let seconds = 0;
let running = true;
const pad = (n) => String(n).padStart(2, '0');
const clock = (total) => `${pad(Math.floor(total / 60))}:${pad(Math.round(total % 60))}`;
// Planned time: the sum of `minutes` over all slides (18.5 min = 18:30).
const plannedSeconds = slides.reduce((sum, slide) => sum + (slide.minutes || 0), 0) * 60;
$('p-timer-target').textContent = plannedSeconds ? `/ ${clock(plannedSeconds)}` : '';
const paintTimer = () => {
  $('p-timer').textContent = clock(seconds);
  $('p-timer').classList.toggle('over', plannedSeconds > 0 && seconds > plannedSeconds);
};
setInterval(() => {
  if (running) {
    seconds++;
    paintTimer();
  }
}, 1000);
$('p-timer-toggle').onclick = (e) => {
  running = !running;
  e.target.textContent = running ? 'Pausar' : 'Reanudar';
};
$('p-timer-reset').onclick = () => {
  seconds = 0;
  paintTimer();
};

render(0);
channel.postMessage({ type: 'hello' });
