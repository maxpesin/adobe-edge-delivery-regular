/* blocks/image-link/image-link.js */
/* eslint-env browser */
export default function decorate(block) {
  console.log("🚀 ~ decorate ~ block:", block)
  if (!block.classList.contains('image-link')) return;
  

  const [firstRow, secondRow] = block.querySelectorAll(':scope > div');
  console.log("🚀 ~ decorate ~ secondRow:", secondRow)
  console.log("🚀 ~ decorate ~ firstRow:", firstRow)
  if (!firstRow || !secondRow) return;

  const picture = firstRow.querySelector('picture');
  console.log("🚀 ~ decorate ~ picture:", picture)
  const link = secondRow.querySelector('a[href]');
  console.log("🚀 ~ decorate ~ link:", link)
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
