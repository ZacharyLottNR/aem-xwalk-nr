import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { tableToBlock } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

// A tab is a thin wrapper: it exposes its name to the parent container and
// decorates any nested blocks in its content. The parent moves the content
// into the matching tab panel.
export default async function decorate(block) {
  const rows = [...block.children];

  // First row is the tab name (block-level model field).
  const name = innerCell(rows[0])?.textContent?.trim() || '';
  block.dataset.tabName = name;
  rows[0]?.remove();

  // Imported nested content blocks arrive as <table> elements; convert them to
  // block divs so they decorate. Default content (headings, paragraphs, images)
  // is left as-is.
  [...block.children].forEach((child) => {
    const table = child.querySelector(':scope table') || (child.tagName === 'TABLE' ? child : null);
    if (table) child.replaceWith(tableToBlock(table));
  });

  // Decorate nested content blocks; anything whose first class names a block.
  await Promise.all([...block.children].map(async (child) => {
    const blockName = child.classList[0];
    if (blockName && !child.dataset.blockStatus) {
      decorateBlock(child);
      await loadBlock(child);
    }
  }));
}
