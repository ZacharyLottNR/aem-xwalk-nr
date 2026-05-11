/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NextRow section breaks and section metadata.
 * Adds <hr> between sections and Section Metadata blocks for styled sections.
 * Runs only in afterTransform. Uses payload.template.sections from page-templates.json.
 * All selectors validated against captured DOM in migration-work/cleaned.html.
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
      let sectionEl = null;
      if (Array.isArray(selector)) {
        // For array selectors (e.g. Services Grid has two sections), use first match
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
      } else {
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
