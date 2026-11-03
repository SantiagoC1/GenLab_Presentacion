// Splits the text of a heading into words wrapped in <span class="word"><span>…</span></span>
// so each word can slide up on its own. Keeps inline tags such as <em>.
export function splitWords(root) {
  let index = 0;
  (function walk(node) {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(' '));
            return;
          }
          const word = document.createElement('span');
          word.className = 'word';
          const inner = document.createElement('span');
          inner.textContent = part;
          inner.style.setProperty('--i', index++);
          word.appendChild(inner);
          fragment.appendChild(word);
        });
        node.replaceChild(fragment, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  })(root);
}
