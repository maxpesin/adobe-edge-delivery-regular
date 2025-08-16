import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // If authoring wrapped rows in a UL already, reuse it.
  let ul = block.querySelector(':scope > ul');
  const searchRoot = ul || block;

  // 0) Promote styles from crumb and remove ONLY that row.
  const crumb = searchRoot.querySelector('[data-aue-prop="style"]');
  if (crumb) {
    const raw = (crumb.textContent || '').trim();
    raw.split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((cls) => block.classList.add(cls));

    if (ul) {
      const crumbLi = crumb.closest('li');
      if (crumbLi && crumbLi.parentElement === ul) crumbLi.remove();
    } else {
      let row = crumb;
      while (row && row.parentElement !== block) row = row.parentElement;
      if (row && row.parentElement === block) row.remove();
    }
  }

  // 1) Build UL only for published shape. In authoring, DO NOT rebuild
  // or you’ll lose the “add card” stub.
  if (!ul) {
    ul = document.createElement('ul');

    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      moveInstrumentation(row, li); // carry authoring markers if any

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
    // Normalize classes for authoring shape without deleting anything.
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

  // 2) Optimize pictures. Preserve instrumentation on <picture>, not just <img>.
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const oldPic = img.closest('picture');
    const newPic = optimized;

    // move any authoring attrs
    moveInstrumentation(img, newPic.querySelector('img'));
    moveInstrumentation(oldPic, newPic);

    oldPic.replaceWith(newPic);
  });
}
