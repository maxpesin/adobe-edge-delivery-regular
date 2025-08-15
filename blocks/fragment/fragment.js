/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import { decorateMain } from '../../scripts/scripts.js';
import { decorateBlocks, loadBlocks } from '../../scripts/aem.js';

/**
 * Loads a fragment shell (transformed to blocks) without hydrating them yet.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} A <main> containing decorated sections/blocks (not loaded)
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace(/(\.plain)?\.html/, '');
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          // eslint-disable-next-line no-param-reassign
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      // transform tables etc into blocks/sections, but do NOT load yet
      decorateMain(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (!fragment) return;

  // pick the first section inside the fetched fragment (mirror your original logic)
  const fragmentSection = fragment.querySelector(':scope .section') || fragment;

  // carry section-level classes onto this fragment wrapper
  if (fragmentSection !== fragment) {
    block.classList.add(...fragmentSection.classList);
  }
  block.classList.remove('section');

  // take children of the section and inject them into this block
  const nodes = [...fragmentSection.childNodes];

  // very important: ensure nested blocks will actually hydrate after injection
  nodes.forEach((n) => {
    if (n.nodeType === 1) {
      n.querySelectorAll?.('.block').forEach((b) => b.removeAttribute('data-block-status'));
      if (n.classList?.contains('block')) n.removeAttribute('data-block-status');
    }
  });

  block.replaceChildren(...nodes);

  // now hydrate only what we just injected
  decorateBlocks(block);
  await loadBlocks(block);
}
