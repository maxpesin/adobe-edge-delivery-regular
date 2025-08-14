import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* 
    block parameter name can be anything
    representing default html snippet we discuss above.
*/
export default function decorate(block) {
  // 0) Promote block-level styles/classes from the authoring crumb row, then remove that row.
  const crumb = block.querySelector('[data-aue-prop="style"]');
  console.log("🚀 ~ decorate ~ crumb:", crumb)
  if (crumb) {
    const raw = (crumb.textContent || '').trim();
    const tokens = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    console.log("🚀 ~ decorate ~ tokens:", tokens)
    tokens.forEach(cls => block.classList.add(cls));

    // remove the top-level row that contains the crumb, before we rebuild the UL
    let row = crumb;
    while (row && row.parentElement !== block) row = row.parentElement;
    if (row && row.parentElement === block) row.remove();
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
