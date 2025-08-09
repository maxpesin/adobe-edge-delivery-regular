import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  // Read authored values from the block table (Label | Value rows)
  const cfg = readBlockConfig(block) || {};

  // Normalize values
  const href = Array.isArray(cfg.link) ? cfg.link[0] : (cfg.link || '');
  const text = (cfg.linkText || '').trim();
  const title = (cfg.linkTitle || text || '').trim();
  const typeClass = (cfg.linkType || '').trim();

  // style (multiselect) can come as array or comma-delimited string
  const styleRaw = cfg.style ?? [];
  const styleClasses = Array.isArray(styleRaw)
    ? styleRaw
    : String(styleRaw).split(',').map((s) => s.trim()).filter(Boolean);

  // Build markup
  block.textContent = '';
  const wrapper = document.createElement('p');
  wrapper.classList.add('button-container');

  const a = document.createElement('a');
  if (href) a.href = href;
  a.textContent = text || 'Learn more';
  if (title) a.title = title;

  // Base + linkType + multiselect styles
  a.classList.add('button');
  if (typeClass) a.classList.add(typeClass);
  styleClasses.forEach((cls) => cls && a.classList.add(cls));

  wrapper.append(a);
  block.append(wrapper);
}
