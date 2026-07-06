function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Block-level fields are single-cell rows in model order (heading, theme).
  // Item rows are multi-cell (title, body) — whether flattened by the importer
  // or arriving as nested item block divs from the Universal Editor.
  let heading = '';
  const singleCellValues = [];
  const itemRows = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) itemRows.push(cells);
    else if (row.textContent.trim()) singleCellValues.push(row.textContent.trim());
  });

  if (singleCellValues.length) [heading] = singleCellValues;
  const theme = singleCellValues.slice(1).some((v) => /^plain$/i.test(v)) ? 'plain' : 'standard';

  block.textContent = '';
  block.classList.add(`accordion-stryker-${theme}`);

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'accordion-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  const list = document.createElement('div');
  list.className = 'accordion-stryker-list';

  itemRows.forEach((cells, i) => {
    const title = innerCell(cells[0])?.textContent?.trim();
    const bodyCell = cells[1];
    if (!title) return;

    const item = document.createElement('div');
    item.className = 'accordion-stryker-item';

    const id = `accordion-stryker-${i}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-stryker-trigger';
    button.id = `${id}-trigger`;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `${id}-panel`);

    const label = document.createElement('span');
    label.className = 'accordion-stryker-label';
    label.textContent = title;
    const icon = document.createElement('span');
    icon.className = 'accordion-stryker-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.append(label, icon);

    const panel = document.createElement('div');
    panel.className = 'accordion-stryker-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', `${id}-trigger`);
    panel.hidden = true;
    if (bodyCell?.innerHTML.trim()) panel.innerHTML = bodyCell.innerHTML;

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });

    item.append(button, panel);
    list.append(item);
  });

  if (list.children.length) block.append(list);
}
