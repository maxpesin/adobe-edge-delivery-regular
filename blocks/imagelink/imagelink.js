import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  if (!block.classList.contains('image-link')) return;

  const [first, second] = block.querySelectorAll(':scope > div');
  if (!first || !second) return;

  const picture = first.querySelector('picture');
  let link = second.querySelector('a');
  if (!picture || !link) return;

  // Optional: optimize the image (only if you actually want responsive sources)
  // const img = picture.querySelector('img');
  // if (img) {
  //   const optimized = createOptimizedPicture(img.src, img.alt);
  //   moveInstrumentation(img, optimized.querySelector('img'));
  //   picture.replaceWith(optimized);
  //   // re-select picture after replacement
  //   link = second.querySelector('a');
  // }

  // Wrap picture with the existing <a>, preserving any attrs on <a>.
  link.textContent = '';
  picture.parentNode.insertBefore(link, picture);
  link.appendChild(picture);

  // Optional: if the second div had any instrumentation attrs you care about,
  // move them onto the <a> before removing the div.
  moveInstrumentation(second, link, ['data-aue-resource','data-aue-type','data-aue-behavior','data-aue-label']);

  second.remove();
}
