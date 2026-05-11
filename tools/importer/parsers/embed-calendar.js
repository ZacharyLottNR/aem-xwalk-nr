/* eslint-disable */
/* global WebImporter */

/**
 * Parser: embed-calendar
 * Base block: embed
 * Source: https://www.nextrow.com/b2b-marketing
 * Selector: section[id='calendar_show']
 * Description: Extracts HubSpot meeting scheduler embed URL from iframe container
 * Generated: 2026-05-11
 */
export default function parse(element, { document }) {
  // Extract the meetings iframe container
  const iframeContainer = element.querySelector('.meetings-iframe-container');
  const iframe = element.querySelector('.meetings-iframe-container iframe, iframe[src*="meetings.hubspot.com"]');

  // Extract the embed URL from iframe src attribute
  let embedUrl = '';
  if (iframe) {
    const src = iframe.getAttribute('src');
    if (src) {
      // Extract the base URL without query parameters for cleaner embed reference
      try {
        const url = new URL(src);
        embedUrl = url.origin + url.pathname;
      } catch (e) {
        // Fallback: use the src directly, stripping common tracking params
        embedUrl = src.split('?')[0];
      }
    }
  }

  // Build the cell content with field hints (xwalk project)
  const cellContent = document.createDocumentFragment();

  // embed_placeholder field - optional placeholder image (not present in source, leave empty hint position)
  // embed_placeholderAlt is collapsed (ends with Alt) - skip per hinting rules

  // embed_uri field - the embed URL as a link
  if (embedUrl) {
    const fieldHint = document.createComment(' field:embed_uri ');
    cellContent.appendChild(fieldHint);
    const link = document.createElement('a');
    link.setAttribute('href', embedUrl);
    link.textContent = embedUrl;
    cellContent.appendChild(link);
  }

  // Build cells array: single row with embed URL
  const cells = [
    [cellContent]
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-calendar', cells });
  element.replaceWith(block);
}
