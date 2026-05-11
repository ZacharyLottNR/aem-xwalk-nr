/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-product
 * Base block: hero
 * Description: Full-width product hero with dark background image, heading, and subtitle.
 * Structure: 2 rows - Row 1: image (background), Row 2: text (heading + paragraph)
 * Project type: xwalk (field hinting enabled)
 * UE Model fields: image (reference), imageAlt (collapsed), text (richtext)
 */
export default function parse(element, { document }) {
  // Row 1: Background image
  // Validated selector: direct child img of the section element (background image)
  const bgImage = element.querySelector(':scope > img, :scope > .elementor-container img.attachment-full');

  // Row 2: Text content (heading + subtitle paragraph)
  // Validated selectors from source.html:
  // - Heading: h2.h3-text within elementor widget container
  // - Subtitle: div.h3-content within elementor widget container
  const heading = element.querySelector('h2.h3-text, h1, h2, [class*="heading"]');
  const subtitle = element.querySelector('div.h3-content, p.h3-content, .elementor-widget-text-editor p, .elementor-widget-container > p');

  // Build cells matching UE model: 2 rows (image, text)
  const cells = [];

  // Row 1: Image with field hint (imageAlt collapsed into img alt attribute per Rule 3)
  if (bgImage) {
    const imageFragment = document.createDocumentFragment();
    imageFragment.appendChild(document.createComment(' field:image '));
    imageFragment.appendChild(bgImage);
    cells.push([imageFragment]);
  }

  // Row 2: Text (richtext) - heading + subtitle combined with field hint
  const textFragment = document.createDocumentFragment();
  textFragment.appendChild(document.createComment(' field:text '));
  if (heading) {
    textFragment.appendChild(heading);
  }
  if (subtitle) {
    // Wrap subtitle in a paragraph if it's a div for semantic correctness
    if (subtitle.tagName === 'DIV') {
      const p = document.createElement('p');
      p.textContent = subtitle.textContent;
      textFragment.appendChild(p);
    } else {
      textFragment.appendChild(subtitle);
    }
  }
  cells.push([textFragment]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-product', cells });
  element.replaceWith(block);
}
