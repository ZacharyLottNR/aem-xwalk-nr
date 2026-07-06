import { moveInstrumentation } from '../../scripts/scripts.js';

// Each block row wraps its value in an inner div; return that inner cell.
function cell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order follows the model field order:
  // 0: eyebrow, 1: heading, 2: subtext, 3: cta link, 4: cta text,
  // 5: background image, 6: theme
  const eyebrowCell = cell(rows[0]);
  const headingCell = cell(rows[1]);
  const subtextCell = cell(rows[2]);
  const ctaLinkCell = cell(rows[3]);
  const ctaTextCell = cell(rows[4]);
  const imageCell = cell(rows[5]);
  const themeRaw = cell(rows[6])?.textContent?.trim().toLowerCase();
  const theme = themeRaw === 'boxed' ? 'boxed' : 'overlay';

  const picture = imageCell?.querySelector('picture');
  const img = picture?.querySelector('img');

  block.textContent = '';
  block.classList.add(`home-hero-stryker-${theme}`);

  // Background image layer sits behind the content in both themes (full-bleed);
  // the boxed theme just floats the content into a white card on the right.
  if (picture) {
    const bg = document.createElement('div');
    bg.className = 'home-hero-stryker-bg';
    if (img) moveInstrumentation(img, img);
    bg.append(picture);
    block.append(bg);
  }

  // Content layer
  const content = document.createElement('div');
  content.className = 'home-hero-stryker-content';

  const eyebrowText = eyebrowCell?.textContent?.trim();
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'home-hero-stryker-eyebrow';
    const inner = eyebrowCell.querySelector('p') || eyebrowCell;
    eyebrow.innerHTML = inner.innerHTML;
    content.append(eyebrow);
  }

  const headingText = headingCell?.textContent?.trim();
  if (headingText) {
    const heading = document.createElement('h1');
    heading.className = 'home-hero-stryker-heading';
    // Preserve inline emphasis (e.g. a bold second word in the stacked theme's
    // two-tone heading); fall back to plain text when there's no markup. The
    // emphasis may sit in a nested <p>/<div> or directly in the cell.
    const inner = headingCell.querySelector('p, div') || headingCell;
    if (inner.querySelector('strong, b, em')) heading.innerHTML = inner.innerHTML;
    else heading.textContent = headingText;
    content.append(heading);
  }

  const subtextText = subtextCell?.textContent?.trim();
  if (subtextText) {
    const subtext = document.createElement('p');
    subtext.className = 'home-hero-stryker-subtext';
    const inner = subtextCell.querySelector('p') || subtextCell;
    subtext.innerHTML = inner.innerHTML;
    content.append(subtext);
  }

  const ctaHref = ctaLinkCell?.querySelector('a')?.href || ctaLinkCell?.textContent?.trim();
  const ctaLabel = ctaTextCell?.textContent?.trim();
  if (ctaHref && ctaLabel) {
    const cta = document.createElement('a');
    cta.className = 'home-hero-stryker-cta';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
    content.append(cta);
  }

  block.append(content);
}
