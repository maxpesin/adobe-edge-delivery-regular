/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
  decorateBlocks,
  loadBlocks,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
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

      // transform tables to sections/blocks (same as before)
      decorateMain(main);

      // keep your original behavior: load off-DOM
      await loadSections(main);

      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section') || fragment;

    // carry section-level classes to this fragment wrapper
    if (fragmentSection !== fragment) {
      block.classList.add(...fragmentSection.classList);
    }

    // this block is not a section, so nuke stray 'section' if present
    block.classList.remove('section');

    // move content into this block
    const nodes = [...fragmentSection.childNodes];
    block.replaceChildren(...nodes);

    // IMPORTANT: re-enable hydration for nested blocks you just injected
    block.querySelectorAll('.block').forEach((b) => {
      b.removeAttribute('data-block-status'); // kill stale "loaded"
    });

    // hydrate only this subtree so cards.js runs
    decorateBlocks(block);
    await loadBlocks(block);
  }
}
