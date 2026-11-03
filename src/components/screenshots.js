import { openViewer } from './viewer.js';

// Slides 6 and 8: every [data-shot] button loads public/screenshots/<code>.png.
// If the file does not exist the "Pegar captura" placeholder stays and the button stays disabled.
export function initScreenshots() {
  const items = [...document.querySelectorAll('[data-shot]')].map((button) => ({
    button,
    group: button.dataset.group,
    alt: button.dataset.alt,
    caption: button.closest('figure')?.querySelector('figcaption')?.textContent || '',
    src: import.meta.env.BASE_URL + 'screenshots/' + button.dataset.code + '.png',
    started: false,
    img: null,
  }));

  items.forEach((item) => {
    item.button.onclick = () => {
      const loaded = items.filter((it) => it.group === item.group && it.img);
      openViewer(loaded, loaded.indexOf(item));
    };
  });

  function load(item) {
    item.started = true;
    const img = new Image();
    img.alt = item.alt;
    img.decoding = 'async';
    img.onload = () => {
      item.img = img;
      item.button.appendChild(img);
      item.button.classList.add('has-image');
      item.button.disabled = false;
    };
    img.src = item.src;
  }

  return {
    // Called when the slide before the group is shown, so the images are ready (no flicker).
    preload(group) {
      items.filter((it) => it.group === group && !it.started).forEach(load);
    },
  };
}
