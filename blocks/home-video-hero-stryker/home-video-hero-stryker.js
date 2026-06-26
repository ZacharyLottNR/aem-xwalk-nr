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

function buildYoutube(id) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    showinfo: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    disablekb: '1',
  });
  const iframe = document.createElement('iframe');
  iframe.className = 'home-video-hero-stryker-iframe';
  iframe.src = `https://www.youtube.com/embed/${id}?${params}`;
  iframe.title = 'Background video';
  iframe.setAttribute('frameborder', '0');
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  return iframe;
}

function buildVideo(url) {
  const video = document.createElement('video');
  video.className = 'home-video-hero-stryker-video';
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.preload = 'auto';

  const source = document.createElement('source');
  source.src = url;
  source.type = url.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  video.append(source);

  const play = video.play();
  if (play?.catch) play.catch(() => {});
  return video;
}

const ALIGNMENTS = ['top', 'center', 'bottom'];

export default function decorate(block) {
  const rows = [...block.children];
  // Cell order: 0: video URL, 1: alignment.
  const videoCell = rows[0]?.querySelector(':scope > div') || rows[0];
  const alignText = rows[1]?.querySelector(':scope > div')?.textContent?.trim().toLowerCase();
  const align = ALIGNMENTS.includes(alignText) ? alignText : 'top';

  const link = videoCell?.querySelector('a');
  const videoUrl = link?.href || videoCell?.textContent?.trim();

  block.textContent = '';
  block.classList.add(`home-video-hero-stryker-align-${align}`);

  if (!videoUrl) return;

  const ytId = youtubeId(videoUrl);
  block.append(ytId ? buildYoutube(ytId) : buildVideo(videoUrl));
}
