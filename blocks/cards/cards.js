import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Helper: is this row/card empty?
  const isVisuallyEmpty = (el) => {
    // no picture/svg and no non-whitespace text
    const hasMedia = el.querySelector('picture,img,source,svg');
    const hasText = (el.textContent || '').trim().length > 0;
    return !hasMedia && !hasText;
  };

  // Use existing UL in authoring, or build one later
  let ul = block.querySelector(':scope > ul');
  const searchRoot = ul || block;

  // 0) Promote styles from crumb (even if empty) then remove its row
  const crumb = searchRoot.querySelector('[data-aue-prop="style"]');
  if (crumb) {
    const raw = (crumb.textContent || '').trim();
    raw.split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((cls) => block.classList.add(cls));

    if (ul) {
      const li = crumb.closest('li');
      if (li && li.parentElement === ul) li.remove();
    } else {
      let row = crumb;
      while (row && row.parentElement !== block) row = row.parentElement;
      if (row && row.parentElement === block) row.remove();
    }
  }

  // 1) Build UL only if one doesn’t exist
  if (!ul) {
    ul = document.createElement('ul');

    [...block.children].forEach((row) => {
      // skip any empty artifact rows
      if (isVisuallyEmpty(row)) return;

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
    // Clean up empty leading li that the editor leaves behind
    let first = ul.querySelector(':scope > li');
    while (first && isVisuallyEmpty(first)) {
      const next = first.nextElementSibling;
      first.remove();
      first = next;
    }

    // Normalize classnames for authoring shape
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

  // Optional: if you truly want a default style token when none chosen,
  // uncomment the next two lines. Otherwise keep CSS defaulting by absence of class.
  // if (![...block.classList].some(c => c.startsWith('cards-')))
  //   block.classList.add('cards--default');
}
