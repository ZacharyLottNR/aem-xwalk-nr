/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-stats
 * Base block: columns
 * Source: https://www.nextrow.com/quiptag
 * Selector: section.elementor-element-5726251c
 * Generated: 2026-05-11
 *
 * Structure: Statistics/results section with three stat images in equal columns
 * (elementor-col-33 inner-section). Section also contains heading (h2),
 * description paragraph, sub-heading (h3), and a CTA button.
 *
 * Output: A columns block with three cells (one stat image per cell).
 * Heading, sub-heading, description, and CTA are included as additional rows.
 *
 * xwalk note: Columns blocks do NOT require field hint comments per hinting rules.
 */
export default function parse(element, { document }) {
  // Extract heading (h2)
  const heading = element.querySelector('.elementor-widget-heading h2, h2.elementor-heading-title');

  // Extract description text
  const descWidget = element.querySelector('.elementor-widget-text-editor .elementor-widget-container');

  // Extract sub-heading (h3)
  const subHeading = element.querySelector('.elementor-widget-heading h3, h3.elementor-heading-title');

  // Extract the three stat columns from the inner section
  const statColumns = element.querySelectorAll('.elementor-inner-section .elementor-col-33');

  // Extract CTA link
  const ctaLink = element.querySelector('.elementor-widget-gt3-core-button a, a.button_size_elementor_custom');

  // Build header row: heading + description + sub-heading in a single cell
  const headerContent = [];
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    headerContent.push(h2);
  }
  if (descWidget) {
    const p = document.createElement('p');
    p.textContent = descWidget.textContent.trim();
    headerContent.push(p);
  }
  if (subHeading) {
    const h3 = document.createElement('h3');
    h3.textContent = subHeading.textContent.trim();
    headerContent.push(h3);
  }

  // Build stat image row: one image per cell (3 columns)
  const statsRow = [];
  statColumns.forEach((col) => {
    const cellContent = [];
    const statImg = col.querySelector('.elementor-widget-image img, img');
    if (statImg) {
      const img = document.createElement('img');
      img.src = statImg.getAttribute('src') || '';
      if (statImg.getAttribute('alt')) {
        img.alt = statImg.getAttribute('alt');
      }
      cellContent.push(img);
    }
    if (cellContent.length > 0) {
      statsRow.push(cellContent);
    }
  });

  // Build CTA row
  const ctaContent = [];
  if (ctaLink) {
    const btnText = ctaLink.querySelector('.elementor_gt3_btn_text');
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href') || '';
    a.textContent = btnText ? btnText.textContent.trim() : ctaLink.textContent.trim();
    ctaContent.push(a);
  }

  // Assemble cells: header row (single cell), stats row (3 cells), CTA row (single cell)
  const cells = [];
  if (headerContent.length > 0) {
    cells.push([headerContent]);
  }
  if (statsRow.length > 0) {
    cells.push(statsRow);
  }
  if (ctaContent.length > 0) {
    cells.push([ctaContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
