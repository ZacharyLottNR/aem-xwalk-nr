/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Asset Share Commons site-wide cleanup.
 * Removes non-authorable content (header, footer, loaders, user menu, hidden elements).
 * All selectors validated against captured DOM in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Loading overlay spinners (block content interaction)
    // Found: <div class="ui indeterminate huge text loader">Preparing download</div>
    // Found: <div class="ui huge text loader">Loading...</div>
    WebImporter.DOMUtils.remove(element, ['.ui.text.loader']);

    // Calendar popup widgets inside date-range filters (interactive UI, not authorable)
    // Found: <div class="ui popup calendar"> containing full calendar tables
    WebImporter.DOMUtils.remove(element, ['.ui.popup.calendar']);

    // Stray top-level input elements at body root (form state, not authorable)
    // Found: <input> elements at lines 1-4, direct children of body
    const bodyInputs = element.querySelectorAll(':scope > input');
    bodyInputs.forEach((input) => input.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Header navigation (non-authorable site chrome, EDS handles nav)
    // Found: <div class="cmp cmp-structure-header aem-GridColumn aem-GridColumn--default--12">
    //   containing <header class="assetshare-header"> with menu items
    WebImporter.DOMUtils.remove(element, ['.cmp-structure-header']);

    // Footer (non-authorable site chrome, EDS handles footer)
    // Found: <div class="cmp cmp-structure-footer aem-GridColumn aem-GridColumn--default--12">
    //   containing <footer> with copyright text
    WebImporter.DOMUtils.remove(element, ['.cmp-structure-footer']);

    // User menu in sidebar rail (login/logout/cart, non-authorable session UI)
    // Found: <span class="cmp cmp-structure-user-menu aem-GridColumn aem-GridColumn--default--12">
    WebImporter.DOMUtils.remove(element, ['.cmp-structure-user-menu']);

    // Filter toggle buttons (Apply/Reset, interactive UI chrome)
    // Found: <div class="cmp cmp-search-filter-toggle aem-GridColumn aem-GridColumn--default--12">
    WebImporter.DOMUtils.remove(element, ['.cmp-search-filter-toggle']);

    // Hidden search components (empty, no visible content)
    // Found: <div class="cmp cmp-search-hidden aem-GridColumn aem-GridColumn--default--12"></div>
    WebImporter.DOMUtils.remove(element, ['.cmp-search-hidden']);

    // Empty section element (no content)
    // Found: <section></section> at end of page
    const emptySections = element.querySelectorAll('section');
    emptySections.forEach((section) => {
      if (!section.textContent.trim() && !section.children.length) {
        section.remove();
      }
    });

    // Link tags (stylesheets, not authorable)
    WebImporter.DOMUtils.remove(element, ['link']);

    // Noscript tags (tracking pixels)
    WebImporter.DOMUtils.remove(element, ['noscript']);
  }
}
