import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: 0: image, 1: heading, 2: body
  const imageCell = innerCell(rows[0]);
  const headingCell = innerCell(rows[1]);
  const bodyCell = innerCell(rows[2]);

  block.textContent = '';

  // Image column
  const imageCol = document.createElement('div');
  imageCol.className = 'text-and-image-stryker-image';
  const picture = imageCell?.querySelector('picture');
  if (picture) imageCol.append(picture);

  // Text column
  const textCol = document.createElement('div');
  textCol.className = 'text-and-image-stryker-text';

  const headingText = headingCell?.textContent?.trim();
  if (headingText) {
    const h2 = document.createElement('h2');
    h2.className = 'text-and-image-stryker-heading';
    h2.textContent = headingText;
    textCol.append(h2);
  }

  if (bodyCell?.textContent?.trim()) {
    const body = document.createElement('div');
    body.className = 'text-and-image-stryker-body';
    body.innerHTML = bodyCell.innerHTML;
    textCol.append(body);
  }

  block.append(imageCol, textCol);

  // Optimize image
  const img = imageCol.querySelector('picture > img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  }
}
