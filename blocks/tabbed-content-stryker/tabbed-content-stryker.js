import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { resolveNestedBlocks } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Block-level fields render first as single-cell rows; item sub-blocks arrive
  // as an imported nested <table> (or an item block div in the Universal
  // Editor). Split them apart before resolving the items.
  const isItem = (row) => row.querySelector(':scope table, :scope picture, :scope img')
    || row.classList.contains('tabbed-content-item-stryker')
    || row.children.length > 1;
  const fieldRows = [];
  const itemRows = [];
  rows.forEach((row) => (isItem(row) ? itemRows : fieldRows).push(row));

  const heading = innerCell(fieldRows[0])?.textContent?.trim() || '';

  // Normalize item rows into item block divs (converts imported tables).
  const container = document.createElement('div');
  itemRows.forEach((row) => container.append(row));
  const itemBlocks = resolveNestedBlocks(container, 'tabbed-content-item-stryker');

  // First cell of each item is its tab name; read it, then strip it so the item
  // only decorates its own content (image/text/link or video).
  const items = itemBlocks.map((el) => {
    const firstRow = el.children[0];
    const tabName = innerCell(firstRow)?.textContent?.trim() || '';
    firstRow?.remove();
    return { el, tabName };
  }).filter((it) => it.tabName);

  await Promise.all(items.map(async ({ el }) => {
    decorateBlock(el);
    await loadBlock(el);
  }));

  block.textContent = '';

  if (!items.length) return;

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'tabbed-content-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  // Preserve first-seen order of tab names while grouping items under each.
  const order = [];
  const groups = new Map();
  items.forEach((it) => {
    if (!groups.has(it.tabName)) {
      groups.set(it.tabName, []);
      order.push(it.tabName);
    }
    groups.get(it.tabName).push(it.el);
  });

  const tablist = document.createElement('div');
  tablist.className = 'tabbed-content-stryker-tablist';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabbed-content-stryker-panels';

  order.forEach((tabName, i) => {
    const id = `tabbed-content-stryker-${i}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabbed-content-stryker-tab';
    button.textContent = tabName;
    button.setAttribute('role', 'tab');
    button.id = `${id}-tab`;
    button.setAttribute('aria-controls', `${id}-panel`);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) button.classList.add('is-active');

    const panel = document.createElement('div');
    panel.className = 'tabbed-content-stryker-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    panel.hidden = i !== 0;
    groups.get(tabName).forEach((el) => panel.append(el));

    button.addEventListener('click', () => {
      tablist.querySelectorAll('.tabbed-content-stryker-tab').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.querySelectorAll('.tabbed-content-stryker-panel').forEach((p) => {
        p.hidden = true;
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
      panel.hidden = false;
    });

    tablist.append(button);
    panels.append(panel);
  });

  block.append(tablist, panels);
}
