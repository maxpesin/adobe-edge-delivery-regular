import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Reuse authoring UL if present; otherwise we'll build one for published shape.
  let ul = block.querySelector(':scope > ul');
  const searchRoot = ul || block;

  // Helper: visually empty means no media and no non-whitespace text.
  const isVisuallyEmpty = (el) => {
    if (!el) return true;
    const hasMedia = el.querySelector('picture,img,source,svg,video,iframe');
    const hasText = (el.textContent || '').trim().length > 0;
    return !hasMedia && !hasText;
  };

  // 0) Promote block-level styles from the crumb and remove ONLY that row.
  const crumb = searchRoot.querySelector('[data-aue-prop="style"]');
  if (crumb) {
    const raw = (crumb.textContent || '').trim();
    raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((cls) => block.classList.add(cls));

    // Remove the row containing the crumb, respecting authoring vs published shapes.
    if (ul) {
      const crumbLi = crumb.closest('li');
      if (crumbLi && crumbLi.parentElement === ul) crumbLi.remove();
    } else {
      let row = crumb;
      while (row && row.parentElement !== block) row = row.parentElement;
      if (row && row.parentElement === block) row.remove();
    }
  }

  // 0.5) If we're in authoring shape (UL exists) and there's NO crumb,
  // remove the leading placeholder <li> ONLY when real cards follow it.
  if (ul && !crumb) {
    const lis = [...ul.querySelectorAll(':scope > li')];
    const hasRealAfter = lis.slice(1).some((li) => !isVisuallyEmpty(li));
    if (lis.length > 1 && isVisuallyEmpty(lis[0]) && hasRealAfter) {
      lis[0].remove();
    }
  }

  // 1) Build UL only in published shape; do not rebuild in authoring or you lose the add-card stub.
  if (!ul) {
    ul = document.createElement('ul');

    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      moveInstrumentation(row, li);

      while (row.firstElementChild) li.append(row.firstElementChild);

      // Classify immediate child divs
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
        } else {
          div.className = 'cards-card-body';
        }
      });

      ul.append(li);
    });

    // Clear old shape and append normalized UL.
    block.textContent = '';
    block.append(ul);
  } else {
    // Normalize authoring shape without destroying anything the editor needs.
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

  // 2) Optimize pictures, carrying instrumentation from both <picture> and <img>.
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const oldPic = img.closest('picture');
    const newPic = optimized;
    const newImg = newPic.querySelector('img');

    moveInstrumentation(img, newImg);
    moveInstrumentation(oldPic, newPic);

    oldPic.replaceWith(newPic);
  });
}
