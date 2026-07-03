export default function decorate(block) {
  const rows = [...block.children];

  let heading = 'Quick links';
  let theme = 'default';
  const itemRows = [];
  const singleCellValues = [];

  // Item rows have two cells (linkLabel, linkUrl) or contain a link. The block
  // also has single-cell rows for the model's text fields (heading, theme) in
  // order; collect those separately so we can assign them.
  rows.forEach((row) => {
    const cells = [...row.children];
    const hasLink = row.querySelector('a');
    if (cells.length >= 2 || hasLink) {
      itemRows.push(row);
    } else if (row.textContent.trim()) {
      singleCellValues.push(row.textContent.trim());
    }
  });

  // First single-cell value is the heading; a later value naming a theme sets it.
  if (singleCellValues.length) [heading] = singleCellValues;
  singleCellValues.slice(1).forEach((v) => {
    if (/^columned$/i.test(v)) theme = 'columned';
    else if (/^default$/i.test(v)) theme = 'default';
  });

  block.textContent = '';
  block.classList.add(`quick-links-stryker-${theme}`);

  const h = document.createElement('h2');
  h.className = 'quick-links-stryker-heading';
  h.textContent = heading;
  block.append(h);

  const grid = document.createElement('div');
  grid.className = 'quick-links-stryker-grid';

  // Columned theme: a single flat list of links that CSS flows into columns.
  if (theme === 'columned') {
    const list = document.createElement('ul');
    list.className = 'quick-links-stryker-links';
    itemRows.forEach((row) => {
      const cells = [...row.children];
      const label = cells[0]?.textContent?.trim() || '';
      const urlCell = cells[1];
      const href = urlCell?.querySelector('a')?.href || urlCell?.textContent?.trim() || '';
      if (!label || !href) return; // skip header / blank-URL rows in this theme
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'quick-links-stryker-link';
      a.href = href;
      a.textContent = label;
      li.append(a);
      list.append(li);
    });
    grid.append(list);
    if (list.children.length) block.append(grid);
    return;
  }

  // Default theme: header items (blank URL) start a new category column.
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
