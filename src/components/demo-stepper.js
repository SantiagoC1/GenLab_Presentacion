import { demoSteps } from '../content/demo-steps.js';
import { prefersReducedMotion, countUp, EASE } from '../motion.js';

const colorFor = (status) =>
  status === 200 ? 'var(--status-ok-fill)' : status === 401 ? 'var(--status-auth)' : status === 503 ? 'var(--status-info)' : 'var(--status-warn)';

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lineHtml = (html) => `<span class="out-line">${html || ' '}</span>`;

// Slide 9: ten clickable steps. On each step: request lines appear, the panel pulses ("sent"),
// the status code bounces in while counting, and the response is written line by line.
export function initDemoStepper() {
  const list = document.getElementById('demo-steps');
  const badge = document.getElementById('demo-badge');
  const type = document.getElementById('demo-type');
  const request = document.getElementById('demo-request');
  const response = document.getElementById('demo-response');
  const narration = document.getElementById('demo-narration');
  const pulse = document.getElementById('demo-pulse');

  let current = 0;
  let running = []; // things to cancel when the step changes: animations, timers, counters

  function cancelAll() {
    running.forEach((item) => (typeof item === 'function' ? item() : item.cancel()));
    running = [];
  }

  const play = (el, keyframes, options) => {
    const animation = el.animate(keyframes, { fill: 'backwards', easing: EASE, ...options });
    running.push(animation);
  };
  const fadeUp = [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }];

  function show(i, animate) {
    cancelAll();
    current = i;
    const step = demoSteps[i];
    [...list.children].forEach((b, j) => b.setAttribute('aria-current', j === i));

    const requestLines = ['<span class="tok-comment">// pedido</span>', ...step.request.split('\n').map(escapeHtml)];
    const responseLines = [
      '<span class="tok-comment">// respuesta</span>',
      ...step.response
        .split('\n')
        .map(escapeHtml)
        .map((l) => l.replace('{countdown}', `<span class="countdown">${step.countdown}</span>`)),
    ];
    request.innerHTML = requestLines.map(lineHtml).join('');
    response.innerHTML = responseLines.map(lineHtml).join('');
    badge.textContent = step.status;
    badge.style.background = colorFor(step.status);
    type.textContent = step.type ? 'tipo: ' + step.type : '';
    narration.textContent = step.narration;

    if (!animate || prefersReducedMotion()) return;

    // 1. request lines appear
    const requestEls = [...request.children];
    requestEls.forEach((el, k) => play(el, fadeUp, { duration: 220, delay: k * 70 }));
    const requestEnd = requestEls.length * 70 + 150;

    // 2. pulse on the panel border: "sent"
    play(pulse, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], { duration: 150, delay: requestEnd });

    // 3. status code bounces in and counts up
    const badgeAt = requestEnd + 150;
    play(
      badge,
      [
        { opacity: 0, transform: 'scale(.6)' },
        { opacity: 1, transform: 'scale(1.15)', offset: 0.6 },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: 350, delay: badgeAt, easing: 'cubic-bezier(.3,1.4,.4,1)' },
    );
    running.push(countUp(badge, step.status, { delay: badgeAt, duration: 400 }));
    play(type, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: badgeAt + 200 });

    // 4. response lines, then the narration
    const responseAt = badgeAt + 300;
    const responseEls = [...response.children];
    responseEls.forEach((el, k) => play(el, fadeUp, { duration: 220, delay: responseAt + k * 90 }));
    const responseEnd = responseAt + responseEls.length * 90 + 220;
    play(narration, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: responseEnd });

    // 5. real-time countdown (one tick per second) when the step has one
    if (step.countdown) {
      const counter = response.querySelector('.countdown');
      let left = step.countdown;
      const timeout = setTimeout(() => {
        const interval = setInterval(() => {
          left = Math.max(0, left - 1);
          counter.textContent = left;
          if (left === 0) clearInterval(interval);
        }, 1000);
        running.push(() => clearInterval(interval));
      }, responseEnd);
      running.push(() => clearTimeout(timeout));
    }
  }

  demoSteps.forEach((step, i) => {
    const button = document.createElement('button');
    button.className = 'step';
    button.innerHTML = '<i>' + (i + 1) + '</i><span>' + step.label + '</span>';
    button.onclick = () => show(i, true);
    list.appendChild(button);
  });
  show(0, false);

  let startTimer;
  return {
    // Slide 9 became visible: replay the current step once the slide transition is over.
    activate() {
      clearTimeout(startTimer);
      startTimer = setTimeout(() => show(current, true), 450);
    },
    // Slide 9 was left: stop timers (the countdown only runs while the step is on screen).
    deactivate() {
      clearTimeout(startTimer);
      cancelAll();
    },
  };
}
