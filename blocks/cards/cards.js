import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* 
    block parameter name can be anything
    representing default html snippet we discuss above.
*/
export default function decorate(block) {
  // 0) Promote block-level styles/classes from the authoring crumb row, then remove that row.
  // 0) Always treat the first row as the crumb row
  const firstRow = block.firstElementChild;

  if (firstRow) {
    const crumb = firstRow.querySelector('[data-aue-prop="style"]');
    if (crumb) {
      const raw = (crumb.textContent || '').trim();
      raw.split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((cls) => block.classList.add(cls));
    }
    // Remove the first row unconditionally, even if no styles were found
    firstRow.remove();
  }

  // 1) Build UL/LI structure from remaining rows
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    while (row.firstElementChild) li.append(row.firstElementChild);

    // classify child divs
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    /* append li to ul*/
    ul.append(li);
  });

    // 2) If the first li's body has no children, remove that li
  // const firstLi = ul.querySelector(':scope > li');
  // if (firstLi) {
  //   const firstBody = firstLi.querySelector(':scope > .cards-card-body');
  //   if (firstBody && firstBody.children.length === 0) {
  //     firstLi.remove();
  //   }
  // }
  
  /* get all img tags within ul and update properties*/
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // make block empty to removed ealier html code or structure.
  block.textContent = '';

  // append brand new updated HTML structure having ul and li's tags.
  block.append(ul);
}
