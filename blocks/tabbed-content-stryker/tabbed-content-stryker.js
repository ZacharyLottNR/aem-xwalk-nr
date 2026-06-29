import { createOptimizedPicture } from '../../scripts/aem.js';
import { optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

// Normalize a YouTube watch/share URL to its embeddable form, or null if not YouTube.
function youTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.endsWith('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
  } catch {
    return null;
  }
  return null;
}

// Build the rendered node for one item row.
// Cell order matches the item model: 0 tabName, 1 image, 2 text, 3 link
// (imageAlt folds into the image). A YouTube link renders an embedded player;
// any other link renders a card CTA.
function renderItem(cells) {
  const imageCell = cells[1];
  const textCell = cells[2];
  const linkCell = cells[3];

  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim();
  const embedUrl = href ? youTubeEmbedUrl(href) : null;

  const item = document.createElement('div');
  item.className = 'tabbed-content-item-stryker';

  if (embedUrl) {
    item.classList.add('tabbed-content-item-stryker-video-item');
    const frame = document.createElement('div');
    frame.className = 'tabbed-content-item-stryker-video';
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = textCell?.textContent?.trim() || 'Video';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.loading = 'lazy';
    frame.append(iframe);
    item.append(frame);
    return item;
  }

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'tabbed-content-item-stryker-media';
    media.append(picture);
    item.append(media);
  }

  if (textCell?.innerHTML.trim()) {
    const text = document.createElement('div');
    text.className = 'tabbed-content-item-stryker-text';
    text.innerHTML = textCell.innerHTML;
    item.append(text);
  }

  if (href) {
    const link = document.createElement('a');
    link.className = 'tabbed-content-item-stryker-link';
    link.href = href;
    link.textContent = linkCell?.querySelector('a')?.textContent?.trim() || 'Learn More';
    item.append(link);
  }

  return item;
}

export default function decorate(block) {
  const rows = [...block.children];

  // The parent block has a single-cell heading row; item rows are multi-cell
  // (tabName, image, text, link). Classify by cell count, like cards-stryker.
  let heading = '';
  const itemRows = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length > 1) {
      itemRows.push(cells);
    } else if (row.textContent.trim()) {
      heading = row.textContent.trim();
    }
  });

  // Group items by tab name, preserving first-seen order.
  const order = [];
  const groups = new Map();
  itemRows.forEach((cells) => {
    const tabName = innerCell(cells[0])?.textContent?.trim();
    if (!tabName) return;
    if (!groups.has(tabName)) {
      groups.set(tabName, []);
      order.push(tabName);
    }
    groups.get(tabName).push(renderItem(cells));
  });

  block.textContent = '';

  if (!order.length) return;

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'tabbed-content-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  const tablist = document.createElement('div');
  tablist.className = 'tabbed-content-stryker-tablist';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabbed-content-stryker-panels';

  order.forEach((tabName, i) => {
    const id = `tabbed-content-stryker-${i}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabbed-content-stryker-tab';
    button.textContent = tabName;
    button.setAttribute('role', 'tab');
    button.id = `${id}-tab`;
    button.setAttribute('aria-controls', `${id}-panel`);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) button.classList.add('is-active');

    const panel = document.createElement('div');
    panel.className = 'tabbed-content-stryker-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    panel.hidden = i !== 0;
    groups.get(tabName).forEach((el) => panel.append(el));

    button.addEventListener('click', () => {
      tablist.querySelectorAll('.tabbed-content-stryker-tab').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.querySelectorAll('.tabbed-content-stryker-panel').forEach((p) => {
        p.hidden = true;
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
      panel.hidden = false;
    });

    tablist.append(button);
    panels.append(panel);
  });

  block.append(tablist, panels);

  block.querySelectorAll('.tabbed-content-item-stryker-media picture > img').forEach((img) => optimizeBlockImage(img, createOptimizedPicture));
}
