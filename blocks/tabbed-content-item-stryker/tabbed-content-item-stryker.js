import { createOptimizedPicture } from '../../scripts/aem.js';
import { optimizeBlockImage } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

// Normalize a YouTube watch/share URL to its embeddable form, or return null if
// the URL isn't a YouTube link.
function youTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.endsWith('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
  } catch {
    return null;
  }
  return null;
}

// The parent container reads and removes the leading tabName cell before
// decorating, so the remaining cells are, in model order: 0 image, 1 text,
// 2 link (imageAlt folds into image). A YouTube link renders as an embedded
// player; any other link renders as a card CTA.
export default function decorate(block) {
  const rows = [...block.children];

  const imageCell = innerCell(rows[0]);
  const textCell = innerCell(rows[1]);
  const linkCell = innerCell(rows[2]);

  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim();
  const embedUrl = href ? youTubeEmbedUrl(href) : null;

  block.textContent = '';

  if (embedUrl) {
    block.classList.add('tabbed-content-item-stryker-video-item');
    const frame = document.createElement('div');
    frame.className = 'tabbed-content-item-stryker-video';
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = textCell?.textContent?.trim() || 'Video';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.loading = 'lazy';
    frame.append(iframe);
    block.append(frame);
    return;
  }

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'tabbed-content-item-stryker-media';
    media.append(picture);
    block.append(media);
  }

  if (textCell?.innerHTML.trim()) {
    const text = document.createElement('div');
    text.className = 'tabbed-content-item-stryker-text';
    text.innerHTML = textCell.innerHTML;
    block.append(text);
  }

  if (href) {
    const link = document.createElement('a');
    link.className = 'tabbed-content-item-stryker-link';
    link.href = href;
    link.textContent = linkCell?.querySelector('a')?.textContent?.trim() || 'Learn More';
    block.append(link);
  }

  optimizeBlockImage(block.querySelector('.tabbed-content-item-stryker-media picture > img'), createOptimizedPicture);
}
