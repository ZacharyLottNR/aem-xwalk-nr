/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-blog
 * Base block: cards
 * Source: https://www.nextrow.com/
 * Selector: .gt3_module_blog
 * Structure: Container block - each card = 1 row with 2 columns (image, text)
 * Model fields: image (reference), text (richtext)
 * Generated: 2026-05-11
 */
export default function parse(element, { document }) {
  // Find all blog post card items
  const cards = element.querySelectorAll('.blog_post_preview');
  const cells = [];

  cards.forEach((card) => {
    // Column 1: Image with link
    const imageLink = card.querySelector('.blog_post_media a');
    const img = card.querySelector('.blog_post_media img');

    // Column 2: Text content (title + excerpt + Read More link)
    const titleLink = card.querySelector('h2.blogpost_title a');
    const description = card.querySelector('.blog_item_description');
    const readMoreLink = card.querySelector('.gt3_module_button_list a');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (imageLink && img) {
      const linkedImage = imageLink.cloneNode(false);
      linkedImage.appendChild(img.cloneNode(true));
      imageCell.appendChild(linkedImage);
    } else if (img) {
      imageCell.appendChild(img.cloneNode(true));
    }

    // Build text cell with field hint (title + excerpt + CTA)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (titleLink) {
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      link.href = titleLink.href;
      link.textContent = titleLink.textContent.trim();
      heading.appendChild(link);
      textCell.appendChild(heading);
    }

    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textCell.appendChild(p);
    }

    if (readMoreLink) {
      const ctaP = document.createElement('p');
      const cta = document.createElement('a');
      cta.href = readMoreLink.href;
      cta.textContent = readMoreLink.textContent.trim();
      ctaP.appendChild(cta);
      textCell.appendChild(ctaP);
    }

    // Each card = 1 row with 2 columns [image, text]
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-blog', cells });
  element.replaceWith(block);
}
