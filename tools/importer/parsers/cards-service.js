/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-service
 * Base block: cards
 * Source: https://www.nextrow.com/
 * Generated: 2026-05-11
 *
 * Extracts service category cards from section.section-categories elements.
 * Each card has an image (cat_img), a title (h4), and a link (category_link).
 * The parser handles being called on each section instance separately;
 * each instance contains 4 cards in a 4-column grid.
 *
 * UE Model: container block "cards" with child "card" items.
 * Each card item has fields: image (reference), text (richtext).
 * Field hinting applied per xwalk requirements.
 */
export default function parse(element, { document }) {
  // Find all service card containers within this section instance
  const cardElements = element.querySelectorAll('.mob-cat');

  const cells = [];

  cardElements.forEach((card) => {
    // Extract the service image (cat_img class, not the arrow icon)
    const image = card.querySelector('img.cat_img');

    // Extract the heading (h4 with service title)
    const heading = card.querySelector('h4');

    // Extract the link (category_link)
    const link = card.querySelector('a.category_link');

    // Build image cell with field hint
    const imageCell = [];
    if (image) {
      const imageFragment = document.createDocumentFragment();
      imageFragment.appendChild(document.createComment(' field:image '));
      const imgClone = image.cloneNode(true);
      imageFragment.appendChild(imgClone);
      imageCell.push(imageFragment);
    }

    // Build text/content cell with field hint
    // Contains heading wrapped in link for navigation
    const textCell = [];
    const textFragment = document.createDocumentFragment();
    textFragment.appendChild(document.createComment(' field:text '));

    if (heading && link) {
      // Create a linked heading: wrap heading text in an anchor
      const linkEl = document.createElement('a');
      linkEl.href = link.getAttribute('href');
      linkEl.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      const h4 = document.createElement('h4');
      h4.appendChild(linkEl);
      textFragment.appendChild(h4);
    } else if (heading) {
      const h4 = document.createElement('h4');
      h4.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      textFragment.appendChild(h4);
    }

    textCell.push(textFragment);

    // Each card is one row with two columns: [image, text]
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service', cells });
  element.replaceWith(block);
}
