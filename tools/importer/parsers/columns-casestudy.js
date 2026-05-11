/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-casestudy
 * Base block: columns
 * Source: https://www.nextrow.com/
 * Selector: section.elementor-element-ccfcd7f
 * Structure: Single row with 2 columns - text column (heading + paragraph + CTA) and image column
 * xwalk: Columns blocks do NOT require field hint comments (per hinting rules exception)
 * Generated: 2026-05-11
 */
export default function parse(element, { document }) {
  // Extract heading from left column
  const heading = element.querySelector('h3.elementor-heading-title, h2.elementor-heading-title, h1.elementor-heading-title, [class*="heading-title"]');

  // Extract description paragraph from text-editor widget
  const descriptionWidget = element.querySelector('.elementor-widget-text-editor .elementor-widget-container');
  let description = null;
  if (descriptionWidget) {
    // Get text content and wrap in a paragraph element
    const text = descriptionWidget.textContent.trim();
    if (text) {
      description = document.createElement('p');
      description.textContent = text;
    }
  }

  // Extract CTA button/link
  const ctaLink = element.querySelector('.elementor-widget-gt3-core-button a, .gt3_module_button_elementor a, a.button_size_elementor_custom');
  let cta = null;
  if (ctaLink) {
    cta = document.createElement('a');
    cta.href = ctaLink.href || ctaLink.getAttribute('href');
    // Get button text from inner span
    const btnText = ctaLink.querySelector('.elementor_gt3_btn_text');
    cta.textContent = btnText ? btnText.textContent.trim() : ctaLink.textContent.trim();
  }

  // Extract image from right column
  const image = element.querySelector('.elementor-widget-image img, img[class*="wp-image"]');

  // Build text column content (heading + description + CTA)
  const textColumn = [];
  if (heading) textColumn.push(heading);
  if (description) textColumn.push(description);
  if (cta) textColumn.push(cta);

  // Build image column content
  const imageColumn = [];
  if (image) imageColumn.push(image);

  // Single row with 2 columns: [textColumn, imageColumn]
  const cells = [
    [textColumn, imageColumn]
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-casestudy', cells });
  element.replaceWith(block);
}
