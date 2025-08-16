import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  let ul = block.querySelector(':scope > ul');

  const parseTokens = (txt) => (txt || '')
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    // keep only class-safe tokens to avoid garbage
    .filter((s) => /^[A-Za-z_][\w-]*$/.test(s));

  const addClasses = (tokens) => {
    [...new Set(tokens)].forEach((cls) => block.classList.add(cls));
  };

  // 0) Single source of truth: first row/LI holds default "cards-block" and friends
  const sourceRow = ul
    ? ul.querySelector(':scope > li')
    : block.firstElementChild;

  if (sourceRow) {
    const tokens = parseTokens(sourceRow.textContent);
    if (tokens.length) addClasses(tokens);
    sourceRow.remove();
  }

  // 1) Build UL only if it doesn't already exist
  if (!ul) {
    ul = document.createElement('ul');

    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      moveInstrumentation(row, li);

      while (row.firstElementChild) li.append(row.firstElementChild);

      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
        } else {
          div.className = 'cards-card-body';
        }
      });

      ul.append(li);
    });

    block.textContent = '';
    block.append(ul);
  } else {
    // Ensure authoring shape gets the same classnames
    ul.querySelectorAll(':scope > li').forEach((li) => {
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.classList.add('cards-card-image');
        } else {
          div.classList.add('cards-card-body');
        }
      });
    });
  }

  // 2) Optimize pictures
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}
