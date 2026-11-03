import { defineConfig } from 'vite';

// VITE_BASE is the sub-path where the site lives (GitHub Pages: "/<repository>/"). Default "/".
// Two pages: the deck and the presenter window.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  build: {
    rollupOptions: {
      input: { main: 'index.html', presenter: 'presenter.html' },
    },
  },
});
