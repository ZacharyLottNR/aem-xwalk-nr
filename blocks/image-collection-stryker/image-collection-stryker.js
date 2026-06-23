import { decorateBlock, loadBlock } from '../../scripts/aem.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Block-level fields render first: 0: heading highlight, 1: heading rest.
  // Remaining rows are nested image-gallery-item-stryker blocks.
  const headingHighlight = innerCell(rows[0])?.textContent?.trim() || '';
  const headingText = innerCell(rows[1])?.textContent?.trim() || '';
  const itemRows = rows.slice(2);

  block.textContent = '';

  if (headingHighlight || headingText) {
    const h2 = document.createElement('h2');
    h2.className = 'image-collection-stryker-heading';
    if (headingHighlight) {
      const hl = document.createElement('span');
      hl.className = 'image-collection-stryker-heading-highlight';
      hl.textContent = headingHighlight;
      h2.append(hl);
    }
    if (headingText) {
      if (headingHighlight) h2.append(document.createTextNode(' '));
      const rest = document.createElement('span');
      rest.className = 'image-collection-stryker-heading-text';
      rest.textContent = headingText;
      h2.append(rest);
    }
    block.append(h2);
  }

  const grid = document.createElement('div');
  grid.className = 'image-collection-stryker-grid';
  block.append(grid);

  // EDS only auto-decorates top-level blocks, so decorate/load each nested item.
  await Promise.all(itemRows.map(async (row) => {
    row.classList.add('image-gallery-item-stryker');
    grid.append(row);
    decorateBlock(row);
    await loadBlock(row);
  }));
}
