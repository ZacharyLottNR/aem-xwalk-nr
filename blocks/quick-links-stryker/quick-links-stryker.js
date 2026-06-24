import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { resolveNestedBlocks } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // Resolve nested child blocks (handles both UE block divs and imported tables).
  const nested = resolveNestedBlocks(block, 'quick-link-lists-stryker');

  const heading = document.createElement('h2');
  heading.className = 'quick-links-stryker-heading';
  heading.textContent = 'Quick links';

  const grid = document.createElement('div');
  grid.className = 'quick-links-stryker-grid';

  block.textContent = '';
  block.append(heading, grid);

  // EDS only auto-decorates top-level blocks, so decorate/load each nested block.
  await Promise.all(nested.map(async (row) => {
    grid.append(row);
    decorateBlock(row);
    await loadBlock(row);
  }));
}
