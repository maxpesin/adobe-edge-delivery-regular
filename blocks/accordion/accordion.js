export default function decorate(block) {
  block.querySelectorAll(':scope > div').forEach((item) => {
    const header = item.querySelector('h1, h2, h3, h4, p');
    const body = item.querySelector('div[data-aue-prop="body"]');

    if (header && body) {
      header.classList.add('accordion-header');
      body.classList.add('accordion-body');
      body.style.display = 'none';

      header.addEventListener('click', () => {
        const expanded = body.style.display === 'block';
        body.style.display = expanded ? 'none' : 'block';
        header.classList.toggle('open', !expanded);
      });
    }
  });
}
