import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { tableToBlock } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // The first single-cell row (no nested block/table) is the column count.
  // Every other row is a nested child block: a <table> when imported, or a
  // block div in the Universal Editor.
  const isItem = (row) => row.querySelector(':scope table')
    || [...row.children].some((c) => c.className && c.querySelector);
  const fieldRows = [];
  const itemRows = [];
  rows.forEach((row) => {
    if (isItem(row) && row.querySelector('table, [class]')) itemRows.push(row);
    else fieldRows.push(row);
  });

  // Fallback: if classification found no items, treat all-but-first as items.
  if (!itemRows.length && rows.length > 1) {
    fieldRows.length = 0;
    fieldRows.push(rows[0]);
    itemRows.push(...rows.slice(1));
  }

  const countRaw = innerCell(fieldRows[0])?.textContent?.trim();
  const count = ['2', '3', '4'].includes(countRaw) ? countRaw : String(itemRows.length || 2);
  const ratioRaw = innerCell(fieldRows[1])?.textContent?.trim().toLowerCase();
  const ratio = ['wide-narrow', 'narrow-wide'].includes(ratioRaw) ? ratioRaw : 'even';

  block.textContent = '';
  block.classList.add(`columns-stryker-${count}col`);
  if (count === '2' && ratio !== 'even') block.classList.add(`columns-stryker-${ratio}`);

  const grid = document.createElement('div');
  grid.className = 'columns-stryker-grid';
  block.append(grid);

  // Decorate/load each nested child block (EDS only auto-decorates top-level
  // blocks). Imported children arrive as a nested <table>.
  await Promise.all(itemRows.map(async (row) => {
    const table = row.querySelector(':scope table');
    let child;
    if (table) {
      child = tableToBlock(table);
    } else {
      // In the editor the cell already holds the child block div.
      child = innerCell(row).querySelector(':scope > [class]') || innerCell(row);
    }
    const col = document.createElement('div');
    col.className = 'columns-stryker-col';
    col.append(child);
    grid.append(col);
    decorateBlock(child);
    await loadBlock(child);
  }));
}
