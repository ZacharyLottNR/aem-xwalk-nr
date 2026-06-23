export default function decorate(block) {
  const link = block.querySelector('a');
  const cell = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  const videoUrl = link?.href || cell?.textContent?.trim();

  block.textContent = '';

  if (!videoUrl) return;

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
  source.src = videoUrl;
  source.type = videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  video.append(source);

  block.append(video);

  const play = video.play();
  if (play?.catch) play.catch(() => {});
}
