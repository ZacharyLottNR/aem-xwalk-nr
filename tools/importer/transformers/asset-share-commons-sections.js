/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Asset Share Commons section breaks and section metadata.
 * Adds <hr> between sections. Uses payload.template.sections from page-templates.json.
 * Runs only in afterTransform. Processes sections in reverse order.
 * All selectors validated against captured DOM in migration-work/cleaned.html.
 *
 * Sections (from page-templates.json "asset-share-light" template):
 *   1. Search Controls — selector: ".cmp-search-search-bar, .cmp-search-layout-toggle, .cmp-search-sort"
 *   2. Asset Results   — selector: ".cmp-search-results"
 *   3. Filter Sidebar  — selector: "#rail"
 *
 * No sections have a style property, so no Section Metadata blocks are needed.
 * Expected <hr> count: 2 (before section 2 and section 3).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument;

    // Process sections in reverse order to avoid DOM position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = section.selector;

      // Find the first element matching the section selector
      // Selector may be a string (possibly comma-separated) or an array
      let sectionEl = null;
      if (Array.isArray(selector)) {
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
      } else {
        // String selector — may contain commas (querySelectorAll-compatible), use first match
        sectionEl = element.querySelector(selector);
      }

      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before section (except for the first section)
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
