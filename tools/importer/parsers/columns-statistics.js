/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-statistics
 * Base block: columns
 * Source selector: .cmp-search-statistics
 * Source: https://publish-p63260-e524717.adobeaemcloud.com/content/asset-share-commons/en/light.html
 * Generated: 2026-05-11
 *
 * Extracts statistics from Semantic UI .ui.statistics component.
 * Each .statistic child becomes a column cell with its value and label.
 * Columns blocks do NOT require field hint comments (xwalk exception).
 */
export default function parse(element, { document }) {
  // Extract all statistic items from the Semantic UI statistics container
  const statisticsContainer = element.querySelector('.ui.statistics, [class*="statistics"]');
  const statisticItems = statisticsContainer
    ? Array.from(statisticsContainer.querySelectorAll(':scope > .statistic'))
    : Array.from(element.querySelectorAll('.statistic'));

  // Build one row with N columns (one cell per statistic)
  const row = [];

  statisticItems.forEach((item) => {
    const valueEl = item.querySelector('.value');
    const labelEl = item.querySelector('.label');

    // Create a container fragment for this column cell
    const cellContent = [];

    if (valueEl) {
      // Wrap value in a strong/heading for semantic emphasis
      const strong = document.createElement('strong');
      strong.textContent = valueEl.textContent.trim();
      cellContent.push(strong);
    }

    if (labelEl) {
      const p = document.createElement('p');
      p.textContent = labelEl.textContent.trim();
      cellContent.push(p);
    }

    row.push(cellContent);
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-statistics', cells });
  element.replaceWith(block);
}
