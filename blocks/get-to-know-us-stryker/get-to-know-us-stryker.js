import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: 0: image, 1: body, 2: button text, 3: button link
  const imageCell = innerCell(rows[0]);
  const bodyCell = innerCell(rows[1]);
  const buttonTextCell = innerCell(rows[2]);
  const buttonLinkCell = innerCell(rows[3]);

  block.textContent = '';

  // Content column: text card + CTA below it
  const content = document.createElement('div');
  content.className = 'get-to-know-us-stryker-content';

  const card = document.createElement('div');
  card.className = 'get-to-know-us-stryker-card';
  if (bodyCell?.innerHTML.trim()) card.innerHTML = bodyCell.innerHTML;
  content.append(card);

  const buttonLabel = buttonTextCell?.textContent?.trim();
  const buttonHref = buttonLinkCell?.querySelector('a')?.href || buttonLinkCell?.textContent?.trim();
  if (buttonLabel && buttonHref) {
    const cta = document.createElement('a');
    cta.className = 'get-to-know-us-stryker-cta button';
    cta.href = buttonHref;
    cta.textContent = buttonLabel;
    content.append(cta);
  }

  // Image column
  const imageCol = document.createElement('div');
  imageCol.className = 'get-to-know-us-stryker-image';
  const picture = imageCell?.querySelector('picture');
  if (picture) imageCol.append(picture);

  block.append(content, imageCol);

  const img = imageCol.querySelector('picture > img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  }
}
