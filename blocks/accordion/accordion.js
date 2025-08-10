export default function decorate(block) {
  console.log("🚀 ~ decorate ~ block:", block)
  
  block.querySelectorAll(':scope > div').forEach((item) => {
    console.log("🚀 ~ decorate ~ item:", item)
    // const header = item.querySelector('h1, h2, h3, h4, p');
    const body = item.querySelector('div[data-aue-prop="body"]');
    console.log("🚀 ~ decorate ~ body:", body)

    if (body) {
      // header.classList.add('accordion-header');
      body.classList.add('accordion-body');
      body.style.display = 'none';

      this.addEventListener('click', () => {
        const expanded = body.style.display === 'block';
        body.style.display = expanded ? 'none' : 'block';
        this.classList.toggle('open', !expanded);
      });
    }
  });
}
