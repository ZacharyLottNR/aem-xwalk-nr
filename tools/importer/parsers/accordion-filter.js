/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-filter
 * Base block: accordion
 * Source: https://publish-p63260-e524717.adobeaemcloud.com/content/asset-share-commons/en/light.html
 * Generated: 2026-05-11
 *
 * Extracts filter accordion groups from Asset Share Commons search sidebar.
 * Each source element (.cmp-search-property, .cmp-search-date-range, .cmp-search-tags)
 * contains a single Semantic UI accordion with a .title and .content section.
 *
 * Filter groups found in source:
 *   - TYPE (checkboxes: IMAGE, DOCUMENT, VIDEO, PRESENTATION)
 *   - LAST MODIFIED (radio buttons: Day, Month, Year)
 *   - CREATED (date range pickers)
 *   - STYLE (slider toggles: Grayscale, Monochrome, Color)
 *   - ORIENTATION (toggles: Landscape, Square, Portrait)
 *   - DRM (checkbox: Restricted)
 *
 * UE Model: container block "accordion-filter" with child "accordion-filter-item" items.
 * Each item has fields: summary (text/string), text (richtext/string).
 * Field hinting applied per xwalk requirements.
 */
export default function parse(element, { document }) {
  // Each element contains one accordion group inside .ui.fluid.styled.accordion.field
  const accordion = element.querySelector('.ui.fluid.styled.accordion.field');
  if (!accordion) return;

  // Extract the title from .title div (contains filter group name like TYPE, LAST MODIFIED, etc.)
  const titleEl = accordion.querySelector('.title');
  // Extract the content from .content div (contains filter options)
  const contentEl = accordion.querySelector('.content');

  if (!titleEl && !contentEl) return;

  const cells = [];

  // Build a single row for this accordion item: [summary, text]

  // Column 1: summary (filter group title)
  const summaryFragment = document.createDocumentFragment();
  summaryFragment.appendChild(document.createComment(' field:summary '));

  if (titleEl) {
    // Get the title text, stripping the dropdown icon content
    const titleText = titleEl.textContent.replace(/\s+/g, ' ').trim();
    const p = document.createElement('p');
    p.textContent = titleText;
    summaryFragment.appendChild(p);
  }

  // Column 2: text (filter content - the options within this group)
  const textFragment = document.createDocumentFragment();
  textFragment.appendChild(document.createComment(' field:text '));

  if (contentEl) {
    // Build a structured representation of the filter options.
    // Find all label elements within the content area to capture option names.
    const labels = contentEl.querySelectorAll('label');
    // Find date range pickers (used by CREATED filter)
    const dateRangeInputs = contentEl.querySelectorAll('.ui.calendar input[type="text"], .ui.calendar input:not([type])');

    if (labels.length > 0) {
      // For checkbox/radio/toggle filter groups, create a list of options
      const ul = document.createElement('ul');
      labels.forEach((label) => {
        const labelText = label.textContent.replace(/\s+/g, ' ').trim();
        if (labelText) {
          const li = document.createElement('li');
          li.textContent = labelText;
          ul.appendChild(li);
        }
      });
      if (ul.childNodes.length > 0) {
        textFragment.appendChild(ul);
      }
    } else if (dateRangeInputs.length > 0) {
      // For date range pickers, indicate the range inputs
      const p = document.createElement('p');
      p.textContent = 'Date range filter';
      textFragment.appendChild(p);
    } else {
      // Fallback: capture any meaningful text content
      const contentText = contentEl.textContent.replace(/\s+/g, ' ').trim();
      if (contentText) {
        const p = document.createElement('p');
        p.textContent = contentText;
        textFragment.appendChild(p);
      }
    }
  }

  // One row per accordion item: [summary, text]
  cells.push([[summaryFragment], [textFragment]]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-filter', cells });
  element.replaceWith(block);
}
