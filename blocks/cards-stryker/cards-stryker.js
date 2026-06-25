import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, optimizeBlockImage } from '../../scripts/scripts.js';

const COLUMN_VALUES = ['3', '4'];
const STYLE_VALUES = ['news', 'product', 'default'];

export default function decorate(block) {
  const rows = [...block.children];

  let heading = '';
  let columns = '3';
  let style = 'default';
  const cardRows = [];

  // Classify rows independently of authored order: card rows have the multi-
  // cell card shape (image, cta text, cta url, text); the block-level fields
  // (heading / columns / style) are single-cell rows. Keying on cell count
  // (not on a <picture>) keeps a card classified even if its image failed to
  // import and left a bare link instead of an optimized picture.
  rows.forEach((row) => {
    if (row.children.length > 1) {
      // Skip empty card rows: stray/placeholder item nodes can serialize as a
      // multi-cell row with no image, text, or links.
      const hasContent = row.querySelector('img, picture, a')
        || row.textContent.trim() !== '';
      if (hasContent) cardRows.push(row);
      return;
    }
    const text = row.textContent.trim();
    const token = text.toLowerCase();
    if (COLUMN_VALUES.includes(text)) columns = text;
    else if (STYLE_VALUES.includes(token)) style = token;
    else if (text) heading = text;
  });

  block.textContent = '';
  block.classList.add(`cards-stryker-cols-${columns}`, `cards-stryker-${style}`);

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'cards-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  const ul = document.createElement('ul');
  ul.className = 'cards-stryker-list';

  cardRows.forEach((row) => {
    // Card item field order: 0: image, 1: cta text, 2: cta url, 3: text
    const cells = [...row.children];
    const imageCell = cells[0];
    const ctaTextCell = cells[1];
    const ctaUrlCell = cells[2];
    const textCell = cells[3];

    const li = document.createElement('li');
    li.className = 'cards-stryker-card';
    moveInstrumentation(row, li);

    const picture = imageCell?.querySelector('picture');
    const img = imageCell?.querySelector('img');
    if (picture || img) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'cards-stryker-card-image';
      imageWrap.append(picture || img);
      li.append(imageWrap);
    }

    const body = document.createElement('div');
    body.className = 'cards-stryker-card-body';

    const textHtml = textCell?.innerHTML?.trim();
    if (textHtml) {
      const text = document.createElement('div');
      text.className = 'cards-stryker-card-text';
      text.innerHTML = textHtml;
      body.append(text);
    }

    const ctaLabel = ctaTextCell?.textContent?.trim();
    const ctaHref = ctaUrlCell?.querySelector('a')?.href || ctaUrlCell?.textContent?.trim();
    if (ctaLabel && ctaHref) {
      const cta = document.createElement('a');
      cta.className = 'cards-stryker-cta';
      cta.href = ctaHref;
      cta.textContent = ctaLabel;
      body.append(cta);
    }

    li.append(body);
    ul.append(li);
  });

  block.append(ul);

  ul.querySelectorAll('picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture));
}
