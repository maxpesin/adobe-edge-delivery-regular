/* blocks/columns/columns.js */
/* eslint-env browser */
import { decorateBlocks, loadBlocks } from '../../scripts/aem.js';

export default async function decorate(block) {
  console.log("🚀 ~ COLUMNS decorate ~ block:", block)
  // how many columns in the first row (for styling hooks)
  const cols = [...(block.firstElementChild?.children || [])];
  console.log("🚀 ~ decorate ~ cols:", cols)
  if (cols.length) block.classList.add(`columns-${cols.length}-cols`);

  // tag rows/cols and mark image-only columns
  [...block.children].forEach((row) => {
    console.log("🚀 ~ decorate ~ row:", row)
    // optional hooks if you care in CSS
    row.classList.add('columns-row');

    [...row.children].forEach((col) => {
      col.classList.add('columns-col');

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is the only content in this column
          picWrapper.classList.add('columns-img-col');
        }
      }

      // IMPORTANT: allow real blocks inside columns
      // This will add the missing ".block" + data attributes to things like .image-link
      decorateBlocks(col);
    });
  });

  // load any nested blocks we just decorated
  const columns = [...block.querySelectorAll(':scope > div > div')];
  console.log("🚀 ~ decorate ~ columns:", columns)
  await Promise.all(columns.map((col) => loadBlocks(col)));
}
