import { createOptimizedPicture } from '../../scripts/aem.js';
import { optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: imageOne, textOne, imageTwo, textTwo (alt is carried on the
  // image). Classify by picture presence so authored order changes are safe.
  const pictures = [];
  const texts = [];
  rows.forEach((row) => {
    const cell = innerCell(row);
    const picture = cell?.querySelector('picture');
    if (picture) {
      pictures.push(picture);
    } else {
      const text = cell?.textContent?.trim();
      if (text) texts.push(text);
    }
  });

  block.textContent = '';

  const buildItem = (picture, text) => {
    const item = document.createElement('div');
    item.className = 'double-text-and-media-stryker-item';

    if (picture) {
      const media = document.createElement('div');
      media.className = 'double-text-and-media-stryker-media';
      media.append(picture);
      item.append(media);
    }

    if (text) {
      const heading = document.createElement('h3');
      heading.className = 'double-text-and-media-stryker-heading';
      heading.textContent = text;
      item.append(heading);
    }

    return item;
  };

  block.append(
    buildItem(pictures[0], texts[0]),
    buildItem(pictures[1], texts[1]),
  );

  block.querySelectorAll('picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture));
}
