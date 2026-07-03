import { createOptimizedPicture } from '../../scripts/aem.js';
import { optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children].map(innerCell);

  // Rows arrive in model order. The rich format is two items of five rows each:
  // image, heading, body, ctaLabel, ctaLink. The legacy format is two items of
  // image + heading only. Split into two items at the SECOND image-bearing row
  // so both formats work.
  const imageRowIdx = [];
  rows.forEach((cell, i) => { if (cell?.querySelector('picture')) imageRowIdx.push(i); });
  const splitAt = imageRowIdx.length > 1 ? imageRowIdx[1] : Math.ceil(rows.length / 2);
  const groups = [rows.slice(0, splitAt), rows.slice(splitAt)];

  block.textContent = '';

  const buildItem = (cells) => {
    const item = document.createElement('div');
    item.className = 'double-text-and-media-stryker-item';

    const picture = cells.find((c) => c?.querySelector('picture'))?.querySelector('picture');
    // The remaining non-image cells, in order: heading, body, ctaLabel, ctaLink.
    const textCells = cells.filter((c) => c && !c.querySelector('picture'));
    const headingText = textCells[0]?.textContent?.trim();
    const bodyCell = textCells[1];
    const ctaLabel = textCells[2]?.textContent?.trim();
    const ctaCell = textCells[3];
    const ctaHref = ctaCell?.querySelector('a')?.getAttribute('href') || ctaCell?.textContent?.trim();

    const content = document.createElement('div');
    content.className = 'double-text-and-media-stryker-content';

    if (headingText) {
      const heading = document.createElement('h3');
      heading.className = 'double-text-and-media-stryker-heading';
      heading.textContent = headingText;
      content.append(heading);
    }
    if (bodyCell?.textContent?.trim()) {
      const body = document.createElement('div');
      body.className = 'double-text-and-media-stryker-body';
      body.innerHTML = bodyCell.innerHTML;
      content.append(body);
    }
    if (ctaLabel && ctaHref) {
      const cta = document.createElement('a');
      cta.className = 'double-text-and-media-stryker-cta button';
      cta.href = ctaHref;
      cta.textContent = ctaLabel;
      content.append(cta);
    }
    if (content.children.length) item.append(content);

    if (picture) {
      const media = document.createElement('div');
      media.className = 'double-text-and-media-stryker-media';
      media.append(picture);
      item.append(media);
    }

    return item;
  };

  block.append(buildItem(groups[0]), buildItem(groups[1]));

  block.querySelectorAll('picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture));
}
