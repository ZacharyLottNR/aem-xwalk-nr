import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

// Render one profile from its cells. Cell order matches the item model's
// field groups: 0 image, 1 name, 2 firstName, 3 lastName, 4 role, 5 bio,
// 6 link, 7 ctaLabel (imageAlt folds into the image).
function renderItem(sourceRow, cells, theme) {
  const imageCell = cells[0];
  const name = innerCell(cells[1])?.textContent?.trim() || '';
  const firstName = innerCell(cells[2])?.textContent?.trim() || '';
  const lastName = innerCell(cells[3])?.textContent?.trim() || '';
  const role = innerCell(cells[4])?.textContent?.trim() || '';
  const bioCell = cells[5];
  const linkCell = cells[6];
  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim() || '';
  const ctaLabel = innerCell(cells[7])?.textContent?.trim() || '';

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

  // Name: the detail theme renders a two-tone name (gold first name + black
  // last name) as an <h1>; the grid theme uses a single <h3>, linked when a
  // profile link is present.
  const hasSplitName = firstName || lastName;
  if (name || hasSplitName) {
    const isDetail = theme === 'detail';
    const n = document.createElement(isDetail ? 'h1' : 'h3');
    n.className = 'profile-stryker-name';

    const buildName = (target) => {
      if (hasSplitName) {
        if (firstName) {
          const f = document.createElement('span');
          f.className = 'profile-stryker-name-first';
          f.textContent = firstName;
          target.append(f);
        }
        if (lastName) {
          if (firstName) target.append(document.createTextNode(' '));
          const l = document.createElement('span');
          l.className = 'profile-stryker-name-last';
          l.textContent = lastName;
          target.append(l);
        }
      } else {
        target.append(document.createTextNode(name));
      }
    };

    if (href && !isDetail) {
      const a = document.createElement('a');
      a.href = href;
      buildName(a);
      n.append(a);
    } else {
      buildName(n);
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

  // "Meet {name}" style CTA link below the role.
  if (href && ctaLabel) {
    const cta = document.createElement('a');
    cta.className = 'profile-stryker-cta';
    cta.href = href;
    cta.textContent = ctaLabel;
    content.append(cta);
  }

  item.append(content);
  return item;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Single-cell rows carry the block-level fields (heading, theme) in order;
  // multi-cell rows are profile items.
  const singleCellValues = [];
  const itemRows = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    const hasMedia = row.querySelector('picture, img');
    if (cells.length >= 2 || hasMedia) itemRows.push(row);
    else singleCellValues.push(row.textContent.trim());
  });

  // The theme is whichever single-cell value names a known theme; the heading
  // is the first single-cell value that ISN'T the theme token (may be empty).
  const theme = singleCellValues.some((v) => /^detail$/i.test(v)) ? 'detail' : 'grid';
  const heading = singleCellValues.find((v) => v && !/^(detail|grid)$/i.test(v)) || '';

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
    grid.append(renderItem(row, [...row.children], theme));
  });
  if (grid.children.length) block.append(grid);

  block.querySelectorAll('.profile-stryker-media picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture, [{ width: '400' }]));
}
