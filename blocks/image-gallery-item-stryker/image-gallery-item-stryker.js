import { createOptimizedPicture } from '../../scripts/aem.js';
import { optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: 0: image, 1: text (richtext), 2: link (optional)
  const imageCell = innerCell(rows[0]);
  const textCell = innerCell(rows[1]);
  const linkCell = innerCell(rows[2]);

  block.textContent = '';

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'image-gallery-item-stryker-media';
    media.append(picture);
    block.append(media);
  }

  if (textCell?.innerHTML.trim()) {
    const text = document.createElement('div');
    text.className = 'image-gallery-item-stryker-text';
    text.innerHTML = textCell.innerHTML;
    block.append(text);
  }

  // Optional learn-more link — only rendered when a URL is provided.
  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim();
  if (href) {
    const link = document.createElement('a');
    link.className = 'image-gallery-item-stryker-link';
    link.href = href;
    link.textContent = 'Learn More';
    block.append(link);
  }

  optimizeBlockImage(block.querySelector('.image-gallery-item-stryker-media picture > img'), createOptimizedPicture);
}
