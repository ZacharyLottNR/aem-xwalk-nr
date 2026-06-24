export default function decorate(block) {
  const rows = [...block.children];

  let heading = 'Quick links';
  const itemRows = [];

  // The parent block has a single-cell heading row; item rows have two cells
  // (linkLabel, linkUrl). A blank URL marks a column header.
  rows.forEach((row) => {
    const cells = [...row.children];
    const hasLink = row.querySelector('a');
    if (cells.length >= 2 || hasLink) {
      itemRows.push(row);
    } else if (row.textContent.trim()) {
      heading = row.textContent.trim();
    }
  });

  block.textContent = '';

  const h = document.createElement('h2');
  h.className = 'quick-links-stryker-heading';
  h.textContent = heading;
  block.append(h);

  const grid = document.createElement('div');
  grid.className = 'quick-links-stryker-grid';

  let currentCol = null;
  let currentList = null;

  const newColumn = (label) => {
    currentCol = document.createElement('div');
    currentCol.className = 'quick-links-stryker-col';
    if (label) {
      const cat = document.createElement('h3');
      cat.className = 'quick-links-stryker-category';
      cat.textContent = label;
      currentCol.append(cat);
    }
    currentList = document.createElement('ul');
    currentList.className = 'quick-links-stryker-links';
    currentCol.append(currentList);
    grid.append(currentCol);
  };

  itemRows.forEach((row) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent?.trim() || '';
    const urlCell = cells[1];
    const href = urlCell?.querySelector('a')?.href || urlCell?.textContent?.trim() || '';

    if (!label) return;

    if (!href) {
      // Header item (no URL): starts a new column.
      newColumn(label);
      return;
    }

    if (!currentCol) newColumn('');

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'quick-links-stryker-link';
    a.href = href;
    a.textContent = label;
    li.append(a);
    currentList.append(li);
  });

  if (grid.children.length) block.append(grid);
}
