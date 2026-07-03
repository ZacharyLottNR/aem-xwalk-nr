import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Block-level fields, one row each, in model order:
  // 0: titleBlack, 1: titleGold, 2: intro, 3: theme. Remaining rows are stats
  // (icon, value, label).
  const titleBlack = innerCell(rows[0])?.textContent?.trim() || '';
  const titleGold = innerCell(rows[1])?.textContent?.trim() || '';
  const introCell = innerCell(rows[2]);

  // Theme row: no <picture>, text is a known theme value; else stats start at 3.
  const themeRow = rows[3];
  const themeText = innerCell(themeRow)?.textContent?.trim().toLowerCase() || '';
  const hasThemeRow = themeRow && !themeRow.querySelector('picture')
    && ['light', 'dark', 'plain'].includes(themeText);
  const themeVal = hasThemeRow && ['dark', 'plain'].includes(themeText) ? themeText : 'light';
  const statRows = rows.slice(hasThemeRow ? 4 : 3);

  block.textContent = '';
  block.classList.add(`stats-stryker-${themeVal}`);

  // Header
  if (titleBlack || titleGold || introCell?.textContent?.trim()) {
    const header = document.createElement('div');
    header.className = 'stats-stryker-header';

    if (titleBlack || titleGold) {
      const h2 = document.createElement('h2');
      h2.className = 'stats-stryker-title';
      if (titleBlack) {
        const black = document.createElement('span');
        black.className = 'stats-stryker-title-black';
        black.textContent = titleBlack;
        h2.append(black, document.createTextNode(' '));
      }
      if (titleGold) {
        const gold = document.createElement('span');
        gold.className = 'stats-stryker-title-gold';
        gold.textContent = titleGold;
        h2.append(gold);
      }
      header.append(h2);
    }

    if (introCell?.textContent?.trim()) {
      const intro = document.createElement('div');
      intro.className = 'stats-stryker-intro';
      intro.innerHTML = introCell.innerHTML;
      header.append(intro);
    }

    block.append(header);
  }

  // Stat items
  const grid = document.createElement('div');
  grid.className = 'stats-stryker-grid';

  statRows.forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells[0];
    const valueCell = cells[1];
    const labelCell = cells[2];

    const item = document.createElement('div');
    item.className = 'stats-stryker-item';
    moveInstrumentation(row, item);

    const picture = iconCell?.querySelector('picture');
    if (picture) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'stats-stryker-item-icon';
      iconWrap.append(picture);
      item.append(iconWrap);
    }

    const value = valueCell?.textContent?.trim();
    if (value) {
      const v = document.createElement('div');
      v.className = 'stats-stryker-item-value';
      v.textContent = value;
      item.append(v);
    }

    if (labelCell?.textContent?.trim()) {
      const l = document.createElement('div');
      l.className = 'stats-stryker-item-label';
      l.innerHTML = innerCell(labelCell).innerHTML;
      item.append(l);
    }

    if (item.children.length) grid.append(item);
  });

  if (grid.children.length) block.append(grid);

  // A stats block holds either large landscape graphics (the "customers"
  // infographic maps, ~16:9) or small square icons (Fast facts, 1:1). Tag each
  // icon wrapper by the image's aspect ratio so CSS can size them differently —
  // wide graphics render large, square icons render small like the original.
  block.querySelectorAll('.stats-stryker-item-icon picture > img').forEach((img) => {
    const tag = () => {
      const wide = img.naturalWidth && img.naturalHeight
        && (img.naturalWidth / img.naturalHeight) > 1.3;
      img.closest('.stats-stryker-item-icon')
        .classList.add(wide ? 'stats-stryker-item-icon-graphic' : 'stats-stryker-item-icon-badge');
    };
    if (img.complete && img.naturalWidth) tag();
    else img.addEventListener('load', tag, { once: true });
    optimizeBlockImage(img, createOptimizedPicture, [{ width: '400' }]);
  });
}
