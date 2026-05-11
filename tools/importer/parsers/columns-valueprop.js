/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-valueprop
 * Base block: columns
 * Source: https://www.nextrow.com/b2b-marketing
 * Selector: section.section_result
 * Generated: 2026-05-11
 *
 * Structure: Two side-by-side value proposition columns.
 * Each column contains: decorative icon image + heading (h3) + paragraph text.
 * Source uses elementor inner-sections with elementor-col-50 layout.
 *
 * xwalk note: Columns blocks do NOT require field hint comments per hinting rules.
 */
export default function parse(element, { document }) {
  // Get the two top-level columns (elementor-col-50 direct children of the container)
  const topColumns = element.querySelectorAll(':scope > .elementor-container > .elementor-column.elementor-col-50');

  const cells = [];

  // Build one cell per column, each containing icon + heading + text
  const row = [];

  topColumns.forEach((col) => {
    const cellContent = [];

    // Extract icon image from the elementor-icon wrapper
    const iconImg = col.querySelector('.elementor-icon img, .elementor-icon-wrapper img');
    if (iconImg) {
      // Create a clean image element
      const img = document.createElement('img');
      img.src = iconImg.getAttribute('src') || '';
      if (iconImg.getAttribute('alt')) {
        img.alt = iconImg.getAttribute('alt');
      }
      cellContent.push(img);
    }

    // Extract heading (h3 within heading widget)
    const heading = col.querySelector('.elementor-widget-heading h3, .elementor-heading-title, h3');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      cellContent.push(h3);
    }

    // Extract paragraph text from text-editor widget
    const textWidget = col.querySelector('.elementor-widget-text-editor .elementor-widget-container');
    if (textWidget) {
      const p = document.createElement('p');
      p.textContent = textWidget.textContent.trim();
      cellContent.push(p);
    }

    row.push(cellContent);
  });

  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-valueprop', cells });
  element.replaceWith(block);
}
