import { decorateBlock, loadBlock } from '../../scripts/aem.js';

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

  // Decorate nested content blocks. Default content (headings, paragraphs,
  // images) is left as-is; anything whose first class names a block is loaded.
  await Promise.all([...block.children].map(async (child) => {
    const blockName = child.classList[0];
    if (blockName && !child.dataset.blockStatus) {
      decorateBlock(child);
      await loadBlock(child);
    }
  }));
}
