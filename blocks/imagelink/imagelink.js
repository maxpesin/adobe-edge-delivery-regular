/* eslint-env browser */
export default function decorate(block) {
  // Only run for this block flavor
  if (!block.classList.contains('image-link')) return;

  // Expect exactly two top-level rows: [0] with picture, [1] with link
  const rows = [...block.querySelectorAll(':scope > div')];
  const first = rows[0];
  const second = rows[1];
  if (!first || !second) return;

  const picture = first.querySelector('picture');
  const link = second.querySelector('a');

  if (!picture || !link) {
    // If authoring forgot either piece, remove the orphan row to avoid random text blobs
    if (second && second.textContent.trim() === '') second.remove();
    return;
  }

  // If the picture is already wrapped, just update attrs from the editor-provided link
  if (picture.parentElement && picture.parentElement.tagName === 'A') {
    const existing = picture.parentElement;
    existing.href = link.href;
    if (link.title) existing.title = link.title;
    second.remove();
    return;
  }

  // Move the editor-provided <a> in front of the picture, then stuff the picture inside it
  // Don’t clone: keep any tracking/instrumentation attrs already on the <a>.
  link.textContent = ''; // no visible URL string inside the button image
  picture.parentNode.insertBefore(link, picture);
  link.appendChild(picture);

  // Kill the now-empty second row
  second.remove();
}
