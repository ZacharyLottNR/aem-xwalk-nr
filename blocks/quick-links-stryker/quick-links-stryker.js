export default function decorate(block) {
  // Single richtext field holds the whole quick-links body: a series of
  // category headings (h2-h4 or bold paragraphs) each followed by a <ul> of
  // links. Authored flat (no nested blocks) so it round-trips through JCR.
  const source = block.querySelector(':scope > div > div') || block.querySelector(':scope > div') || block;
  const nodes = [...source.children];

  block.textContent = '';

  const heading = document.createElement('h2');
  heading.className = 'quick-links-stryker-heading';
  heading.textContent = 'Quick links';

  const grid = document.createElement('div');
  grid.className = 'quick-links-stryker-grid';

  const isHeading = (el) => el && (/^H[1-6]$/.test(el.tagName)
    || (el.tagName === 'P' && el.querySelector(':scope > strong')
        && el.textContent.trim() === el.querySelector(':scope > strong').textContent.trim()));

  let currentCol = null;

  nodes.forEach((node) => {
    if (isHeading(node)) {
      currentCol = document.createElement('div');
      currentCol.className = 'quick-links-stryker-col';
      const cat = document.createElement('h3');
      cat.className = 'quick-links-stryker-category';
      cat.textContent = node.textContent.trim();
      currentCol.append(cat);
      grid.append(currentCol);
    } else if (node.tagName === 'UL' || node.tagName === 'OL') {
      if (!currentCol) {
        currentCol = document.createElement('div');
        currentCol.className = 'quick-links-stryker-col';
        grid.append(currentCol);
      }
      const list = document.createElement('ul');
      list.className = 'quick-links-stryker-links';
      [...node.querySelectorAll(':scope > li')].forEach((li) => {
        const a = li.querySelector('a');
        if (a) a.classList.add('quick-links-stryker-link');
        list.append(li);
      });
      currentCol.append(list);
    }
  });

  block.append(heading);
  if (grid.children.length) block.append(grid);
}
