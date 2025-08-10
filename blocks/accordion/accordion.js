export default function decorate(block) {
  console.log("🚀 ~ decorate ~ block:", block)
  
  // block.querySelectorAll(':scope > div').forEach((item) => {
    // console.log("🚀 ~ decorate ~ item:", item)
    // const header = item.querySelector('h1, h2, h3, h4, p');
    const body = 
      block.querySelector('div[data-aue-prop="body"]') ||
      block.querySelector(':scope > div:nth-of-type(2)');
    console.log("🚀 ~ decorate ~ body:", body)

    if (body) {
      // header.classList.add('accordion-header');
      body.classList.add('accordion-body');
      body.style.display = 'none';

      block.addEventListener('click', () => {
        const expanded = body.style.display === 'block';
        body.style.display = expanded ? 'none' : 'block';
        block.classList.toggle('open', !expanded);
      });
    }
  // });
}
