import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

// Render one profile from its cells. Cell order matches the item model's
// field groups: 0 image, 1 name, 2 role, 3 bio, 4 link (imageAlt folds into
// the image).
function renderItem(sourceRow, cells) {
  const imageCell = cells[0];
  const name = innerCell(cells[1])?.textContent?.trim() || '';
  const role = innerCell(cells[2])?.textContent?.trim() || '';
  const bioCell = cells[3];
  const linkCell = cells[4];
  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim() || '';

  const item = document.createElement('div');
  item.className = 'profile-stryker-item';
  moveInstrumentation(sourceRow, item);

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const media = document.createElement(href ? 'a' : 'div');
    media.className = 'profile-stryker-media';
    if (href) media.href = href;
    media.append(picture);
    item.append(media);
  }

  const content = document.createElement('div');
  content.className = 'profile-stryker-content';

  if (name) {
    const n = document.createElement('h3');
    n.className = 'profile-stryker-name';
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = name;
      n.append(a);
    } else {
      n.textContent = name;
    }
    content.append(n);
  }

  if (role) {
    const r = document.createElement('p');
    r.className = 'profile-stryker-role';
    r.textContent = role;
    content.append(r);
  }

  if (bioCell?.innerHTML.trim()) {
    const bio = document.createElement('div');
    bio.className = 'profile-stryker-bio';
    bio.innerHTML = bioCell.innerHTML;
    content.append(bio);
  }

  item.append(content);
  return item;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Single-cell rows carry the block-level fields (heading, theme) in order;
  // multi-cell rows are profile items.
  let heading = '';
  const singleCellValues = [];
  const itemRows = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    const hasMedia = row.querySelector('picture, img');
    if (cells.length >= 2 || hasMedia) itemRows.push(row);
    else if (row.textContent.trim()) singleCellValues.push(row.textContent.trim());
  });

  if (singleCellValues.length) [heading] = singleCellValues;
  const theme = singleCellValues.slice(1).some((v) => /^detail$/i.test(v)) ? 'detail' : 'grid';

  block.textContent = '';
  block.classList.add(`profile-stryker-${theme}`);

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'profile-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  const grid = document.createElement('div');
  grid.className = 'profile-stryker-grid';
  itemRows.forEach((row) => {
    grid.append(renderItem(row, [...row.children]));
  });
  if (grid.children.length) block.append(grid);

  block.querySelectorAll('.profile-stryker-media picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture, [{ width: '400' }]));
}
