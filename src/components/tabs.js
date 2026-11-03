import { responseTypes } from '../content/response-types.js';

// Slide 4: tabs that change the response type shown in the JSON and the example.
export function initTabs() {
  const tablist = document.getElementById('type-tabs');
  const typeValue = document.getElementById('type-value');
  const question = document.getElementById('type-question');
  const description = document.getElementById('type-description');

  const buttons = responseTypes.map(([type]) => {
    const button = document.createElement('button');
    button.className = 'tab';
    button.setAttribute('role', 'tab');
    button.textContent = type;
    tablist.appendChild(button);
    return button;
  });

  function select(k) {
    buttons.forEach((b, i) => b.setAttribute('aria-selected', i === k));
    typeValue.textContent = '"' + responseTypes[k][0] + '"';
    question.textContent = responseTypes[k][1];
    description.textContent = responseTypes[k][2];
  }

  buttons.forEach((b, i) => (b.onclick = () => select(i)));
  select(0);
}
