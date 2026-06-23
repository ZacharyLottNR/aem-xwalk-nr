import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

const ALIGNMENTS = ['left', 'center', 'right'];

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: 0: image, 1: imageAlt, 2: link, 3: cta text, 4: alignment
  const imageCell = innerCell(rows[0]);
  const linkCell = innerCell(rows[2]);
  const ctaTextCell = innerCell(rows[3]);
  const alignVal = innerCell(rows[4])?.textContent?.trim().toLowerCase();
  const alignment = ALIGNMENTS.includes(alignVal) ? alignVal : 'center';

  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim();
  const ctaText = ctaTextCell?.textContent?.trim() || 'Read more';
  const picture = imageCell?.querySelector('picture');

  block.textContent = '';
  block.classList.add(`cross-promo-stryker-${alignment}`);

  const tile = document.createElement('a');
  tile.className = 'cross-promo-stryker-tile';
  if (href) tile.href = href;

  if (picture) {
    const media = document.createElement('div');
    media.className = 'cross-promo-stryker-media';
    media.append(picture);
    tile.append(media);
  }

  const cta = document.createElement('div');
  cta.className = 'cross-promo-stryker-cta';
  const ctaLabel = document.createElement('span');
  ctaLabel.className = 'cross-promo-stryker-cta-text';
  ctaLabel.textContent = ctaText;
  const arrow = document.createElement('span');
  arrow.className = 'cross-promo-stryker-cta-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  cta.append(ctaLabel, arrow);
  tile.append(cta);

  block.append(tile);

  const img = tile.querySelector('.cross-promo-stryker-media picture > img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  }
}
