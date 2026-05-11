/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-partner
 * Base block: cards
 * Source: https://www.nextrow.com/partners
 * Generated: 2026-05-11
 *
 * Extracts partner capability cards from a grid of gt3-core-imagebox elements.
 * Each card produces a row with 2 columns: image | text (heading).
 * xwalk container block: each child item = one row with image + text fields.
 */
export default function parse(element, { document }) {
  // Find all imagebox widgets - these are the repeating card items
  const imageboxItems = element.querySelectorAll('.elementor-widget-gt3-core-imagebox');

  const cells = [];

  imageboxItems.forEach((item) => {
    // Extract image if present (logo/icon within the imagebox)
    const img = item.querySelector('.gt3-core-imagebox-img img, .gt3-core-imagebox-icon img, img');

    // Extract heading from the title area - h5 contains the link for semantics
    const heading = item.querySelector('div.gt3-core-imagebox-title > h5, h5.gt3-core-imagebox-title, h5, h4, h3');

    // Skip items that have no meaningful content
    if (!heading) return;

    // Build image cell with field hint (only add hint if image exists)
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Build text cell with field hint
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textCell.appendChild(heading);

    // Each card = one row with [image, text] columns
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-partner', cells });
  element.replaceWith(block);
}
