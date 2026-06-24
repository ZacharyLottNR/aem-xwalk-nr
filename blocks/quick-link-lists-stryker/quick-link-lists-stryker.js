export default function decorate(block) {
  const rows = [...block.children];

  let category = '';
  const linkRows = [];
  let manualList = null;

  // Classify rows: an authored manual list (a <ul>/<ol> with no surrounding
  // anchor-cell pairs) takes precedence; otherwise link rows carry the URL
  // field and the remaining text row is the category name.
  rows.forEach((row) => {
    const cells = [...row.children];
    const listEl = row.querySelector(':scope ul, :scope ol');
    // A manual-list row is a single cell that wraps a list element.
    if (listEl && cells.length <= 1 && !row.querySelector(':scope > div > div')) {
      manualList = listEl;
    } else if (row.querySelector('a')) {
      linkRows.push(row);
    } else if (row.textContent.trim()) {
      category = row.textContent.trim();
    }
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

  if (manualList) {
    // Manual authored list: reuse its <li> items, styling their links.
    [...manualList.querySelectorAll(':scope > li')].forEach((li) => {
      const a = li.querySelector('a');
      if (a) a.classList.add('quick-link-lists-stryker-link');
      list.append(li);
    });
  } else {
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
  }

  block.append(list);
}
