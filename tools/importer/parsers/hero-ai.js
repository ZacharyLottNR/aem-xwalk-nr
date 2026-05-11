/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-ai
 * Base block: hero
 * Source: https://www.nextrow.com/
 * Selector: section.elementor-element-245e5dd9.home_top_section
 *
 * UE Model fields:
 *   - image (reference): Hero background image
 *   - imageAlt (collapsed): Alt text for image
 *   - text (richtext): Heading and CTA content
 */
export default function parse(element, { document }) {
  // Extract background image - try multiple selectors for the hero background
  // In source HTML it appears as a direct child img, but on live page it may be nested
  const bgImage = element.querySelector(':scope > img') ||
    element.querySelector(':scope > div > img') ||
    element.querySelector('img[src*="cfac8641"]') ||
    element.querySelector('.elementor-background-overlay + img') ||
    element.querySelector('img:not(.elementor_btn_icon_container img):not([alt="Arrow Icon Png"])');

  // Extract headings - source has two h1 elements that together form the full heading
  const headings = element.querySelectorAll('h1.elementor-heading-title');

  // Extract CTA link
  const ctaLink = element.querySelector('a[href="/ai-services"]') ||
    element.querySelector('a[href*="ai-services"]') ||
    element.querySelector('.gt3_module_button_elementor a') ||
    element.querySelector('a.button_size_elementor_custom');

  // Build cells matching UE model structure (simple block: 2 rows)
  const cells = [];

  // Row 1: image field (always present per xwalk model requirements)
  const imageFragment = document.createDocumentFragment();
  imageFragment.appendChild(document.createComment(' field:image '));
  if (bgImage) {
    imageFragment.appendChild(bgImage);
  }
  cells.push([imageFragment]);

  // Row 2: text field (richtext containing heading + CTA)
  const textFragment = document.createDocumentFragment();
  textFragment.appendChild(document.createComment(' field:text '));

  // Combine the two h1 headings into one heading element
  if (headings.length > 0) {
    const combinedHeading = document.createElement('h1');
    const headingTexts = [];
    headings.forEach((h) => {
      headingTexts.push(h.textContent.trim());
    });
    combinedHeading.textContent = headingTexts.join(' ');
    textFragment.appendChild(combinedHeading);
  }

  // Add CTA as a paragraph with link
  if (ctaLink) {
    const ctaParagraph = document.createElement('p');
    const link = document.createElement('a');
    link.href = ctaLink.href || ctaLink.getAttribute('href');
    link.textContent = ctaLink.querySelector('.elementor_gt3_btn_text')?.textContent?.trim() ||
      ctaLink.textContent?.trim() || 'Learn More';
    ctaParagraph.appendChild(link);
    textFragment.appendChild(ctaParagraph);
  }

  cells.push([textFragment]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-ai', cells });
  element.replaceWith(block);
}
