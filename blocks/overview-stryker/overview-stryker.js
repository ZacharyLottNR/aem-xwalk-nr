import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Block-level fields are one row each, in model order:
  // 0: titleBlack, 1: titleGold, 2: primer, 3: body
  // Remaining rows (4+) are info cards (image, title, description).
  const titleBlack = innerCell(rows[0])?.textContent?.trim() || '';
  const titleGold = innerCell(rows[1])?.textContent?.trim() || '';
  const primerCell = innerCell(rows[2]);
  const richTextCell = innerCell(rows[3]);

  const cardRows = rows.slice(4);

  block.textContent = '';

  // Header
  const header = document.createElement('div');
  header.className = 'overview-stryker-header';

  if (titleBlack || titleGold) {
    const h2 = document.createElement('h2');
    h2.className = 'overview-stryker-title';
    if (titleBlack) {
      const black = document.createElement('span');
      black.className = 'overview-stryker-title-black';
      black.textContent = titleBlack;
      h2.append(black, document.createTextNode(' '));
    }
    if (titleGold) {
      const gold = document.createElement('span');
      gold.className = 'overview-stryker-title-gold';
      gold.textContent = titleGold;
      h2.append(gold);
    }
    header.append(h2);
  }

  if (primerCell?.textContent?.trim()) {
    const primer = document.createElement('p');
    primer.className = 'overview-stryker-primer';
    primer.innerHTML = (primerCell.querySelector('p') || primerCell).innerHTML;
    header.append(primer);
  }

  if (richTextCell?.textContent?.trim()) {
    const rich = document.createElement('div');
    rich.className = 'overview-stryker-richtext';
    rich.innerHTML = richTextCell.innerHTML;
    header.append(rich);
  }

  block.append(header);

  // Info cards
  const cards = document.createElement('div');
  cards.className = 'overview-stryker-cards';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells[0];
    const titleCell = cells[1];
    const descCell = cells[2];

    const card = document.createElement('div');
    card.className = 'overview-stryker-card';
    moveInstrumentation(row, card);

    const picture = imageCell?.querySelector('picture');
    if (picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'overview-stryker-card-image';
      imgWrap.append(picture);
      card.append(imgWrap);
    }

    const titleText = titleCell?.textContent?.trim();
    if (titleText) {
      const t = document.createElement('h3');
      t.className = 'overview-stryker-card-title';
      t.textContent = titleText;
      card.append(t);
    }

    if (descCell?.textContent?.trim()) {
      const d = document.createElement('div');
      d.className = 'overview-stryker-card-desc';
      d.innerHTML = innerCell(descCell).innerHTML;
      card.append(d);
    }

    cards.append(card);
  });

  if (cards.children.length) block.append(cards);

  // Optimize card images
  block.querySelectorAll('.overview-stryker-card-image picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture, [{ width: '400' }]));
}
