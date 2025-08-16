/* blocks/image-link/image-link.js */
/* eslint-env browser */
export default function decorate(block) {
  if (!block.classList.contains('image-link')) return;

  const [firstRow, secondRow] = block.querySelectorAll(':scope > div');
  if (!firstRow || !secondRow) return;

  const picture = firstRow.querySelector('picture');
  const link = secondRow.querySelector('a[href]');
  if (!picture || !link) {
    // nothing useful to do; nuke the empty link row if it has no content
    if (secondRow.textContent.trim() === '') secondRow.remove();
    return;
  }

  // If the picture is already wrapped, reuse that <a> and ditch the duplicate row.
  if (picture.parentElement && picture.parentElement.tagName === 'A') {
    const existingA = picture.parentElement;
    existingA.href = link.href;
    if (link.title) existingA.title = link.title;
    if (link.target) existingA.target = link.target;
    if (link.rel) existingA.rel = link.rel;
    secondRow.remove();
    return;
  }

  // Make the link wrap the picture and remove any leftover URL text
  link.textContent = '';
  picture.replaceWith(link);
  link.appendChild(picture);

  // Goodbye, second row
  secondRow.remove();
}
