import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // If authoring wrapped rows in a UL already, use it
  let ul = block.querySelector(':scope > ul');
  const searchRoot = ul || block;

  // 0) Promote styles from crumb, then remove the crumb row
  const crumb = searchRoot.querySelector('[data-aue-prop="style"]');
  if (crumb) {
    const raw = (crumb.textContent || '').trim();
    raw.split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((cls) => block.classList.add(cls));

    // Remove the row that contains the crumb
    if (ul) {
      const li = crumb.closest('li');
      if (li && li.parentElement === ul) li.remove();
    } else {
      let row = crumb;
      while (row && row.parentElement !== block) row = row.parentElement;
      if (row && row.parentElement === block) row.remove();
    }
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
