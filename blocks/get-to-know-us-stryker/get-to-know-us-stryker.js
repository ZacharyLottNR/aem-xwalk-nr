import { createOptimizedPicture } from '../../scripts/aem.js';
import { optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

function optimize(scope) {
  optimizeBlockImage(scope?.querySelector('picture > img'), createOptimizedPicture);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: 0: image, 1: body, 2: button text, 3: button link,
  // 4: layout, 5: background image
  const imageCell = innerCell(rows[0]);
  const bodyCell = innerCell(rows[1]);
  const buttonTextCell = innerCell(rows[2]);
  const buttonLinkCell = innerCell(rows[3]);
  const layoutCell = innerCell(rows[4]);
  const bgCell = innerCell(rows[5]);

  const layout = layoutCell?.textContent?.trim().toLowerCase() === 'banner' ? 'banner' : 'standard';

  block.textContent = '';
  block.classList.add(`get-to-know-us-stryker-${layout}`);

  // Full-bleed background band (banner layout only)
  const bgPicture = bgCell?.querySelector('picture');
  if (layout === 'banner' && bgPicture) {
    const bg = document.createElement('div');
    bg.className = 'get-to-know-us-stryker-bg';
    bg.append(bgPicture);
    block.append(bg);
    optimize(bg);
  }

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

  // Banner places image first (left), then content (right);
  // standard keeps content first (left), image second (right).
  if (layout === 'banner') block.append(imageCol, content);
  else block.append(content, imageCol);

  optimize(imageCol);
}
