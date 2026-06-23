import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2];
      return u.searchParams.get('v');
    }
  } catch (e) { /* not a parseable URL */ }
  return null;
}

function buildVideo(url) {
  const ytId = youtubeId(url);
  if (ytId) {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    const iframe = document.createElement('iframe');
    iframe.className = 'text-and-media-stryker-iframe';
    iframe.src = `https://www.youtube.com/embed/${ytId}?${params}`;
    iframe.title = 'Video';
    iframe.setAttribute('frameborder', '0');
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    return iframe;
  }
  const video = document.createElement('video');
  video.className = 'text-and-media-stryker-video';
  video.controls = true;
  video.preload = 'metadata';
  const source = document.createElement('source');
  source.src = url;
  source.type = url.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  video.append(source);
  return video;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Model field order:
  // 0: image, 1: imageAlt, 2: video, 3: headingHighlight, 4: heading,
  // 5: body, 6: theme, 7: layout
  const imageCell = innerCell(rows[0]);
  const videoCell = innerCell(rows[2]);
  const headingHighlight = innerCell(rows[3])?.textContent?.trim() || '';
  const headingText = innerCell(rows[4])?.textContent?.trim() || '';
  const bodyCell = innerCell(rows[5]);
  const themeVal = innerCell(rows[6])?.textContent?.trim().toLowerCase() === 'advanced' ? 'advanced' : 'basic';
  const layoutVal = innerCell(rows[7])?.textContent?.trim().toLowerCase() === 'media-right' ? 'media-right' : 'media-left';

  block.textContent = '';
  block.classList.add(`text-and-media-stryker-${themeVal}`, `text-and-media-stryker-${layoutVal}`);

  // Media column (video takes precedence over image)
  const mediaCol = document.createElement('div');
  mediaCol.className = 'text-and-media-stryker-media';
  const videoUrl = videoCell?.querySelector('a')?.href || videoCell?.textContent?.trim();
  const picture = imageCell?.querySelector('picture');
  if (videoUrl) {
    mediaCol.append(buildVideo(videoUrl));
  } else if (picture) {
    mediaCol.append(picture);
  }

  // Text column
  const textCol = document.createElement('div');
  textCol.className = 'text-and-media-stryker-text';

  if (headingHighlight || headingText) {
    const h2 = document.createElement('h2');
    h2.className = 'text-and-media-stryker-heading';
    if (headingHighlight) {
      const hl = document.createElement('span');
      hl.className = 'text-and-media-stryker-heading-highlight';
      hl.textContent = headingHighlight;
      h2.append(hl);
    }
    if (headingText) {
      if (headingHighlight) h2.append(document.createTextNode(' '));
      const rest = document.createElement('span');
      rest.className = 'text-and-media-stryker-heading-text';
      rest.textContent = headingText;
      h2.append(rest);
    }
    textCol.append(h2);
  }

  if (bodyCell?.innerHTML.trim()) {
    const body = document.createElement('div');
    body.className = 'text-and-media-stryker-body';
    body.innerHTML = bodyCell.innerHTML;
    textCol.append(body);
  }

  block.append(mediaCol, textCol);

  const img = mediaCol.querySelector('picture > img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  }
}
