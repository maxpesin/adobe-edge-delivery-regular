import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* 
    block parameter name can be anything
    representing default html snippet we discuss above.
*/
export default function decorate(block) {
  /* change to ul, li */
  /* Create ul tag dynamically */
  const ul = document.createElement('ul');

  /* loop through all child rows */
  [...block.children].forEach((row) => {

    /* Create ul tag dynamically */
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    /* Wrap every child element within li tag */ 
    while (row.firstElementChild) li.append(row.firstElementChild);

    /* loop through all div tags within li tag */
    [...li.children].forEach((div) => {

      /* append class to picture and content parent div */
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
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
