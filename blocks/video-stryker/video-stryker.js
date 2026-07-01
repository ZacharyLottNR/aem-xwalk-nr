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

function buildYoutube(id, hero) {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (hero) {
    // Hero: autoplay, muted, looping background video, no player chrome.
    params.set('autoplay', '1');
    params.set('mute', '1');
    params.set('controls', '0');
    params.set('loop', '1');
    params.set('playlist', id); // YouTube loop requires the playlist param
  }
  const iframe = document.createElement('iframe');
  iframe.className = 'video-stryker-iframe';
  iframe.src = `https://www.youtube.com/embed/${id}?${params}`;
  iframe.title = 'Video';
  iframe.setAttribute('frameborder', '0');
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.setAttribute('allowfullscreen', '');
  return iframe;
}

function buildVideo(url, posterUrl, hero) {
  const video = document.createElement('video');
  video.className = 'video-stryker-video';
  video.preload = 'metadata';
  if (posterUrl) video.poster = posterUrl;

  if (hero) {
    // Hero: full-bleed background video — autoplay, muted, looping, no controls.
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.controls = false;
  } else {
    video.controls = true;
  }

  const source = document.createElement('source');
  source.src = url;
  source.type = url.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  video.append(source);
  return video;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Field order: 0: video url, 1: theme, 2: poster image
  const videoCell = rows[0]?.querySelector(':scope > div') || rows[0];
  const themeCell = rows[1]?.querySelector(':scope > div') || rows[1];
  const posterCell = rows[2]?.querySelector(':scope > div') || rows[2];

  const videoUrl = videoCell?.querySelector('a')?.href || videoCell?.textContent?.trim();
  const hero = themeCell?.textContent?.trim().toLowerCase() === 'hero';
  const posterUrl = posterCell?.querySelector('img')?.src;

  block.textContent = '';
  block.classList.add(`video-stryker-${hero ? 'hero' : 'default'}`);

  if (!videoUrl) return;

  const ytId = youtubeId(videoUrl);
  block.append(ytId ? buildYoutube(ytId, hero) : buildVideo(videoUrl, posterUrl, hero));
}
