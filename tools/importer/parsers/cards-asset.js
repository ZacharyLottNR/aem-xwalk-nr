/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-asset variant.
 * Base block: cards
 * Source: Asset Share Commons light theme - asset card grid
 * Container block: each article.cmp-card becomes one row with image + text columns.
 * UE model fields: image (reference), text (richtext)
 * Generated: 2026-05-11
 */
export default function parse(element, { document }) {
  // Select all card articles from the .cards.cmp-cards container
  const cards = element.querySelectorAll(':scope > article.cmp-card');

  const cells = [];

  cards.forEach((card) => {
    // Column 1: Image - extract the card thumbnail
    const imageLink = card.querySelector(':scope > a.cmp-image__wrapper--card');
    const img = card.querySelector('img.cmp-image--card');

    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      // Wrap image in its detail link if available
      if (imageLink) {
        const link = document.createElement('a');
        link.href = imageLink.href;
        link.appendChild(img.cloneNode(true));
        imageCell.appendChild(link);
      } else {
        imageCell.appendChild(img.cloneNode(true));
      }
    }

    // Column 2: Text - title heading + metadata properties + action buttons
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    // Title: h3 with link
    const titleHeading = card.querySelector('h3.header');
    if (titleHeading) {
      const h3 = document.createElement('h3');
      const titleLink = titleHeading.querySelector('a');
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.href;
        a.textContent = titleLink.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = titleHeading.textContent.trim();
      }
      textCell.appendChild(h3);
    }

    // Metadata properties (SIZE, TYPE, RES.)
    const properties = card.querySelectorAll('div.meta div.property');
    if (properties.length > 0) {
      const metaList = document.createElement('ul');
      properties.forEach((prop) => {
        const li = document.createElement('li');
        const valueSpan = prop.querySelector('span.value');
        const value = valueSpan ? valueSpan.textContent.trim() : '';
        // Extract label text (the text node before the span)
        const labelText = prop.childNodes[0] ? prop.childNodes[0].textContent.trim() : '';
        if (labelText && value) {
          li.textContent = `${labelText}: ${value}`;
        } else if (labelText) {
          li.textContent = labelText;
        }
        if (li.textContent) {
          metaList.appendChild(li);
        }
      });
      if (metaList.children.length > 0) {
        textCell.appendChild(metaList);
      }
    }

    // Action buttons (Download, Share, Add to Cart) - skip hidden buttons
    const actionButtons = card.querySelectorAll('ul.cmp_card__action-buttons button.ui.link.button:not(.hidden)');
    if (actionButtons.length > 0) {
      const buttonPara = document.createElement('p');
      actionButtons.forEach((btn, idx) => {
        if (idx > 0) {
          buttonPara.appendChild(document.createTextNode(' | '));
        }
        const strong = document.createElement('strong');
        strong.textContent = btn.textContent.trim();
        buttonPara.appendChild(strong);
      });
      textCell.appendChild(buttonPara);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-asset', cells });
  element.replaceWith(block);
}
