/* eslint-disable */
/* global WebImporter */

/**
 * Parser: embed-video
 * Base block: embed-video
 * Source: https://www.nextrow.com/ (service pages with video embeds)
 * Generated: 2026-05-11
 *
 * Extracts video URL from <video>/<source> elements and produces an Embed Video
 * block table with a single row containing the video URL as a link.
 *
 * UE Model fields:
 *   - embed_placeholder: Placeholder Image (reference)
 *   - embed_placeholderAlt: Placeholder Image Alt Text (text)
 *   - embed_uri: URI (text) - the video URL
 */
export default function parse(element, { document }) {
  // Extract video source URL from <source> or <video> element
  const sourceEl = element.querySelector('video source[src], video[src]');
  let videoUrl = '';
  if (sourceEl) {
    videoUrl = sourceEl.getAttribute('src') || '';
  } else {
    // Fallback: try to find a direct video element with src
    const videoEl = element.querySelector('video');
    if (videoEl) {
      videoUrl = videoEl.getAttribute('src') || '';
    }
  }

  // Build the video link element for the cell
  const cells = [];

  if (videoUrl) {
    // Create a link element with the video URL
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;

    // Single row with the video URI as a link
    // Field hints for xwalk UE model
    // Col 1: placeholder image (empty - no placeholder in source)
    // Col 2: placeholder alt text (empty)
    // Col 3: embed_uri - the video URL
    cells.push([link]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
