// Dark is the default theme and never follows the system setting (the deck is projected).
// The T key switches between dark and light; the choice is saved in localStorage.
// The matching early script in index.html / presenter.html avoids a flash on load.
const KEY = 'genlab-theme';
const root = document.documentElement;

function apply(theme) {
  root.dataset.theme = theme === 'light' ? 'light' : 'dark';
}

export function toggleTheme() {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  apply(next);
  try {
    localStorage.setItem(KEY, next);
  } catch (e) {}
}

export function initTheme() {
  try {
    apply(localStorage.getItem(KEY));
  } catch (e) {
    apply('dark');
  }
  // Keeps the presenter window and the deck on the same theme.
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) apply(e.newValue);
  });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key.toLowerCase() === 't') toggleTheme();
  });
}
