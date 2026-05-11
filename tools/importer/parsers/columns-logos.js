/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-logos
 * Base block: columns
 * Source: https://www.nextrow.com/
 * Structure: Single row with 5 columns, each containing a client logo image
 * Generated: 2026-05-11
 *
 * Columns block (xwalk): No field hints required per hinting rules.
 * Extracts logo images from elementor-col-20 columns into a single-row columns block.
 */
export default function parse(element, { document }) {
  // Extract all logo images from the inner columns (elementor-col-20 divs)
  // Each column contains exactly one img element inside nested widget containers
  const logoImages = element.querySelectorAll('.elementor-col-20 .elementor-widget-image img');

  // Build cells: single row with each logo image as a separate column cell
  // Standard columns block structure: one row, N cells = N columns
  const cells = [];
  const row = [];

  logoImages.forEach((img) => {
    row.push(img);
  });

  // If no images found via primary selector, try fallback
  if (row.length === 0) {
    const fallbackImages = element.querySelectorAll('.elementor-widget-container img[alt]');
    fallbackImages.forEach((img) => {
      row.push(img);
    });
  }

  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-logos', cells });
  element.replaceWith(block);
}
