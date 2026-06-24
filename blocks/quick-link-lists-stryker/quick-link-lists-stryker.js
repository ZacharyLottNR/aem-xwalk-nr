export default function decorate(block) {
  const rows = [...block.children];

  let category = '';
  const linkRows = [];

  // Link rows contain an anchor (the URL field); the remaining text row is the
  // category name (block-level model field).
  rows.forEach((row) => {
    if (row.querySelector('a')) linkRows.push(row);
    else if (row.textContent.trim()) category = row.textContent.trim();
  });

  block.textContent = '';

  if (category) {
    const heading = document.createElement('h3');
    heading.className = 'quick-link-lists-stryker-category';
    heading.textContent = category;
    block.append(heading);
  }

  const list = document.createElement('ul');
  list.className = 'quick-link-lists-stryker-links';

  linkRows.forEach((row) => {
    const cells = [...row.children];
    const nameCell = cells[0];
    const urlCell = cells[1];
    const href = urlCell?.querySelector('a')?.href || urlCell?.textContent?.trim();
    const label = nameCell?.textContent?.trim();
    if (!href || !label) return;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'quick-link-lists-stryker-link';
    a.href = href;
    a.textContent = label;
    li.append(a);
    list.append(li);
  });

  block.append(list);
}
