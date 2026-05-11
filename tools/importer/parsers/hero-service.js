/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-service
 * Base block: hero
 * Source: https://www.nextrow.com/b2b-marketing
 * Selector: section.full-width-2col-section
 *
 * Model fields:
 *   - image (reference) — illustration image in the right column
 *   - imageAlt (collapsed into image) — alt text
 *   - text (richtext) — heading, paragraphs, and CTA button
 *
 * Structure: Simple block with 2 rows
 *   Row 1: image
 *   Row 2: text (heading + description paragraphs + CTA)
 *
 * Decorative geometric shapes (section-ls, section-rs) are ignored.
 */
export default function parse(element, { document }) {
  // Extract the illustration image from the right column
  // Right column is the second .elementor-col-50 with the image widget
  const rightColumn = element.querySelector('.elementor-inner-column:last-child .elementor-widget-image img, .elementor-col-50:last-child .elementor-widget-image img');
  const image = rightColumn ? rightColumn.cloneNode(true) : null;

  // Extract text content from the left column
  // Heading
  const heading = element.querySelector('.elementor-heading-title, h2');

  // Description paragraphs from text-editor widgets
  const textEditors = element.querySelectorAll('.elementor-widget-text-editor .elementor-widget-container');

  // CTA button link
  const ctaLink = element.querySelector('.gt3_module_button_elementor a, .elementor-widget-gt3-core-button a');

  // Build richtext content fragment for the text field
  const textFrag = document.createDocumentFragment();
  const fieldHintText = document.createComment(' field:text ');
  textFrag.appendChild(fieldHintText);

  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    textFrag.appendChild(h2);
  }

  if (textEditors && textEditors.length > 0) {
    textEditors.forEach((editor) => {
      const p = document.createElement('p');
      p.textContent = editor.textContent.trim();
      if (p.textContent) {
        textFrag.appendChild(p);
      }
    });
  }

  if (ctaLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = ctaLink.href || ctaLink.getAttribute('href') || '#';
    // Button has duplicate text spans (front/back for hover animation) - grab only the first
    const btnTextSpan = ctaLink.querySelector('.elementor_gt3_btn_text');
    a.textContent = btnTextSpan ? btnTextSpan.textContent.trim() : (ctaLink.textContent.trim() || 'Learn More');
    p.appendChild(a);
    textFrag.appendChild(p);
  }

  // Build image cell with field hint
  const imageFrag = document.createDocumentFragment();
  const fieldHintImage = document.createComment(' field:image ');
  imageFrag.appendChild(fieldHintImage);
  if (image) {
    imageFrag.appendChild(image);
  }

  // Build cells array: Row 1 = image, Row 2 = text
  const cells = [
    [imageFrag],
    [textFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-service', cells });
  element.replaceWith(block);
}
