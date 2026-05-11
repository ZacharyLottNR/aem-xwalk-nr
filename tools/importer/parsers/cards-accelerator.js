/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-accelerator
 * Base block: cards
 * Source: https://www.nextrow.com/b2b-marketing
 * Selector: section.boxes
 * Generated: 2026-05-11
 *
 * UE Model: card (fields: image, text)
 * Structure: Container block - each card is one row with 2 columns [image, text]
 * These are text-only cards so image column is empty.
 * Each card has: heading (h5), description (p), and "Learn More" link (a.box_link)
 */
export default function parse(element, { document }) {
  // Find all card containers - each .inner_layer holds one card's content
  const cardElements = element.querySelectorAll('.content_box .inner_layer');

  const cells = [];

  cardElements.forEach((card) => {
    // Extract heading (h5 in source, fallback to h4, h6, or any heading)
    const heading = card.querySelector('h5, h4, h6, h3, h2, h1');

    // Extract description paragraphs - find all p elements with actual text content
    // Some cards have empty p.box_desc followed by a separate p with real text
    const allParagraphs = Array.from(card.querySelectorAll('p'));
    const descriptions = allParagraphs.filter((p) => p.textContent.trim().length > 0);

    // Extract link
    const link = card.querySelector('a.box_link, a');

    // Build the text cell content with field hint
    // UE model: column 1 = image (empty for text-only), column 2 = text (richtext)
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (heading) textFrag.appendChild(heading);
    descriptions.forEach((desc) => textFrag.appendChild(desc));
    if (link) textFrag.appendChild(link);

    // Row: [image (empty), text content]
    // Empty image cell - no hint needed per hinting rules
    cells.push(['', textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-accelerator', cells });
  element.replaceWith(block);
}
