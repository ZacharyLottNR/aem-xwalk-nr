/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NextRow site-wide cleanup.
 * Removes non-authorable content (header, footer, cookie consent, decorative elements).
 * All selectors validated against captured DOM in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent popup (blocks content interaction)
    // Found: <div id="ct-ultimate-gdpr-cookie-popup" class="ct-ultimate-gdpr-cookie-bottomPanel ...">
    // Found: <div id="ct-ultimate-gdpr-cookie-modal" class="ct-ultimate-gdpr--Groups-5 ...">
    // Found: <div id="ct-ultimate-gdpr-cookie-open" class="ct-ultimate-gdpr-trigger-modal-round">
    // Found: <div id="ct-ultimate-gdpr-loader">
    WebImporter.DOMUtils.remove(element, [
      '#ct-ultimate-gdpr-cookie-popup',
      '#ct-ultimate-gdpr-cookie-modal',
      '#ct-ultimate-gdpr-cookie-open',
      '#ct-ultimate-gdpr-loader',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Header navigation (non-authorable site chrome)
    // Found: <div class="elementor elementor-13111 wpda-builder-page-13111 wpda-builder wpda-header-builder ...">
    WebImporter.DOMUtils.remove(element, ['.wpda-header-builder']);

    // Footer (non-authorable site chrome)
    // Found: <div class="elementor elementor-24486 wpda-builder-page-24486 wpda-builder wpda-footer-builder">
    WebImporter.DOMUtils.remove(element, ['.wpda-footer-builder']);

    // Back to top button (non-authorable UI element)
    // Found: <div class="back_to_top_container">
    WebImporter.DOMUtils.remove(element, ['.back_to_top_container']);

    // Elementor device mode indicator (non-authorable)
    // Found: <span id="elementor-device-mode" class="elementor-screen-only">
    WebImporter.DOMUtils.remove(element, ['#elementor-device-mode']);

    // Iframes (non-authorable tracking/widgets)
    // Found: <iframe> at end of body
    WebImporter.DOMUtils.remove(element, ['iframe']);

    // Noscript tags (tracking pixels)
    WebImporter.DOMUtils.remove(element, ['noscript']);

    // Link tags (stylesheets, not authorable)
    WebImporter.DOMUtils.remove(element, ['link']);
  }
}
