import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const heading = document.createElement('h2');
  heading.className = 'quick-links-stryker-heading';
  heading.textContent = 'Quick links';

  const grid = document.createElement('div');
  grid.className = 'quick-links-stryker-grid';

  // Each row is a nested quick-link-lists-stryker block. EDS only auto-decorates
  // top-level blocks, so decorate and load each nested block here.
  const nested = [...block.children];
  block.textContent = '';
  block.append(heading, grid);

  await Promise.all(nested.map(async (row) => {
    row.classList.add('quick-link-lists-stryker');
    grid.append(row);
    decorateBlock(row);
    await loadBlock(row);
  }));
}
